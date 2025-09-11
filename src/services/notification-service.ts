
// src/services/notification-service.ts
'use client';
import { app, messaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';

export const initializeMessaging = async () => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && messaging) {
        try {
            const serviceWorker = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Service worker registered successfully:', serviceWorker);
            return serviceWorker;
        } catch (error) {
            console.error('Service worker registration failed:', error);
            return null;
        }
    }
    return null;
};

export const requestNotificationPermission = async () => {
  if (!messaging) {
    console.log("Firebase Messaging is not initialized.");
    return null;
  }
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        console.error("VAPID key is not configured in .env.local. Please add NEXT_PUBLIC_FIREBASE_VAPID_KEY.");
        alert("Configuração de notificação incompleta. Contate o suporte.");
        return null;
      }

      const fcmToken = await getToken(messaging, { vapidKey });
      if (fcmToken) {
        // Listen for foreground messages
        onMessage(messaging, (payload) => {
          console.log('Message received. ', payload);
          // You can show a custom toast or notification here
          new Notification(payload.notification?.title || 'Nova Mensagem', {
            body: payload.notification?.body,
            icon: '/icon-192x192.png',
          });
        });
        return fcmToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
        return null;
      }
    } else {
      console.log('Unable to get permission to notify.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
    return null;
  }
};
