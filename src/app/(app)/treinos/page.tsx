
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dumbbell, Flame, Lock, Play, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useQuiz } from "@/services/quiz-service";
import * as React from 'react';
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

const baseWorkouts = [
  { id: 1, title: 'HIIT Intenso', description: 'Queima máxima de calorias em 20 minutos.', icon: Flame },
  { id: 2, title: 'Força Total', description: 'Foco em construção muscular e definição.', icon: Dumbbell },
  { id: 3, title: 'Mobilidade e Core', description: 'Melhore sua flexibilidade e fortaleça seu abdômen.', icon: Play },
];

const totalDays = 21;

function WorkoutCard({ day, isCompleted, isCurrent, isLocked }: { day: number, isCompleted: boolean, isCurrent: boolean, isLocked: boolean }) {
    const cardContent = (
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-300 h-full hover:bg-muted/50",
            isCurrent && "border-primary ring-2 ring-primary",
            isCompleted && "bg-muted/50 border-dashed",
            isLocked && "cursor-not-allowed"
        )}>
            <CardContent className="p-4 flex items-center gap-4">
                    {isCompleted ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-green-500">
                        <CheckCircle className="h-6 w-6" />
                        </div>
                    ) : isCurrent ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary animate-pulse">
                            <Play className="h-6 w-6" />
                    </div>
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        </div>
                    )}
                <div>
                    <p className={cn("font-semibold", isCompleted && "text-muted-foreground line-through")}>Dia {day}</p>
                </div>
            </CardContent>
        </Card>
    );

    if (isLocked) {
        return (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <div className="cursor-pointer">{cardContent}</div>
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
            {cardContent}
        </Link>
    );
}


export default function TreinosPage() {
  const { answers, isWorkoutCompleted } = useQuiz();
  const completedWorkouts = answers.completedWorkouts || [];
  const focusDays = completedWorkouts.length;
  const progressPercentage = (focusDays / totalDays) * 100;

  // Determine o dia atual para o usuário.
  // O dia atual é o primeiro dia não concluído.
  // Se todos estiverem concluídos, o dia atual é o último dia.
  let currentDay = 1;
  while(isWorkoutCompleted(currentDay) && currentDay < totalDays) {
    currentDay++;
  }
  if (focusDays === totalDays) {
    currentDay = totalDays;
  }

  const currentWorkoutDetails = baseWorkouts[(currentDay - 1) % baseWorkouts.length];
  
  const dailyWorkouts = Array.from({ length: totalDays }, (_, i) => {
      const day = i + 1;
      const workout = baseWorkouts[i % baseWorkouts.length];
      return {
          day: day,
          title: workout.title,
          description: workout.description,
      }
  });

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-headline text-foreground">
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
            {/* Today's Workout Card */}
            <Card className="bg-gradient-to-br from-primary/20 to-card">
                 <CardHeader>
                    <CardDescription className="font-semibold text-primary">TREINO DE HOJE: DIA {currentDay}</CardDescription>
                    <CardTitle className="text-3xl">{currentWorkoutDetails.title}</CardTitle>
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

            {/* Journey Timeline */}
            <div>
                <h2 className="text-xl font-bold mb-4">Seu Histórico de Treinos</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dailyWorkouts.map((workout) => {
                        const isCompleted = isWorkoutCompleted(workout.day);
                        const isCurrent = workout.day === currentDay;
                        // A day is locked if it's not completed, not the current day, AND it's in the future
                        const isLocked = !isCompleted && !isCurrent && workout.day > currentDay;

                        return (
                            <WorkoutCard
                                key={workout.day}
                                day={workout.day}
                                isCompleted={isCompleted}
                                isCurrent={isCurrent}
                                isLocked={isLocked}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

