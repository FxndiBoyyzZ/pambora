// src/components/quiz/chat-step.tsx
'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useQuiz } from '@/services/quiz-service';
import { Send, Loader2 } from 'lucide-react';
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
        setShowReplyOptions(true);
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
    <div className="w-full h-full flex flex-col p-4 bg-cover bg-center" style={{ backgroundImage: `url('${step.content.backgroundUrl}')` }}>
        <div className="flex-grow flex flex-col justify-end space-y-4 overflow-y-auto">
            {messages.map((message, index) => (
                <div
                    key={index}
                    className={cn(
                        "flex items-end gap-2 max-w-[80%]",
                        message.author === 'user' ? 'self-end' : 'self-start'
                    )}
                >
                    {message.author === 'ByPamela' && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={step.content.avatarUrl} alt="ByPamela" />
                            <AvatarFallback>BP</AvatarFallback>
                        </Avatar>
                    )}
                    <div
                        className={cn(
                            "rounded-2xl p-3 text-sm",
                            message.author === 'user'
                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                : 'bg-muted text-muted-foreground rounded-bl-none'
                        )}
                    >
                        <p>{message.text}</p>
                    </div>
                </div>
            ))}
            {isReplying && (
                 <div className="flex items-end gap-2 max-w-[80%] self-start">
                     <Avatar className="h-8 w-8">
                        <AvatarImage src={step.content.avatarUrl} alt="ByPamela" />
                        <AvatarFallback>BP</AvatarFallback>
                    </Avatar>
                     <div className="rounded-2xl p-3 text-sm bg-muted text-muted-foreground rounded-bl-none">
                         <Loader2 className="h-5 w-5 animate-spin" />
                     </div>
                 </div>
            )}
        </div>

      <div className="pt-4">
        {showReplyOptions && (
          <div className="flex flex-col sm:flex-row gap-2">
            {step.content.replyOptions.map(option => (
              <Button
                key={option.value}
                variant="outline"
                className="flex-1 bg-background/70 backdrop-blur-sm"
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
