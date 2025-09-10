// src/components/pambora/create-post-form.tsx
'use client';
import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useQuiz } from '@/services/quiz-service';
import { useToast } from '@/hooks/use-toast';
import { storage, db } from '@/services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Image as ImageIcon, Loader2, Send, XCircle } from 'lucide-react';
import Image from 'next/image';

export function CreatePostForm() {
    const { user, answers } = useQuiz();
    const { toast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [text, setText] = React.useState('');
    const [mediaFile, setMediaFile] = React.useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setMediaFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handlePost = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Erro de Autenticação', description: 'Você precisa estar logado para postar.' });
            return;
        }
        if (!text.trim() && !mediaFile) {
            toast({ variant: 'destructive', title: 'Post Vazio', description: 'Seu post precisa de texto ou uma imagem/vídeo.' });
            return;
        }

        setIsSubmitting(true);
        try {
            let mediaUrl = '';
            let mediaType = '';

            // Upload media if it exists
            if (mediaFile) {
                const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}-${mediaFile.name}`);
                const snapshot = await uploadBytes(storageRef, mediaFile);
                mediaUrl = await getDownloadURL(snapshot.ref);
                mediaType = mediaFile.type.startsWith('video') ? 'video' : 'image';
            }

            // This is the new, correct post object structure.
            // It includes the `userId` field that matches the security rules.
            const newPost = {
                userId: user.uid,
                text: text,
                mediaUrl: mediaUrl,
                mediaType: mediaType,
                timestamp: serverTimestamp(),
                likes: 0,
                commentsCount: 0,
                // Denormalized user data for easy display
                author: {
                    name: answers.name || 'Usuário Anônimo',
                    avatarUrl: answers.profilePictureUrl || null,
                },
            };

            await addDoc(collection(db, 'posts'), newPost);

            toast({ title: 'Sucesso!', description: 'Seu post foi publicado na comunidade #PAMBORA!' });
            
            // Reset form state
            setText('');
            clearMedia();

        } catch (error) {
            console.error("Error creating post:", error);
            const firebaseError = error as { code?: string };

            if (firebaseError.code === 'permission-denied') {
                 toast({ 
                     variant: 'destructive', 
                     title: 'Erro de Permissão', 
                     description: 'Você não tem permissão para publicar. Verifique as regras do Firestore e se você está autenticado.'
                 });
            } else {
                 toast({ 
                     variant: 'destructive', 
                     title: 'Erro ao Publicar', 
                     description: 'Não foi possível publicar seu post. Por favor, tente novamente.' 
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardContent className="p-4">
                 <div className="flex items-start gap-4">
                    <Avatar>
                        <AvatarImage src={answers.profilePictureUrl} alt={answers.name} />
                        <AvatarFallback>{answers.name ? answers.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                    <div className='w-full'>
                        <Textarea
                            placeholder={`No que você está pensando, ${answers.name?.split(' ')[0] || ''}?`}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="min-h-[100px] resize-none border-none focus-visible:ring-0 shadow-none p-0"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
                 {mediaPreview && (
                    <div className="mt-4 relative">
                        <Image src={mediaPreview} alt="Preview" width={500} height={280} className="rounded-lg object-cover w-full aspect-video" />
                         <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 rounded-full" onClick={clearMedia} disabled={isSubmitting}>
                            <XCircle className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
            <CardFooter className='flex justify-between items-center w-full border-t border-border pt-4'>
                <div>
                     <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} aria-label="Adicionar Foto/Vídeo" disabled={isSubmitting}>
                        <ImageIcon className="text-green-500 h-6 w-6" />
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        disabled={isSubmitting}
                    />
                </div>
                <Button onClick={handlePost} disabled={isSubmitting || (!text.trim() && !mediaFile)} className='w-full max-w-xs sm:w-auto'>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Publicar
                </Button>
            </CardFooter>
        </Card>
    );
}