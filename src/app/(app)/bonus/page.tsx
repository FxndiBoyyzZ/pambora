
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BookOpen, Download, Sparkles, Lock, Gift, Trophy } from "lucide-react";
import Link from 'next/link';
import { cn } from "@/lib/utils";

const bonuses = [
    {
        title: "E-book de Receitas Fit",
        description: "Um guia completo com mais de 300 receitas saudáveis e deliciosas.",
        icon: BookOpen,
        link: "/300 - CAFÉS DA MANHÃ.pdf",
        disabled: false,
    },
    {
        title: "Bônus da Semana 2 (Em Breve)",
        description: "Uma surpresa especial será liberada para te manter no foco total!",
        icon: Lock,
        link: "#",
        disabled: true,
    },
    {
        title: "Bônus da Semana 3 (Em Breve)",
        description: "Na reta final, um novo bônus incrível para potencializar seus resultados.",
        icon: Gift,
        link: "#",
        disabled: true,
    },
    {
        title: "Presente Final (Último Dia)",
        description: "Complete o desafio e receba uma recompensa exclusiva por sua dedicação.",
        icon: Trophy,
        link: "#",
        disabled: true,
    }
];

const BonusCard = ({ bonus }: { bonus: typeof bonuses[0] }) => {
    const cardContent = (
         <Card className={cn(
                "w-full h-full flex flex-col text-center transition-all duration-300 ease-in-out transform hover:-translate-y-1",
                bonus.disabled 
                    ? "border-dashed border-muted-foreground/50 bg-transparent shadow-none" 
                    : "bg-gradient-to-br from-card to-muted/30 hover:shadow-primary/20 hover:shadow-lg cursor-pointer"
            )}>
            <CardHeader className="flex-grow flex flex-col items-center justify-center p-6">
                <div className={cn("mb-4 rounded-full p-4", bonus.disabled ? "bg-muted/50" : "bg-primary/10")}>
                    <bonus.icon className={cn("w-12 h-12", bonus.disabled ? "text-muted-foreground/80" : "text-primary")} />
                </div>
                <CardTitle className="text-xl font-bold">{bonus.title}</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-4">
                <CardDescription className="min-h-[40px]">{bonus.description}</CardDescription>
            </CardContent>
            <CardFooter className="p-6 pt-0">
                <button 
                    disabled={bonus.disabled}
                    className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed">
                    {bonus.disabled ? "Em Breve" : "Acessar Agora"}
                </button>
            </CardFooter>
        </Card>
    );

    if (bonus.disabled || !bonus.link || bonus.link === "#") {
        return cardContent;
    }

    return (
        <Link href={bonus.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
           {cardContent}
        </Link>
    );
};


export default function BonusPage() {
  return (
    <div className="flex flex-col h-full">
        <header className="p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
            <h1 className="text-3xl font-bold font-headline text-foreground text-center lg:text-left uppercase tracking-wider">
              Bônus Exclusivos
            </h1>
        </header>

        <main className="flex-grow p-4 md:p-6 lg:p-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {bonuses.map((bonus, index) => (
                   <BonusCard key={index} bonus={bonus} />
                ))}
            </div>
        </main>
    </div>
  );
}
