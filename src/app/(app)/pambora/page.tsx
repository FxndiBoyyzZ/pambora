// src/app/(app)/pambora/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function PamboraPage() {
  // ATENÇÃO: Substitua este link pelo link real da sua comunidade no WhatsApp!
  const whatsAppCommunityLink = 'https://chat.whatsapp.com/YOUR_COMMUNITY_ID';

  return (
    <div className="flex flex-col h-full">
        <header className="p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
            <h1 className="text-3xl font-bold font-headline text-foreground text-center lg:text-left uppercase tracking-wider">
            Comunidade #PAMBORA
            </h1>
        </header>

        <div className="flex-grow flex items-center justify-center p-4 md:p-6 lg:p-8">
            <Card className="w-full max-w-lg text-center shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-500">
                 <div className="relative h-48 w-full">
                     <Image 
                        src="/comunidade2.png"
                        alt="Comunidade animada"
                        layout="fill"
                        objectFit="cover"
                        className="opacity-90"
                        data-ai-hint="fitness community"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                 </div>
                <CardHeader className="pt-8">
                    <CardTitle className="text-4xl font-bold font-headline text-primary uppercase tracking-wide">
                        Junte-se à Nossa Comunidade!
                    </CardTitle>
                    <CardDescription className="text-lg text-foreground/80 pt-2 max-w-md mx-auto">
                        Conecte-se com outras pessoas, compartilhe suas vitórias, tire dúvidas e receba dicas exclusivas diretamente da Pam.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <a href={whatsAppCommunityLink} target="_blank" rel="noopener noreferrer">
                        <Button size="lg" className="w-full text-lg font-semibold">
                            Entrar na Comunidade
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </a>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
