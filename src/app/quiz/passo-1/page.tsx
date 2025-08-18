'use client';

import { useQuiz } from '@/services/quiz-service';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const goals = [
  { id: 'perder-peso', label: 'Perder Peso' },
  { id: 'ganhar-massa', label: 'Ganhar Massa Muscular' },
  { id: 'manter-forma', label: 'Manter a Forma' },
  { id: 'melhorar-saude', label: 'Melhorar a Saúde Geral' },
];

export default function QuizStep1() {
  const router = useRouter();
  const { answers, setAnswer } = useQuiz();

  const handleNext = () => {
    router.push('/quiz/passo-2');
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <Progress value={33} className="mb-4" />
        <CardTitle>Passo 1 de 3: Seu Objetivo</CardTitle>
        <CardDescription>Qual é o seu principal objetivo ao iniciar este desafio?</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={answers.goal}
          onValueChange={(value) => setAnswer('goal', value)}
          className="space-y-3"
        >
          {goals.map((goal) => (
            <Label
              key={goal.id}
              htmlFor={goal.id}
              className="flex items-center space-x-3 rounded-md border p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground has-[input:checked]:bg-primary has-[input:checked]:text-primary-foreground"
            >
              <RadioGroupItem value={goal.id} id={goal.id} />
              <span>{goal.label}</span>
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button onClick={handleNext} disabled={!answers.goal} className="ml-auto">
          Próximo
        </Button>
      </CardFooter>
    </Card>
  );
}
