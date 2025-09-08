// src/app/quiz/quiz-config.ts

export interface QuizStep {
    type: 'video' | 'form' | 'question' | 'vitals' | 'scratch';
    content: any;
}

export const quizSteps: QuizStep[] = [
    {
        type: 'video',
        content: {
            videoUrl: 'https://vimeo.com/1116746550',
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
                { id: 'perder-peso', label: 'Perder Peso' },
                { id: 'ganhar-massa', label: 'Ganhar Massa Muscular' },
                { id: 'manter-forma', label: 'Manter a Forma' },
                { id: 'melhorar-saude', label: 'Melhorar a Saúde Geral' },
            ],
            backgroundUrl: '/fundo1p.png',
        }
    },
    {
        type: 'question',
        content: {
            title: 'Você possui alguma alergia ou restrição alimentar?',
            description: 'Marque todas as opções aplicáveis.',
            questionType: 'multiple-select', // Changed from 'text'
            answerKey: 'allergies',
            options: [
                { id: 'gluten', label: 'Glúten' },
                { id: 'lactose', label: 'Lactose' },
                { id: 'frutos-do-mar', label: 'Frutos do Mar' },
                { id: 'amendoim', label: 'Amendoim' },
                { id: 'outra', label: 'Outra' },
            ],
            backgroundUrl: '/fundo1p.png',
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
            backgroundUrl: '/fundo1p.png',
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
            backgroundUrl: '/fundo1p.png',
        }
    },
    {
        type: 'scratch',
        content: {
            title: 'Você ganhou um presente!',
            description: 'Raspe para revelar seu bônus exclusivo por ter chegado até aqui.',
            prizeText: 'Acesso a um Guia de Receitas Fit!',
            backgroundUrl: '/fundo1.png',
        }
    },
    {
        type: 'video',
        content: {
            videoUrl: 'https://vimeo.com/1116746276',
            backgroundUrl: '/fundo1.png',
        }
    },
];
