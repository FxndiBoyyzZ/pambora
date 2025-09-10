
'use client';
import * as React from 'react';
import { PostCard } from "@/components/pambora/post-card";
import { CreatePostForm } from "@/components/pambora/create-post-form";
import { db } from '@/services/firebase';
import { collection, query, onSnapshot, DocumentData } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuiz } from '@/services/quiz-service';

export default function PamboraPage() {
  const [posts, setPosts] = React.useState<DocumentData[]>([]);
  const [dataLoading, setDataLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { user, loading: authLoading } = useQuiz();

  React.useEffect(() => {
    // We can proceed to fetch data regardless of auth state, as the feed is public.
    setDataLoading(true);
    setError(null);
    
    // Query without server-side ordering to avoid needing a composite index for public queries.
    const q = query(collection(db, "posts"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData: DocumentData[] = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });

      // Sort posts on the client-side to ensure newest are first.
      postsData.sort((a, b) => {
        const dateA = a.timestamp?.toDate() || 0;
        const dateB = b.timestamp?.toDate() || 0;
        return dateB - dateA;
      });

      setPosts(postsData);
      setDataLoading(false);
    }, (err) => {
      console.error("Firestore snapshot error:", err);
      setError("Ocorreu um erro ao carregar o feed. Por favor, tente recarregar a página.");
      setDataLoading(false);
    });

    // Cleanup subscription on unmount.
    return () => unsubscribe();
  }, []);

  const renderContent = () => {
    if (dataLoading) {
      return (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-lg font-semibold text-muted-foreground mt-4">Carregando feed #PAMBORA...</p>
        </div>
      );
    }
    
    if (error) {
        return (
             <div className="text-center py-12 bg-destructive/10 text-destructive-foreground rounded-lg border border-destructive p-4">
                <p className="text-lg font-semibold">Erro ao Carregar</p>
                <p className="text-sm">{error}</p>
             </div>
        )
    }

    if (posts.length > 0) {
      return posts.map(post => <PostCard key={post.id} post={post} />);
    }

    return (
      <div className="text-center py-12 bg-card rounded-lg border border-border">
        <p className="text-lg font-semibold text-muted-foreground">Ainda não há publicações.</p>
        <p className="text-muted-foreground">Que tal ser o primeiro a postar e inspirar a comunidade?</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <h1 className="text-2xl font-bold font-headline text-foreground">#PAMBORA</h1>
      </header>
      <div className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full space-y-6">
            
            <CreatePostForm />

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full">
                    <TabsTrigger value="all" className="flex-1">Feed</TabsTrigger>
                    <TabsTrigger value="dicas" className="flex-1">Dicas</TabsTrigger>
                    <TabsTrigger value="conquistas" className="flex-1">Conquistas</TabsTrigger>
                    <TabsTrigger value="popular" className="flex-1">Popular</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="space-y-6">
              {renderContent()}
            </div>
        </div>
      </div>
    </div>
  );
}
