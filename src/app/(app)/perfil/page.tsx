
'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bell, Shield, LogOut, ChevronRight, Camera, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuiz } from "@/services/quiz-service";
import * as React from 'react';
import { useRouter } from "next/navigation";
import { storage, auth } from "@/services/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { signOut } from "firebase/auth";

const settings = [
  { name: "Notificações", icon: Bell },
  { name: "Privacidade", icon: Shield },
];

function EditProfileDialog({ children }: { children: React.ReactNode }) {
  const { answers, setAnswer } = useQuiz();
  const [open, setOpen] = React.useState(false);
  const [localAnswers, setLocalAnswers] = React.useState(answers);

  React.useEffect(() => {
    setLocalAnswers(answers);
  }, [answers, open]);


  const handleSave = () => {
    Object.keys(localAnswers).forEach(key => {
        const value = localAnswers[key as keyof typeof localAnswers];
        if(value !== undefined && value !== answers[key as keyof typeof answers]) {
             setAnswer(key as keyof typeof localAnswers, value);
        }
    });
    setOpen(false);
  }

  const handleChange = (field: keyof typeof localAnswers, value: string) => {
    setLocalAnswers(prev => ({...prev, [field]: value}));
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
            <Input id="name" value={localAnswers.name || ''} onChange={(e) => handleChange('name', e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="whatsapp" className="text-right">
              Whatsapp
            </Label>
            <Input id="whatsapp" value={localAnswers.whatsapp || ''} onChange={(e) => handleChange('whatsapp', e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" type="email" value={localAnswers.email || ''} onChange={(e) => handleChange('email', e.target.value)} className="col-span-3" disabled />
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
  const { user, answers, setAnswer, resetQuiz } = useQuiz();
  const router = useRouter();

  const focusDays = answers.completedWorkouts?.length ?? 0;
  const mealsOnPlan = focusDays * 4;

  const stats = [
    { name: "Dias de Foco", value: focusDays },
    { name: "Treinos Concluídos", value: focusDays },
    { name: "Refeições no Plano", value: mealsOnPlan },
  ];

  const handleResetData = async () => {
    await resetQuiz();
    alert('Seus dados foram resetados!');
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/quiz');
  }
  
  const userHandle = answers.name ? `@${answers.name.split(' ')[0].toLowerCase()}` : '@usuario';
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        // Show local preview immediately
        setAnswer('profilePictureUrl', dataUrl); 

        // Upload to Firebase Storage
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        try {
            await uploadString(storageRef, dataUrl, 'data_url');
            const downloadUrl = await getDownloadURL(storageRef);
            // Update Firestore with the final URL
            setAnswer('profilePictureUrl', downloadUrl);
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            // Optionally revert the optimistic UI update
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <h1 className="text-2xl font-bold font-headline text-foreground text-center lg:text-left">
          Meu Perfil
        </h1>
      </header>

      <div className="flex-grow p-4 md:p-6 lg:p-8 space-y-8">
        <div className="flex flex-col items-center lg:flex-row lg:items-start gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
              <AvatarImage src={answers.profilePictureUrl} alt={answers.name || "Usuário"} />
              <AvatarFallback className="text-4xl">
                <span>{answers.name ? answers.name.charAt(0).toUpperCase() : '💪'}</span>
              </AvatarFallback>
            </Avatar>
            <div 
              className="absolute bottom-0 right-0 bg-primary rounded-full p-1.5 cursor-pointer hover:bg-primary/90"
              onClick={handleAvatarClick}
            >
              <Camera className="h-4 w-4 text-primary-foreground" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
              accept="image/*"
            />
          </div>
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

        <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
            <Button variant="outline" className="w-full" onClick={handleResetData}>
                <Trash2 className="mr-2 h-4 w-4" />
                Resetar Dados
            </Button>
            <Button variant="destructive" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
            </Button>
        </div>
      </div>
    </div>
  );
}
