// src/app/quiz/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StoryLayout } from '@/components/quiz/story-layout';
import { useQuiz } from '@/services/quiz-service';
import { Play, Loader2 } from 'lucide-react';
import { quizSteps as localQuizSteps, type QuizStep } from './quiz-config';
import { ChatStep } from '@/components/quiz/chat-step';
import { VitalsStep } from '@/components/quiz/vitals-step';


export default function QuizPage() {
  const router = useRouter();
  const [quizSteps, setQuizSteps] = useState<QuizStep[]>(localQuizSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { answers, setAnswer, signUp, user, loading: authLoading } = useQuiz();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // If a permanent user lands on the quiz, push them to the app.
    // Anonymous users should proceed with the quiz.
    if (user && !user.isAnonymous && !authLoading) {
      router.push('/treinos');
    }
  }, [user, authLoading, router]);
  
  const handleNext = useCallback(async () => {
    if (quizSteps.length === 0) return;

    // Check if we are on the last step
    if (currentStepIndex >= quizSteps.length - 1) {
        setIsSubmitting(true);
        try {
            // Sign up the user with all the collected answers
            await signUp(answers.email || '', answers.name || '', answers.whatsapp || '');
            // Then redirect
            router.push('/treinos');
        } catch (error) {
            console.error("Sign up failed on the final step", error);
            setIsSubmitting(false);
            // Optionally show an error to the user
        }
    } else {
      // Just move to the next step
      setCurrentStepIndex(prevIndex => prevIndex + 1);
    }
  }, [quizSteps, currentStepIndex, signUp, answers, router]);


  const currentStep = quizSteps[currentStepIndex];

  const renderStepContent = () => {
    if (!currentStep) return null;
    const step = currentStep;
    const isFirstStep = currentStepIndex === 0;

    switch (step.type) {
      case 'video':
        const isYoutube = step.content.videoUrl && (step.content.videoUrl.includes('youtube.com') || step.content.videoUrl.includes('youtu.be'));
        
        let videoSrc = step.content.videoUrl;
        if (isYoutube) {
            const videoId = new URL(videoSrc).searchParams.get('v') || videoSrc.split('/').pop();
            videoSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0`;
        }

        return (
          <div className="w-full h-full bg-black flex flex-col justify-center items-center text-center p-0">
            <div className="relative w-full aspect-[9/16] max-h-full">
               {isYoutube ? (
                 <iframe
                    src={videoSrc}
                    className="w-full h-full object-cover"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Quiz Video"
                 ></iframe>
               ) : (
                 <video
                   ref={videoRef}
                   src={videoSrc}
                   autoPlay
                   muted
                   playsInline
                   className="w-full h-full object-cover"
                   onEnded={isFirstStep ? handleNext : undefined}
                   loop={!isFirstStep}
                 ></video>
               )}
            </div>
             {isFirstStep && (
                  <div className="absolute bottom-10 w-full px-8">
                     {/* The button is not displayed but could be added here if needed */}
                  </div>
              )}
          </div>
        );
      case 'form':
        const isFormValid = step.content.fields.every((field: string | number) => !!answers[field as keyof typeof answers]);
        return (
          <div className="w-full h-full flex items-center justify-center p-4 bg-cover bg-center" style={{ backgroundImage: `url('${step.content.backgroundUrl}')` }}>
            <Card className="w-full max-w-sm bg-background/80 backdrop-blur-sm text-foreground">
              <CardHeader>
                <CardTitle>{step.content.title}</CardTitle>
                <CardDescription>{step.content.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {step.content.fields.map((field: any) => (
                  <div className="space-y-2" key={field}>
                    <Label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                    <Input id={field} placeholder={step.content.placeholders[field]} value={(answers as any)[field] || ''} onChange={(e) => setAnswer(field as any, e.target.value)} type={field === 'email' ? 'email' : 'text'} />
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button onClick={handleNext} className="w-full" disabled={!isFormValid}>
                  Continuar
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      case 'question':
        return (
          <div className="w-full h-full flex items-center justify-center p-4 bg-cover bg-center" style={{ backgroundImage: `url('${step.content.backgroundUrl}')` }}>
            <Card className="w-full max-w-sm bg-background/80 backdrop-blur-sm text-foreground">
              <CardHeader>
                <CardTitle>{step.content.title}</CardTitle>
                {step.content.description && <CardDescription>{step.content.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                {step.content.questionType === 'multiple-choice' ? (
                  <RadioGroup
                    value={(answers as any)[step.content.answerKey]}
                    onValueChange={(value) => {
                      setAnswer(step.content.answerKey as any, value);
                      setTimeout(handleNext, 300);
                    }}
                    className="space-y-3"
                  >
                    {step.content.options.map((item: any) => (
                      <Label
                        key={item.id}
                        htmlFor={item.id}
                        className="flex items-center space-x-3 rounded-md border border-border p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground has-[input:checked]:bg-primary has-[input:checked]:text-primary-foreground transition-colors"
                      >
                        <RadioGroupItem value={item.id} id={item.id} />
                        <span>{item.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor={step.content.answerKey}>{step.content.title}</Label>
                        <Input id={step.content.answerKey} placeholder="Ex: Glúten, lactose..." value={(answers as any)[step.content.answerKey] || ''} onChange={(e) => setAnswer(step.content.answerKey as any, e.target.value)} />
                    </div>
                  </div>
                )}
              </CardContent>
               {step.content.questionType === 'text' && (
                 <CardFooter>
                    <Button onClick={handleNext} className="w-full">Continuar</Button>
                 </CardFooter>
               )}
            </Card>
          </div>
        )
    case 'chat':
        return <ChatStep step={step} onComplete={handleNext} />;
    case 'vitals':
        return <VitalsStep step={step} onComplete={handleNext} />;
    default:
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Fim do Quiz!</h2>
                <Button onClick={() => router.push('/treinos')}>Ver meu plano!</Button>
            </div>
        );
    }
  };


  if (authLoading) {
    return (
        <div className="flex justify-center items-center h-screen bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <StoryLayout step={currentStepIndex + 1} totalSteps={quizSteps.length}>
      <div className="w-full h-full flex-1">
        {renderStepContent()}
      </div>
    </StoryLayout>
  );
}
