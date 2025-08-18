
// src/app/admin/page.tsx
'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { type QuizStep } from "@/app/quiz/quiz-config";
import { Film, ListChecks, MessageSquare, Gift, HelpCircle, User, GripVertical, UploadCloud, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { uploadVideo } from './actions';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useToast } from '@/hooks/use-toast';

const getIcon = (type: string) => {
    switch (type) {
        case 'video': return <Film className="h-6 w-6 text-primary" />;
        case 'form': return <User className="h-6 w-6 text-primary" />;
        case 'question': return <HelpCircle className="h-6 w-6 text-primary" />;
        case 'chat': return <MessageSquare className="h-6 w-6 text-primary" />;
        case 'wheel': return <Gift className="h-6 w-6 text-primary" />;
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
                        <Label htmlFor={`videoUrl-${index}`}>URL do Vídeo</Label>
                        <Input id={`videoUrl-${index}`} value={stepData.videoUrl} onChange={(e) => handleChange('videoUrl', e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="text-center text-xs text-muted-foreground">OU</div>
                    <div>
                         <Label htmlFor={`videoUpload-${index}`}>Fazer Upload</Label>
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
                            <Label>Opções</Label>
                             <div className="space-y-2">
                                {stepData.options.map((opt: any, optIndex: number) => (
                                     <Input key={opt.id} value={opt.label} onChange={(e) => {
                                         const newOptions = [...stepData.options];
                                         newOptions[optIndex].label = e.target.value;
                                         handleChange('options', newOptions);
                                     }} />
                                ))}
                            </div>
                        </div>
                    )}
                     <div>
                        <Label htmlFor={`q-bg-${index}`}>URL da Imagem de Fundo</Label>
                        <Input id={`q-bg-${index}`} value={stepData.backgroundUrl} onChange={(e) => handleChange('backgroundUrl', e.target.value)} />
                    </div>
                </div>
             )
        case 'wheel':
             return (
                <div className="space-y-4">
                    <div>
                        <Label htmlFor={`wheel-title-${index}`}>Título</Label>
                        <Input id={`wheel-title-${index}`} value={stepData.title} onChange={(e) => handleChange('title', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor={`wheel-desc-${index}`}>Descrição</Label>
                        <Textarea id={`wheel-desc-${index}`} value={stepData.description} onChange={(e) => handleChange('description', e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor={`wheel-bg-${index}`}>URL da Imagem de Fundo</Label>
                        <Input id={`wheel-bg-${index}`} value={stepData.backgroundUrl} onChange={(e) => handleChange('backgroundUrl', e.target.value)} />
                    </div>
                </div>
             )
        case 'chat':
             return (
                <div className="space-y-4">
                    <Label>Mensagens</Label>
                     {stepData.messages.map((msg: any, msgIndex: number) => (
                         msg.author === 'ByPamela' && (
                           <Textarea 
                              key={msgIndex} 
                              value={msg.text} 
                              className="bg-muted" 
                              onChange={(e) => {
                                const newMessages = [...stepData.messages];
                                newMessages[msgIndex].text = e.target.value;
                                handleChange('messages', newMessages);
                              }}
                           />
                         )
                     ))}
                </div>
             )
        default:
            return null;
    }
}

export default function AdminDashboard() {
  const [quizSteps, setQuizSteps] = React.useState<QuizStep[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchQuizConfig = async () => {
        setIsLoading(true);
        try {
            const configDocRef = doc(db, 'config', 'quiz');
            const configDoc = await getDoc(configDocRef);
            if(configDoc.exists()) {
                setQuizSteps(configDoc.data().steps);
            } else {
                // Se não existir, importa do arquivo local e salva no Firestore
                const { quizSteps: initialQuizSteps } = await import('@/app/quiz/quiz-config');
                await setDoc(configDocRef, { steps: initialQuizSteps });
                setQuizSteps(initialQuizSteps);
            }
        } catch (error) {
            console.error("Erro ao buscar configuração do quiz:", error);
            toast({
                variant: 'destructive',
                title: 'Erro!',
                description: 'Não foi possível carregar a configuração do quiz.'
            });
        } finally {
            setIsLoading(false);
        }
    };
    fetchQuizConfig();
  }, [toast]);


  const handleStepChange = (index: number, newStep: QuizStep) => {
    if (!quizSteps) return;
    const newQuizSteps = [...quizSteps];
    newQuizSteps[index] = newStep;
    setQuizSteps(newQuizSteps);
  }

  const handleSaveChanges = async () => {
    if (!quizSteps) return;
    setIsSaving(true);
    try {
        const configDocRef = doc(db, 'config', 'quiz');
        await setDoc(configDocRef, { steps: quizSteps });
        toast({
            title: 'Sucesso!',
            description: 'Configuração do quiz salva com sucesso.'
        });
    } catch (error) {
        console.error("Erro ao salvar configuração do quiz:", error);
         toast({
            variant: 'destructive',
            title: 'Erro!',
            description: 'Não foi possível salvar a configuração do quiz.'
        });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex justify-between items-center p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div>
            <h1 className="text-2xl font-bold font-headline text-foreground">
            Admin - Configuração do Quiz
            </h1>
            <p className="text-muted-foreground">Arraste e solte para reordenar as etapas (funcionalidade em breve).</p>
        </div>
        <Button onClick={handleSaveChanges} disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Salvar Alterações
        </Button>
      </header>

      <main className="flex-grow p-4 md:p-6 lg:p-8">
        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : quizSteps && quizSteps.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {quizSteps.map((step, index) => (
                    <Card key={index} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                    <CardTitle className="text-lg">Etapa {index + 1}: {step.type.charAt(0).toUpperCase() + step.type.slice(1)}</CardTitle>
                                </div>
                                {getIcon(step.type)}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <StepContentEditor step={step} index={index} onStepChange={handleStepChange} />
                        </CardContent>
                        <CardFooter>
                            <Button variant="destructive" size="sm" className="w-full" onClick={() => alert('Funcionalidade de remover ainda não implementada.')}>
                                Remover Etapa
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-semibold">Nenhuma configuração de quiz encontrada.</p>
            </div>
        )}
      </main>
    </div>
  );
}
