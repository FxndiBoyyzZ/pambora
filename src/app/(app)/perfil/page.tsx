
'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bell, Shield, LogOut, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuiz } from "@/services/quiz-service";
import * as React from 'react';

const stats = [
  { name: "Dias de Foco", value: "2" },
  { name: "Treinos Concluídos", value: "2" },
  { name: "Refeições no Plano", value: "34" },
];

const settings = [
  { name: "Notificações", icon: Bell },
  { name: "Privacidade", icon: Shield },
];

function EditProfileDialog({ children }: { children: React.ReactNode }) {
  const { answers, setAnswer } = useQuiz();
  const [open, setOpen] = React.useState(false);

  const handleSave = () => {
    // Here you would typically save the data to a backend
    console.log("Saving data:", answers);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Faça alterações no seu perfil aqui. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input id="name" value={answers.name || ''} onChange={(e) => setAnswer('name', e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="whatsapp" className="text-right">
              Whatsapp
            </Label>
            <Input id="whatsapp" value={answers.whatsapp || ''} onChange={(e) => setAnswer('whatsapp', e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" type="email" value={answers.email || ''} onChange={(e) => setAnswer('email', e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSave}>Salvar alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function PerfilPage() {
  const { answers } = useQuiz();
  const userHandle = answers.name ? `@${answers.name.split(' ')[0].toLowerCase()}` : '@usuario';
  
  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <h1 className="text-2xl font-bold font-headline text-foreground text-center lg:text-left">
          Meu Perfil
        </h1>
      </header>

      <div className="flex-grow p-4 md:p-6 lg:p-8 space-y-8">
        <div className="flex flex-col items-center lg:flex-row lg:items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src="https://placehold.co/100x100.png" alt={answers.name || "Usuário"} />
            <AvatarFallback>{answers.name ? answers.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
          </Avatar>
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold">{answers.name || "Usuário"}</h2>
            <p className="text-muted-foreground">{userHandle}</p>
            <EditProfileDialog>
                <Button variant="outline" className="mt-4">
                Editar Perfil
                </Button>
            </EditProfileDialog>
          </div>
        </div>
        
        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Minhas Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-muted p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {settings.map((item) => (
                <li key={item.name}>
                  <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-base">{item.name}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-center">
            <Button variant="destructive" className="w-full max-w-sm">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
            </Button>
        </div>
      </div>
    </div>
  );
}
