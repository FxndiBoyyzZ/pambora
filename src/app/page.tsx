import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4 text-center">
      <Image
        src="/FundoPAM.png"
        alt="Mulher se exercitando"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 z-0 opacity-20"
        data-ai-hint="woman fitness"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <Logo />
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-bold tracking-tighter text-primary sm:text-5xl md:text-6xl font-headline">
            Desafio PAMBORA!
          </h1>
          <p className="max-w-md text-lg text-foreground/80 md:text-xl">
            Comece sua jornada de 21 dias para uma vida mais saudável e ativa.
          </p>
        </div>
        <Button asChild size="lg" className="text-lg font-semibold">
          <Link href="/quiz">INICIAR DESAFIO</Link>
        </Button>
      </div>
    </div>
  );
}
