// src/components/pambora/post-card.tsx
'use client';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import Image from "next/image";

export function PostCard({ post }: { post: any }) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3 p-4">
                <Avatar>
                    <AvatarImage src={post.user.avatar} alt={post.user.name} />
                    <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <p className="font-semibold">{post.user.name}</p>
                    <p className="text-sm text-muted-foreground">@{post.user.handle} • {post.timestamp}</p>
                </div>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
                {post.image && (
                    <div className="aspect-video relative rounded-lg overflow-hidden border border-border">
                        <Image src={post.image} alt="Post image" layout="fill" objectFit="cover" data-ai-hint={post.imageHint} />
                    </div>
                )}
            </CardContent>
            {/* Likes and comments count */}
            <div className="px-4 pb-2 flex justify-between text-sm text-muted-foreground">
                <span>{post.likes} curtidas</span>
                <span>{post.comments} comentários</span>
            </div>
            <hr className="mx-4 border-border" />
            <CardFooter className="flex justify-around items-center p-1">
                 <Button variant="ghost" className="flex-1 text-muted-foreground hover:bg-accent">
                    <Heart className="mr-2" />
                    Curtir
                </Button>
                <Button variant="ghost" className="flex-1 text-muted-foreground hover:bg-accent">
                    <MessageCircle className="mr-2" />
                    Comentar
                </Button>
                <Button variant="ghost" className="flex-1 text-muted-foreground hover:bg-accent">
                    <Send className="mr-2" />
                    Compartilhar
                </Button>
            </CardFooter>
        </Card>
    );
}
