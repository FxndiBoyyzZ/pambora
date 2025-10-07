// src/services/quiz-service.tsx
'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { auth, db } from '@/services/firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, setPersistence, browserLocalPersistence, inMemoryPersistence, browserSessionPersistence } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import { generateMealPlan, MealPlanOutput } from '@/ai/flows/meal-plan-generator';

interface QuizAnswers {
  name?: string;
  whatsapp?: string;
  email?: string;
  password?: string;
  goal?: string;
  diet?: string;
  allergies?: string;
  bonusPlan?: string;
  profilePictureUrl?: string;
  completedWorkouts?: number[];
  weight?: number;
  height?: number;
  gender?: 'male' | 'female';
  createdAt?: any;
  mealPlan?: MealPlanOutput['mealPlan'];
}

interface QuizContextType {
  user: User | null;
  answers: QuizAnswers;
  loading: boolean;
  setAnswer: (step: keyof QuizAnswers, answer: any) => void;
  resetQuiz: () => void;
  toggleWorkoutCompleted: (workoutId: number) => void;
  isWorkoutCompleted: (workoutId: number) => boolean;
  signUp: () => Promise<void>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

// Default state moved outside to be pure
const defaultQuizState = { completedWorkouts: [], weight: 60, height: 160 };

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [answers, setAnswers] = useState<QuizAnswers>(defaultQuizState);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (user: User) => {
    const isAdmin = user.email === 'pam@admin.com' || user.email === 'bypam@admin.com';
    const userDocRef = doc(db, 'users', user.uid);
    
    try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const data = userDoc.data() as QuizAnswers;
            // Lazy migration: if user exists but has no meal plan, generate and save it.
            if (!data.mealPlan && !isAdmin && data.goal) {
                 console.log(`User ${user.uid} is missing a meal plan. Generating one now.`);
                 const mealPlanResult = await generateMealPlan({
                    goal: data.goal || 'Perder Peso',
                    diet: data.diet || '',
                    allergies: data.allergies || 'Não possuo restrições'
                });
                const updatedData = { ...data, mealPlan: mealPlanResult.mealPlan };
                await setDoc(userDocRef, { mealPlan: mealPlanResult.mealPlan }, { merge: true });
                setAnswers(prev => ({ ...prev, ...updatedData }));
                console.log(`Meal plan for user ${user.uid} has been generated and saved.`);
            } else {
              setAnswers(prev => ({ ...prev, ...data }));
            }
        } else if (isAdmin) {
            await setDoc(userDocRef, { email: user.email, uid: user.uid, createdAt: serverTimestamp() });
            setAnswers({ email: user.email });
        }
    } catch (error) {
        console.error("Failed to fetch or migrate user data from Firestore", error);
    }
  }, []);

  useEffect(() => {
    const isInstagramOrFacebookBrowser = () => {
        if (typeof window === 'undefined') return false;
        const userAgent = window.navigator.userAgent || window.navigator.vendor || (window as any).opera;
        return /FBAN|FBAV|Instagram/i.test(userAgent);
    };

    const persistence = isInstagramOrFacebookBrowser() 
        ? browserSessionPersistence 
        : browserLocalPersistence;

    setPersistence(auth, persistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          setLoading(true);
          if (currentUser) {
            setUser(currentUser);
            await fetchUserData(currentUser);
          } else {
            setUser(null);
            setAnswers(defaultQuizState);
          }
          setLoading(false);
        });
        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Firebase persistence error:", error);
        setPersistence(auth, inMemoryPersistence).finally(() => {
            setLoading(false);
        });
      });
  }, [fetchUserData]);

  const updateFirestore = async (uid: string, data: Partial<QuizAnswers>) => {
    if (!uid) return;
    try {
      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, data, { merge: true });
    } catch (error) {
        console.error("Failed to update user data in Firestore", error);
    }
  };

  const setAnswer = (step: keyof QuizAnswers, answer: any) => {
    setAnswers((prevAnswers) => {
      const newAnswers = { ...prevAnswers, [step]: answer };
      
      if (user && user.email !== 'pam@admin.com' && user.email !== 'bypam@admin.com') {
        updateFirestore(user.uid, { [step]: answer });
      }
      return newAnswers;
    });
  };

  const resetQuiz = async () => {
    if (user && user.email !== 'pam@admin.com' && user.email !== 'bypam@admin.com') {
        try {
            console.log("Generating new meal plan during reset...");
            const mealPlanResult = await generateMealPlan({
                goal: answers.goal || 'Perder Peso',
                diet: answers.diet || '',
                allergies: answers.allergies || 'Não possuo restrições'
            });
            console.log("New meal plan generated.");

            const resetData = {
                ...defaultQuizState,
                // Preserve essential info
                name: answers.name,
                email: answers.email,
                whatsapp: answers.whatsapp,
                profilePictureUrl: answers.profilePictureUrl,
                createdAt: answers.createdAt,
                // Add new meal plan
                mealPlan: mealPlanResult.mealPlan,
            };
            await setDoc(doc(db, 'users', user.uid), resetData, { merge: true }); // Merge to be safe
            setAnswers(resetData);
        } catch (error) {
            console.error("Failed to generate meal plan during reset, saving without it.", error);
        }
    }
};

  const toggleWorkoutCompleted = (workoutId: number) => {
    setAnswers(prev => {
        const completed = prev.completedWorkouts || [];
        const isCompleted = completed.includes(workoutId);
        const newCompleted = isCompleted 
            ? completed.filter(id => id !== workoutId)
            : [...completed, workoutId];
        const newAnswers = { ...prev, completedWorkouts: newCompleted };
        if (user && user.email !== 'pam@admin.com' && user.email !== 'bypam@admin.com') {
            updateFirestore(user.uid, { completedWorkouts: newCompleted });
        }
        return newAnswers;
    });
  };
  
  const signUp = async () => {
    const { email, password, ...finalAnswers } = answers;

    if (!email || !password) {
        throw new Error("Email e senha são obrigatórios.");
    }

    const saveUserData = async (user: User) => {
        let mealPlanData = {};
        try {
            console.log("Generating meal plan during signup...");
            const mealPlanResult = await generateMealPlan({
                goal: finalAnswers.goal || 'Perder Peso',
                diet: finalAnswers.diet || '',
                allergies: finalAnswers.allergies || 'Não possuo restrições'
            });
            mealPlanData = { mealPlan: mealPlanResult.mealPlan };
            console.log("Meal plan generated.");
        } catch (error) {
            console.error("Failed to generate meal plan during signup. Saving user data without it.", error);
        }

        const { password: _password, ...userDataToSave } = { 
            ...finalAnswers, 
            uid: user.uid, 
            email: user.email, 
            createdAt: serverTimestamp(),
            ...mealPlanData,
        };
        await setDoc(doc(db, 'users', user.uid), userDataToSave, { merge: true });
    };

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserData(userCredential.user);
        
        // No need to sign in again, createUserWithEmailAndPassword does it.

    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
           throw new Error("Este e-mail já está em uso. Por favor, vá para a página de login.");
        } else {
            console.error("Error signing up:", error);
            throw error;
        }
    }
  };

  const isWorkoutCompleted = (workoutId: number) => {
      return answers.completedWorkouts?.includes(workoutId) ?? false;
  }

  return (
    <QuizContext.Provider value={{ user, answers, loading, setAnswer, resetQuiz, toggleWorkoutCompleted, isWorkoutCompleted, signUp }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
