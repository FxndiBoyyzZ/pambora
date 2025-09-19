
'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, EyeOff, Eye, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { auth } from '@/services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({
                title: 'Login bem-sucedido!',
                description: 'Bem-vindo(a) de volta!',
            });
            router.push('/treinos');
        } catch (err: any) {
             setError('Email ou senha inválidos. Por favor, tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
             <Image
                src="/FundoPAM.png"
                alt="Mulher se exercitando"
                fill
                className="absolute inset-0 z-0 object-cover opacity-20"
                data-ai-hint="woman fitness"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md">
                <Link href="/" className="absolute top-4 left-4 z-20">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft />
                    </Button>
                </Link>
                <Logo />
                <Card className="w-full bg-background/80 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-headline tracking-wider">Acesse sua Conta</CardTitle>
                        <CardDescription>
                            Faça login para continuar sua jornada.
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
                                        placeholder="Sua senha"
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
                        <CardFooter className="flex-col gap-4">
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Entrar
                            </Button>
                             <Button variant="link" asChild>
                                <Link href="/quiz">Não tem uma conta? Cadastre-se</Link>
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
