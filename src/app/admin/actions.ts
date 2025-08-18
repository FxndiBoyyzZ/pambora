
'use server';

export async function uploadVideo(formData: FormData): Promise<{ success: boolean; dataUrl?: string; error?: string }> {
  const file = formData.get('video') as File;

  if (!file) {
    return { success: false, error: 'Nenhum arquivo enviado.' };
  }

  // Basic validation (optional)
  if (!file.type.startsWith('video/')) {
      return { success: false, error: 'Tipo de arquivo inválido. Por favor, envie um vídeo.' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const dataUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    // In a real application, you would upload the buffer to a cloud storage (like Firebase Storage)
    // and return the public URL. Here, we return the Data URL for local-only preview.
    
    return { success: true, dataUrl: dataUrl };

  } catch (error) {
    console.error('Error converting file to Data URL:', error);
    return { success: false, error: 'Falha ao processar o arquivo.' };
  }
}
