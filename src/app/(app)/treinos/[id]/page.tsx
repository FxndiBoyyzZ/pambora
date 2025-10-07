
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
import { differenceInCalendarDays, isBefore, startOfDay } from 'date-fns';

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

// Data de início do desafio (importante: o mês é baseado em zero, então 8 = Setembro)
const challengeStartDate = startOfDay(new Date(2025, 8, 22));

function getEmbedUrl(url: string): string {
    if (!url) return '';
    // YouTube: youtu.be/VIDEO_ID or youtube.com/watch?v=VIDEO_ID or youtube.com/embed/VIDEO_ID
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})(?:\S+)?/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo: vimeo.com/VIDEO_ID or player.vimeo.com/video/VIDEO_ID
    const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?(?:player\.)?vimeo.com\/(?:video\/)?(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Return original url if no match
    return url;
}

export default function TreinoDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const { toggleWorkoutCompleted, isWorkoutCompleted, loading: quizLoading } = useQuiz();

  const [workout, setWorkout] = React.useState<Workout | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  const day = parseInt(params.id as string, 10);
  const isCompleted = isWorkoutCompleted(day);

  // Calcula qual o dia liberado atualmente
  const today = startOfDay(new Date());
  const unlockedDays = isBefore(today, challengeStartDate)
    ? 0
    : differenceInCalendarDays(today, challengeStartDate) + 1;

  React.useEffect(() => {
    const fetchWorkoutConfig = async () => {
        setLoading(true);
        try {
            const configDocRef = doc(db, 'config', 'workouts');
            const configDoc = await getDoc(configDocRef);

            if (configDoc.exists()) {
                const allWorkouts = configDoc.data().workouts as Workout[];
                // O treino base roda de 1 a 3. A fórmula (day - 1) % 3 garante isso.
                const workoutToShow = allWorkouts[(day - 1) % allWorkouts.length];
                setWorkout(workoutToShow);
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

    if (day > 0) {
        fetchWorkoutConfig();
    }
  }, [day, toast]);
  

  const isTodayWorkout = day === unlockedDays;
  const canToggleComplete = day <= unlockedDays && day > 0;

  const handleToggleComplete = () => {
    if (!canToggleComplete) {
       toast({
        variant: "destructive",
        title: "Ação não permitida!",
        description: `Você só pode marcar treinos até o dia de hoje (${unlockedDays}).`,
      });
      return;
    }

    toggleWorkoutCompleted(day);
    toast({
        title: isCompleted ? "Treino desmarcado!" : "Parabéns!",
        description: isCompleted ? "O treino não está mais marcado como concluído." : `Você concluiu o Treino do Dia ${day}!`,
    })
  };
  
  const embedUrl = workout ? getEmbedUrl(workout.videoUrl) : '';

  if (loading || quizLoading) {
     return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="flex items-center justify-center h-full text-center p-4">
        <p>Treino não encontrado ou ainda não liberado.</p>
      </div>
    );
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
                            src={embedUrl}
                            title="Workout video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
                        </Title>
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
                        </Title>
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
                                    <p>Você só pode marcar treinos de dias anteriores ou do dia atual.</p>
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
