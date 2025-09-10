// src/app/(app)/pambora/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

// Simple SVG for WhatsApp icon
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" {...props}>
        <path
        d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.044-.53-.044-.315 0-.76.214-1.225.86-.23.305-.547.713-.738 1.138-.305.713-.688 1.74-.688 2.593 0 .828.74 1.96 1.425 2.688.93.93 2.36 1.84 3.76 2.33.93.305 1.76.402 2.63.402.688 0 1.12-.187 1.518-.487.545-.402.99-1.29.99-1.82 0-.372-.23-.586-.315-.687a.426.426 0 0 0-.214-.173.426.426 0 0 0-.315-.043zM15.011 2.41a12.583 12.583 0 0 0-12.57 12.57c0 6.94 5.63 12.57 12.57 12.57.25 0 .5-.01.75-.03a12.583 12.583 0 0 0 11.08-11.08.75.75 0 0 0-.03-.75A12.583 12.583 0 0 0 15.011 2.411z"
        fill="currentColor"
        />
    </svg>
);

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
                        src="https://picsum.photos/seed/community/600/300"
                        alt="Comunidade animada"
                        layout="fill"
                        objectFit="cover"
                        className="opacity-90"
                        data-ai-hint="fitness community"
                     />
                     <div className="absolute inset-0 bg-black/50" />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-full">
                             <WhatsAppIcon className="h-16 w-16 text-green-500" />
                        </div>
                     </div>
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
