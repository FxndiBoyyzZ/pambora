// src/app/quiz/quiz-config.ts

export interface QuizStep {
    type: 'video' | 'form' | 'question' | 'scratch' | 'chat' | 'vitals';
    content: any;
}

export const quizSteps: QuizStep[] = [
    {
        type: 'video',
        content: {
            videoUrl: '/video1.mp4',
        }
    },
    {
        type: 'form',
        content: {
            title: 'Quase lá!',
            description: 'Nos conte um pouco sobre você para personalizar sua experiência.',
            fields: ['name', 'whatsapp', 'email'],
            placeholders: {
                name: 'Seu nome completo',
                whatsapp: '(00) 00000-0000',
                email: 'seu@email.com',
            },
            backgroundUrl: 'https://placehold.co/420x850.png',
        }
    },
    {
        type: 'vitals',
        content: {
            title: 'Detalhes Corporais',
            description: 'Essas informações nos ajudam a criar um plano ainda mais personalizado para você.',
            backgroundUrl: 'https://placehold.co/420x850.png',
        }
    },
    {
        type: 'question',
        content: {
            title: 'Qual seu objetivo principal?',
            description: 'Isso nos ajuda a montar o treino e dieta ideais para você.',
            questionType: 'multiple-choice',
            answerKey: 'goal',
            options: [
                { id: 'perder-peso', label: 'Perder Peso' },
                { id: 'ganhar-massa', label: 'Ganhar Massa Muscular' },
                { id: 'manter-forma', label: 'Manter a Forma' },
                { id: 'melhorar-saude', label: 'Melhorar a Saúde Geral' },
            ],
            backgroundUrl: 'https://placehold.co/420x850.png',
        }
    },
    {
        type: 'question',
        content: {
            title: 'Você possui alguma alergia ou restrição alimentar?',
            description: '(Opcional)',
            questionType: 'text',
            answerKey: 'allergies',
            backgroundUrl: 'https://placehold.co/420x850.png',
        }
    },
    {
        type: 'video',
        content: {
            videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4',
        }
    },
    {
        type: 'question',
        content: {
            title: 'Você tem alguma preferência de dieta?',
            questionType: 'multiple-choice',
            answerKey: 'diet',
            options: [
                { id: 'sem-restricao', label: 'Sem Restrições' },
                { id: 'vegetariana', label: 'Vegetariana' },
                { id: 'vegana', label: 'Vegana' },
                { id: 'low-carb', label: 'Low-Carb' },
            ],
            backgroundUrl: 'https://placehold.co/420x850.png',
        }
    },
    {
        type: 'question',
        content: {
            title: 'Com que frequência você planeja treinar?',
             questionType: 'multiple-choice',
             answerKey: 'workoutFrequency',
             options: [
                 { id: '2-3', label: '2-3 vezes por semana' },
                 { id: '4-5', label: '4-5 vezes por semana' },
                 { id: '6-7', label: '6-7 vezes por semana' },
                 { id: 'everyday', label: 'Todos os dias' },
             ],
            backgroundUrl: 'https://placehold.co/420x850.png',
        }
    },
    {
        type: 'video',
        content: {
            videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        }
    },
    {
        type: 'scratch',
        content: {
            title: 'Você ganhou um prêmio!',
            description: 'Raspe para revelar seu bônus exclusivo.',
            prizeText: 'Acesso Vitalício ao Cardápio Personalizado!',
            backgroundUrl: 'https://placehold.co/420x850.png',
        }
    },
    {
        type: 'chat',
        content: {
            avatarUrl: '/fotodeperfil.jpg',
            backgroundUrl: 'https://placehold.co/420x850.png',
            messages: [
                { author: 'ByPamela', text: 'Eba! 🎉 Vi que você está quase dentro!' },
                { author: 'ByPamela', text: 'Para finalizar, tenho um bônus: um plano alimentar com um nutricionista parceiro. Ajuda MUITO a acelerar os resultados. O que acha?' },
                { author: 'user', text: '' }, // Placeholder for user reply
                { author: 'ByPamela', text: 'Ótima escolha! 💪' },
                { author: 'ByPamela', text: 'Nossa equipe vai te contatar para alinhar tudo.' },
                { author: 'ByPamela', text: 'Prepare-se, nossa jornada começa agora!' },
            ],
            replyOptions: [
                { text: 'Sim, quero o plano!', value: 'yes' },
                { text: 'Não, obrigado(a).', value: 'no' },
            ],
        }
    },
    {
        type: 'video',
        content: {
            videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        }
    },
];

    