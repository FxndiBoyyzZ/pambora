
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Triggered when a new notification is created in the /notifications collection.
 * This function fetches all user FCM tokens and sends them a push notification.
 */
export const sendPushNotificationOnQueue = functions
  .region("southamerica-east1")
  .firestore.document("notifications/{notificationId}")
  .onCreate(async (snapshot, context) => {
    const notificationData = snapshot.data();
    const notificationId = context.params.notificationId;

    functions.logger.info(`Notification ${notificationId} triggered for processing.`);

    if (!notificationData) {
      functions.logger.error("Notification data is empty. Aborting.");
      return;
    }

    const {title, body} = notificationData;
    functions.logger.info(`Title: "${title}", Body: "${body}"`);

    // 1. Update status to "processing"
    await db.collection("notifications").doc(notificationId).update({
      status: "processing",
    });
    functions.logger.info(`Status updated to "processing" for ${notificationId}.`);

    try {
      // 2. Get all user documents from Firestore
      const usersSnapshot = await db.collection("users").get();
      functions.logger.info(`Found ${usersSnapshot.size} total users in 'users' collection.`);


      // 3. Filter out users who have an FCM token
      const tokens: string[] = [];
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.fcmToken) {
          tokens.push(data.fcmToken);
        }
      });

      if (tokens.length === 0) {
        functions.logger.warn("No FCM tokens found. No notifications to send.");
        await db.collection("notifications").doc(notificationId).update({
          status: "completed",
          stats: {successCount: 0, failureCount: 0},
        });
        return;
      }
      
      functions.logger.info(`Found ${tokens.length} tokens. Preparing to send multicast message.`);

      // 4. Construct the multicast message
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title,
          body,
        },
        android: {
          notification: {
            icon: "/icon-192x192.png",
          },
        },
        apns: {
          payload: {
            aps: {
              "mutable-content": 1,
            },
          },
          fcm_options: {
            image: "/icon-192x192.png",
          },
        },
        webpush: {
          notification: {
            icon: "/icon-192x192.png",
          },
        },
      };

      // 5. Send the message to all tokens
      const batchResponse = await messaging.sendEachForMulticast(message);
      functions.logger.log(
        `${batchResponse.successCount} messages were sent successfully.`
      );
      functions.logger.log(
        `${batchResponse.failureCount} messages failed to send.`
      );

      // 6. Update status to "completed" with stats
      await db.collection("notifications").doc(notificationId).update({
        status: "completed",
        stats: {
          successCount: batchResponse.successCount,
          failureCount: batchResponse.failureCount,
        },
      });
      functions.logger.info(`Status updated to "completed" for ${notificationId}.`);

    } catch (error) {
      functions.logger.error(`Error sending multicast message for ${notificationId}:`, error);
      // Update status to "failed"
      await db.collection("notifications").doc(notificationId).update({
        status: "failed",
        error: (error as Error).message,
      });
    }
  });
