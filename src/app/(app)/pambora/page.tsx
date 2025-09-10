// src/app/(app)/pambora/page.tsx
'use client';
import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageIcon, MessageSquareText } from "lucide-react";
import { ContentAssistantDialog } from "@/components/pambora/content-assistant-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/pambora/post-card";
import { useQuiz } from "@/services/quiz-service";
import { CreatePostDialog } from '@/components/pambora/create-post-dialog';
import { db } from '@/services/firebase';
import { collection, query, orderBy, onSnapshot, DocumentData } from 'firebase/firestore';

export default function PamboraPage() {
  const { answers } = useQuiz();
  const [isCreatePostOpen, setCreatePostOpen] = React.useState(false);
  const [posts, setPosts] = React.useState<DocumentData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData: DocumentData[] = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <h1 className="text-2xl font-bold font-headline text-foreground">#PAMBORA</h1>
      </header>
      <div className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full space-y-6">
            
            <CreatePostDialog open={isCreatePostOpen} onOpenChange={setCreatePostOpen} />

            {/* Create Post Section */}
            <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3" onClick={() => setCreatePostOpen(true)}>
                    <Avatar>
                      <AvatarImage src={answers.profilePictureUrl} alt={answers.name} />
                      <AvatarFallback>{answers.name ? answers.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow bg-muted rounded-full h-10 flex items-center px-4 cursor-pointer hover:bg-muted/80">
                        <span className="text-muted-foreground">No que você está pensando, {answers.name?.split(' ')[0]}?</span>
                    </div>
                </div>
                <hr className="my-4 border-border" />
                <div className="flex justify-around">
                    <Button variant="ghost" className="flex-1" onClick={() => setCreatePostOpen(true)}>
                        <MessageSquareText className="mr-2 text-blue-500" />
                        Texto
                    </Button>
                    <Button variant="ghost" className="flex-1" onClick={() => setCreatePostOpen(true)}>
                        <ImageIcon className="mr-2 text-green-500" />
                        Foto/Vídeo
                    </Button>
                    <ContentAssistantDialog />
                </div>
            </div>

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
