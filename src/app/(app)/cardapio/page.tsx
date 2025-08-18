'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Heart, RefreshCw } from 'lucide-react';
import { Label } from '@/components/ui/label';

const mealPlan = {
    "Seg": {
        "Café da Manhã": ["Ovos mexidos com espinafre", "1 fatia de pão integral", "1/2 abacate"],
        "Almoço": ["Salmão grelhado", "Quinoa", "Brócolis no vapor"],
        "Lanche": ["Iogurte grego com frutas vermelhas"],
        "Jantar": ["Sopa de legumes com frango desfiado"]
    },
    "Ter": {
        "Café da Manhã": ["Smoothie de proteína com banana e aveia"],
        "Almoço": ["Salada de frango com mix de folhas e nozes"],
        "Lanche": ["Maçã com pasta de amendoim"],
        "Jantar": ["Carne moída com purê de batata doce"]
    },
    "Qua": {
        "Café da Manhã": ["Panquecas de aveia com mel"],
        "Almoço": ["Bife de patinho com arroz integral e feijão"],
        "Lanche": ["Mix de castanhas"],
        "Jantar": ["Omelete com queijo e tomate"]
    },
    "Qui": { "Café da Manhã": [], "Almoço": [], "Lanche": [], "Jantar": [] },
    "Sex": { "Café da Manhã": [], "Almoço": [], "Lanche": [], "Jantar": [] },
    "Sáb": { "Café da Manhã": [], "Almoço": [], "Lanche": [], "Jantar": [] },
    "Dom": { "Café da Manhã": [], "Almoço": [], "Lanche": [], "Jantar": [] },
};

type MealName = keyof typeof mealPlan.Seg;
const mealNames: MealName[] = ["Café da Manhã", "Almoço", "Lanche", "Jantar"];

export default function CardapioPage() {
    const [favorites, setFavorites] = React.useState<Record<string, boolean>>({});

    const toggleFavorite = (meal: string) => {
        setFavorites(prev => ({...prev, [meal]: !prev[meal]}));
    }
    
    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                <h1 className="text-2xl font-bold font-headline text-foreground">Cardápio</h1>
                <Button variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refazer Quiz
                </Button>
            </header>
            <div className="flex-grow p-4 md:p-6 lg:p-8">
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
                                                                <Heart className={cn("h-5 w-5", favorites[`${day}-${mealName}`] ? 'text-red-500 fill-current' : 'text-muted-foreground')} />
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
            </div>
        </div>
    );
}

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}
