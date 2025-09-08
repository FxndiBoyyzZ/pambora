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
import { VitalsStep } from '@/components/quiz/vitals-step';
import { ScratchCardStep } from '@/components/quiz/scratch-card-step';
import { Checkbox } from '@/components/ui/checkbox';


export default function QuizPage() {
  const router = useRouter();
  const [quizSteps, setQuizSteps] = useState<QuizStep[]>(localQuizSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { answers, setAnswer, signUp, user, loading: authLoading } = useQuiz();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef<HTMLIFrameElement>(null);
  
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [otherAllergy, setOtherAllergy] = useState('');


  useEffect(() => {
    // If a permanent user lands on the quiz, push them to the app.
    // Anonymous users should proceed with the quiz.
    if (user && !user.isAnonymous && !authLoading) {
      router.push('/treinos');
    }
  }, [user, authLoading, router]);
  
  const handleNext = useCallback(async () => {
    if (quizSteps.length === 0) return;
    
    // Logic to save multiple-select answers
    const currentStep = quizSteps[currentStepIndex];
    if (currentStep.type === 'question' && currentStep.content.questionType === 'multiple-select') {
        const finalAllergies = selectedAllergies.filter(a => a !== 'Outra');
        if (selectedAllergies.includes('Outra') && otherAllergy) {
            finalAllergies.push(otherAllergy);
        }
        setAnswer('allergies', finalAllergies.join(', '));
    }


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
  }, [quizSteps, currentStepIndex, signUp, answers, router, selectedAllergies, otherAllergy, setAnswer]);

  useEffect(() => {
    const currentStep = quizSteps[currentStepIndex];
    if (currentStep && currentStep.type === 'video') {
      const handleVimeoMessage = (event: MessageEvent) => {
        if (event.origin !== 'https://player.vimeo.com') return;
        if (event.data?.method === 'onEnded') {
          handleNext();
        }
      };

      window.addEventListener('message', handleVimeoMessage);

      // Tell vimeo player to listen to events
      const tellVimeo = (method: string) => {
        videoRef.current?.contentWindow?.postMessage(JSON.stringify({ method }), '*');
      };

      const intervalId = setInterval(() => {
        tellVimeo('addEventListener');
        tellVimeo('play'); // Attempt to play again in case autoplay was blocked
      }, 1000);


      return () => {
        window.removeEventListener('message', handleVimeoMessage);
        clearInterval(intervalId);
      };
    }
  }, [currentStepIndex, quizSteps, handleNext]);


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
        return (
          <div className="w-full h-full bg-black flex flex-col justify-center items-center text-center p-0">
            <div className="relative w-full aspect-[9/16] max-h-full">
                 <iframe
                    ref={videoRef}
                    src={`${currentStep.content.videoUrl}&dnt=1&app_id=123456`}
                    className="w-full h-full object-cover border-0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                 ></iframe>
            </div>
          </div>
        );
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
