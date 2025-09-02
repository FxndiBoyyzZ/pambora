// src/services/quiz-service.tsx
'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { auth, db } from '@/services/firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface QuizAnswers {
  name?: string;
  whatsapp?: string;
  email?: string;
  goal?: string;
  diet?: string;
  allergies?: string;
  bonusPlan?: string;
  profilePictureUrl?: string;
  completedWorkouts?: number[];
  workoutFrequency?: string;
  weight?: number;
  height?: number;
  gender?: 'male' | 'female';
  createdAt?: any;
}

interface QuizContextType {
  user: User | null;
  answers: QuizAnswers;
  loading: boolean;
  setAnswer: (step: keyof QuizAnswers, answer: any) => void;
  resetQuiz: () => void;
  toggleWorkoutCompleted: (workoutId: number) => void;
  isWorkoutCompleted: (workoutId: number) => boolean;
  signUp: (email: string, name: string, whatsapp: string) => Promise<void>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [answers, setAnswers] = useState<QuizAnswers>({ completedWorkouts: [], weight: 60, height: 160 });
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (user: User) => {
    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data() as QuizAnswers;
        setAnswers(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error("Failed to fetch user data from Firestore", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchUserData(user);
      } else {
        try {
            await signInAnonymously(auth);
        } catch (error: any) {
            if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/configuration-not-found') {
                console.error("Firebase Anonymous Sign-in is not enabled. Please enable it in the Firebase console for the app to work correctly.");
            } else {
                 console.error("Firebase anonymous sign-in error:", error);
            }
        }
        setUser(null);
        setAnswers({ completedWorkouts: [], weight: 60, height: 160 });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  const updateFirestore = async (uid: string, data: Partial<QuizAnswers>) => {
    if (!uid) return;
    try {
      const userDocRef = doc(db, 'users', uid);
      // Use setDoc with merge:true to create or update the document.
      await setDoc(userDocRef, data, { merge: true });
    } catch (error) {
        console.error("Failed to update user data in Firestore", error);
    }
  };

  const setAnswer = (step: keyof QuizAnswers, answer: any) => {
    setAnswers((prevAnswers) => {
      const newAnswers = { ...prevAnswers, [step]: answer };
      if (user) {
        updateFirestore(user.uid, { [step]: answer });
      }
      return newAnswers;
    });
  };

  const resetQuiz = async () => {
    const defaultState = { completedWorkouts: [], weight: 60, height: 160 };
    setAnswers(defaultState);
    if (user) {
      // Clear the document in Firestore
      await setDoc(doc(db, 'users', user.uid), defaultState);
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
        if (user) {
            updateFirestore(user.uid, { completedWorkouts: newCompleted });
        }
        return newAnswers;
    });
  };
  
  const signUp = async (email: string, name: string, whatsapp: string) => {
    // Note: In a real app, use a more secure temporary password method.
    const tempPassword = "temporaryPassword123";
    const newUserData = { name, email, whatsapp };

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
        const newUser = userCredential.user;
        setUser(newUser);
        const initialData = { ...answers, ...newUserData, createdAt: new Date() };
        await setDoc(doc(db, 'users', newUser.uid), initialData);
        setAnswers(initialData);
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, tempPassword);
                const existingUser = userCredential.user;
                setUser(existingUser);
                // Update user data in firestore with the new info from the form
                await updateFirestore(existingUser.uid, { ...answers, ...newUserData });
                // Fetch all user data to update the state
                await fetchUserData(existingUser);
            } catch (signInError) {
                 console.error("Error signing in existing user:", signInError);
                 throw signInError;
            }
        } else if (error.code === 'auth/operation-not-allowed') {
            console.error("Sign-up with Email/Password is not enabled in Firebase. Please enable it in the console.");
            // We can alert the user here or handle it gracefully.
            alert("O serviço de cadastro está temporariamente indisponível. Por favor, tente mais tarde.");
            throw error;
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
