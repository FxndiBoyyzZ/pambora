'use client';

import { useQuiz } from '@/services/quiz-service';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function QuizStep3() {
  const router = useRouter();
  const { answers, setAnswer } = useQuiz();

  const handleSubmit = () => {
    // Logic to save quiz data could go here
    router.push('/treinos');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <Progress value={100} className="mb-4" />
        <CardTitle>Passo 3 de 3: Restrições</CardTitle>
        <CardDescription>Você possui alguma alergia ou restrição alimentar? (opcional)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="allergies">Alergias</Label>
          <Input
            type="text"
            id="allergies"
            placeholder="Ex: Glúten, lactose, amendoim..."
            value={answers.allergies || ''}
            onChange={(e) => setAnswer('allergies', e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={handleBack}>
          Voltar
        </Button>
        <Button onClick={handleSubmit}>
          Finalizar e ver meu plano!
        </Button>
      </CardFooter>
    </Card>
  );
}
