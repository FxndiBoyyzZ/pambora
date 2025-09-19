
// src/app/admin/page.tsx
'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, Dumbbell, Download, LogOut, Settings, EyeOff, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/services/firebase';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, type User as FirebaseUser, createUserWithEmailAndPassword } from 'firebase/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const dynamic = 'force-dynamic';

function AdminDashboard() {
    const [workoutControls, setWorkoutControls] = React.useState({ unlockedDays: 0, baseWorkoutForToday: 1 });
    const [isLoadingData, setIsLoadingData] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const { toast } = useToast();

     React.useEffect(() => {
        const fetchConfig = async () => {
            setIsLoadingData(true);
            try {
                const workoutConfigDocRef = doc(db, 'config', 'workoutControls');
                const workoutConfigDoc = await getDoc(workoutConfigDocRef);
                if (workoutConfigDoc.exists()) {
                    const data = workoutConfigDoc.data();
                     setWorkoutControls({
                        unlockedDays: data.unlockedDays || 0,
                        baseWorkoutForToday: data.baseWorkoutForToday || 1,
                    });
                } else {
                     await setDoc(workoutConfigDocRef, { unlockedDays: 0, baseWorkoutForToday: 1 });
                }

            } catch (error) {
                console.error("Erro ao buscar configuração:", error);
                toast({
                    variant: 'destructive',
                    title: 'Erro ao Carregar Dados!',
                    description: 'Não foi possível carregar a configuração. Verifique as regras de segurança do Firestore.'
                });
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchConfig();
    }, [toast]);

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const workoutConfigDocRef = doc(db, 'config', 'workoutControls');
            await setDoc(workoutConfigDocRef, workoutControls);

            toast({
                title: 'Sucesso!',
                description: 'Configurações salvas com sucesso.'
            });
        } catch (error) {
            console.error("Erro ao salvar configuração:", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao Salvar!',
                description: 'Não foi possível salvar. Verifique as permissões do Firestore.'
            });
        } finally {
            setIsSaving(false);
        }
    };
  
    if (isLoadingData) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-headline text-foreground tracking-wide">
                    Painel de Controle Geral
                </h2>
                <Button onClick={handleSaveChanges} disabled={isSaving || isLoadingData}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Salvar Alterações
                </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Workout Controls Card */}
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Controle de Treinos</CardTitle>
                        <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-2 gap-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="unlockedDays">Dia liberado hoje</Label>
                            <Select
                                value={String(workoutControls.unlockedDays)}
                                onValueChange={(value) => setWorkoutControls(prev => ({ ...prev, unlockedDays: parseInt(value) }))}
                            >
                                <SelectTrigger id="unlockedDays">
                                    <SelectValue placeholder="Selecione o dia" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Em Breve</SelectItem>
                                    {Array.from({ length: 21 }, (_, i) => i + 1).map(day => (
                                        <SelectItem key={day} value={String(day)}>
                                            Dia {day}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Defina qual dia do desafio está ativo.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="baseWorkout">Treino base de hoje</Label>
                            <Select
                                value={String(workoutControls.baseWorkoutForToday)}
                                onValueChange={(value) => setWorkoutControls(prev => ({...prev, baseWorkoutForToday: parseInt(value)}))}
                            >
                                <SelectTrigger id="baseWorkout">
                                    <SelectValue placeholder="Selecione o treino" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Treino Base 1</SelectItem>
                                    <SelectItem value="2">Treino Base 2</SelectItem>
                                    <SelectItem value="3">Treino Base 3</SelectItem>
                                </SelectContent>
                            </Select>
                             <p className="text-xs text-muted-foreground">Escolha o treino para o dia liberado.</p>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gerenciar Treinos</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                            <p className="text-xs text-muted-foreground">Edite os detalhes de cada treino base, como vídeos, exercícios e durações.</p>
                    </CardContent>
                        <CardFooter>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                           <Link href="/admin/workouts">Editar Treinos</Link>
                        </Button>
                        </CardFooter>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gerenciar Leads</CardTitle>
                        <Download className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                            <p className="text-xs text-muted-foreground">Visualize e exporte a lista de todos os usuários que se inscreveram.</p>
                    </CardContent>
                        <CardFooter>
                        <Link href="/admin/leads" className="w-full">
                            <Button variant="outline" size="sm" className="w-full">
                                Visualizar Leads
                            </Button>
                        </Link>
                        </CardFooter>
                </Card>
            </div>
        </div>
    );
}

function AdminLoginPage({ onLoginSuccess }: { onLoginSuccess: (user: FirebaseUser) => void }) {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            onLoginSuccess(userCredential.user);
        } catch (err: any) {
             setError('Email ou senha inválidos. Por favor, tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40">
            <Card className="w-full max-w-md mx-4">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline tracking-wider text-center">Acesso Restrito</CardTitle>
                    <CardDescription className="text-center">
                        Faça login para gerenciar o aplicativo.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="seu@email.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <div className="relative">
                                <Input 
                                    id="password" 
                                    type={showPassword ? 'text' : 'password'}
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                />
                                <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                    onClick={() => setShowPassword(prev => !prev)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Entrar
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

export default function AdminPage() {
    const [user, setUser] = React.useState<FirebaseUser | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [authChecked, setAuthChecked] = React.useState(false);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Hard-coded admin emails
                const isAdminEmail = currentUser.email === 'pam@admin.com' || currentUser.email === 'bypam@admin.com';
                if(isAdminEmail) {
                    setIsAdmin(true);
                } else {
                    const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
                    setIsAdmin(adminDoc.exists());
                }
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
            setAuthChecked(true);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await firebaseSignOut(auth);
        setUser(null);
        setIsAdmin(false);
    };

    if (loading || !authChecked) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!user) {
        return <AdminLoginPage onLoginSuccess={(loggedInUser) => {
             setUser(loggedInUser);
             const isAdminEmail = loggedInUser.email === 'pam@admin.com' || loggedInUser.email === 'bypam@admin.com';
             if(isAdminEmail){
                 setIsAdmin(true);
             } else {
                // Re-check admin status on login
                getDoc(doc(db, 'admins', loggedInUser.uid)).then(adminDoc => {
                    setIsAdmin(adminDoc.exists());
                });
             }
        }} />;
    }

    if (!isAdmin) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Card className="w-full max-w-sm text-center">
                     <CardHeader>
                        <CardTitle>Acesso Negado</CardTitle>
                        <CardDescription>Esta conta não é de administrador.</CardDescription>
                     </CardHeader>
                     <CardFooter>
                        <Button variant="destructive" onClick={handleLogout} className="w-full">
                            Sair e tentar novamente
                        </Button>
                     </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/30">
             <header className="flex justify-between items-center p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                <div>
                    <h1 className="text-2xl font-bold font-headline text-foreground">
                        Admin - Painel de Controle
                    </h1>
                     <p className="text-sm text-muted-foreground">Logado como {user.email}</p>
                </div>
                <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </header>
            <main className="flex-grow p-4 md:p-6 lg:p-8">
                 <AdminDashboard />
            </main>
        </div>
    );
}
