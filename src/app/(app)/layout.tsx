
'use client';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dumbbell, UtensilsCrossed, Users, User, Flame, Gift, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { QuizProvider, useQuiz } from '@/services/quiz-service';
import { useEffect } from 'react';
import Image from 'next/image';

const navItems = [
  { href: '/treinos', label: 'Treinos', icon: Dumbbell },
  { href: '/cardapio', label: 'Cardápio', icon: UtensilsCrossed },
  { href: '/pambora', label: '#PAMBORA', icon: Users },
  { href: '/bonus', label: 'Bônus', icon: Gift },
  { href: '/perfil', label: 'Perfil', icon: User },
];

function DesktopSidebar() {
  const pathname = usePathname();
  const { answers } = useQuiz();
  const userHandle = answers.name ? `@${answers.name.split(' ')[0].toLowerCase()}` : '@usuario';

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-background/80 backdrop-blur-sm p-4 z-10">
      <div className="p-4 mb-4">
        <Logo />
      </div>
      <nav className="flex flex-col gap-2 flex-grow">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={pathname.startsWith(item.href) ? 'default' : 'ghost'}
            asChild
            className="justify-start gap-3 px-4 py-6 text-base"
          >
            <Link href={item.href}>
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-3 p-4">
        <Avatar>
          <AvatarImage src={answers.profilePictureUrl} alt={answers.name} />
          <AvatarFallback>{answers.name ? answers.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{answers.name || 'Usuário'}</p>
          <p className="text-sm text-muted-foreground">{userHandle}</p>
        </div>
      </div>
    </aside>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border p-2 flex justify-around z-20">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
            pathname.startsWith(item.href)
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <item.icon className="h-6 w-6" />
          <span className="text-xs font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function AppLayoutContent({ children }: { children: ReactNode }) {
  const { user, loading } = useQuiz();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/quiz');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full">
        <Image
            src="/IMG_8326.JPG"
            alt="Fundo"
            fill
            className="object-cover opacity-20 z-0"
            data-ai-hint="fitness background"
        />
        <div className="relative z-10 flex min-h-screen bg-transparent">
            <DesktopSidebar />
            <main className="flex-1 pb-20 lg:pb-0 bg-background/80 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none">
                {children}
            </main>
            <MobileBottomNav />
        </div>
    </div>
  );
}


export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <QuizProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </QuizProvider>
  );
}
