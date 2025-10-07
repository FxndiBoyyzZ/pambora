
'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Heart, RefreshCw, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useQuiz } from '@/services/quiz-service';
import { useRouter } from 'next/navigation';
import type { MealPlanOutput } from '@/ai/flows/meal-plan-generator';


type MealName = "Café da Manhã" | "Almoço" | "Lanche" | "Jantar";
const mealNames: MealName[] = ["Café da Manhã", "Almoço", "Lanche", "Jantar"];
const orderedDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function MealPlanSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Carregando seu cardápio...
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="w-1/3 h-6 rounded-md bg-muted animate-pulse" />
                            <div className="w-full h-10 rounded-md bg-muted animate-pulse" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}


export default function CardapioPage() {
    const router = useRouter();
    const { answers, resetQuiz, loading: quizLoading } = useQuiz();
    const [favorites, setFavorites] = React.useState<Record<string, boolean>>({});
    const [currentDay, setCurrentDay] = React.useState(orderedDays[0]);

    const mealPlan = answers.mealPlan;

    React.useEffect(() => {
        const today = new Date().toLocaleString('pt-BR', { weekday: 'short' }).replace('.', '');
        const capitalizedToday = today.charAt(0).toUpperCase() + today.slice(1);
        
        if (orderedDays.includes(capitalizedToday)) {
            setCurrentDay(capitalizedToday);
        } else {
            setCurrentDay('Seg');
        }
    }, []);

    const handleResetQuiz = async () => {
        // Optimistically navigate, the resetQuiz will handle the logic
        router.push('/quiz');
        await resetQuiz();
    };

    const toggleFavorite = (meal: string) => {
        setFavorites(prev => ({...prev, [meal]: !prev[meal]}));
    }
    
    const renderContent = () => {
        if (quizLoading) {
            return <MealPlanSkeleton />;
        }

        if (!mealPlan) {
            return (
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle>Complete seu Quiz!</CardTitle>
                        <CardDescription>
                            Precisamos das suas respostas do quiz para gerar e salvar seu plano alimentar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/quiz')}>
                            Ir para o Quiz
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Tabs value={currentDay} onValueChange={setCurrentDay} className="w-full">
                <TabsList className="grid w-full grid-cols-7">
                    {orderedDays.map(day => <TabsTrigger key={day} value={day}>{day}</TabsTrigger>)}
                </TabsList>
                {orderedDays.map((day) => {
                     const meals = mealPlan[day as keyof typeof mealPlan];
                     return (
                        <TabsContent key={day} value={day}>
                            <Card>
                                <CardContent className="p-4 md:p-6">
                                    <Accordion type="single" collapsible defaultValue="Café da Manhã" className="w-full">
                                        {mealNames.map((mealName) => {
                                            const mealItems = meals?.[mealName as keyof typeof meals];
                                            return (
                                                <AccordionItem value={mealName} key={mealName}>
                                                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                                        <div className="flex items-center gap-3">
                                                            <UtensilsCrossed className="h-5 w-5 text-primary" />
                                                            {mealName}
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="pt-2 pl-4">
                                                        <div className="space-y-4">
                                                            {(mealItems && Array.isArray(mealItems) && mealItems.length > 0) ? mealItems.map((item, index) => (
                                                                <div key={index} className="flex items-center space-x-3">
                                                                    <Checkbox id={`${day}-${mealName}-${index}`} />
                                                                    <Label htmlFor={`${day}-${mealName}-${index}`} className="text-base font-normal text-foreground/80 leading-snug">
                                                                        {item}
                                                                    </Label>
                                                                </div>
                                                            )) : <p className="text-muted-foreground">Nenhuma refeição planejada.</p>}
                                                            <div className="flex justify-end pt-2">
                                                                <Button variant="ghost" size="icon" onClick={() => toggleFavorite(`${day}-${mealName}`)}>
                                                                    <Heart className={favorites[`${day}-${mealName}`] ? 'text-red-500 fill-current' : 'text-muted-foreground'} />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            );
                                        })}
                                    </Accordion>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )
                })}
            </Tabs>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                <h1 className="text-3xl font-bold font-headline text-foreground uppercase tracking-wider">Cardápio</h1>
                <Button variant="outline" size="sm" onClick={handleResetQuiz}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refazer o Quiz
                </Button>
            </header>
            <div className="flex-grow p-4 md:p-6 lg:p-8">
                {renderContent()}
            </div>
        </div>
    );
}
