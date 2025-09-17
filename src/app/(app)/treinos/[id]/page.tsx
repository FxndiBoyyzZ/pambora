
'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Circle, Clock, Dumbbell, PlayCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuiz } from '@/services/quiz-service';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

interface Exercise {
    name: string;
    reps: string;
}

interface Workout {
    id: number;
    title: string;
    description: string;
    duration: string;
    videoUrl: string;
    exercises: Exercise[];
}

export default function TreinoDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const { answers, toggleWorkoutCompleted, isWorkoutCompleted, loading: quizLoading } = useQuiz();

  const [workout, setWorkout] = React.useState<Workout | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [unlockedDays, setUnlockedDays] = React.useState(1);
  
  const day = parseInt(params.id as string, 10);
  const isCompleted = isWorkoutCompleted(day);

  React.useEffect(() => {
    const fetchWorkoutConfig = async () => {
        setLoading(true);
        try {
            const configDocRef = doc(db, 'config', 'workouts');
            const configDoc = await getDoc(configDocRef);

            const controlsDocRef = doc(db, 'config', 'workoutControls');
            const controlsDoc = await getDoc(controlsDocRef);

            if (configDoc.exists()) {
                const allWorkouts = configDoc.data().workouts as Workout[];
                // Determine which workout to show based on the day
                const workoutToShow = allWorkouts[(day - 1) % allWorkouts.length];
                setWorkout(workoutToShow);
            }

             if (controlsDoc.exists()) {
                setUnlockedDays(controlsDoc.data().unlockedDays);
            }
        } catch (error) {
            console.error("Failed to fetch workout config:", error);
            toast({
                variant: "destructive",
                title: "Erro ao carregar treino",
                description: "Não foi possível buscar os detalhes do treino.",
            });
        } finally {
            setLoading(false);
        }
    };

    fetchWorkoutConfig();
  }, [day, toast]);
  

  const isTodayWorkout = day === unlockedDays;
  const canToggleComplete = isTodayWorkout || isCompleted;


  const handleToggleComplete = () => {
    if (!canToggleComplete) {
       toast({
        variant: "destructive",
        title: "Ação não permitida!",
        description: `Você só pode marcar/desmarcar o treino do dia atual (${unlockedDays}).`,
      });
      return;
    }

    toggleWorkoutCompleted(day);
    toast({
        title: isCompleted ? "Treino desmarcado!" : "Parabéns!",
        description: isCompleted ? "O treino não está mais marcado como concluído." : `Você concluiu o Treino do Dia ${day}!`,
    })
  }

  if (loading || quizLoading) {
     return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Treino não encontrado.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
        <header className="p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
            <h1 className="text-3xl font-bold font-headline text-foreground uppercase tracking-wider">Treino do Dia {day}</h1>
            <p className="text-muted-foreground">{workout.title}</p>
        </header>

        <div className="flex-grow p-4 md:p-6 lg:p-8 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PlayCircle className="h-6 w-6 text-primary" />
                        Vídeo do Treino
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="aspect-video rounded-lg overflow-hidden border">
                         <iframe
                            className="w-full h-full"
                            src={workout.videoUrl}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Dumbbell className="h-6 w-6 text-primary" />
                           Exercícios
                        </CardTitle>
                        <CardDescription>Siga as séries e repetições para melhores resultados.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {workout.exercises.map((ex, index) => (
                                <li key={index} className="flex justify-between items-center p-2 rounded-md bg-muted">
                                    <span className="font-medium">{ex.name}</span>
                                    <span className="text-sm text-muted-foreground font-semibold">{ex.reps}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Clock className="h-6 w-6 text-primary" />
                           Informações
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Duração Estimada</span>
                            <span className="font-bold">{workout.duration}</span>
                        </div>
                         <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Tipo</span>
                            <span className="font-bold">{workout.description}</span>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-full">
                                <Button className="w-full mt-4" onClick={handleToggleComplete} disabled={!canToggleComplete}>
                                    {isCompleted ? (
                                        <>
                                         <CheckCircle className="mr-2 h-5 w-5" />
                                         Treino Concluído
                                        </>
                                    ) : (
                                        <>
                                         <Circle className="mr-2 h-5 w-5" />
                                         Marcar como Concluído
                                        </>
                                    )}
                                </Button>
                               </div>
                            </TooltipTrigger>
                            {!canToggleComplete && (
                                <TooltipContent>
                                    <p>Você só pode concluir o treino do dia atual.</p>
                                </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                     </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
