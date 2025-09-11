// src/services/firebase-admin.ts
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

// Ensure the app is initialized only once
if (!admin.apps.length) {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)),
        });
    } else {
        // This will use the default credentials on App Hosting.
        admin.initializeApp();
    }
}

const app = admin.app();
const db = getFirestore(app);
const messaging = getMessaging(app);

export { db, messaging };
