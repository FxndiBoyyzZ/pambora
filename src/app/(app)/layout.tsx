'use client';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Dumbbell, UtensilsCrossed, Users, User, Flame, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { QuizProvider } from '@/services/quiz-service';

const navItems = [
  { href: '/treinos', label: 'Treinos', icon: Dumbbell },
  { href: '/cardapio', label: 'Cardápio', icon: UtensilsCrossed },
  { href: '/pambora', label: '#PAMBORA', icon: Users },
  { href: '/bonus', label: 'Bônus', icon: Gift },
  { href: '/perfil', label: 'Perfil', icon: User },
];

function DesktopSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-background p-4">
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
          <AvatarImage src="https://placehold.co/40x40.png" alt="ByPamela" />
          <AvatarFallback>BP</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">ByPamela</p>
          <p className="text-sm text-muted-foreground">@bypamela</p>
        </div>
      </div>
    </aside>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 flex justify-around">
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

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <QuizProvider>
      <div className="flex min-h-screen bg-background">
        <DesktopSidebar />
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
        <MobileBottomNav />
      </div>
    </QuizProvider>
  );
}
