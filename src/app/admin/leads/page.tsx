// src/app/admin/leads/page.tsx
'use client';
import * as React from 'react';
import { db, auth } from '@/services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Download, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface UserData {
  uid: string;
  name?: string;
  email?: string;
  whatsapp?: string;
  goal?: string;
  diet?: string;
  allergies?: string;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
}

export default function LeadsPage() {
  const [leads, setLeads] = React.useState<UserData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<User | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email === 'pam@admin.com') {
        setUser(currentUser);
      } else {
        // If not the admin, redirect to admin login page.
        // This also handles the case where the user logs out.
        router.push('/admin');
      }
    });
    return () => unsubscribe();
  }, [router]);

  React.useEffect(() => {
    // Only fetch leads if we have confirmed the user is the admin.
    if (!user) return; 

    const fetchLeads = async () => {
      setLoading(true);
      try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const leadsData = querySnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        } as UserData));
        setLeads(leadsData);
      } catch (error) {
        console.error("Erro ao buscar leads:", error);
        toast({
          variant: 'destructive',
          title: 'Erro ao Carregar Leads',
          description: 'Não foi possível buscar os dados dos usuários. Verifique as regras do Firestore e sua conexão.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [toast, user]);

  const escapeCsvField = (field: any) => {
    if (field === null || field === undefined) {
      return '""';
    }
    const stringField = String(field);
    if (/[",\r\n]/.test(stringField)) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return `"${stringField}"`;
  };

  const exportToCsv = () => {
    const headers = ['UID', 'Nome', 'Email', 'WhatsApp', 'Data de Inscrição', 'Objetivo', 'Dieta', 'Alergias'];
    const rows = leads.map(lead => [
      lead.uid,
      lead.name || '',
      lead.email || '',
      lead.whatsapp || '',
      lead.createdAt ? format(new Date(lead.createdAt.seconds * 1000), 'dd/MM/yyyy HH:mm') : '',
      lead.goal || '',
      lead.diet || '',
      lead.allergies || ''
    ].map(escapeCsvField).join(','));

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + '\n' 
      + rows.join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads_pambora.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show a loading spinner while we verify the user's auth state.
  if (!user) {
    return (
        <div className="flex h-screen items-center justify-center bg-muted/30">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <header className="flex items-center gap-4 p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-headline text-foreground">
            Leads Cadastrados
          </h1>
          <p className="text-muted-foreground">Visualize e exporte todos os usuários inscritos.</p>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-6 lg:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Usuários</CardTitle>
                <CardDescription>
                    Total de {leads.length} {leads.length === 1 ? 'usuário cadastrado' : 'usuários cadastrados'}.
                </CardDescription>
            </div>
            <Button onClick={exportToCsv} disabled={leads.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Exportar para CSV
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
                 <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="border rounded-md">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>WhatsApp</TableHead>
                        <TableHead>Data de Inscrição</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads.length > 0 ? leads.map(lead => (
                        <TableRow key={lead.uid}>
                            <TableCell className="font-medium">{lead.name || 'N/A'}</TableCell>
                            <TableCell>{lead.email || 'N/A'}</TableCell>
                            <TableCell>{lead.whatsapp || 'N/A'}</TableCell>
                            <TableCell>
                            {lead.createdAt ? format(new Date(lead.createdAt.seconds * 1000), 'dd/MM/yyyy') : 'N/A'}
                            </TableCell>
                        </TableRow>
                        )) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                            Nenhum lead encontrado.
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
