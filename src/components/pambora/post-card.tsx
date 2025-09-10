
'use client';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, MoreHorizontal, Send, User } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// A simple utility to format time since post
const formatTimestamp = (timestamp: any): string => {
    if (!timestamp?.toDate) {
        return 'agora mesmo';
    }
    try {
        return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, locale: ptBR });
    } catch (error) {
        console.error("Error formatting date:", error);
        return 'algum tempo atrás';
    }
}

export function PostCard({ post }: { post: any }) {
    // Destructure with default values for safety
    const { author, text, mediaUrl, timestamp, likes, commentsCount } = post;
    const { name = 'Visitante Anônimo', avatarUrl = '' } = author || {};
    const postTimestamp = formatTimestamp(timestamp);
    const fallback = name.charAt(0).toUpperCase() || <User className="h-5 w-5" />;

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3 p-4">
                <Avatar>
                    <AvatarImage src={avatarUrl} alt={name} />
                    <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-muted-foreground">{postTimestamp}</p>
                </div>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {text && <p className="mb-4 whitespace-pre-wrap">{text}</p>}
                {mediaUrl && (
                    <div className="aspect-video relative rounded-lg overflow-hidden border border-border">
                        <Image src={mediaUrl} alt="Conteúdo da publicação" layout="fill" objectFit="cover" />
                    </div>
                )}
            </CardContent>
            
            <div className="px-4 pb-2 flex justify-between text-sm text-muted-foreground">
                <span>{likes || 0} curtidas</span>
                <span>{commentsCount || 0} comentários</span>
            </div>
            <hr className="mx-4 border-border" />

            <CardFooter className="flex justify-around items-center p-1">
                 <Button variant="ghost" className="flex-1 text-muted-foreground hover:bg-accent hover:text-primary">
                    <Heart className="mr-2" />
                    Curtir
                </Button>
                <Button variant="ghost" className="flex-1 text-muted-foreground hover:bg-accent hover:text-primary">
                    <MessageCircle className="mr-2" />
                    Comentar
                </Button>
                <Button variant="ghost" className="flex-1 text-muted-foreground hover:bg-accent hover:text-primary">
                    <Send className="mr-2" />
                    Compartilhar
                </Button>
            </CardFooter>
        </Card>
    );
}
