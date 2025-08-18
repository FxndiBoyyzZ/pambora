import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Clock, Dumbbell, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const workouts = Array.from({ length: 21 }, (_, i) => ({
  id: i + 1,
  day: i + 1,
  title: `Treino do Dia ${i + 1}`,
  description: i < 3 ? 'HIIT de 20 min' : 'Treino de Força',
  duration: i < 3 ? '20 minutos' : '45 minutos',
  unlocked: i < 3,
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder video
  exercises: [
    { name: "Agachamento", reps: "3x12" },
    { name: "Flexão de Braço", reps: "3x10" },
    { name: "Prancha", reps: "3x30s" },
    { name: "Polichinelo", reps: "3x45s" },
    { name: "Abdominal", reps: "3x20" },
  ]
}));

export async function generateStaticParams() {
    return workouts.map((workout) => ({
      id: workout.id.toString(),
    }))
}

export default function TreinoDetailPage({ params }: { params: { id: string } }) {
  const workout = workouts.find(w => w.id.toString() === params.id);

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
            <h1 className="text-2xl font-bold font-headline text-foreground">{workout.title}</h1>
            <p className="text-muted-foreground">Dia {workout.day}</p>
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
                        <Button className="w-full mt-4">
                            <CheckCircle className="mr-2 h-5 w-5" />
                            Marcar como Concluído
                        </Button>
                     </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
