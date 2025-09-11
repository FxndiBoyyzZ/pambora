// src/ai/flows/notification-sender.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for sending push notifications to all users.
 *
 * It exports:
 * - `sendPushNotification`: An async function that takes a title and body and sends notifications.
 * - `PushNotificationInput`: The input type for the `sendPushNotification` function.
 * - `PushNotificationOutput`: The output type for the `sendPushNotification` function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as admin from 'firebase-admin';

// Helper function to safely initialize firebase-admin
function initializeFirebaseAdmin() {
  // Check if the app is already initialized to prevent errors in hot-reload environments.
  if (!admin.apps.length) {
    // This will use the default credentials on App Hosting.
    admin.initializeApp();
  }
}

// Define Zod schemas for input and output types
const PushNotificationInputSchema = z.object({
  title: z.string().describe('The title of the notification.'),
  body: z.string().describe('The main content of the notification.'),
});
export type PushNotificationInput = z.infer<typeof PushNotificationInputSchema>;

const PushNotificationOutputSchema = z.object({
  successCount: z.number().describe('Number of messages sent successfully.'),
  failureCount: z.number().describe('Number of messages that failed to send.'),
});
export type PushNotificationOutput = z.infer<typeof PushNotificationOutputSchema>;


// Exported function that will be called from the UI
export async function sendPushNotification(
  input: PushNotificationInput
): Promise<PushNotificationOutput> {
  return sendPushNotificationFlow(input);
}


const sendPushNotificationFlow = ai.defineFlow(
  {
    name: 'sendPushNotificationFlow',
    inputSchema: PushNotificationInputSchema,
    outputSchema: PushNotificationOutputSchema,
  },
  async ({ title, body }) => {
    // Initialize Firebase Admin SDK
    initializeFirebaseAdmin();

    const db = admin.firestore();
    const messaging = admin.messaging();
    
    // 1. Get all user documents from Firestore
    const usersSnapshot = await db.collection('users').get();
    
    // 2. Filter out users who have an FCM token
    const tokens: string[] = [];
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.fcmToken) {
        tokens.push(data.fcmToken);
      }
    });

    if (tokens.length === 0) {
      console.log('No FCM tokens found. No notifications to send.');
      return { successCount: 0, failureCount: 0 };
    }

    // 3. Construct the multicast message
    const message: admin.messaging.MulticastMessage = {
      tokens: tokens,
      notification: {
        title,
        body,
      },
      android: {
        notification: {
            icon: '/icon-192x192.png',
        },
      },
      apns: {
        payload: {
            aps: {
                'mutable-content': 1,
            }
        },
        fcm_options: {
            image: '/icon-192x192.png',
        }
      },
      webpush: {
        notification: {
            icon: '/icon-192x192.png',
        },
      },
    };

    // 4. Send the message to all tokens
    try {
      const batchResponse = await messaging.sendEachForMulticast(message);
      console.log(batchResponse.successCount + ' messages were sent successfully');
      console.log(batchResponse.failureCount + ' messages failed to send');
      return {
        successCount: batchResponse.successCount,
        failureCount: batchResponse.failureCount,
      };
    } catch (error) {
      console.error('Error sending multicast message:', error);
      return { successCount: 0, failureCount: tokens.length };
    }
  }
);
