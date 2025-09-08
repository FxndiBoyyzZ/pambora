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
import { Loader2, VolumeX, Volume2 } from 'lucide-react';
import { quizSteps as localQuizSteps, type QuizStep } from './quiz-config';
import { VitalsStep } from '@/components/quiz/vitals-step';
import { ScratchCardStep } from '@/components/quiz/scratch-card-step';
import { Checkbox } from '@/components/ui/checkbox';
import Player from '@vimeo/player';

function VimeoPlayer({ step, onNext }: { step: QuizStep, onNext: () => void }) {
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<Player | null>(null);
    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        if (!videoContainerRef.current) return;

        const options = {
            url: step.content.videoUrl,
            autoplay: true,
            muted: true, // Always start muted for autoplay to work
            controls: false,
            dnt: true,
        };

        const player = new Player(videoContainerRef.current, options);
        playerRef.current = player;

        player.on('ended', () => {
            onNext();
        });
        
        // This is a failsafe timer, in case the 'ended' event doesn't fire
        if (step.content.duration) {
            const timer = setTimeout(() => {
                onNext();
            }, step.content.duration * 1000);
            return () => clearTimeout(timer);
        }

        return () => {
            player.destroy();
        };
    }, [step, onNext]);

    const toggleMute = () => {
        if (playerRef.current) {
            playerRef.current.setMuted(!isMuted).then(() => {
                setIsMuted(!isMuted);
            }).catch(error => {
                // This might happen if user hasn't interacted with the page yet
                console.warn("Could not change volume:", error.name);
                 // Fallback: try to play and then unmute
                playerRef.current?.play().then(() => {
                    playerRef.current?.setMuted(false).then(() => setIsMuted(false));
                });
            });
        }
    };

    return (
        <div className="relative w-full h-full bg-black flex flex-col justify-center items-center text-center p-0" onClick={toggleMute}>
            <div ref={videoContainerRef} className="w-full aspect-[9/16] max-h-full" />
            
            {isMuted && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 text-white bg-black/50 p-4 rounded-full pointer-events-none">
                    <VolumeX className="h-8 w-8" />
                    <span className="text-sm font-semibold">Toque para ativar o som</span>
                </div>
            )}
        </div>
    );
}


export default function QuizPage() {
  const router = useRouter();
  const [quizSteps, setQuizSteps] = useState<QuizStep[]>(localQuizSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { answers, setAnswer, signUp, user, loading: authLoading } = useQuiz();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [otherAllergy, setOtherAllergy] = useState('');


  useEffect(() => {
    if (user && !user.isAnonymous && !authLoading) {
      router.push('/treinos');
    }
  }, [user, authLoading, router]);
  
  const handleNext = useCallback(async () => {
    if (quizSteps.length === 0) return;
    
    const currentStep = quizSteps[currentStepIndex];
    if (currentStep.type === 'question' && currentStep.content.questionType === 'multiple-select') {
        const finalAllergies = selectedAllergies.filter(a => a !== 'Outra');
        if (selectedAllergies.includes('Outra') && otherAllergy) {
            finalAllergies.push(otherAllergy);
        }
        setAnswer('allergies', finalAllergies.join(', '));
    }

    if (currentStepIndex >= quizSteps.length - 1) {
        setIsSubmitting(true);
        try {
            await signUp(answers.email || '', answers.name || '', answers.whatsapp || '');
            router.push('/treinos');
        } catch (error) {
            console.error("Sign up failed on the final step", error);
            setIsSubmitting(false);
        }
    } else {
      setCurrentStepIndex(prevIndex => prevIndex + 1);
    }
  }, [quizSteps, currentStepIndex, signUp, answers, router, selectedAllergies, otherAllergy, setAnswer]);

  const currentStep = quizSteps[currentStepIndex];

  const handleAllergyChange = (allergy: string, checked: boolean) => {
    setSelectedAllergies(prev => 
        checked ? [...prev, allergy] : prev.filter(a => a !== allergy)
    );
  };
  
  const renderStepContent = () => {
    if (!currentStep) return null;

    const backgroundUrl = currentStep.content.backgroundUrl;
    const backgroundStyle = backgroundUrl ? { backgroundImage: `url('${backgroundUrl}')` } : {};
    
    switch (currentStep.type) {
      case 'video':
        return <VimeoPlayer step={currentStep} onNext={handleNext} />;
      case 'form':
        const isFormValid = currentStep.content.fields.every((field: string | number) => !!answers[field as keyof typeof answers]);
        return (
          <div 
            className="w-full h-full flex items-center justify-center p-4 bg-cover bg-center" 
            style={backgroundStyle}
          >
            <Card className="w-full max-w-sm bg-background/80 backdrop-blur-sm text-foreground">
              <CardHeader>
                <CardTitle>{currentStep.content.title}</CardTitle>
                <CardDescription>{currentStep.content.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentStep.content.fields.map((field: any) => (
                  <div className="space-y-2" key={field}>
                    <Label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                    <Input id={field} placeholder={currentStep.content.placeholders[field]} value={(answers as any)[field] || ''} onChange={(e) => setAnswer(field as any, e.target.value)} type={field === 'email' ? 'email' : 'text'} />
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
          <div 
            className="w-full h-full flex items-center justify-center p-4 bg-cover bg-center" 
            style={backgroundStyle}
          >
            <Card className="w-full max-w-sm bg-background/80 backdrop-blur-sm text-foreground">
              <CardHeader>
                <CardTitle>{currentStep.content.title}</CardTitle>
                {currentStep.content.description && <CardDescription>{currentStep.content.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                {currentStep.content.questionType === 'multiple-choice' ? (
                  <RadioGroup
                    value={(answers as any)[currentStep.content.answerKey]}
                    onValueChange={(value) => {
                      setAnswer(currentStep.content.answerKey as any, value);
                      setTimeout(handleNext, 300);
                    }}
                    className="space-y-3"
                  >
                    {currentStep.content.options.map((item: any) => (
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
                ) : currentStep.content.questionType === 'multiple-select' ? (
                     <div className="space-y-3">
                        {currentStep.content.options.map((item: any) => (
                           <Label
                            key={item.id}
                            htmlFor={item.id}
                            className="flex items-center space-x-3 rounded-md border border-border p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground has-[input:checked]:border-primary transition-colors"
                          >
                             <Checkbox 
                                id={item.id} 
                                onCheckedChange={(checked) => handleAllergyChange(item.label, !!checked)}
                                checked={selectedAllergies.includes(item.label)}
                             />
                             <span>{item.label}</span>
                          </Label>
                        ))}
                        {selectedAllergies.includes('Outra') && (
                            <div className="pt-2">
                                <Label htmlFor="other-allergy">Qual?</Label>
                                <Input 
                                    id="other-allergy" 
                                    placeholder="Digite a outra alergia" 
                                    value={otherAllergy}
                                    onChange={(e) => setOtherAllergy(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        )}
                     </div>
                ) : (
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor={currentStep.content.answerKey}>{currentStep.content.title}</Label>
                        <Input id={currentStep.content.answerKey} placeholder="Ex: Glúten, lactose..." value={(answers as any)[currentStep.content.answerKey] || ''} onChange={(e) => setAnswer(currentStep.content.answerKey as any, e.target.value)} />
                    </div>
                  </div>
                )}
              </CardContent>
               {(currentStep.content.questionType === 'text' || currentStep.content.questionType === 'multiple-select') && (
                 <CardFooter>
                    <Button onClick={handleNext} className="w-full">Continuar</Button>
                 </CardFooter>
               )}
            </Card>
          </div>
        )
    case 'vitals':
        return <VitalsStep step={currentStep} onComplete={handleNext} />;
    case 'scratch':
        return <ScratchCardStep step={currentStep} onComplete={handleNext} />;
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