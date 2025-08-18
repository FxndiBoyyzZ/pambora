'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { generatePamboraContentIdeas, type PamboraContentIdeasOutput } from '@/ai/flows/pambora-content-generator';
import { Card, CardContent } from '../ui/card';

export function ContentAssistantDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [ideas, setIdeas] = useState<PamboraContentIdeasOutput | null>(null);
    const [activity, setActivity] = useState('');

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setIdeas(null);
        try {
            const result = await generatePamboraContentIdeas({ recentActivity: activity });
            setIdeas(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Post
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Assistente de Conteúdo
                    </DialogTitle>
                    <DialogDescription>
                        Sem ideias para postar? Descreva a atividade recente na comunidade e nós geramos ideias para você!
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="message">Atividade Recente da Comunidade</Label>
                            <Textarea
                                placeholder="Ex: Usuárias compartilhando suas conquistas nos treinos e receitas saudáveis..."
                                id="message"
                                value={activity}
                                onChange={(e) => setActivity(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Gerando...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    Gerar Ideias
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
                {ideas && (
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">Ideias de Conteúdo:</h4>
                        <Card>
                            <CardContent className="p-4 space-y-2">
                                {ideas.contentIdeas.map((idea, index) => (
                                    <p key={index} className="text-sm text-foreground/80 border-b border-border pb-2 last:border-0 last:pb-0">
                                        - {idea}
                                    </p>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
