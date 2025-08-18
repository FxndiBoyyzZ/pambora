// src/components/quiz/scratch-card-step.tsx
'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle } from 'lucide-react';

interface ScratchCardStepProps {
  step: {
    content: {
      title: string;
      description: string;
      prizeText: string;
      backgroundUrl: string;
    };
  };
  onComplete: () => void;
}

export function ScratchCardStep({ step, onComplete }: ScratchCardStepProps) {
  const [isRevealed, setIsRevealed] = React.useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-cover bg-center" style={{ backgroundImage: `url('${step.content.backgroundUrl}')` }}>
      <Card className="w-full max-w-sm bg-background/80 backdrop-blur-sm text-foreground text-center">
        <CardHeader>
          <CardTitle>{step.content.title}</CardTitle>
          <CardDescription>{step.content.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-dashed border-primary/50 bg-muted/30 flex items-center justify-center p-4">
            <AnimatePresence>
              {!isRevealed && (
                <motion.div
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-gradient-to-br from-primary/80 to-accent/80 flex flex-col items-center justify-center cursor-pointer"
                  onClick={handleReveal}
                >
                  <Sparkles className="h-12 w-12 text-primary-foreground/80 mb-4" />
                  <p className="font-bold text-primary-foreground text-lg">Clique para Raspar</p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {isRevealed && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-center"
                >
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <p className="text-2xl font-bold text-primary">{step.content.prizeText}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
        <CardFooter>
            {isRevealed ? (
                 <Button onClick={onComplete} className="w-full">
                    Continuar
                 </Button>
            ) : (
                <Button onClick={handleReveal} className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Revelar Prêmio
                </Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
