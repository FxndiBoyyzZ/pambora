
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Progress } from '../ui/progress';

const TOTAL_STEPS = 10; // 1 video + form + 2 questions + video + 2 questions + video + wheel + bonus question

interface StoryLayoutProps {
  step: number;
  children: ReactNode;
  showNext?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
}

export function StoryLayout({ step, children, showNext = true, onNext, onPrev }: StoryLayoutProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    const timer = setTimeout(() => setProgress((step / TOTAL_STEPS) * 100), 100);
    return () => clearTimeout(timer);
  }, [step]);
  
  const handleNext = onNext ? onNext : () => {
    if (step < TOTAL_STEPS) {
      router.push(`/quiz/${step + 1}`);
    } else {
      router.push('/treinos');
    }
  };

  const handlePrev = onPrev ? onPrev : () => {
    if (step > 1) {
      router.push(`/quiz/${step - 1}`);
    } else {
       router.push('/');
    }
  };


  return (
    <div className="relative w-full max-w-[420px] h-screen sm:h-[95vh] sm:max-h-[850px] bg-zinc-900 text-white flex flex-col rounded-none sm:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-white transition-all duration-500 ease-in-out"
                        style={{ width: i < step -1 ? '100%' : (i === step -1 ? '100%' : '0%') }}
                     />
                </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="https://placehold.co/40x40.png" alt="@bypamela" />
                <AvatarFallback>BP</AvatarFallback>
              </Avatar>
              <span className="font-semibold text-white">@bypamela</span>
            </div>
            <button onClick={() => router.push('/')} className="text-white">
                <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center items-center h-full w-full">
            {children}
        </div>

        {/* Navigation */}
        <div className="absolute inset-0 flex justify-between items-center z-0">
            <button onClick={handlePrev} className="w-1/3 h-full" aria-label="Previous Step"></button>
            <button onClick={handleNext} disabled={!showNext} className="w-2/3 h-full" aria-label="Next Step"></button>
        </div>
    </div>
  );
}
