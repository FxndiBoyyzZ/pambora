// src/components/pambora/create-post-dialog.tsx
'use client';
import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useQuiz } from '@/services/quiz-service';
import { Image as ImageIcon, Loader2, Send, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { storage, db } from '@/services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface CreatePostDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreatePostDialog({ open, onOpenChange }: CreatePostDialogProps) {
    const { user, answers } = useQuiz();
    const { toast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [text, setText] = React.useState('');
    const [mediaFile, setMediaFile] = React.useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);

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
            toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado para postar.' });
            return;
        }
        if (!text.trim() && !mediaFile) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Seu post precisa de texto ou uma imagem/vídeo.' });
            return;
        }

        setLoading(true);
        try {
            let mediaUrl = '';
            if (mediaFile) {
                const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}-${mediaFile.name}`);
                const snapshot = await uploadBytes(storageRef, mediaFile);
                mediaUrl = await getDownloadURL(snapshot.ref);
            }

            await addDoc(collection(db, 'posts'), {
                userId: user.uid,
                user: {
                    name: answers.name || 'Usuário Anônimo',
                    handle: answers.name ? `@${answers.name.split(' ')[0].toLowerCase()}` : '@usuario',
                    avatar: answers.profilePictureUrl || ''
                },
                text: text,
                mediaUrl: mediaUrl,
                timestamp: serverTimestamp(),
                likes: 0,
                comments: 0
            });

            toast({ title: 'Sucesso!', description: 'Seu post foi publicado na comunidade #PAMBORA!' });
            setText('');
            clearMedia();
            onOpenChange(false);
        } catch (error) {
            console.error("Error creating post:", error);
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível publicar seu post. Tente novamente.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Criar Publicação</DialogTitle>
                     <DialogDescription>
                        Compartilhe seu progresso com a comunidade #PAMBORA.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="flex items-start gap-4">
                        <Avatar>
                            <AvatarImage src={answers.profilePictureUrl} alt={answers.name} />
                            <AvatarFallback>{answers.name ? answers.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                        </Avatar>
                        <div className='w-full'>
                            <Textarea
                                placeholder={`No que você está pensando, ${answers.name?.split(' ')[0]}?`}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="min-h-[120px] resize-none"
                            />
                        </div>
                    </div>
                     {mediaPreview && (
                        <div className="mt-4 relative">
                            <Image src={mediaPreview} alt="Preview" width={500} height={280} className="rounded-lg object-cover w-full aspect-video" />
                             <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 rounded-full" onClick={clearMedia}>
                                <XCircle className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
                <DialogFooter className='flex-col-reverse sm:flex-row sm:justify-between items-center w-full'>
                    <div className='flex items-center gap-2'>
                         <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                            <ImageIcon className="text-green-500 h-6 w-6" />
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                        />
                    </div>
                    <Button onClick={handlePost} disabled={loading} className='w-full sm:w-auto'>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Publicar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
