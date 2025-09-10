
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Flame, Lock, PlayCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useQuiz } from "@/services/quiz-service";

const baseWorkouts = [
  { id: 1, title: 'HIIT Intenso', description: 'Queima máxima de calorias.' },
  { id: 2, title: 'Força Total', description: 'Construção muscular.' },
  { id: 3, title: 'Mobilidade e Core', description: 'Flexibilidade e abdômen.' },
];

const totalDays = 21;
const dailyWorkouts = Array.from({ length: totalDays }, (_, i) => {
    const day = i + 1;
    const workout = baseWorkouts[(i % baseWorkouts.length)];
    return {
        day: day,
        title: workout.title,
        description: workout.description,
        // The first 3 days are unlocked by default
        unlocked: day <= 3, 
    }
});


export default function TreinosPage() {
  const { answers, isWorkoutCompleted } = useQuiz();
  const focusDays = answers.completedWorkouts?.length ?? 0;
  
  // A workout is unlocked if the previous day was completed, or if it's one of the first 3.
  const isUnlocked = (day: number) => {
    if (day <= 3) return true;
    return isWorkoutCompleted(day - 1);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <h1 className="text-2xl font-bold font-headline text-foreground">
          Treinos Diários
        </h1>
        <div className="flex items-center gap-2 text-primary font-bold text-lg">
          <Flame className="h-7 w-7" />
          <span>{focusDays}</span>
          <span className="text-sm font-normal text-muted-foreground">dias de Foco!</span>
        </div>
      </header>
      <div className="flex-grow p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {dailyWorkouts.map((workout) => {
            const unlocked = isUnlocked(workout.day);
            const completed = isWorkoutCompleted(workout.day);
            
            return (
                <Link key={workout.day} href={unlocked ? `/treinos/${workout.day}` : '#'} passHref>
                <Card className={cn(
                    "group relative overflow-hidden transition-all duration-300 h-full",
                    unlocked ? "bg-card hover:shadow-primary/20 hover:shadow-lg cursor-pointer" : "bg-muted/50 cursor-not-allowed",
                    completed && "border-primary/50"
                )}>
                    {completed && (
                        <div className="absolute top-2 right-2 bg-primary rounded-full p-1 z-10">
                            <CheckCircle className="h-4 w-4 text-primary-foreground" />
                        </div>
                    )}
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dia {workout.day}</CardTitle>
                    {unlocked ? (
                        <Dumbbell className="h-4 w-4 text-primary" />
                    ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                    </CardHeader>
                    <CardContent>
                    <div className="text-lg font-bold">{workout.title}</div>
                    <p className="text-xs text-muted-foreground">{workout.description}</p>
                    {unlocked && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <PlayCircle className="h-12 w-12 text-primary" />
                        </div>
                    )}
                    </CardContent>
                </Card>
                </Link>
            )
          })}
        </div>
      </div>
    </div>
  );
}
