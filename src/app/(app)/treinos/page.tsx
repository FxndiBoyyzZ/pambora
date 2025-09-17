// src/app/(app)/treinos/page.tsx
'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dumbbell, Flame, TrendingUp, Target, ArrowRight, Loader2, CalendarClock } from "lucide-react";
import Link from "next/link";
import { useQuiz } from "@/services/quiz-service";
import { isBefore, startOfDay } from 'date-fns';

const baseWorkouts = [
  { id: 1, title: 'HIIT Intenso', description: 'Queima máxima de calorias em 20 minutos.', calories: 300, icon: Flame },
  { id: 2, title: 'Força Total', description: 'Foco em construção muscular e definição.', calories: 400, icon: Dumbbell },
  { id: 3, title: 'Mobilidade e Core', description: 'Melhore sua flexibilidade e fortaleça seu abdômen.', calories: 150, icon: Target },
];

const totalDays = 21;
// Set the start date for the challenge
const challengeStartDate = new Date('2024-09-22T00:00:00');


const StatCard = ({ icon: Icon, title, value, description }: { icon: React.ElementType, title: string, value: string, description: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

export default function TreinosPage() {
  const { answers, isWorkoutCompleted, loading: isQuizLoading } = useQuiz();
  
  // This is the core logic fix: Determine if the challenge has started.
  const today = startOfDay(new Date());
  const isChallengeStarted = !isBefore(today, challengeStartDate);

  // If the challenge has NOT started, completedWorkouts should be treated as empty.
  const completedWorkouts = isChallengeStarted ? (answers.completedWorkouts || []) : [];
  const focusDays = completedWorkouts.length;
  const progressPercentage = (focusDays / totalDays) * 100;

  // Determine the current day
  let currentDay = 1;
  // This loop should only run if the challenge has started.
  if (isChallengeStarted) {
    while (isWorkoutCompleted(currentDay) && currentDay < totalDays) {
      currentDay++;
    }
     if (focusDays === totalDays) {
      currentDay = totalDays;
    }
  }
  
  const currentWorkoutDetails = baseWorkouts[(currentDay - 1) % baseWorkouts.length];
  
  // Calculate estimates
  const totalCaloriesBurned = React.useMemo(() => {
    // This will correctly calculate 0 if completedWorkouts is empty (because the challenge hasn't started)
    return completedWorkouts.reduce((acc, day) => {
        const workout = baseWorkouts[(day - 1) % baseWorkouts.length];
        return acc + workout.calories;
    }, 0);
  }, [completedWorkouts]);

  const projection = React.useMemo(() => {
    const weeklyChangeKg = answers.goal === "Perder Peso" ? -0.5 : 0.25; // Média de 0.5kg/semana para perda e 0.25kg/semana para ganho
    const changeIn6Months = weeklyChangeKg * 4.33 * 6; // 4.33 semanas por mês
    return {
        value: `${changeIn6Months.toFixed(1)} kg`,
        label: answers.goal === "Perder Peso" ? "a menos" : "a mais",
    };
  }, [answers.goal]);


  if (isQuizLoading) {
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
      <div className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto space-y-8">
            {isChallengeStarted ? (
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
            ) : (
                <Card className="bg-gradient-to-br from-muted/50 to-card text-center">
                    <CardHeader>
                        <div className="flex justify-center mb-2">
                            <CalendarClock className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-headline tracking-wide">O Desafio Começa em Breve!</CardTitle>
                        <CardDescription className="text-md text-foreground/80 max-w-md mx-auto">
                            Sua jornada está prestes a começar. O treino do Dia 1 será liberado em:
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-primary">Segunda-feira, 22 de Setembro</p>
                        <p className="text-muted-foreground mt-4">Enquanto isso, que tal explorar a seção de bônus ou se apresentar na comunidade #PAMBORA?</p>
                    </CardContent>
                </Card>
            )}

            <div>
                <h2 className="text-xl font-bold mb-4 font-headline tracking-wide text-center">Seu Progresso</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard 
                        icon={Flame}
                        title="Calorias Queimadas"
                        value={totalCaloriesBurned.toLocaleString('pt-BR')}
                        description="Estimativa dos treinos concluídos"
                    />
                    <StatCard 
                        icon={TrendingUp}
                        title="Projeção para 6 Meses"
                        value={projection.value}
                        description={`Estimativa de peso ${projection.label}`}
                    />
                    <StatCard 
                        icon={Dumbbell}
                        title="Treinos Concluídos"
                        value={`${focusDays} de ${totalDays}`}
                        description="Continue com foco total!"
                    />
                </div>
            </div>
      </div>
    </div>
  );
}
