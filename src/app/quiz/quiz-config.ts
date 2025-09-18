// src/app/quiz/quiz-config.ts

export interface QuizStep {
    type: 'video' | 'form' | 'question' | 'vitals';
    content: any;
}

export const quizSteps: QuizStep[] = [
    {
        type: 'video',
        content: {
            // Use background=1 to ensure chromeless video, which will loop.
            // The component will handle navigation before the loop restarts.
            videoUrl: 'https://vimeo.com/1116746550?background=1',
            backgroundUrl: '/fundo1.png',
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
            backgroundUrl: '/fundo1.png',
        }
    },
    {
        type: 'vitals',
        content: {
            title: 'Detalhes Corporais',
            description: 'Essas informações nos ajudam a criar um plano ainda mais personalizado para você.',
            backgroundUrl: '/fundo1.png',
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
                { id: 'Perder Peso', label: 'Perder Peso' },
                { id: 'Ganhar Massa Muscular', label: 'Ganhar Massa Muscular' },
            ],
            backgroundUrl: '/fundo1.png',
        }
    },
    {
        type: 'question',
        content: {
            title: 'Qual sua preferência de dieta?',
            description: 'Selecione uma opção para adaptarmos seu cardápio.',
            questionType: 'multiple-choice',
            answerKey: 'diet',
            options: [
                { id: 'Sem Restrições', label: 'Sem Restrições' },
                { id: 'Vegetariana', label: 'Vegetariana' },
            ],
            backgroundUrl: '/fundo1.png',
        }
    },
    {
        type: 'question',
        content: {
            title: 'Você possui alguma alergia ou restrição alimentar?',
            description: 'Selecione as opções ou descreva abaixo. Esta informação é crucial para a sua segurança.',
            questionType: 'multiple-select-plus-text',
            answerKey: 'allergies',
            options: [
                { id: 'sem-restricao', label: 'Não possuo restrições' },
                { id: 'gluten', label: 'Intolerância ao Glúten' },
                { id: 'lactose', label: 'Intolerância à Lactose' },
                { id: 'frutos-do-mar', label: 'Alergia a Frutos do Mar' },
                { id: 'amendoim', label: 'Alergia a Amendoim' },
            ],
            textPlaceholder: "Ex: Tenho alergia a nozes e não como carne de porco.",
            backgroundUrl: '/fundo1.png',
        }
    },
    {
        type: 'video',
        content: {
            videoUrl: 'https://vimeo.com/1116746276?background=1',
            backgroundUrl: '/fundo1.png',
        }
    },
];
