// src/app/admin/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { quizSteps } from "@/app/quiz/quiz-config";
import { Film, ListChecks, MessageSquare, Gift, HelpCircle, User, Zap } from 'lucide-react';

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

const StepContent = ({ step }: { step: any }) => {
    switch (step.type) {
        case 'video':
            return <CardDescription>Vídeo: {step.content.videoUrl}</CardDescription>
        case 'form':
            return <CardDescription>Formulário com campos para {step.content.fields.join(', ')}.</CardDescription>
        case 'question':
            return <CardDescription>Pergunta: "{step.content.title}"</CardDescription>
        case 'chat':
            return <CardDescription>{step.content.messages.length} mensagens no chat.</CardDescription>
        case 'wheel':
            return <CardDescription>Roda da Sorte.</CardDescription>
        default:
            return null;
    }
}

export default function AdminDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <h1 className="text-2xl font-bold font-headline text-foreground">
          Admin - Configuração do Quiz
        </h1>
        <p className="text-muted-foreground">Arraste e solte para reordenar as etapas (funcionalidade em breve).</p>
      </header>

      <main className="flex-grow p-4 md:p-6 lg:p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {quizSteps.map((step, index) => (
                <Card key={index} className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Etapa {index + 1}: {step.type.charAt(0).toUpperCase() + step.type.slice(1)}</CardTitle>
                            {getIcon(step.type)}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <StepContent step={step} />
                    </CardContent>
                </Card>
            ))}
        </div>
      </main>
    </div>
  );
}
