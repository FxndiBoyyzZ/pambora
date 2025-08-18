'use client';

import { useQuiz } from '@/services/quiz-service';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const diets = [
  { id: 'sem-restricao', label: 'Sem Restrições' },
  { id: 'vegetariana', label: 'Vegetariana' },
  { id: 'vegana', label: 'Vegana' },
  { id: 'low-carb', label: 'Low-Carb' },
];

export default function QuizStep2() {
  const router = useRouter();
  const { answers, setAnswer } = useQuiz();

  const handleNext = () => {
    router.push('/quiz/passo-3');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <Progress value={66} className="mb-4" />
        <CardTitle>Passo 2 de 3: Sua Alimentação</CardTitle>
        <CardDescription>Você segue algum tipo de dieta específica?</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={answers.diet}
          onValueChange={(value) => setAnswer('diet', value)}
          className="space-y-3"
        >
          {diets.map((diet) => (
            <Label
              key={diet.id}
              htmlFor={diet.id}
              className="flex items-center space-x-3 rounded-md border p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground has-[input:checked]:bg-primary has-[input:checked]:text-primary-foreground"
            >
              <RadioGroupItem value={diet.id} id={diet.id} />
              <span>{diet.label}</span>
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={handleBack}>
          Voltar
        </Button>
        <Button onClick={handleNext} disabled={!answers.diet}>
          Próximo
        </Button>
      </CardFooter>
    </Card>
  );
}
