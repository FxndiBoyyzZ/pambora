
// src/services/quiz-service.tsx
'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
}

interface QuizContextType {
  answers: QuizAnswers;
  setAnswer: (step: keyof QuizAnswers, answer: any) => void;
  resetQuiz: () => void;
  toggleWorkoutCompleted: (workoutId: number) => void;
  isWorkoutCompleted: (workoutId: number) => boolean;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'pamfit_quizAnswers';

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [answers, setAnswers] = useState<QuizAnswers>(() => {
    if (typeof window === 'undefined') {
      return { completedWorkouts: [], weight: 60, height: 160 };
    }
    try {
      const savedAnswers = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsedAnswers = savedAnswers ? JSON.parse(savedAnswers) : {};
      if (!parsedAnswers.completedWorkouts) {
        parsedAnswers.completedWorkouts = [];
      }
      if (!parsedAnswers.weight) {
        parsedAnswers.weight = 60;
      }
      if (!parsedAnswers.height) {
        parsedAnswers.height = 160;
      }
      return parsedAnswers;
    } catch (error) {
      console.error("Failed to parse quiz answers from localStorage", error);
      return { completedWorkouts: [], weight: 60, height: 160 };
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(answers));
    } catch (error) {
        console.error("Failed to save quiz answers to localStorage", error);
    }
  }, [answers]);

  const setAnswer = (step: keyof QuizAnswers, answer: any) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [step]: answer,
    }));
  };

  const resetQuiz = () => {
    setAnswers({ completedWorkouts: [] });
    try {
       window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
        console.error("Failed to remove quiz answers from localStorage", error);
    }
  }

  const toggleWorkoutCompleted = (workoutId: number) => {
    setAnswers(prev => {
        const completed = prev.completedWorkouts || [];
        const isCompleted = completed.includes(workoutId);
        const newCompleted = isCompleted 
            ? completed.filter(id => id !== workoutId)
            : [...completed, workoutId];
        return { ...prev, completedWorkouts: newCompleted };
    });
  };

  const isWorkoutCompleted = (workoutId: number) => {
      return answers.completedWorkouts?.includes(workoutId) ?? false;
  }

  return (
    <QuizContext.Provider value={{ answers, setAnswer, resetQuiz, toggleWorkoutCompleted, isWorkoutCompleted }}>
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
