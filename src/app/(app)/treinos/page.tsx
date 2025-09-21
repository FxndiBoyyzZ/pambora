// src/app/(app)/treinos/page.tsx
'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dumbbell, Flame, ArrowRight, Loader2, CalendarClock } from "lucide-react";
import Link from "next/link";
import { useQuiz } from "@/services/quiz-service";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { isBefore, startOfDay, intervalToDuration, type Duration } from 'date-fns';

const totalDays = 21;
// Data de início do desafio (importante: o mês é baseado em zero, então 8 = Setembro)
const challengeStartDate = new Date(2025, 8, 22, 0, 0, 0);

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

const Countdown = () => {
    const [duration, setDuration] = React.useState<Duration>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    React.useEffect(() => {
        const calculateDuration = () => {
            const now = new Date();
            if (isBefore(now, challengeStartDate)) {
                setDuration(intervalToDuration({ start: now, end: challengeStartDate }));
            } else {
                setDuration({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateDuration();
        const intervalId = setInterval(calculateDuration, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const timeUnits = [
        { label: 'Horas', value: duration.hours ?? 0 },
        { label: 'Min', value: duration.minutes ?? 0 },
        { label: 'Seg', value: duration.seconds ?? 0 },
    ];

    return (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            {timeUnits.map(unit => (
                <div key={unit.label} className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-3xl font-bold text-primary">{String(unit.value).padStart(2, '0')}</div>
                    <div className="text-xs text-muted-foreground uppercase">{unit.label}</div>
                </div>
            ))}
        </div>
    );
};

export default function TreinosPage() {
    // Hooks sempre no topo
    const { answers, loading: isQuizLoading } = useQuiz();
    const [unlockedDays, setUnlockedDays] = React.useState(0);
    const [workoutsConfig, setWorkoutsConfig] = React.useState<any[]>([]);
    const [configLoading, setConfigLoading] = React.useState(true);
    
    // Carrega a configuração do admin
    React.useEffect(() => {
        const fetchConfig = async () => {
            setConfigLoading(true);
            try {
                const controlsDoc = await getDoc(doc(db, 'config', 'workoutControls'));
                if (controlsDoc.exists()) {
                    setUnlockedDays(controlsDoc.data().unlockedDays || 0);
                }
                const workoutsDoc = await getDoc(doc(db, 'config', 'workouts'));
                if (workoutsDoc.exists()) {
                    setWorkoutsConfig(workoutsDoc.data().workouts);
                }
            } catch (error) {
                console.error("Error fetching config:", error);
            } finally {
                setConfigLoading(false);
            }
        };
        fetchConfig();
    }, []);

    // Determina se o desafio começou com base na configuração do admin
    const isChallengeStarted = unlockedDays > 0;

    // Lógica de cálculo dos dados do usuário
    const completedWorkouts = isChallengeStarted ? (answers.completedWorkouts || []) : [];
    const focusDays = completedWorkouts.length;
    const progressPercentage = (focusDays / totalDays) * 100;
    
    const totalCaloriesBurned = React.useMemo(() => {
        if (!isChallengeStarted || !workoutsConfig.length || !completedWorkouts.length) return 0;
        
        return completedWorkouts.reduce((acc, day) => {
            const workout = workoutsConfig[(day - 1) % workoutsConfig.length];
            return acc + (workout?.calories || 0);
        }, 0);
    }, [completedWorkouts, workoutsConfig, isChallengeStarted]);
    
    // Dados para o card de "Treino de Hoje"
    const currentDayForDisplay = unlockedDays > totalDays ? totalDays : unlockedDays;
    const currentWorkoutDetails = isChallengeStarted && workoutsConfig.length > 0
        ? workoutsConfig[(currentDayForDisplay - 1) % workoutsConfig.length]
        : null;

    // Estado de carregamento principal
    if (isQuizLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-full">
            {/* Header com progresso */}
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
                {configLoading ? (
                     <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : !isChallengeStarted ? (
                    // Tela de PRÉ-DESAFIO (Estática)
                    <>
                        <Card className="bg-gradient-to-br from-muted/50 to-card text-center">
                            <CardHeader>
                                <div className="flex justify-center mb-2">
                                    <CalendarClock className="h-10 w-10 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-headline tracking-wide">O Desafio Começa em Breve!</CardTitle>
                                <CardDescription className="text-md text-foreground/80 max-w-md mx-auto">
                                    A sua jornada de 21 dias para uma vida mais saudável está prestes a começar.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Countdown />
                            </CardContent>
                        </Card>
                        <div>
                            <h2 className="text-xl font-bold mb-4 font-headline tracking-wide text-center">Seu Progresso</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <StatCard 
                                    icon={Flame}
                                    title="Calorias Queimadas"
                                    value={"0"}
                                    description="Estimativa dos treinos concluídos"
                                />
                                <StatCard 
                                    icon={Dumbbell}
                                    title="Treinos Concluídos"
                                    value={`0 de ${totalDays}`}
                                    description="Prepare-se para começar!"
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    // Tela do DESAFIO ATIVO
                    <>
                        <Card className="bg-gradient-to-br from-primary/20 to-card">
                            <CardHeader>
                                <CardDescription className="font-semibold text-primary">TREINO DE HOJE: DIA {currentDayForDisplay}</CardDescription>
                                <CardTitle className="text-3xl font-headline tracking-wide">{currentWorkoutDetails?.title || 'Treino não encontrado'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">{currentWorkoutDetails?.description || '...'}</p>
                                <Link href={`/treinos/${currentDayForDisplay}`} passHref>
                                    <Button size="lg" className="w-full sm:w-auto" disabled={!currentWorkoutDetails}>
                                        Começar Agora <ArrowRight className="ml-2" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <div>
                            <h2 className="text-xl font-bold mb-4 font-headline tracking-wide text-center">Seu Progresso</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <StatCard 
                                    icon={Flame}
                                    title="Calorias Queimadas"
                                    value={totalCaloriesBurned.toLocaleString('pt-BR')}
                                    description="Estimativa dos treinos concluídos"
                                />
                                <StatCard 
                                    icon={Dumbbell}
                                    title="Treinos Concluídos"
                                    value={`${focusDays} de ${totalDays}`}
                                    description="Continue com foco total!"
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
