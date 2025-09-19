
'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { Copy, Compass } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from './logo';

const BlockerScreen = () => {
    const { toast } = useToast();
    const [currentUrl, setCurrentUrl] = React.useState('');

    React.useEffect(() => {
        setCurrentUrl(window.location.href);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(currentUrl).then(() => {
            toast({
                title: 'Link Copiado!',
                description: 'Agora cole no seu navegador principal.',
            });
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            toast({
                variant: 'destructive',
                title: 'Falha ao copiar',
                description: 'Por favor, copie o link manualmente.',
            });
        });
    };

    return (
        <div className="fixed inset-0 bg-background z-[200] flex items-center justify-center p-4 text-center">
            <div className="flex flex-col items-center gap-6 max-w-md">
                <Logo />
                <Compass className="h-20 w-20 text-primary" />
                <h1 className="text-2xl font-bold font-headline tracking-wide">Use seu Navegador Principal</h1>
                <p className="text-muted-foreground">
                    Para uma melhor experiência e para garantir que todas as funcionalidades funcionem, por favor, abra este site no seu navegador padrão (Safari, Chrome, etc.).
                </p>
                <div className="w-full p-3 border border-dashed rounded-md text-sm text-muted-foreground truncate">
                    {currentUrl}
                </div>
                <Button onClick={handleCopy} className="w-full">
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Link para Abrir no Navegador
                </Button>
                 <p className="text-xs text-muted-foreground/50">
                    O navegador do Instagram/Facebook não é compatível com todas as tecnologias deste app.
                </p>
            </div>
        </div>
    );
};

export function InAppBrowserBlocker() {
    const [isBlocked, setIsBlocked] = React.useState(false);

    React.useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        // This regex checks for Instagram, Facebook, and Messenger in-app browsers.
        if (/FBAN|FBAV|Instagram|Messenger/i.test(userAgent)) {
            setIsBlocked(true);
        }
    }, []);

    if (isBlocked) {
        return <BlockerScreen />;
    }

    return null;
}
