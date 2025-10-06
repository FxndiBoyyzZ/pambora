// src/app/admin/page.tsx
'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, Download, LogOut, Users, UserPlus, LineChart, CheckCircle, UserSearch, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { doc, getDocs, collection } from 'firebase/firestore';
import { db, auth } from '@/services/firebase';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, type User as FirebaseUser } from 'firebase/auth';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { format, subDays, isToday, startOfDay, differenceInCalendarDays, isBefore } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

export const dynamic = 'force-dynamic';

const challengeStartDate = startOfDay(new Date(2025, 8, 22));

const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: string, icon: React.ElementType, description?: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
);

function AdminDashboard() {
    const [leads, setLeads] = React.useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = React.useState(true);
    const { toast } = useToast();

    // Calcula qual o dia liberado atualmente
    const today = startOfDay(new Date());
    const unlockedDays = isBefore(today, challengeStartDate)
        ? 0
        : differenceInCalendarDays(today, challengeStartDate) + 1;

    React.useEffect(() => {
        const fetchAllData = async () => {
            setIsLoadingData(true);
            try {
                // Fetch leads
                const usersCollection = collection(db, 'users');
                const querySnapshot = await getDocs(usersCollection);
                const leadsData = querySnapshot.docs.map(doc => ({
                    uid: doc.id,
                    ...doc.data()
                }));
                setLeads(leadsData);

            } catch (error) {
                console.error("Erro ao buscar dados:", error);
                toast({
                    variant: 'destructive',
                    title: 'Erro ao Carregar Dados!',
                    description: 'Não foi possível carregar os leads.'
                });
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchAllData();
    }, [toast]);

    const metrics = React.useMemo(() => {
        const totalSignups = leads.length;
        const todaySignups = leads.filter(lead => 
            lead.createdAt && isToday(new Date(lead.createdAt.seconds * 1000))
        ).length;

        const todayCompletedWorkouts = unlockedDays > 0 ? leads.filter(lead =>
            lead.completedWorkouts && lead.completedWorkouts.includes(unlockedDays)
        ).length : 0;

        const signupsByDay = Array.from({ length: 7 }).map((_, i) => {
            const date = subDays(new Date(), i);
            const count = leads.filter(lead => 
                lead.createdAt && format(new Date(lead.createdAt.seconds * 1000), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            ).length;
            return {
                name: format(date, 'dd/MM'),
                Cadastros: count,
            };
        }).reverse();

        return { totalSignups, todaySignups, signupsByDay, todayCompletedWorkouts };
    }, [leads, unlockedDays]);
  
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
                <div className="text-right">
                    <p className="font-bold text-lg">Desafio Dia: <span className="text-primary">{unlockedDays > 0 ? unlockedDays : "Em breve"}</span></p>
                    <p className="text-xs text-muted-foreground">O dia do desafio é calculado automaticamente.</p>
                </div>
            </div>

            {/* Metrics Section */}
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard 
                    title="Cadastros Totais"
                    value={metrics.totalSignups.toString()}
                    icon={Users}
                    description="Total de usuários na plataforma."
                />
                 <StatCard 
                    title="Cadastros Hoje"
                    value={metrics.todaySignups.toString()}
                    icon={UserPlus}
                    description="Novos usuários registrados hoje."
                />
                 <StatCard 
                    title="Treinos Concluídos Hoje"
                    value={metrics.todayCompletedWorkouts.toString()}
                    icon={CheckCircle}
                    description={`Usuários que concluíram o treino do dia ${unlockedDays || ''}`}
                />
            </div>

            {/* Chart Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Cadastros nos Últimos 7 Dias</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                       <BarChart data={metrics.signupsByDay}>
                           <XAxis 
                                dataKey="name" 
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                           <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                                allowDecimals={false}
                           />
                           <Tooltip 
                            cursor={{fill: 'hsl(var(--muted))'}}
                            contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}}
                           />
                           <Bar dataKey="Cadastros" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                       </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Workout Controls Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Editar Treinos</CardTitle>
                        <CardDescription>Edite os detalhes dos 3 treinos base do desafio.</CardDescription>
                    </CardHeader>
                     <CardFooter>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                           <Link href="/admin/workouts"><Settings className="mr-2 h-4 w-4" />Editar Treinos Base</Link>
                        </Button>
                    </CardFooter>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Gerenciar Usuários</CardTitle>
                        <CardDescription>Busque usuários e veja suas estatísticas individuais.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                           <Link href="/admin/users"><UserSearch className="mr-2 h-4 w-4" />Ver Usuários</Link>
                        </Button>
                    </CardFooter>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Exportar Leads</CardTitle>
                        <CardDescription>Baixe a lista completa de usuários inscritos em formato CSV.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Link href="/admin/leads" className="w-full">
                            <Button variant="outline" size="sm" className="w-full">
                                <Download className="mr-2 h-4 w-4" />Exportar Leads
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

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const isAdminEmail = currentUser.email === 'pam@admin.com' || currentUser.email === 'bypam@admin.com';
                setIsAdmin(isAdminEmail);
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await firebaseSignOut(auth);
    };



    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!user) {
        return <AdminLoginPage onLoginSuccess={setUser} />;
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
