// src/app/(app)/pambora/page.tsx
'use client';
import * as React from 'react';
import { PostCard } from "@/components/pambora/post-card";
import { CreatePostForm } from "@/components/pambora/create-post-form";
import { useQuiz } from '@/services/quiz-service';
import { db } from '@/services/firebase';
import { collection, query, orderBy, onSnapshot, DocumentData } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PamboraPage() {
  const { user, loading: authLoading } = useQuiz();
  const [posts, setPosts] = React.useState<DocumentData[]>([]);
  const [dataLoading, setDataLoading] = React.useState(true);

  React.useEffect(() => {
    // Wait until the authentication state is resolved.
    if (authLoading) {
      return;
    }

    // If there is no authenticated user, do not attempt to fetch data.
    if (!user) {
      setDataLoading(false);
      return;
    }

    // User is authenticated, it's safe to query Firestore.
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData: DocumentData[] = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postsData);
      setDataLoading(false);
    }, (error) => {
      console.error("Error fetching posts from Firestore:", error);
      // This is where a "Missing or insufficient permissions" error would be caught.
      setDataLoading(false);
    });

    // Cleanup the Firestore listener when the component unmounts
    // or when the user/auth state changes.
    return () => unsubscribe();
  }, [user, authLoading]); // Re-run effect if user or authLoading state changes.

  const renderContent = () => {
    if (authLoading || dataLoading) {
      return (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-lg font-semibold text-muted-foreground mt-4">Carregando feed #PAMBORA...</p>
        </div>
      );
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
