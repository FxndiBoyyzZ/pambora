// src/services/quiz-service.tsx
'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { auth, db } from '@/services/firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, setPersistence, browserLocalPersistence, inMemoryPersistence, browserSessionPersistence } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, getFirestore } from 'firebase/firestore';

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

  // This effect runs once on mount to safely load initial state from localStorage
  useEffect(() => {
    const savedAnswers = localStorage.getItem('quizAnswers');
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, []);


  const fetchUserData = useCallback(async (user: User) => {
    const isAdmin = user.email === 'pam@admin.com' || user.email === 'bypam@admin.com';
    const userDocRef = doc(db, 'users', user.uid);
    
    try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const data = userDoc.data() as QuizAnswers;
            setAnswers(prev => ({ ...prev, ...data }));
        } else if (isAdmin) {
            // If admin doc doesn't exist, create it.
            await setDoc(userDocRef, { email: user.email, uid: user.uid, createdAt: serverTimestamp() });
            setAnswers({ email: user.email });
        }
    } catch (error) {
        console.error("Failed to fetch or create user data from Firestore", error);
    }
  }, []);

  useEffect(() => {
    // Helper function to detect Instagram/Facebook in-app browsers, runs only on client
    const isInstagramOrFacebookBrowser = () => {
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
            // When user logs out, reset answers but keep localStorage for next login attempt
            const saved = localStorage.getItem('quizAnswers');
            setAnswers(saved ? JSON.parse(saved) : defaultQuizState);
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
      // This is safe because setAnswer is only called via user interaction (client-side)
      localStorage.setItem('quizAnswers', JSON.stringify(newAnswers));
      
      if (user && user.email !== 'pam@admin.com' && user.email !== 'bypam@admin.com') {
        updateFirestore(user.uid, { [step]: answer });
      }
      return newAnswers;
    });
  };

  const resetQuiz = async () => {
    localStorage.removeItem('quizAnswers');
    setAnswers(defaultQuizState);
    if (user && user.email !== 'pam@admin.com' && user.email !== 'bypam@admin.com') {
      const initialData = {
          uid: user.uid, // Ensure UID is preserved
          name: answers.name || '',
          email: answers.email || '',
          whatsapp: answers.whatsapp || '',
          profilePictureUrl: answers.profilePictureUrl || '',
          createdAt: answers.createdAt || serverTimestamp(),
          ...defaultQuizState
      };
      await setDoc(doc(db, 'users', user.uid), initialData);
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
        const { password: _password, ...userDataToSave } = { 
            ...finalAnswers, 
            uid: user.uid, 
            email: user.email, 
            createdAt: serverTimestamp() 
        };
        await setDoc(doc(db, 'users', user.uid), userDataToSave, { merge: true });
        localStorage.removeItem('quizAnswers');
    };

    try {
        // First, try to create a new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserData(userCredential.user);
        
        // After successfully creating and saving, attempt a sign-in to ensure session persistence
        await signInWithEmailAndPassword(auth, email, password);

    } catch (error: any) {
        // If user already exists, don't try to sign them in, just throw an error to be handled by the UI
        if (error.code === 'auth/email-already-in-use') {
           throw new Error("Este e-mail já está em uso. Por favor, vá para a página de login.");
        } else {
            // For any other signup errors, rethrow them
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
