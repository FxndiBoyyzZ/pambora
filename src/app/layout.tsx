
import type { Metadata } from 'next';
import { Inter, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { InAppBrowserBlocker } from '@/components/in-app-browser-blocker';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const bebasNeue = Bebas_Neue({ 
  subsets: ['latin'], 
  weight: '400',
  variable: '--font-bebas-neue'
});

export const metadata: Metadata = {
  title: 'Pam Fit - Desafio PAMBORA!',
  description: 'Um aplicativo para o desafio fitness de 21 dias #PAMBORA.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://www.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={cn('font-body antialiased', inter.variable, bebasNeue.variable)}>
        <InAppBrowserBlocker />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
