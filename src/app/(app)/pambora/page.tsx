import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, MoreHorizontal, Send, Sparkles } from "lucide-react";
import Image from "next/image";
import { ContentAssistantDialog } from "@/components/pambora/content-assistant-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const posts: any[] = [
  // Posts removidos para resetar o feed
];

const PostCard = ({ post }: { post: any }) => (
  <Card className="overflow-hidden">
    <CardHeader className="flex flex-row items-center gap-3 p-4">
      <Avatar>
        <AvatarImage src={post.user.avatar} alt={post.user.name} />
        <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-grow">
        <p className="font-semibold">{post.user.name}</p>
        <p className="text-sm text-muted-foreground">@{post.user.handle}</p>
      </div>
      <Button variant="ghost" size="icon">
        <MoreHorizontal className="h-5 w-5" />
      </Button>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      <p className="mb-4">{post.content}</p>
      {post.image && (
        <div className="aspect-video relative rounded-lg overflow-hidden">
          <Image src={post.image} alt="Post image" layout="fill" objectFit="cover" data-ai-hint={post.imageHint} />
        </div>
      )}
    </CardContent>
    <CardFooter className="flex justify-between items-center p-4 pt-0">
      <div className="flex gap-4 text-muted-foreground">
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          <span>{post.likes}</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <span>{post.comments}</span>
        </Button>
      </div>
      <Button variant="ghost" size="sm" className="flex items-center gap-2">
        <Send className="h-5 w-5" />
        <span>Compartilhar</span>
      </Button>
    </CardFooter>
  </Card>
);

export default function PamboraPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <h1 className="text-2xl font-bold font-headline text-foreground">#PAMBORA</h1>
        <ContentAssistantDialog />
      </header>
      <div className="flex-grow p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto w-full">
            <Tabs defaultValue="all" className="w-full mb-6">
                <TabsList>
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="dicas">Dicas</TabsTrigger>
                    <TabsTrigger value="dúvidas">Dúvidas</TabsTrigger>
                    <TabsTrigger value="frases">Frases</TabsTrigger>
                    <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map(post => <PostCard key={post.id} post={post} />)
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg font-semibold">Ainda não há publicações.</p>
                  <p>Que tal ser o primeiro a postar? Use o botão "Gerar Post"!</p>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
