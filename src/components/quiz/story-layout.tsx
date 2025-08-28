
'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { X } from 'lucide-react';

interface StoryLayoutProps {
  step: number;
  totalSteps: number;
  children: ReactNode;
}

export function StoryLayout({ step, totalSteps, children }: StoryLayoutProps) {
  const router = useRouter();

  return (
    <div className="relative w-full max-w-[420px] h-screen sm:h-[95vh] sm:max-h-[850px] bg-zinc-900 text-white flex flex-col rounded-none sm:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-white transition-all duration-300 ease-linear"
                        style={{ width: i < step ? '100%' : '0%' }}
                     />
                </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/fotodeperfil.jpg" alt="@bypamela" />
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
    </div>
  );
}
