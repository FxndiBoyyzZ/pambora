
// src/app/admin/workouts/page.tsx
'use client';
import * as React from 'react';
import { db, auth } from '@/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, ArrowLeft, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Exercise {
    name: string;
    reps: string;
}

interface Workout {
    id: number;
    title: string;
    description: string;
    duration: string;
    calories: number;
    videoUrl: string;
    exercises: Exercise[];
}

const defaultWorkouts: Workout[] = [
  {
    id: 1,
    title: 'Treino HIIT Intenso',
    description: 'Queima máxima de calorias em 20 minutos.',
    duration: '20 minutos',
    calories: 300,
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
    calories: 400,
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
    calories: 150,
    videoUrl: "https://www.youtube.com/embed/jyV-cIC8xNo",
    exercises: [
      { name: "Prancha Lateral", reps: "3x30s cada lado" },
      { name: "Ponte de Glúteos", reps: "3x15" },
      { name: "Abdominal Remador", reps: "3x20" },
      { name: "Gato-Camelo", reps: "3x10" },
    ]
  }
];


export default function WorkoutsAdminPage() {
    const [workouts, setWorkouts] = React.useState<Workout[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [user, setUser] = React.useState<User | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser && currentUser.email === 'pam@admin.com') {
                setUser(currentUser);
            } else {
                router.push('/admin');
            }
        });
        return () => unsubscribe();
    }, [router]);

    React.useEffect(() => {
        if (!user) return;

        const fetchWorkouts = async () => {
            setLoading(true);
            const docRef = doc(db, 'config', 'workouts');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists() && docSnap.data().workouts) {
                setWorkouts(docSnap.data().workouts);
            } else {
                // If it doesn't exist, set it with default values
                await setDoc(docRef, { workouts: defaultWorkouts });
                setWorkouts(defaultWorkouts);
            }
            setLoading(false);
        };

        fetchWorkouts();
    }, [user]);

    const handleWorkoutChange = (index: number, field: keyof Workout, value: any) => {
        const newWorkouts = [...workouts];
        (newWorkouts[index] as any)[field] = value;
        setWorkouts(newWorkouts);
    };

    const handleExerciseChange = (workoutIndex: number, exerciseIndex: number, field: keyof Exercise, value: string) => {
        const newWorkouts = [...workouts];
        (newWorkouts[workoutIndex].exercises[exerciseIndex] as any)[field] = value;
        setWorkouts(newWorkouts);
    };

    const addExercise = (workoutIndex: number) => {
        const newWorkouts = [...workouts];
        newWorkouts[workoutIndex].exercises.push({ name: '', reps: '' });
        setWorkouts(newWorkouts);
    };

    const removeExercise = (workoutIndex: number, exerciseIndex: number) => {
        const newWorkouts = [...workouts];
        newWorkouts[workoutIndex].exercises.splice(exerciseIndex, 1);
        setWorkouts(newWorkouts);
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'config', 'workouts'), { workouts });
            toast({
                title: 'Sucesso!',
                description: 'Os treinos foram atualizados com sucesso.',
            });
        } catch (error) {
            console.error('Error saving workouts:', error);
            toast({
                variant: 'destructive',
                title: 'Erro ao Salvar',
                description: 'Não foi possível salvar as alterações nos treinos.',
            });
        } finally {
            setSaving(false);
        }
    };
    
    if (!user || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-muted/30">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/30">
            <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                    <Link href="/admin">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold font-headline text-foreground">
                            Gerenciar Treinos
                        </h1>
                        <p className="text-muted-foreground">Edite os treinos base do desafio.</p>
                    </div>
                </div>
                 <Button onClick={handleSaveChanges} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Alterações
                </Button>
            </header>

            <main className="flex-grow p-4 md:p-6 lg:p-8">
                 <div className="grid gap-8">
                    {workouts.map((workout, workoutIndex) => (
                        <Card key={workout.id}>
                            <CardHeader>
                                <CardTitle>Treino Base {workout.id}</CardTitle>
                                <CardDescription>Este treino será usado de forma cíclica durante o desafio.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor={`title-${workout.id}`}>Título do Treino</Label>
                                        <Input id={`title-${workout.id}`} value={workout.title} onChange={e => handleWorkoutChange(workoutIndex, 'title', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`description-${workout.id}`}>Descrição Curta</Label>
                                        <Input id={`description-${workout.id}`} value={workout.description} onChange={e => handleWorkoutChange(workoutIndex, 'description', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`duration-${workout.id}`}>Duração</Label>
                                        <Input id={`duration-${workout.id}`} value={workout.duration} onChange={e => handleWorkoutChange(workoutIndex, 'duration', e.target.value)} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor={`calories-${workout.id}`}>Calorias (Estimativa)</Label>
                                        <Input id={`calories-${workout.id}`} type="number" value={workout.calories} onChange={e => handleWorkoutChange(workoutIndex, 'calories', parseInt(e.target.value, 10) || 0)} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor={`videoUrl-${workout.id}`}>URL do Vídeo (Embed)</Label>
                                        <Input id={`videoUrl-${workout.id}`} value={workout.videoUrl} onChange={e => handleWorkoutChange(workoutIndex, 'videoUrl', e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <Label>Exercícios</Label>
                                    {workout.exercises.map((exercise, exerciseIndex) => (
                                        <div key={exerciseIndex} className="flex items-center gap-2">
                                            <Input placeholder="Nome do Exercício" value={exercise.name} onChange={e => handleExerciseChange(workoutIndex, exerciseIndex, 'name', e.target.value)} />
                                            <Input placeholder="Séries/Repetições" value={exercise.reps} onChange={e => handleExerciseChange(workoutIndex, exerciseIndex, 'reps', e.target.value)} />
                                            <Button variant="ghost" size="icon" onClick={() => removeExercise(workoutIndex, exerciseIndex)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={() => addExercise(workoutIndex)}>
                                        Adicionar Exercício
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            </main>
        </div>
    );
}

