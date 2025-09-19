
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, LogIn } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function StartPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
      <Image
        src="/FundoPAM.png"
        alt="Mulher se exercitando"
        fill
        className="absolute inset-0 z-0 object-cover opacity-20"
        data-ai-hint="woman fitness"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md">
        <Logo />
        <Card className="w-full bg-background/80 backdrop-blur-sm text-center">
            <CardHeader>
                <CardTitle className="text-3xl font-headline tracking-wide">
                    Bem-vindo(a)!
                </CardTitle>
                <CardDescription className="text-md text-foreground/80 pt-2">
                    Vamos começar? Nos diga se você é novo por aqui ou se já faz parte do time.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Button asChild size="lg" className="w-full text-lg font-semibold">
                    <Link href="/quiz">
                        Quero começar o desafio!
                        <ArrowRight className="ml-2" />
                    </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full text-lg font-semibold">
                     <Link href="/login">
                        Já tenho uma conta
                        <LogIn className="ml-2" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
