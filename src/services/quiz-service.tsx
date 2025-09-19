
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
  signUp: (email: string, name: string, whatsapp: string) => Promise<void>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

// Helper function to detect Instagram/Facebook in-app browsers
const isInstagramOrFacebookBrowser = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent || window.navigator.vendor || (window as any).opera;
  return /FBAN|FBAV|Instagram/i.test(userAgent);
};


export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [answers, setAnswers] = useState<QuizAnswers>(() => {
    if (typeof window !== 'undefined') {
      const savedAnswers = localStorage.getItem('quizAnswers');
      return savedAnswers ? JSON.parse(savedAnswers) : { completedWorkouts: [], weight: 60, height: 160 };
    }
    return { completedWorkouts: [], weight: 60, height: 160 };
  });
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (user: User) => {
    // Admins are anonymous and don't have user data in firestore
    if (user.email === 'pam@admin.com' || user.email === 'bypam@admin.com') {
      setAnswers({ completedWorkouts: [], weight: 60, height: 160 });
      return;
    }
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data() as QuizAnswers;
        setAnswers(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error("Failed to fetch user data from Firestore", error);
    }
  }, []);

  useEffect(() => {
    // Choose persistence based on browser environment.
    // In-app browsers (like Instagram's) often have issues with browserLocalPersistence.
    const persistence = isInstagramOrFacebookBrowser() 
        ? browserSessionPersistence // Works better in restricted environments, but logs out on session end.
        : browserLocalPersistence;   // Keeps user logged in across sessions.

    setPersistence(auth, persistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          setLoading(true);
          if (currentUser) {
            setUser(currentUser);
            await fetchUserData(currentUser);
          } else {
            setUser(null);
            // Reset answers to default when no user is logged in.
            setAnswers({ completedWorkouts: [], weight: 60, height: 160 });
          }
          setLoading(false);
        });
        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Firebase persistence error:", error);
        // Fallback to in-memory persistence if the chosen one fails
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('quizAnswers', JSON.stringify(newAnswers));
      }
      if (user && user.email !== 'pam@admin.com' && user.email !== 'bypam@admin.com') {
        updateFirestore(user.uid, { [step]: answer });
      }
      return newAnswers;
    });
  };

  const resetQuiz = async () => {
    const defaultState = { completedWorkouts: [], weight: 60, height: 160 };
    if (typeof window !== 'undefined') {
      localStorage.removeItem('quizAnswers');
    }
    setAnswers(defaultState);
    if (user && user.email !== 'pam@admin.com' && user.email !== 'bypam@admin.com') {
      const initialData = {
          uid: user.uid, // Ensure UID is preserved
          name: answers.name || '',
          email: answers.email || '',
          whatsapp: answers.whatsapp || '',
          profilePictureUrl: answers.profilePictureUrl || '',
          createdAt: answers.createdAt || serverTimestamp(),
          ...defaultState
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
  
  const signUp = async (email: string, name: string, whatsapp: string) => {
    const tempPassword = "temporaryPassword123"; // This can be a static password
    const finalAnswers = { ...answers, name, email, whatsapp };

    const saveUserData = async (user: User) => {
        const userData = { 
            ...finalAnswers, 
            uid: user.uid, 
            email: user.email, // Ensure email is from the auth user object
            createdAt: serverTimestamp() 
        };
        // Use setDoc with merge:true to create or update data without overwriting createdAt on subsequent logins.
        await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('quizAnswers');
        }
    };

    try {
        // Step 1: Try to create a new user.
        const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
        // If successful, save their data.
        await saveUserData(userCredential.user);
    } catch (error: any) {
        // Step 2: If the user already exists, sign them in instead.
        if (error.code === 'auth/email-already-in-use') {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, tempPassword);
                // On successful login, also save/update their latest data.
                await saveUserData(userCredential.user);
            } catch (signInError) {
                 console.error("Error signing in existing user:", signInError);
                 throw signInError;
            }
        } else {
            // For any other signup error, log it and re-throw.
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
