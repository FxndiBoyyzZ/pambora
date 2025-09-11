
'use server';
/**
 * @fileOverview A Genkit flow for sending push notifications to all users.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

const NotificationInputSchema = z.object({
  title: z.string().describe('The title of the push notification.'),
  body: z.string().describe('The main content (body) of the push notification.'),
});
export type NotificationInput = z.infer<typeof NotificationInputSchema>;

const NotificationOutputSchema = z.object({
  successCount: z.number().describe('The number of messages that were sent successfully.'),
  failureCount: z.number().describe('The number of messages that failed to be sent.'),
});
export type NotificationOutput = z.infer<typeof NotificationOutputSchema>;


export async function sendPushNotification(input: NotificationInput): Promise<NotificationOutput> {
    return sendPushNotificationFlow(input);
}

const initializeFirebaseAdmin = () => {
  if (admin.apps.length === 0) {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)),
        });
    } else {
        // This will use the default credentials on App Hosting.
        admin.initializeApp();
    }
  }
};

const sendPushNotificationFlow = ai.defineFlow(
  {
    name: 'sendPushNotificationFlow',
    inputSchema: NotificationInputSchema,
    outputSchema: NotificationOutputSchema,
  },
  async (payload) => {
    try {
      initializeFirebaseAdmin();
      const db = getFirestore();
      const messaging = getMessaging();

      console.log('Fetching user tokens from Firestore...');
      const usersSnapshot = await db.collection('users').get();
      
      const tokens: string[] = [];
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.fcmToken) {
          tokens.push(userData.fcmToken);
        }
      });
      
      console.log(`Found ${tokens.length} tokens to send notifications to.`);
      if (tokens.length === 0) {
        return { successCount: 0, failureCount: 0 };
      }

      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        tokens: tokens,
        webpush: {
            notification: {
                icon: 'https://pambora-boost.web.app/icon-192x192.png'
            }
        }
      };

      console.log('Sending multicast message...');
      const batchResponse = await messaging.sendEachForMulticast(message);
      
      console.log(`Successfully sent ${batchResponse.successCount} messages.`);
      if (batchResponse.failureCount > 0) {
        const failedTokens: string[] = [];
        batchResponse.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        console.log('List of tokens that caused failures: ' + failedTokens);
      }

      return {
        successCount: batchResponse.successCount,
        failureCount: batchResponse.failureCount,
      };

    } catch (error) {
      console.error('Error sending push notifications:', error);
      // Re-throw the error to make the flow fail
      throw error;
    }
  }
);
