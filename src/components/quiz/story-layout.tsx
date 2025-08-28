
'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { X } from 'lucide-react';

const VerifiedIcon = () => (
    <svg fill="#0095F6" height="16" viewBox="0 0 40 40" width="16">
        <path d="M19.998 3.094c-3.535 0-6.495 2.96-6.495 6.495s2.96 6.495 6.495 6.495 6.495-2.96 6.495-6.495S23.533 3.094 19.998 3.094zm0 11.082c-2.585 0-4.685-2.1-4.685-4.685s2.1-4.685 4.685-4.685 4.685 2.1 4.685 4.685-2.1 4.685-4.685 4.685zm5.728 2.875c-1.39-1.12-3.13-1.84-5.02-2.05.15-.45.24-.92.24-1.41 0-2.6-2.1-4.7-4.7-4.7s-4.7 2.1-4.7 4.7c0 .49.09.96.24 1.41-1.89.21-3.63.93-5.02 2.05-1.78 1.43-2.99 3.49-3.23 5.82h25.46c-.24-2.33-1.45-4.39-3.23-5.82zM21.383 33.11c-1.17.68-2.58.98-4.04.83-2.3-.23-4.34-1.62-5.7-3.48-.3-.4-.7-.7-1.1-.9-1.1-.5-2.2-.7-3.4-.7-.4 0-.7-.3-.7-.7s.3-.7.7-.7c1.3 0 2.5.3 3.6.8.5.2.9.5 1.3.8 1.5 1.9 3.7 3.1 6.2 3.1 2.5 0 4.7-1.2 6.2-3.1.4-.3.8-.6 1.3-.8 1.1-.5 2.3-.8 3.6-.8.4 0 .7.3.7.7s-.3.7-.7.7c-1.2 0-2.3.2-3.4.7-.4.2-.8.5-1.1.9-1.36 1.86-3.4 3.25-5.7 3.48-.48.05-.96.05-1.44.05z" fill-rule="evenodd" clip-rule="evenodd"></path>
        <path d="m34.456 20.332-2.848.814c.08.432.128.874.128 1.32 0 .446-.048.888-.128 1.32l2.848.814c1.088.31 1.63 1.532 1.22 2.65-.41 1.118-1.63 1.698-2.738 1.388l-2.848-.814c-.58.74-1.24 1.4-1.988 1.958l.898 2.83c.33 1.04-.15 2.21-1.19 2.54-1.04.33-2.21-.15-2.54-1.19l-.898-2.83c-.85.19-1.72.29-2.61.29s-1.76-.1-2.61-.29l-.898 2.83c-.33 1.04-1.5 1.52-2.54 1.19-1.04-.33-1.52-1.5-1.19-2.54l.898-2.83c-.748-.558-1.408-1.218-1.988-1.958l-2.848.814c-1.108.31-2.328-.27-2.738-1.388s.132-2.34 1.22-2.65l2.848-.814c-.08-.432-.128-.874-.128-1.32 0-.446.048-.888.128-1.32l-2.848-.814c-1.088-.31-1.63-1.532-1.22-2.65.41-1.118 1.63-1.698 2.738-1.388l2.848.814c.58-.74 1.24-1.4 1.988-1.958l-.898-2.83c-.33-1.04.15-2.21 1.19-2.54 1.04-.33 2.21.15 2.54 1.19l.898 2.83c.85-.19 1.72-.29 2.61-.29s1.76.1 2.61.29l.898-2.83c.33-1.04 1.5-1.52 2.54-1.19 1.04.33 1.52 1.5 1.19 2.54l-.898 2.83c.748.558 1.408 1.218 1.988 1.958l2.848-.814c1.108-.31 2.328.27 2.738 1.388.41 1.118-.132 2.34-1.22 2.65zm-14.458 5.11c2.868 0 5.198-2.33 5.198-5.198s-2.33-5.198-5.198-5.198-5.198 2.33-5.198 5.198 2.33 5.198 5.198 5.198z" fill-rule="evenodd" clip-rule="evenodd"></path>
        <path d="m24.63 19.95-6.26 6.26-2.92-2.92c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l3.63 3.63c.19.19.45.29.7.29s.51-.1.7-.29l6.96-6.96c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.42 0z" fill-rule="evenodd" clip-rule="evenodd" fill="#fff"></path>
    </svg>
);

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
                <AvatarImage src="/fotodeperfil.jpg" alt="@bypamella" />
                <AvatarFallback>BP</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-white">bypamella</span>
                <VerifiedIcon />
              </div>
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
