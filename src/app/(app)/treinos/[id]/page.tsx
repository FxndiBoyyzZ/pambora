
'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Circle, Clock, Dumbbell, PlayCircle, Flame, Play, Info } from "lucide-react";
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


// Base Workouts that will be cycled through
const baseWorkouts = [
  {
    id: 1,
    title: 'Treino HIIT Intenso',
    description: 'Queima máxima de calorias em 20 minutos.',
    duration: '20 minutos',
    videoUrl: "https://www.youtube.com/embed/nJoG-iGk_hY", 
    exercises: [
      { name: "Burpees", reps: "3x10" },
      { name: "Agachamento com Salto", reps: "3x15" },
      { name: "Alpinista", reps: "3x30s" },
      { name: "Polichinelo", reps: "3x45s" },
    ]
  },
  {
    id: 2,
    title: 'Força Total',
    description: 'Foco em construção muscular e definição.',
    duration: '45 minutos',
    videoUrl: "https://www.youtube.com/embed/545K3byoJgE", 
    exercises: [
      { name: "Agachamento", reps: "3x12" },
      { name: "Flexão de Braço", reps: "3x10" },
      { name: "Remada com Halter", reps: "3x12" },
      { name: "Prancha", reps: "3x45s" },
    ]
  },
   {
    id: 3,
    title: 'Mobilidade e Core',
    description: 'Melhore sua flexibilidade e fortaleça seu abdômen.',
    duration: '30 minutos',
    videoUrl: "https://www.youtube.com/embed/jyV-cIC8xNo",
    exercises: [
      { name: "Prancha Lateral", reps: "3x30s cada lado" },
      { name: "Ponte de Glúteos", reps: "3x15" },
      { name: "Abdominal Remador", reps: "3x20" },
      { name: "Gato-Camelo", reps: "3x10" },
    ]
  }
];

const totalDays = 21;

export default function TreinoDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const day = parseInt(params.id as string, 10);
  
  const { answers, toggleWorkoutCompleted, isWorkoutCompleted } = useQuiz();
  const completedWorkouts = answers.completedWorkouts || [];
  
  // Determine which workout to show based on the day
  const workout = baseWorkouts[(day - 1) % baseWorkouts.length];
  const isCompleted = isWorkoutCompleted(day);

  // Determine the user's current day
  let currentDay = 1;
  while(isWorkoutCompleted(currentDay) && currentDay < totalDays) {
    currentDay++;
  }
   if (completedWorkouts.length === totalDays) {
    currentDay = totalDays;
  }

  const isTodayWorkout = day === currentDay;
  const canToggleComplete = isTodayWorkout || isCompleted;


  const handleToggleComplete = () => {
    // Prevent toggling if it's not the current day's workout (and it's not already completed)
    if (!canToggleComplete) {
       toast({
        variant: "destructive",
        title: "Ação não permitida!",
        description: `Você só pode marcar/desmarcar o treino do dia ${currentDay}.`,
      });
      return;
    }

    toggleWorkoutCompleted(day);
    toast({
        title: isCompleted ? "Treino desmarcado!" : "Parabéns!",
        description: isCompleted ? "O treino não está mais marcado como concluído." : `Você concluiu o Treino do Dia ${day}!`,
    })
  }

  if (!workout || !day) {
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
