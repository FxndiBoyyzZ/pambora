// src/app/(app)/treinos/page.tsx
'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dumbbell, Flame, Lock, Play, CheckCircle, ArrowRight, Loader2, Award } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useQuiz } from "@/services/quiz-service";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const baseWorkouts = [
  { id: 1, title: 'HIIT Intenso', description: 'Queima máxima de calorias em 20 minutos.', icon: Flame },
  { id: 2, title: 'Força Total', description: 'Foco em construção muscular e definição.', icon: Dumbbell },
  { id: 3, title: 'Mobilidade e Core', description: 'Melhore sua flexibilidade e fortaleça seu abdômen.', icon: Play },
];

const totalDays = 21;
const checkpoints = [7, 14, 21];

function JourneyNode({ day, isCompleted, isCurrent, isLocked }: { day: number, isCompleted: boolean, isCurrent: boolean, isLocked: boolean }) {
    const isCheckpoint = checkpoints.includes(day);

    const nodeContent = (
         <div className={cn(
            "relative w-16 h-16 rounded-full flex items-center justify-center border-4",
            isCompleted ? "bg-green-500 border-green-700" : "bg-muted border-border",
            isCurrent && "border-primary ring-4 ring-primary/50 animate-pulse",
            isLocked && "bg-muted/50 border-dashed"
         )}>
            {isLocked && <Lock className="h-6 w-6 text-muted-foreground/50" />}
            {isCompleted && <CheckCircle className="h-8 w-8 text-white" />}
            {isCurrent && <Play className="h-8 w-8 text-primary" />}
            {!isLocked && !isCompleted && !isCurrent && (
                <span className="text-xl font-bold text-muted-foreground">{day}</span>
            )}

            {isCheckpoint && (
                <div className="absolute -top-4 -right-4 bg-amber-400 p-1.5 rounded-full border-2 border-background shadow-md">
                    <Award className="h-5 w-5 text-amber-900" />
                </div>
            )}
        </div>
    );
    
    const nodeWithTooltip = (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{nodeContent}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Dia {day}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    if (isLocked) {
        return (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <div className="cursor-pointer">{nodeWithTooltip}</div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Calma, Fera!</AlertDialogTitle>
                        <AlertDialogDescription>
                            Um passo de cada vez. Foco total no treino de hoje e logo você desbloqueará este desafio. #PAMBORA
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction>Entendido!</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    }

    return (
        <Link href={`/treinos/${day}`} passHref>
            {nodeWithTooltip}
        </Link>
    );
}

export default function TreinosPage() {
  const { answers, isWorkoutCompleted } = useQuiz();
  const [workoutControls, setWorkoutControls] = React.useState({ unlockedDays: 21 });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchWorkoutConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'config', 'workoutControls'));
        if (configDoc.exists()) {
          setWorkoutControls(configDoc.data() as { unlockedDays: number });
        }
      } catch (error) {
        console.error("Failed to fetch workout controls", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkoutConfig();
  }, []);

  const completedWorkouts = answers.completedWorkouts || [];
  const focusDays = completedWorkouts.length;
  const progressPercentage = (focusDays / totalDays) * 100;

  let currentDay = 1;
  while(isWorkoutCompleted(currentDay) && currentDay < totalDays) {
    currentDay++;
  }
  if (focusDays === totalDays) {
    currentDay = totalDays;
  }

  const currentWorkoutDetails = baseWorkouts[(currentDay - 1) % baseWorkouts.length];
  
  const dailyWorkouts = Array.from({ length: totalDays }, (_, i) => ({ day: i + 1 }));

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-headline text-foreground uppercase tracking-wider">
                Sua Jornada
                </h1>
                <div className="flex items-center gap-2 text-primary font-bold text-lg">
                    <Flame className="h-7 w-7" />
                    <span>{focusDays}</span>
                    <span className="text-sm font-normal text-muted-foreground">/ {totalDays} dias!</span>
                </div>
            </div>
            <Progress value={progressPercentage} className="h-2" />
        </div>
      </header>
      <div className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="space-y-8">
            <Card className="bg-gradient-to-br from-primary/20 to-card">
                 <CardHeader>
                    <CardDescription className="font-semibold text-primary">TREINO DE HOJE: DIA {currentDay}</CardDescription>
                    <CardTitle className="text-3xl font-headline tracking-wide">{currentWorkoutDetails.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">{currentWorkoutDetails.description}</p>
                    <Link href={`/treinos/${currentDay}`} passHref>
                        <Button size="lg" className="w-full sm:w-auto">
                            Começar Agora <ArrowRight className="ml-2" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            <div>
                <h2 className="text-xl font-bold mb-6 font-headline tracking-wide text-center">Mapa da sua Jornada de 21 Dias</h2>
                 <div className="relative">
                     {/* The path SVG */}
                    <svg className="absolute top-0 left-0 w-full h-full" preserveAspectRatio="none">
                        <path 
                            d="M20 40 Q 50 80, 100 80 T 200 80 Q 250 80, 280 120 T 200 160 Q 150 200, 100 200 T 20 240 Q 50 280, 100 280 T 200 280 Q 250 280, 280 320 T 200 360 Q 150 400, 100 400 T 20 440 Q 50 480, 100 480 T 200 480 Q 250 480, 280 520 T 200 560 Q 150 600, 100 600 T 20 640" 
                            fill="none" 
                            stroke="hsl(var(--border))" 
                            strokeWidth="4"
                            strokeDasharray="10 5"
                            vectorEffect="non-scaling-stroke"
                        />
                     </svg>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-x-2 gap-y-12 items-center justify-items-center">
                        {dailyWorkouts.map(({day}) => {
                            const isCompleted = isWorkoutCompleted(day);
                            const isCurrent = day === currentDay;
                            const isLocked = day > currentDay || day > workoutControls.unlockedDays;

                            return (
                                <JourneyNode
                                    key={day}
                                    day={day}
                                    isCompleted={isCompleted}
                                    isCurrent={!isLocked && isCurrent}
                                    isLocked={isLocked && !isCurrent && !isCompleted}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
