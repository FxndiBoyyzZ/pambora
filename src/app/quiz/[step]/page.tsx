
'use client';
import { useQuiz } from '@/services/quiz-service';
import { useRouter, useParams } from 'next/navigation';
import { StoryLayout } from '@/components/quiz/story-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Play } from 'lucide-react';

// Mock data, replace with real data as needed
const goals = [
  { id: 'perder-peso', label: 'Perder Peso' },
  { id: 'ganhar-massa', label: 'Ganhar Massa Muscular' },
  { id: 'manter-forma', label: 'Manter a Forma' },
  { id: 'melhorar-saude', label: 'Melhorar a Saúde Geral' },
];

const diets = [
  { id: 'sem-restricao', label: 'Sem Restrições' },
  { id: 'vegetariana', label: 'Vegetariana' },
  { id: 'vegana', label: 'Vegana' },
  { id: 'low-carb', label: 'Low-Carb' },
];

const bonusOptions = [
    { id: 'sim', label: 'Sim, quero o plano personalizado!' },
    { id: 'nao', label: 'Não, seguirei o padrão.' },
]

export default function QuizStepPage() {
  const router = useRouter();
  const params = useParams();
  const step = parseInt(params.step as string, 10);
  const { answers, setAnswer } = useQuiz();

  const handleNext = () => {
     if (step < 10) { // Total steps
      router.push(`/quiz/${step + 1}`);
    } else {
      router.push('/treinos');
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
      case 5:
      case 8:
        return (
            <div className="w-full h-full bg-black flex flex-col justify-center items-center text-center p-8">
                 <div className="relative w-full aspect-9/16 max-h-full">
                    <video
                        src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                    ></video>
                    <div className="absolute inset-0 bg-black/30 flex justify-center items-center">
                       <Play className="text-white/70 h-16 w-16" />
                    </div>
                </div>
                <p className="text-white mt-4 text-sm">Vídeo impulsionável</p>
            </div>
        )
      case 2:
        return (
          <div className="w-full h-full flex items-center justify-center p-4 bg-cover bg-center" style={{backgroundImage: "url('https://placehold.co/420x850.png')"}}>
            <Card className="w-full max-w-sm bg-background/80 backdrop-blur-sm text-foreground">
              <CardHeader>
                <CardTitle>Quase lá!</CardTitle>
                <CardDescription>Nos conte um pouco sobre você para personalizar sua experiência.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" placeholder="Seu nome completo" value={answers.name || ''} onChange={(e) => setAnswer('name', e.target.value)} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="whatsapp">Whatsapp</Label>
                  <Input id="whatsapp" placeholder="(00) 00000-0000" value={answers.whatsapp || ''} onChange={(e) => setAnswer('whatsapp', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" value={answers.email || ''} onChange={(e) => setAnswer('email', e.target.value)} />
                </div>
              </CardContent>
              <CardFooter>
                 <Button onClick={handleNext} className="w-full" disabled={!answers.name || !answers.whatsapp || !answers.email}>Continuar</Button>
              </CardFooter>
            </Card>
          </div>
        );
      case 3:
      case 6:
        const currentGoals = step === 3 ? goals : diets;
        const currentAnswer = step === 3 ? answers.goal : answers.diet;
        const setAnswerKey = step === 3 ? 'goal' : 'diet';
        const title = step === 3 ? "Qual seu objetivo?" : "Você tem alguma preferência de dieta?";

        return (
             <div className="w-full h-full flex items-center justify-center p-4 bg-cover bg-center" style={{backgroundImage: "url('https://placehold.co/420x850.png')"}}>
                <Card className="w-full max-w-sm bg-background/80 backdrop-blur-sm text-foreground">
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={currentAnswer}
                            onValueChange={(value) => {
                                setAnswer(setAnswerKey, value);
                                setTimeout(handleNext, 300);
                            }}
                            className="space-y-3"
                            >
                            {currentGoals.map((item) => (
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
                    </CardContent>
                 </Card>
            </div>
        )
       case 4:
       case 7:
        const setAllergiesKey = 'allergies';
        const allergiesTitle = "Você possui alguma alergia ou restrição alimentar?";

        return (
            <div className="w-full h-full flex items-center justify-center p-4 bg-cover bg-center" style={{backgroundImage: "url('https://placehold.co/420x850.png')"}}>
            <Card className="w-full max-w-sm bg-background/80 backdrop-blur-sm text-foreground">
              <CardHeader>
                <CardTitle>{allergiesTitle}</CardTitle>
                 <CardDescription>(Opcional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="allergies">Alergias</Label>
                  <Input id="allergies" placeholder="Ex: Glúten, lactose..." value={answers.allergies || ''} onChange={(e) => setAnswer(setAllergiesKey, e.target.value)} />
                </div>
              </CardContent>
              <CardFooter>
                 <Button onClick={handleNext} className="w-full">Continuar</Button>
              </CardFooter>
            </Card>
          </div>
        )
      case 9:
         return (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-cover bg-center" style={{backgroundImage: "url('https://placehold.co/420x850.png')"}}>
                <Card className="w-full max-w-sm bg-background/80 backdrop-blur-sm text-foreground text-center">
                    <CardHeader>
                        <CardTitle>Gire a Roda da Sorte!</CardTitle>
                        <CardDescription>Você ganhou um prêmio especial!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Placeholder for Wheel of Fortune */}
                        <div className="w-64 h-64 bg-gradient-to-tr from-primary to-accent rounded-full mx-auto flex items-center justify-center animate-spin" style={{animationDuration: '5s'}}>
                            <span className="text-2xl font-bold text-primary-foreground">🎁</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleNext} className="w-full">Resgatar Prêmio e Continuar</Button>
                    </CardFooter>
                </Card>
            </div>
         );
    case 10:
        return (
             <div className="w-full h-full flex items-center justify-center p-4 bg-cover bg-center" style={{backgroundImage: "url('https://placehold.co/420x850.png')"}}>
                <Card className="w-full max-w-sm bg-background/80 backdrop-blur-sm text-foreground">
                    <CardHeader>
                        <CardTitle>Bônus: Nutricionista</CardTitle>
                        <CardDescription>Quer um plano alimentar feito sob medida por um nutricionista parceiro?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={answers.bonusPlan}
                            onValueChange={(value) => {
                                setAnswer('bonusPlan', value);
                                setTimeout(handleNext, 300);
                            }}
                            className="space-y-3"
                            >
                            {bonusOptions.map((item) => (
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
                    </CardContent>
                 </Card>
            </div>
        )
      default:
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Fim do Quiz!</h2>
                <Button onClick={() => router.push('/treinos')}>Ver meu plano!</Button>
            </div>
        );
    }
  };

  const isVideoStep = [1, 5, 8].includes(step);
  const isFormStep = [2, 4, 7, 9].includes(step);
  const isFinalStep = step === 10;
  
  // Auto-advance for video steps, disabled for manual clicking
   useEffect(() => {
    if (isVideoStep) {
      const timer = setTimeout(() => {
        handleNext();
      }, 5000); // 5 second video
      return () => clearTimeout(timer);
    }
  }, [step, isVideoStep, handleNext]);

  return (
    <StoryLayout step={step} showNext={isFormStep || isFinalStep}>
        {renderStepContent()}
    </StoryLayout>
  );
}

