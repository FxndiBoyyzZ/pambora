
'use server';

import { storage } from '@/services/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

export async function uploadVideo(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  const file = formData.get('video') as File;

  if (!file) {
    return { success: false, error: 'Nenhum arquivo enviado.' };
  }

  if (!file.type.startsWith('video/')) {
      return { success: false, error: 'Tipo de arquivo inválido. Por favor, envie um vídeo.' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create a unique filename
    const storageRef = ref(storage, `quiz-videos/${Date.now()}-${file.name}`);

    // Upload the file to Firebase Storage
    const snapshot = await uploadBytes(storageRef, buffer, {
        contentType: file.type
    });

    // Get the public download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return { success: true, url: downloadURL };

  } catch (error) {
    console.error('Error uploading video to Firebase Storage:', error);
    return { success: false, error: 'Falha ao processar e enviar o arquivo.' };
  }
}
