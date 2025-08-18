// src/components/quiz/chat-step.tsx
'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useQuiz } from '@/services/quiz-service';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

interface ChatStepProps {
  step: {
    content: {
      avatarUrl: string;
      backgroundUrl: string;
      messages: { author: 'ByPamela' | 'user'; text: string }[];
      replyOptions: { text: string; value: string }[];
    };
  };
  onComplete: () => void;
}

export function ChatStep({ step, onComplete }: ChatStepProps) {
  const { setAnswer } = useQuiz();
  const [messages, setMessages] = React.useState([step.content.messages[0]]);
  const [currentMessageIndex, setCurrentMessageIndex] = React.useState(1);
  const [showReplyOptions, setShowReplyOptions] = React.useState(false);
  const [isReplying, setIsReplying] = React.useState(false);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isReplying]);

  React.useEffect(() => {
    if (currentMessageIndex < step.content.messages.length) {
      const currentMessage = step.content.messages[currentMessageIndex];
      if (currentMessage.author === 'ByPamela') {
        const timer = setTimeout(() => {
          setMessages(prev => [...prev, currentMessage]);
          setCurrentMessageIndex(prev => prev + 1);
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        // It's the user's turn to reply
        const timer = setTimeout(() => {
            setShowReplyOptions(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    } else {
        // End of scripted messages
        setTimeout(onComplete, 1500);
    }
  }, [currentMessageIndex, step.content.messages, onComplete]);
  
  const handleReply = (reply: { text: string; value: string }) => {
    setIsReplying(true);
    setShowReplyOptions(false);
    
    // Add user's reply to chat
    const userReplyMessage = { author: 'user' as const, text: reply.text };
    setMessages(prev => [...prev, userReplyMessage]);

    // Save answer
    setAnswer('bonusPlan', reply.value);

    // Continue with ByPamela's messages
    setTimeout(() => {
        setIsReplying(false);
        // Find the next 'ByPamela' message after the user placeholder
        const userPlaceholderIndex = step.content.messages.findIndex(m => m.author === 'user');
        setCurrentMessageIndex(userPlaceholderIndex + 1);
    }, 1000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-cover bg-center" style={{ backgroundImage: `url('${step.content.backgroundUrl}')` }}>
        <div className="flex-grow flex flex-col justify-end p-4 space-y-4 overflow-y-auto" ref={chatContainerRef}>
            {messages.map((message, index) => (
                <div
                    key={index}
                    className={cn(
                        "flex items-end gap-2 max-w-[85%]",
                        message.author === 'user' ? 'self-end' : 'self-start'
                    )}
                >
                    {message.author === 'ByPamela' && (
                        <Avatar className="h-7 w-7">
                            <AvatarImage src={step.content.avatarUrl} alt="ByPamela" />
                            <AvatarFallback>BP</AvatarFallback>
                        </Avatar>
                    )}
                    <div
                        className={cn(
                            "rounded-2xl px-4 py-2 text-sm md:text-base",
                            message.author === 'user'
                                ? 'bg-blue-500 text-white rounded-br-lg'
                                : 'bg-zinc-700 text-white rounded-bl-lg'
                        )}
                    >
                        <p>{message.text}</p>
                    </div>
                </div>
            ))}
            {isReplying && (
                 <div className="flex items-end gap-2 max-w-[85%] self-start">
                     <Avatar className="h-7 w-7">
                        <AvatarImage src={step.content.avatarUrl} alt="ByPamela" />
                        <AvatarFallback>BP</AvatarFallback>
                    </Avatar>
                     <div className="rounded-2xl px-4 py-2 text-sm bg-zinc-700 text-white rounded-bl-lg">
                         <div className="flex gap-1.5 items-center">
                            <span className="h-2 w-2 rounded-full bg-current animate-pulse delay-0"></span>
                            <span className="h-2 w-2 rounded-full bg-current animate-pulse delay-150"></span>
                            <span className="h-2 w-2 rounded-full bg-current animate-pulse delay-300"></span>
                         </div>
                     </div>
                 </div>
            )}
        </div>

      <div className="p-4 border-t border-white/10">
        {showReplyOptions && (
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {step.content.replyOptions.map(option => (
              <Button
                key={option.value}
                variant="outline"
                className="flex-1 bg-transparent border-white/50 text-white hover:bg-white/10 hover:text-white rounded-full"
                onClick={() => handleReply(option)}
              >
                {option.text}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
