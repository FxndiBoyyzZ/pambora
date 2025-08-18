
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function QuizStep1Redirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/quiz/1');
  }, [router]);

  return null;
}
