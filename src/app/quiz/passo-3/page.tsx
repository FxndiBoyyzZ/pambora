
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function QuizStep3Redirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new flow, assuming the user might land here from an old link
    router.replace('/quiz/1');
  }, [router]);

  return null;
}
