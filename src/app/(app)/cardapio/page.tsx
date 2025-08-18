'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Heart, RefreshCw, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useQuiz } from '@/services/quiz-service';
import { generateMealPlan, MealPlanOutput } from '@/ai/flows/meal-plan-generator';
import { useRouter } from 'next/navigation';
import { auth } from '@/services/firebase';
import { signOut } from 'firebase/auth';

type MealName = "Café da Manhã" | "Almoço" | "Lanche" | "Jantar";
const mealNames: MealName[] = ["Café da Manhã", "Almoço", "Lanche", "Jantar"];

function MealPlanSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                    <div className="w-1/3 h-6 rounded-md bg-muted animate-pulse" />
                    <div className="w-full h-10 rounded-md bg-muted animate-pulse" />
                </div>
            ))}
        </div>
    )
}

export default function CardapioPage() {
    const router = useRouter();
    const { answers, resetQuiz } = useQuiz();
    const [loading, setLoading] = React.useState(true);
    const [mealPlan, setMealPlan] = React.useState<MealPlanOutput['mealPlan'] | null>(null);
    const [favorites, setFavorites] = React.useState<Record<string, boolean>>({});

    React.useEffect(() => {
        // We need goal, diet, and allergies to generate a plan
        if (!answers.goal || !answers.diet) {
            // If essential answers are missing, maybe they skipped the quiz.
            // Redirect them back. Check for user to avoid redirect loop on logout.
            if(auth.currentUser) router.push('/quiz');
        } else {
            const getPlan = async () => {
                setLoading(true);
                try {
                    const result = await generateMealPlan({
                        goal: answers.goal || '',
                        diet: answers.diet || '',
                        allergies: answers.allergies || '',
                    });
                    setMealPlan(result.mealPlan);
                } catch (error) {
                    console.error("Failed to generate meal plan:", error);
                } finally {
                    setLoading(false);
                }
            };
            getPlan();
        }
    }, [answers, router]);

    const handleResetQuiz = async () => {
        await resetQuiz();
        router.push('/quiz');
    };

    const toggleFavorite = (meal: string) => {
        setFavorites(prev => ({...prev, [meal]: !prev[meal]}));
    }
    
    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                <h1 className="text-2xl font-bold font-headline text-foreground">Cardápio</h1>
                <Button variant="outline" size="sm" onClick={handleResetQuiz}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refazer o Quiz
                </Button>
            </header>
            <div className="flex-grow p-4 md:p-6 lg:p-8">
                {loading || !mealPlan ? (
                     <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Gerando seu cardápio personalizado...
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MealPlanSkeleton />
                        </CardContent>
                     </Card>
                ) : (
                    <Tabs defaultValue="Seg" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 md:grid-cols-7">
                            {Object.keys(mealPlan).map(day => <TabsTrigger key={day} value={day}>{day}</TabsTrigger>)}
                        </TabsList>
                        {Object.entries(mealPlan).map(([day, meals]) => (
                            <TabsContent key={day} value={day}>
                                <Card>
                                    <CardContent className="p-4 md:p-6">
                                        <Accordion type="single" collapsible defaultValue="Café da Manhã" className="w-full">
                                            {mealNames.map((mealName) => (
                                                <AccordionItem value={mealName} key={mealName}>
                                                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                                        <div className="flex items-center gap-3">
                                                            <UtensilsCrossed className="h-5 w-5 text-primary" />
                                                            {mealName}
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="pt-2 pl-4">
                                                        <div className="space-y-4">
                                                            {(meals[mealName] && meals[mealName].length > 0) ? meals[mealName].map((item, index) => (
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
                                            ))}
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
            </div>
        </div>
    );
}

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}
