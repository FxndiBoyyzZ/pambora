
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award, BookOpen, Download } from "lucide-react";
import Image from "next/image";

const bonuses = [
    {
        title: "E-book de Receitas Fit",
        description: "Um guia completo com mais de 50 receitas saudáveis e deliciosas.",
        icon: BookOpen,
        image: "https://placehold.co/600x400.png",
        imageHint: "cookbook recipe"
    },
    {
        title: "Guia de Meditação",
        description: "Aprenda a meditar e reduza o estresse com nosso guia para iniciantes.",
        icon: Award,
        image: "https://placehold.co/600x400.png",
        imageHint: "meditation yoga"
    },
    {
        title: "Playlists para Treino",
        description: "Mantenha a motivação em alta com playlists selecionadas para cada tipo de treino.",
        icon: Download,
        image: "https://placehold.co/600x400.png",
        imageHint: "music playlist",
        link: "https://open.spotify.com/playlist/4ZqjhPyrWT9oqKRMafvDE0?si=f7RQpejvSPy-jMWLDEEX6g&pi=SGpxE8JWQxqVg"
    }
]

export default function BonusPage() {
  return (
    <div className="flex flex-col h-full">
        <header className="p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
            <h1 className="text-3xl font-bold font-headline text-foreground text-center lg:text-left uppercase tracking-wider">
              Bônus Exclusivos
            </h1>
        </header>

        <div className="flex-grow p-4 md:p-6 lg:p-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {bonuses.map((bonus, index) => (
                    <Card key={index} className="overflow-hidden flex flex-col">
                         <div className="relative w-full h-48">
                             <Image 
                                 src={bonus.image} 
                                 alt={bonus.title} 
                                 layout="fill"
                                 objectFit="cover"
                                 data-ai-hint={bonus.imageHint}
                              />
                         </div>
                        <CardHeader className="flex flex-row items-start gap-4">
                            <bonus.icon className="w-8 h-8 text-primary mt-1" />
                            <div>
                                <CardTitle>{bonus.title}</CardTitle>
                                <CardDescription className="mt-1">{bonus.description}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="mt-auto">
                           {bonus.link ? (
                                <a href={bonus.link} target="_blank" rel="noopener noreferrer">
                                    <button className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors">
                                        Acessar Agora
                                    </button>
                                </a>
                            ) : (
                                <button className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors">
                                    Acessar Agora
                                </button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    </div>
  );
}
