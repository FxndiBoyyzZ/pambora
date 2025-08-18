// src/app/admin/page.tsx
'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { quizSteps } from "@/app/quiz/quiz-config";
import { Film, ListChecks, MessageSquare, Gift, HelpCircle, User, Zap, GripVertical, UploadCloud } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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

const StepContentEditor = ({ step, index }: { step: any, index: number }) => {
    // Note: State changes here are local and won't be saved.
    // This is a UI-only implementation for now.
    const [stepData, setStepData] = React.useState(step.content);

    const handleChange = (field: string, value: string | string[]) => {
        setStepData((prev: any) => ({ ...prev, [field]: value }));
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
                             <UploadCloud className="h-5 w-5 text-muted-foreground" />
                            <Input id={`videoUpload-${index}`} type="file" accept="video/*" className="border-none text-xs h-auto p-0 file:mr-2 file:text-primary file:font-semibold" />
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
                         msg.author === 'ByPamela' && <Textarea key={msgIndex} value={msg.text} className="bg-muted" />
                     ))}
                </div>
             )
        default:
            return null;
    }
}

export default function AdminDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex justify-between items-center p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div>
            <h1 className="text-2xl font-bold font-headline text-foreground">
            Admin - Configuração do Quiz
            </h1>
            <p className="text-muted-foreground">Arraste e solte para reordenar as etapas (funcionalidade em breve).</p>
        </div>
        <Button onClick={() => alert('Funcionalidade de salvar ainda não implementada.')}>
            Salvar Alterações
        </Button>
      </header>

      <main className="flex-grow p-4 md:p-6 lg:p-8">
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
                        <StepContentEditor step={step} index={index} />
                    </CardContent>
                    <CardFooter>
                        <Button variant="destructive" size="sm" className="w-full" onClick={() => alert('Funcionalidade de remover ainda não implementada.')}>
                            Remover Etapa
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
      </main>
    </div>
  );
}
