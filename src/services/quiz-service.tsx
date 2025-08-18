
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
}

interface QuizContextType {
  answers: QuizAnswers;
  setAnswer: (step: keyof QuizAnswers, answer: string) => void;
  resetQuiz: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'pamfit_quizAnswers';

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [answers, setAnswers] = useState<QuizAnswers>(() => {
    if (typeof window === 'undefined') {
      return {};
    }
    try {
      const savedAnswers = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      return savedAnswers ? JSON.parse(savedAnswers) : {};
    } catch (error) {
      console.error("Failed to parse quiz answers from localStorage", error);
      return {};
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(answers));
    } catch (error) {
        console.error("Failed to save quiz answers to localStorage", error);
    }
  }, [answers]);

  const setAnswer = (step: keyof QuizAnswers, answer: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [step]: answer,
    }));
  };

  const resetQuiz = () => {
    setAnswers({});
    try {
       window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
        console.error("Failed to remove quiz answers from localStorage", error);
    }
  }

  return (
    <QuizContext.Provider value={{ answers, setAnswer, resetQuiz }}>
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
