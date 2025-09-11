// src/app/admin/page.tsx
'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { type QuizStep } from "@/app/quiz/quiz-config";
import { Film, ListChecks, MessageSquare, Gift, HelpCircle, User, GripVertical, UploadCloud, Loader2, Sparkles, Dumbbell, Download, Bell, Edit, LogOut, CheckCircle, AlertCircle, Send, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { uploadVideo } from './actions';
import { doc, getDoc, setDoc, addDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/services/firebase';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, type User as FirebaseUser } from 'firebase/auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

const getIcon = (type: string) => {
    switch (type) {
        case 'video': return <Film className="h-6 w-6 text-primary" />;
        case 'form': return <User className="h-6 w-6 text-primary" />;
        case 'question': return <HelpCircle className="h-6 w-6 text-primary" />;
        case 'chat': return <MessageSquare className="h-6 w-6 text-primary" />;
        case 'scratch': return <Sparkles className="h-6 w-6 text-primary" />;
        default: return <ListChecks className="h-6 w-6 text-primary" />;
    }
}

const StepContentEditor = ({ step, index, onStepChange }: { step: any, index: number, onStepChange: (index: number, newContent: any) => void }) => {
    const [stepData, setStepData] = React.useState(step.content);
    const [isUploading, setIsUploading] = React.useState(false);

    const handleChange = (field: string, value: any) => {
        const newStepData = { ...stepData, [field]: value };
        setStepData(newStepData);
        onStepChange(index, { ...step, content: newStepData });
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('video', file);
            const result = await uploadVideo(formData);
            if (result.success && result.url) {
                handleChange('videoUrl', result.url);
            } else {
                 alert('Falha no upload do vídeo: ' + result.error);
            }
        } catch (error) {
            console.error(error);
            alert('Ocorreu um erro durante o upload.');
        } finally {
            setIsUploading(false);
        }
    }


    switch (step.type) {
        case 'video':
            return (
                <div className="space-y-4">
                    <div>
                        <Label htmlFor={`videoUrl-${index}`}>URL do Vídeo (Vimeo)</Label>
                        <Input id={`videoUrl-${index}`} value={stepData.videoUrl} onChange={(e) => handleChange('videoUrl', e.target.value)} placeholder="https://vimeo.com/..." />
                    </div>
                    <div className="text-center text-xs text-muted-foreground">OU</div>
                    <div>
                         <Label htmlFor={`videoUpload-${index}`}>Fazer Upload (Firebase Storage)</Label>
                         <div className="flex items-center gap-2 rounded-md border border-dashed p-2">
                             {isUploading ? <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" /> : <UploadCloud className="h-5 w-5 text-muted-foreground" />}
                            <Input 
                                id={`videoUpload-${index}`} 
                                type="file" 
                                accept="video/*" 
                                className="border-none text-xs h-auto p-0 file:mr-2 file:text-primary file:font-semibold"
                                onChange={handleFileChange}
                                disabled={isUploading}
                             />
                         </div>
                    </div>
                </div>
            )
        case 'form':
            return (
                 <div className="space-y-4">
                    <div>
                        <Label htmlFor={`form-title-${index}`}>Título</Label>
                        <Input id={`form-title-${index}`} value={stepData.title} onChange={(e) => handleChange('title', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor={`form-desc-${index}`}>Descrição</Label>
                        <Textarea id={`form-desc-${index}`} value={stepData.description} onChange={(e) => handleChange('description', e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor={`form-bg-${index}`}>URL da Imagem de Fundo</Label>
                        <Input id={`form-bg-${index}`} value={stepData.backgroundUrl} onChange={(e) => handleChange('backgroundUrl', e.target.value)} />
                    </div>
                </div>
            )
        case 'question':
             return (
                 <div className="space-y-4">
                    <div>
                        <Label htmlFor={`q-title-${index}`}>Título</Label>
                        <Input id={`q-title-${index}`} value={stepData.title} onChange={(e) => handleChange('title', e.target.value)} />
                    </div>
                    {stepData.description && (
                        <div>
                            <Label htmlFor={`q-desc-${index}`}>Descrição</Label>
                            <Textarea id={`q-desc-${index}`} value={stepData.description} onChange={(e) => handleChange('description', e.target.value)} />
                        </div>
                    )}
                    {stepData.questionType === 'multiple-choice' && (
                         <div>
                            <Label>Opções (uma por linha)</Label>
                            <Textarea 
                                value={stepData.options.map((o: any) => o.label).join('\n')}
                                onChange={(e) => {
                                    const labels = e.target.value.split('\n');
                                    const newOptions = labels.map((label, i) => ({
                                        id: stepData.options[i]?.id || label.toLowerCase().replace(/\s+/g, '-'),
                                        label
                                    }));
                                    handleChange('options', newOptions);
                                }}
                                rows={stepData.options.length || 2}
                            />
                        </div>
                    )}
                     <div>
                        <Label htmlFor={`q-bg-${index}`}>URL da Imagem de Fundo</Label>
                        <Input id={`q-bg-${index}`} value={stepData.backgroundUrl} onChange={(e) => handleChange('backgroundUrl', e.target.value)} />
                    </div>
                </div>
             )
        case 'vitals':
             return (
                 <div className="space-y-4">
                    <div>
                        <Label htmlFor={`vitals-title-${index}`}>Título</Label>
                        <Input id={`vitals-title-${index}`} value={stepData.title} onChange={(e) => handleChange('title', e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor={`vitals-desc-${index}`}>Descrição</Label>
                        <Textarea id={`vitals-desc-${index}`} value={stepData.description} onChange={(e) => handleChange('description', e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor={`vitals-bg-${index}`}>URL da Imagem de Fundo</Label>
                        <Input id={`vitals-bg-${index}`} value={stepData.backgroundUrl} onChange={(e) => handleChange('backgroundUrl', e.target.value)} />
                    </div>
                </div>
             )
        default:
            return <p className="text-sm text-muted-foreground">Este tipo de etapa não possui conteúdo editável.</p>;
    }
}

interface NotificationJob {
  id: string;
  createdAt: { seconds: number; nanoseconds: number };
  title: string;
  body: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  stats?: {
    successCount: number;
    failureCount: number;
  };
}

const NotificationQueueReport: React.FC = () => {
    const [jobs, setJobs] = React.useState<NotificationJob[]>([]);
    const [loading, setLoading] = React.useState(true);
    const { toast } = useToast();

    React.useEffect(() => {
        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NotificationJob));
            setJobs(jobsData);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar fila de notificações:", error);
            toast({
                variant: 'destructive',
                title: 'Erro de Permissão',
                description: 'Não foi possível ler a fila de notificações. Verifique as regras do Firestore.'
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

    const getStatusVariant = (status: NotificationJob['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
        switch (status) {
            case 'completed': return 'default';
            case 'processing': return 'secondary';
            case 'failed': return 'destructive';
            case 'queued': return 'outline';
            default: return 'outline';
        }
    };
    
    return (
      <Card className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4">
          <CardHeader>
              <CardTitle>Relatório de Envio de Notificações</CardTitle>
              <CardDescription>Status das últimas notificações enviadas.</CardDescription>
          </CardHeader>
          <CardContent>
              {loading && <Loader2 className="mx-auto h-6 w-6 animate-spin" />}
              {!loading && jobs.length === 0 && <p className="text-sm text-muted-foreground text-center">Nenhuma notificação na fila ainda.</p>}
              {!loading && jobs.length > 0 && (
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Horário</TableHead>
                            <TableHead>Título</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Resultado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobs.map(job => (
                            <TableRow key={job.id}>
                                <TableCell>{formatDistanceToNow(new Date(job.createdAt.seconds * 1000), { addSuffix: true, locale: ptBR })}</TableCell>
                                <TableCell className="font-medium">{job.title}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {job.stats ? (
                                        <span className="text-xs">
                                          ✅ {job.stats.successCount} | ❌ {job.stats.failureCount}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">--</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
              )}
          </CardContent>
      </Card>
    )
}


function AdminDashboard() {
    const [quizSteps, setQuizSteps] = React.useState<QuizStep[] | null>(null);
    const [workoutControls, setWorkoutControls] = React.useState({ unlockedDays: 21 });
    const [isLoadingData, setIsLoadingData] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [notificationTitle, setNotificationTitle] = React.useState('Nova Mensagem da Pam');
    const [notificationBody, setNotificationBody] = React.useState('');
    const [isSendingNotification, setIsSendingNotification] = React.useState(false);
    const { toast } = useToast();

     React.useEffect(() => {
        const fetchConfig = async () => {
            setIsLoadingData(true);
            try {
                // Fetch Quiz Config
                const quizConfigDocRef = doc(db, 'config', 'quiz');
                const quizConfigDoc = await getDoc(quizConfigDocRef);
                if(quizConfigDoc.exists()) {
                    setQuizSteps(quizConfigDoc.data().steps);
                } else {
                    // If no config in DB, load local one.
                    const { quizSteps: initialQuizSteps } = await import('@/app/quiz/quiz-config');
                    setQuizSteps(initialQuizSteps);
                }

                // Fetch Workout Controls
                const workoutConfigDocRef = doc(db, 'config', 'workoutControls');
                const workoutConfigDoc = await getDoc(workoutConfigDocRef);
                if (workoutConfigDoc.exists()) {
                    setWorkoutControls(workoutConfigDoc.data() as { unlockedDays: number });
                }

            } catch (error) {
                console.error("Erro ao buscar configuração:", error);
                toast({
                    variant: 'destructive',
                    title: 'Erro ao Carregar Dados!',
                    description: 'Não foi possível carregar a configuração. Verifique as regras de segurança do Firestore.'
                });
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchConfig();
    }, [toast]);
    
    const handleStepChange = (index: number, newStep: QuizStep) => {
        if (!quizSteps) return;
        const newQuizSteps = [...quizSteps];
        newQuizSteps[index] = newStep;
        setQuizSteps(newQuizSteps);
    };

    const handleSaveChanges = async () => {
        if (!quizSteps) return;
        setIsSaving(true);
        try {
            // Save quiz config
            const quizConfigDocRef = doc(db, 'config', 'quiz');
            await setDoc(quizConfigDocRef, { steps: quizSteps });

            // Save workout controls
            const workoutConfigDocRef = doc(db, 'config', 'workoutControls');
            await setDoc(workoutConfigDocRef, workoutControls);

            toast({
                title: 'Sucesso!',
                description: 'Configurações salvas com sucesso.'
            });
        } catch (error) {
            console.error("Erro ao salvar configuração:", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao Salvar!',
                description: 'Não foi possível salvar. Verifique as permissões do Firestore.'
            });
        } finally {
            setIsSaving(false);
        }
    };
  
    const handleQueueNotification = async () => {
      if (!notificationBody) {
          toast({ variant: 'destructive', title: 'Erro', description: 'A mensagem da notificação não pode estar vazia.' });
          return;
      }
      setIsSendingNotification(true);
      try {
          await addDoc(collection(db, 'notifications'), {
              title: notificationTitle,
              body: notificationBody,
              status: 'queued',
              createdAt: new Date(),
          });
          toast({
              title: 'Notificação Enfileirada!',
              description: 'A notificação foi adicionada à fila e será enviada em breve.',
          });
          setNotificationBody('');
      } catch (error) {
          console.error("Erro ao enfileirar notificação:", error);
          toast({
              variant: 'destructive',
              title: 'Erro ao Enfileirar!',
              description: 'Não foi possível enfileirar a notificação. Verifique as permissões do Firestore.',
          });
      } finally {
          setIsSendingNotification(false);
      }
    };

    if (isLoadingData) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-headline text-foreground tracking-wide">
                    Painel de Controle Geral
                </h2>
                <Button onClick={handleSaveChanges} disabled={isSaving || isLoadingData}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Salvar Alterações
                </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Workout Controls Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Controle de Treinos</CardTitle>
                        <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                            <div className="space-y-2">
                            <Label htmlFor="unlockedDays">Último Dia Liberado</Label>
                            <Input 
                                id="unlockedDays" 
                                type="number" 
                                value={workoutControls.unlockedDays}
                                onChange={(e) => setWorkoutControls({ unlockedDays: parseInt(e.target.value, 10) || 1 })}
                                min="1"
                                max="21"
                            />
                                <p className="text-xs text-muted-foreground">Defina qual o último dia de treino que os usuários podem acessar globalmente.</p>
                            </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gerenciar Leads</CardTitle>
                        <Download className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                            <p className="text-xs text-muted-foreground">Visualize e exporte a lista de todos os usuários que se inscreveram.</p>
                    </CardContent>
                        <CardFooter>
                        <Link href="/admin/leads" className="w-full">
                            <Button variant="outline" size="sm" className="w-full">
                                Visualizar Leads
                            </Button>
                        </Link>
                        </CardFooter>
                </Card>

                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="text-sm font-medium">Notificações Push</CardTitle>
                             <CardDescription className="text-xs text-muted-foreground pt-1">Envie uma mensagem para todos os usuários que instalaram o app.</CardDescription>
                        </div>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="col-span-1">
                                <Label htmlFor="notification-title" className="sr-only">Título</Label>
                                <Input 
                                    id="notification-title"
                                    value={notificationTitle}
                                    onChange={(e) => setNotificationTitle(e.target.value)}
                                    placeholder="Título da notificação"
                                />
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                                <Label htmlFor="notification-body" className="sr-only">Mensagem</Label>
                                <Input 
                                    id="notification-body"
                                    placeholder="Sua mensagem aqui..." 
                                    value={notificationBody}
                                    onChange={(e) => setNotificationBody(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button size="sm" className="w-full" onClick={handleQueueNotification} disabled={isSendingNotification}>
                            {isSendingNotification && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enfileirar para Envio Imediato
                        </Button>
                    </CardFooter>
                </Card>

                <NotificationQueueReport />
            </div>

            <div>
                 <h2 className="text-xl font-bold font-headline text-foreground mb-4 mt-12">
                    Editor de Etapas do Quiz
                </h2>
                {quizSteps && quizSteps.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {quizSteps.map((step, index) => (
                            <Card key={index} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                            <CardTitle className="text-lg">Etapa {index + 1}: {step.type.charAt(0).toUpperCase() + step.type.slice(1)}</CardTitle>
                                        </div>
                                        {getIcon(step.type)}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <StepContentEditor step={step} index={index} onStepChange={handleStepChange} />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                        <Card className="text-center py-12">
                            <CardTitle>Nenhuma configuração de quiz encontrada.</CardTitle>
                            <CardDescription className="mt-2">Isso pode acontecer devido a um erro de permissão ou se nenhuma configuração foi salva ainda.</CardDescription>
                        </Card>
                )}
            </div>
        </div>
    );
}

function AdminLoginPage({ onLoginSuccess }: { onLoginSuccess: (user: FirebaseUser) => void }) {
    const [email, setEmail] = React.useState('pam@admin.com');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            onLoginSuccess(userCredential.user);
        } catch (err) {
            setError('Email ou senha inválidos. Por favor, tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40">
            <Card className="w-full max-w-md mx-4">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline tracking-wider text-center">Acesso Restrito</CardTitle>
                    <CardDescription className="text-center">
                        Faça login para gerenciar o aplicativo.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="pam@admin.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Entrar
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

export default function AdminPage() {
    const [user, setUser] = React.useState<FirebaseUser | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser && currentUser.email === 'pam@admin.com') {
                setUser(currentUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await firebaseSignOut(auth);
        setUser(null);
    };



    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!user) {
        return <AdminLoginPage onLoginSuccess={setUser} />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/30">
             <header className="flex justify-between items-center p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                <div>
                    <h1 className="text-2xl font-bold font-headline text-foreground">
                        Admin - Painel de Controle
                    </h1>
                     <p className="text-sm text-muted-foreground">Logado como {user.email}</p>
                </div>
                <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </header>
            <main className="flex-grow p-4 md:p-6 lg:p-8">
                 <AdminDashboard />
            </main>
        </div>
    );
}
