
'use client';
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Apple, Share, MoreVertical } from "lucide-react";

// Simple SVG for Android icon
const AndroidIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M15.2,5.4H13V2.6c0-0.4-0.3-0.7-0.7-0.7c-0.4,0-0.7,0.3-0.7,0.7v2.8H8.8V2.6c0-0.4-0.3-0.7-0.7-0.7s-0.7,0.3-0.7,0.7v2.8 H5.2c-1.1,0-2,0.9-2,2v10.3c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V7.4C17.2,6.3,16.3,5.4,15.2,5.4z M7.7,16.5c-0.6,0-1.1-0.5-1.1-1.1 s0.5-1.1,1.1-1.1s1.1,0.5,1.1,1.1S8.3,16.5,7.7,16.5z M14.7,16.5c-0.6,0-1.1-0.5-1.1-1.1s0.5-1.1,1.1-1.1s1.1,0.5,1.1,1.1 S15.3,16.5,14.7,16.5z M15.5,11.6H6.8V9.8h8.7V11.6z"></path>
    </svg>
);


interface PwaInstallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismiss: () => void;
}

export function PwaInstallDialog({ open, onOpenChange, onDismiss }: PwaInstallDialogProps) {
  const [os, setOs] = React.useState<'android' | 'ios' | null>(null);

  // Reset state when dialog is closed/opened
  React.useEffect(() => {
    if (!open) {
        setTimeout(() => setOs(null), 200); // Delay to allow animation
    }
  }, [open]);

  const handleDismiss = () => {
    onDismiss();
  };

  const renderInitialScreen = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-center">Instale o App na sua Tela de Início!</DialogTitle>
        <DialogDescription className="text-center">
            Tenha acesso rápido aos seus treinos e cardápios. Primeiro, qual sistema você usa?
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-4 py-4">
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setOs('ios')}>
            <Apple className="h-8 w-8" />
            iPhone
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setOs('android')}>
            <AndroidIcon className="h-8 w-8" />
            Android
        </Button>
      </div>
      <DialogFooter>
         <Button variant="ghost" className="w-full" onClick={handleDismiss}>Deixar para depois</Button>
      </DialogFooter>
    </>
  );

  const renderIosInstructions = () => (
    <>
        <DialogHeader>
            <DialogTitle className="text-center">Instalando no iPhone</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 text-center">
            <p>1. Abra o app no navegador Safari.</p>
            <p>2. Toque no ícone de <span className="font-bold">Compartilhar</span> <Share className="inline-block h-5 w-5 mx-1" /> na barra de navegação.</p>
            <p>3. Role para baixo e selecione <span className="font-bold">"Adicionar à Tela de Início"</span>.</p>
            <p>4. Confirme e o ícone do app aparecerá na sua tela!</p>
        </div>
        <DialogFooter className="flex-col gap-2">
            <Button className="w-full" onClick={handleDismiss}>Entendido!</Button>
            <Button variant="link" className="w-full" onClick={() => setOs(null)}>Voltar</Button>
        </DialogFooter>
    </>
  );

    const renderAndroidInstructions = () => (
    <>
        <DialogHeader>
            <DialogTitle className="text-center">Instalando no Android</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 text-center">
            <p>1. Abra o app no navegador Chrome.</p>
            <p>2. Toque no menu <MoreVertical className="inline-block h-5 w-5 mx-1" /> no canto superior direito.</p>
            <p>3. Selecione a opção <span className="font-bold">"Instalar aplicativo"</span> ou <span className="font-bold">"Adicionar à tela inicial"</span>.</p>
            <p>4. Siga as instruções e o ícone do app aparecerá na sua tela!</p>
        </div>
         <DialogFooter className="flex-col gap-2">
            <Button className="w-full" onClick={handleDismiss}>Entendido!</Button>
            <Button variant="link" className="w-full" onClick={() => setOs(null)}>Voltar</Button>
        </DialogFooter>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onEscapeKeyDown={handleDismiss} onPointerDownOutside={handleDismiss}>
        {!os && renderInitialScreen()}
        {os === 'ios' && renderIosInstructions()}
        {os === 'android' && renderAndroidInstructions()}
      </DialogContent>
    </Dialog>
  );
}
