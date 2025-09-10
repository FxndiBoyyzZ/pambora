// src/app/(app)/pambora/page.tsx
'use client';
import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/pambora/post-card";
import { db } from '@/services/firebase';
import { collection, query, orderBy, onSnapshot, DocumentData } from 'firebase/firestore';
import { CreatePostForm } from '@/components/pambora/create-post-form';
import { useQuiz } from '@/services/quiz-service';

export default function PamboraPage() {
  const { user } = useQuiz();
  const [posts, setPosts] = React.useState<DocumentData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Only fetch posts if the user is authenticated (even anonymously)
    if (!user) {
        setLoading(false);
        return;
    }

    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData: DocumentData[] = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching posts:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <h1 className="text-2xl font-bold font-headline text-foreground">#PAMBORA</h1>
      </header>
      <div className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full space-y-6">
            
            {/* Create Post Form */}
            <CreatePostForm />

            {/* Filter Tabs */}
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full">
                    <TabsTrigger value="all" className="flex-1">Feed</TabsTrigger>
                    <TabsTrigger value="dicas" className="flex-1">Dicas</TabsTrigger>
                    <TabsTrigger value="conquistas" className="flex-1">Conquistas</TabsTrigger>
                    <TabsTrigger value="popular" className="flex-1">Popular</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Posts */}
            <div className="space-y-6">
              {loading ? (
                 <div className="text-center py-12 bg-card rounded-lg border border-border">
                  <p className="text-lg font-semibold text-muted-foreground">Carregando feed...</p>
                </div>
              ) : posts.length > 0 ? (
                posts.map(post => <PostCard key={post.id} post={post} />)
              ) : (
                <div className="text-center py-12 bg-card rounded-lg border border-border">
                  <p className="text-lg font-semibold text-muted-foreground">Ainda não há publicações.</p>
                  <p className="text-muted-foreground">Que tal ser o primeiro a postar?</p>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
