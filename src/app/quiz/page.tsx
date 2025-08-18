
// src/app/quiz/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StoryLayout } from '@/components/quiz/story-layout';
import { useQuiz } from '@/services/quiz-service';
import { Play, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { type QuizStep } from './quiz-config';
import { ChatStep } from '@/components/quiz/chat-step';
import { VitalsStep } from '@/components/quiz/vitals-step';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

const isVideoStep = (step: QuizStep) => step.type === 'video';

export default function QuizPage() {
  const router = useRouter();
  const [quizSteps, setQuizSteps] = useState<QuizStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { answers, setAnswer, signUp, user, loading: authLoading } = useQuiz();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    const fetchQuizConfig = async () => {
        setConfigLoading(true);
        try {
            const configDocRef = doc(db, 'config', 'quiz');
            const configDoc = await getDoc(configDocRef);
            if (configDoc.exists()) {
                setQuizSteps(configDoc.data().steps);
            } else {
                // Fallback to local config if not found in Firestore
                const { quizSteps: localQuizSteps } = await import('./quiz-config');
                setQuizSteps(localQuizSteps);
                console.warn("Configuração do quiz não encontrada no Firestore. Usando configuração local.");
            }
        } catch (error) {
            console.error("Erro ao buscar configuração do quiz:", error);
            // Fallback to local config on error
            const { quizSteps: localQuizSteps } = await import('./quiz-config');
            setQuizSteps(localQuizSteps);
        } finally {
            setConfigLoading(false);
        }
    };
    fetchQuizConfig();
  }, []);

  useEffect(() => {
    // If a permanent user lands on the quiz, push them to the app.
    // Anonymous users should proceed with the quiz.
    if (user && !user.isAnonymous && !authLoading) {
      router.push('/treinos');
    }
  }, [user, authLoading, router]);
  
  const handleNext = useCallback(async () => {
    if (configLoading || quizSteps.length === 0) return;

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
  }, [configLoading, quizSteps, currentStepIndex, signUp, answers, router]);


  const currentStep = quizSteps[currentStepIndex];

  useEffect(() => {
    if (!currentStep) return;
    let timer: NodeJS.Timeout;
    if (isVideoStep(currentStep)) {
      timer = setTimeout(() => {
        handleNext();
      }, 5000); // 5 second video
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [currentStepIndex, currentStep, handleNext]);

  const renderStepContent = () => {
    if (!currentStep) return null;
    const step = currentStep;

    switch (step.type) {
      case 'video':
        const isYoutube = step.content.videoUrl && (step.content.videoUrl.includes('youtube.com') || step.content.videoUrl.includes('youtu.be'));
        const videoId = isYoutube ? new URL(step.content.videoUrl).searchParams.get('v') || step.content.videoUrl.split('/').pop() : null;
        const embedUrl = isYoutube ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0` : step.content.videoUrl;
        
        return (
          <div className="w-full h-full bg-black flex flex-col justify-center items-center text-center p-0">
            <div className="relative w-full aspect-[9/16] max-h-full">
               {isYoutube ? (
                 <iframe
                    src={embedUrl}
                    className="w-full h-full object-cover"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Quiz Video"
                 ></iframe>
               ) : (
                 <video
                   src={step.content.videoUrl}
                   autoPlay
                   muted
                   loop
                   playsInline
                   className="w-full h-full object-cover"
                 ></video>
               )}
              <div className="absolute inset-0 bg-black/30 flex justify-center items-center pointer-events-none">
                <Play className="text-white/70 h-16 w-16" />
              </div>
            </div>
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
      case 'wheel':
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-cover bg-center" style={{backgroundImage: `url('${step.content.backgroundUrl}')`}}>
                <Card className="w-full max-w-sm bg-background/80 backdrop-blur-sm text-foreground text-center">
                    <CardHeader>
                        <CardTitle>{step.content.title}</CardTitle>
                        <CardDescription>{step.content.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-64 h-64 mx-auto my-4">
                            <Image src="/wheel.png" alt="Roda da Sorte" layout="fill" className="animate-spin" style={{ animationDuration: '5s' }}/>
                            <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white" />
                            </div>
                            <div 
                                style={{clipPath: 'polygon(100% 50%, 0 0, 0 100%)'}}
                                className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-sm"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleNext} className="w-full">Girar e Continuar</Button>
                    </CardFooter>
                </Card>
            </div>
         );
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

  const loading = authLoading || configLoading;

  if (loading) {
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
