// src/components/quiz/vitals-step.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuiz } from '@/services/quiz-service';
import { cn } from '@/lib/utils';
import { Slider } from '../ui/slider';
import { Ruler, Weight, User } from 'lucide-react';

interface VitalsStepProps {
  step: {
    content: {
      title: string;
      description: string;
      backgroundUrl: string;
    };
  };
  onComplete: () => void;
}

export function VitalsStep({ step, onComplete }: VitalsStepProps) {
  const { answers, setAnswer } = useQuiz();
  const [height, setHeight] = React.useState(answers.height || 160);
  const [weight, setWeight] = React.useState(answers.weight || 60);

  const handleNext = () => {
    setAnswer('gender', 'female'); // Define 'female' como padrão
    setAnswer('height', height);
    setAnswer('weight', weight);
    onComplete();
  };
  
  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-cover bg-center" style={{ backgroundImage: `url('${step.content.backgroundUrl}')` }}>
      <Card className="w-full max-w-md bg-background/80 backdrop-blur-sm text-foreground">
        <CardHeader>
          <CardTitle>{step.content.title}</CardTitle>
          <CardDescription>{step.content.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Height Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
                <label className="font-medium text-foreground/90">Sua altura</label>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary">{height}</span>
                    <span className="text-sm text-muted-foreground">cm</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Ruler className="h-5 w-5 text-muted-foreground" />
                <Slider
                    value={[height]}
                    onValueChange={(value) => setHeight(value[0])}
                    min={120}
                    max={220}
                    step={1}
                />
            </div>
          </div>
          {/* Weight Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
                <label className="font-medium text-foreground/90">Seu peso</label>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary">{weight}</span>
                    <span className="text-sm text-muted-foreground">kg</span>
                </div>
            </div>
             <div className="flex items-center gap-4">
                <Weight className="h-5 w-5 text-muted-foreground" />
                <Slider
                    value={[weight]}
                    onValueChange={(value) => setWeight(value[0])}
                    min={40}
                    max={150}
                    step={1}
                />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleNext} className="w-full">Continuar</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
