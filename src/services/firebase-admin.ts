// src/services/firebase-admin.ts
import * as admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

// Garante que a inicialização ocorra apenas uma vez.
if (!admin.apps.length) {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        // Usado em ambientes de desenvolvimento local se a variável de ambiente estiver definida
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)),
        });
    } else {
        // Usado no ambiente de produção da App Hosting, que configura as credenciais automaticamente.
        admin.initializeApp();
    }
}

const db: Firestore = getFirestore();
const messaging: Messaging = getMessaging();

export { db, messaging };
