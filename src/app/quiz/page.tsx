
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
import { Loader2, VolumeX } from 'lucide-react';
import { quizSteps as localQuizSteps, type QuizStep } from './quiz-config';
import { VitalsStep } from '@/components/quiz/vitals-step';
import { ScratchCardStep } from '@/components/quiz/scratch-card-step';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import Player from '@vimeo/player';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';


function VimeoPlayer({ step, onNext }: { step: QuizStep, onNext: () => void }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMuted, setIsMuted] = useState(true);
    const playerRef = useRef<Player | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const player = new Player(containerRef.current, {
            url: step.content.videoUrl,
            autoplay: true,
            muted: true,
            controls: false,
            loop: false,
        });
        playerRef.current = player;
        
        let onNextCalled = false;
        let duration: number | null = null;
        
        const checkTime = (data: { seconds: number }) => {
            if (duration && !onNextCalled && data.seconds > duration - 0.5) {
                onNextCalled = true;
                onNext();
            }
        };
        
        const setupPlayer = async () => {
            try {
                await player.ready();
                const d = await player.getDuration();
                duration = d;
                player.on('timeupdate', checkTime);

                const iframe = containerRef.current?.querySelector('iframe');
                if (iframe) {
                    iframe.style.position = 'absolute';
                    iframe.style.top = '50%';
                    iframe.style.left = '50%';
                    iframe.style.width = 'auto';
                    iframe.style.height = 'auto';
                    iframe.style.minWidth = '100%';
                    iframe.style.minHeight = '100%';
                    iframe.style.transform = 'translate(-50%, -50%)';
                }
            } catch (e) {
                console.error("Error setting up Vimeo player", e);
            }
        };

        setupPlayer();

        return () => {
            player?.off('timeupdate', checkTime);
            player?.destroy();
        };
    }, [step.content.videoUrl, onNext]);


    const handleVideoClick = () => {
        if (playerRef.current) {
            playerRef.current.getMuted().then(muted => {
                const newMutedState = !muted;
                playerRef.current?.setMuted(newMutedState);
                setIsMuted(newMutedState);
            });
        }
    };


    return (
        <div className="relative w-full h-full bg-black overflow-hidden" onClick={handleVideoClick}>
             <div ref={containerRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
            <AnimatePresence>
                {isMuted && (
                     <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 text-white pointer-events-none z-10"
                     >
                        <VolumeX className="h-10 w-10" />
                        <span className="text-sm font-semibold bg-black/50 rounded-md px-2 py-1">Toque para ativar o som</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function QuizPage() {
  const router = useRouter();
  const [quizSteps, setQuizSteps] = useState<QuizStep[] | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { answers, setAnswer, signUp, user, loading: authLoading } = useQuiz();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(answers.allergies?.split(', ')[0].split(',') || []);
  const [otherAllergyText, setOtherAllergyText] = useState(answers.allergies?.split('; ')[1] || '');

  useEffect(() => {
    const fetchQuizConfig = async () => {
        setIsLoadingConfig(true);
        try {
            const configDocRef = doc(db, 'config', 'quiz');
            const configDoc = await getDoc(configDocRef);
            if(configDoc.exists()) {
                setQuizSteps(configDoc.data().steps);
            } else {
                setQuizSteps(localQuizSteps);
            }
        } catch (error) {
            console.error("Erro ao buscar configuração do quiz:", error);
            setQuizSteps(localQuizSteps); // Fallback to local config on error
        } finally {
            setIsLoadingConfig(false);
        }
    };
    fetchQuizConfig();
  }, []);

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/treinos');
    }
  }, [user, authLoading, router]);
  
  const handleNext = useCallback(async () => {
    if (!quizSteps || quizSteps.length === 0) return;
    
    const currentStep = quizSteps[currentStepIndex];
    if (currentStep.type === 'question' && currentStep.content.questionType === 'multiple-select-plus-text') {
        const allergies = selectedAllergies.join(', ');
        const fullAllergyInfo = [allergies, otherAllergyText].filter(Boolean).join('; ');
        setAnswer('allergies', fullAllergyInfo);
    }

    if (currentStepIndex >= quizSteps.length - 1) {
        setIsSubmitting(true);
        try {
            await signUp(answers.email || '', answers.name || '', answers.whatsapp || '');
            // The useEffect will handle the redirect once the user is signed in.
        } catch (error) {
            console.error("Sign up failed on the final step", error);
            setIsSubmitting(false);
        }
    } else {
      setCurrentStepIndex(prevIndex => prevIndex + 1);
    }
  }, [quizSteps, currentStepIndex, signUp, answers, router, selectedAllergies, otherAllergyText, setAnswer]);

  const currentStep = quizSteps ? quizSteps[currentStepIndex] : null;

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
                <Button onClick={handleNext} className="w-full" disabled={!isFormValid || isSubmitting}>
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
                ) : currentStep.content.questionType === 'multiple-select-plus-text' ? (
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
                        <div className="pt-2">
                            <Label htmlFor="other-allergy-text" className="text-muted-foreground">Ou descreva em detalhes aqui:</Label>
                            <Textarea 
                                id="other-allergy-text" 
                                placeholder={currentStep.content.textPlaceholder}
                                value={otherAllergyText}
                                onChange={(e) => setOtherAllergyText(e.target.value)}
                                className="mt-1"
                                rows={3}
                            />
                        </div>
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
               {(currentStep.content.questionType === 'text' || currentStep.content.questionType === 'multiple-select-plus-text') && (
                 <CardFooter>
                    <Button onClick={handleNext} className="w-full" disabled={isSubmitting}>Continuar</Button>
                 </CardFooter>
               )}
            </Card>
          </div>
        )
    case 'vitals':
        return <VitalsStep step={currentStep} onComplete={handleNext} />;
    default:
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Fim do Quiz!</h2>
                <Button onClick={() => router.push('/treinos')}>Ver meu plano!</Button>
            </div>
        );
    }
  };


  if (authLoading || isSubmitting || isLoadingConfig) {
    return (
        <div className="flex justify-center items-center h-screen bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <StoryLayout step={currentStepIndex + 1} totalSteps={quizSteps?.length || 0}>
      <div className="w-full h-full flex-1">
        {renderStepContent()}
      </div>
    </StoryLayout>
  );
}
