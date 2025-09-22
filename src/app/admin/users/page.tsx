// src/app/admin/users/page.tsx
'use client';
import * as React from 'react';
import { db, auth } from '@/services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, ArrowLeft, Search, Dumbbell, Flame, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserData {
  uid: string;
  name?: string;
  email?: string;
  whatsapp?: string;
  goal?: string;
  diet?: string;
  allergies?: string;
  completedWorkouts?: number[];
  profilePictureUrl?: string;
}

const StatItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | undefined }) => (
    <div className="flex items-center gap-3 rounded-md bg-muted p-3">
        <Icon className="h-5 w-5 text-primary" />
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-semibold">{value || 'Não informado'}</p>
        </div>
    </div>
);

export default function UsersAdminPage() {
  const [allUsers, setAllUsers] = React.useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = React.useState<UserData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<User | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedUser, setSelectedUser] = React.useState<UserData | null>(null);
  
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const isAdmin = currentUser && (currentUser.email === 'pam@admin.com' || currentUser.email === 'bypam@admin.com');
      if (isAdmin) {
        setUser(currentUser);
      } else {
        router.push('/admin');
      }
    });
    return () => unsubscribe();
  }, [router]);

  React.useEffect(() => {
    if (!user) return; 

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, orderBy('name'));
        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        } as UserData));
        setAllUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        toast({
          variant: 'destructive',
          title: 'Erro ao Carregar Usuários',
          description: 'Não foi possível buscar os dados. Verifique o Firestore.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast, user]);

  React.useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = allUsers.filter(item => {
      return (
        item.name?.toLowerCase().includes(lowercasedFilter) ||
        item.email?.toLowerCase().includes(lowercasedFilter)
      );
    });
    setFilteredUsers(filteredData);
  }, [searchTerm, allUsers]);

  if (!user) {
    return (
        <div className="flex h-screen items-center justify-center bg-muted/30">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <div className="flex flex-col min-h-screen bg-muted/30">
        <header className="flex items-center gap-4 p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
            <Button variant="outline" size="icon" asChild>
            <Link href="/admin">
                <ArrowLeft className="h-4 w-4" />
            </Link>
            </Button>
            <div>
            <h1 className="text-2xl font-bold font-headline text-foreground">
                Gerenciar Usuários
            </h1>
            <p className="text-muted-foreground">Busque e visualize o progresso dos participantes.</p>
            </div>
        </header>

        <main className="flex-grow p-4 md:p-6 lg:p-8">
            <Card>
            <CardHeader>
                <CardTitle>Lista de Usuários</CardTitle>
                <CardDescription>
                    Encontramos {filteredUsers.length} de {allUsers.length} usuários.
                </CardDescription>
                 <div className="relative pt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou e-mail..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredUsers.length > 0 ? filteredUsers.map(u => (
                        <Card 
                            key={u.uid} 
                            className="flex flex-col items-center p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => setSelectedUser(u)}
                        >
                            <Avatar className="h-16 w-16 mb-3">
                                <AvatarImage src={u.profilePictureUrl} alt={u.name} />
                                <AvatarFallback>{u.name ? u.name.charAt(0) : 'U'}</AvatarFallback>
                            </Avatar>
                            <p className="font-semibold truncate w-full">{u.name || 'Nome não preenchido'}</p>
                            <p className="text-xs text-muted-foreground truncate w-full">{u.email}</p>
                        </Card>
                        )) : (
                            <div className="col-span-full text-center py-10">
                                <p>Nenhum usuário encontrado com esse critério de busca.</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
            </Card>
        </main>
        </div>

        {/* User Details Dialog */}
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedUser?.profilePictureUrl} alt={selectedUser?.name} />
                        <AvatarFallback>{selectedUser?.name ? selectedUser.name.charAt(0) : 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <DialogTitle className="text-2xl">{selectedUser?.name}</DialogTitle>
                        <DialogDescription>{selectedUser?.email}</DialogDescription>
                        <DialogDescription>{selectedUser?.whatsapp}</DialogDescription>
                    </div>
                </div>
            </DialogHeader>
            <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatItem icon={Flame} label="Objetivo Principal" value={selectedUser?.goal} />
                <StatItem icon={Dumbbell} label="Treinos Concluídos" value={`${selectedUser?.completedWorkouts?.length || 0} de 21`} />
                <div className="col-span-full">
                     <div className="flex items-center gap-3 rounded-md bg-muted p-3">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">Dias de Treino Concluídos</p>
                            <p className="font-semibold break-all">
                                {selectedUser?.completedWorkouts && selectedUser.completedWorkouts.length > 0 
                                    ? selectedUser.completedWorkouts.sort((a,b) => a-b).join(', ') 
                                    : 'Nenhum treino concluído'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DialogContent>
    </Dialog>
  );
}
