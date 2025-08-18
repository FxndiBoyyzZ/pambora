import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Flame, Lock, PlayCircle } from "lucide-react";

const workouts = Array.from({ length: 21 }, (_, i) => ({
  day: i + 1,
  title: `Treino do Dia ${i + 1}`,
  description: i < 3 ? 'HIIT de 20 min' : 'Treino de Força',
  unlocked: i < 3,
}));

export default function TreinosPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <h1 className="text-2xl font-bold font-headline text-foreground">
          Treinos Diários
        </h1>
        <div className="flex items-center gap-2 text-primary font-bold text-lg">
          <Flame className="h-7 w-7" />
          <span>2</span>
          <span className="text-sm font-normal text-muted-foreground">dias de Foco!</span>
        </div>
      </header>
      <div className="flex-grow p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {workouts.map((workout) => (
            <Card key={workout.day} className={cn(
                "group relative overflow-hidden transition-all duration-300",
                workout.unlocked ? "bg-card hover:shadow-primary/20 hover:shadow-lg" : "bg-muted/50"
            )}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dia {workout.day}</CardTitle>
                {workout.unlocked ? (
                  <Dumbbell className="h-4 w-4 text-primary" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{workout.title}</div>
                <p className="text-xs text-muted-foreground">{workout.description}</p>
                 {workout.unlocked && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <PlayCircle className="h-12 w-12 text-primary" />
                  </div>
                 )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}
