'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

interface NotificationData {
  title?: string;
  body?: string;
  icon?: string;
  data?: {
    orderId?: string;
    type?: string;
    action?: string;
    url?: string;
  };
}

interface UseNotificationsReturn {
  token: string | null;
  permission: NotificationPermission;
  isSupported: boolean;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
  unsubscribe: () => Promise<void>;
  sendTestNotification: () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // FCM desteklenip desteklenmediğini kontrol et
  useEffect(() => {
    const checkSupport = () => {
      if (typeof window !== 'undefined') {
        const supported = 'serviceWorker' in navigator && 
                         'Notification' in window && 
                         'firebase' in window;
        setIsSupported(supported);
        
        if (supported) {
          setPermission(Notification.permission);
        }
      }
      setIsLoading(false);
    };

    checkSupport();
  }, []);

  // FCM token'ı al ve kaydet
  const getNotificationToken = useCallback(async (): Promise<string | null> => {
    if (!isSupported) {
      console.warn('FCM desteklenmiyor');
      return null;
    }

    try {
      const messaging = getMessaging();
      
      // Service Worker'ı kaydet
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('✅ Service Worker registered:', registration.scope);
      }

      // Token al
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || 'BKxOJt7p4i4LVF3H9f5J2g8vR6kN3mL9sT4wE2qA1zX7c5bY8dV4hG6jK9lM0nP3rS5uW2xZ9bC4eF1hI6kL9oQ'
      });

      if (currentToken) {
        console.log('✅ FCM Token alındı:', currentToken.substring(0, 50) + '...');
        
        // Token'ı Firestore'a kaydet
        if (user) {
          await saveTokenToFirestore(currentToken, user.uid);
        }
        
        return currentToken;
      } else {
        console.warn('⚠️ FCM Token alınamadı');
        return null;
      }
    } catch (error) {
      console.error('❌ FCM Token alma hatası:', error);
      return null;
    }
  }, [isSupported, user]);

  // Token'ı Firestore'a kaydet
  const saveTokenToFirestore = async (token: string, userId: string) => {
    try {
      const tokenData = {
        token,
        userId,
        platform: navigator.userAgent.includes('Mobile') ? 'mobile_web' : 'desktop_web',
        userAgent: navigator.userAgent,
        url: window.location.origin,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      };

      // Tokens collection'a kaydet
      const tokenRef = doc(db, 'fcm_tokens', token);
      await setDoc(tokenRef, tokenData, { merge: true });

      // User document'a da token listesi ekle
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        fcmTokens: {
          [token]: {
            platform: tokenData.platform,
            lastUsed: serverTimestamp(),
            isActive: true
          }
        }
      });

      console.log('✅ Token Firestore\'a kaydedildi');
    } catch (error) {
      console.error('❌ Token kaydetme hatası:', error);
    }
  };

  // İzin iste
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Bu tarayıcı bildirimları desteklemiyor');
      return false;
    }

    if (permission === 'granted') {
      const token = await getNotificationToken();
      setToken(token);
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast.success('✅ Bildirimler aktif edildi!');
        const token = await getNotificationToken();
        setToken(token);
        return true;
      } else {
        toast.error('❌ Bildirim izni reddedildi');
        return false;
      }
    } catch (error) {
      console.error('❌ İzin isteme hatası:', error);
      toast.error('Bildirim izni alınamadı');
      return false;
    }
  }, [isSupported, permission, getNotificationToken]);

  // Abonelikten çık
  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!token) return;

    try {
      const messaging = getMessaging();
      await deleteToken(messaging);
      
      // Firestore'dan sil
      if (user) {
        const tokenRef = doc(db, 'fcm_tokens', token);
        await updateDoc(tokenRef, {
          isActive: false,
          unsubscribedAt: serverTimestamp()
        });
      }

      setToken(null);
      toast.success('📵 Bildirimler kapatıldı');
    } catch (error) {
      console.error('❌ Abonelik iptal hatası:', error);
      toast.error('Abonelik iptal edilemedi');
    }
  }, [token, user]);

  // Test bildirimi gönder
  const sendTestNotification = useCallback(() => {
    if (!isSupported || permission !== 'granted') {
      toast.error('Bildirim izni gerekli');
      return;
    }

    // Test bildirimi oluştur
    const notification = new Notification('🍕 Neyisek.com Test', {
      body: 'Push notification sistemi çalışıyor!',
      icon: '/icon-192x192.png',
      badge: '/favicon-32x32.png',
      tag: 'test-notification',
      data: {
        type: 'test',
        timestamp: Date.now()
      }
    });

    // 5 saniye sonra kapat
    setTimeout(() => notification.close(), 5000);

    toast.success('🔔 Test bildirimi gönderildi!');
  }, [isSupported, permission]);

  // Foreground mesajları dinle
  useEffect(() => {
    if (!isSupported) return;

    const messaging = getMessaging();
    
    const unsubscribeOnMessage = onMessage(messaging, (payload) => {
      console.log('🔔 Foreground message received:', payload);
      
      const { notification, data } = payload;
      
      if (notification) {
        // Toast notification göster
        toast.success(
          `${notification.title || 'Neyisek.com'}\n${notification.body || ''}`,
          {
            duration: 5000,
            icon: '🔔'
          }
        );

        // Browser notification da göster
        if (permission === 'granted') {
          const browserNotification = new Notification(
            notification.title || 'Neyisek.com',
            {
              body: notification.body,
              icon: notification.icon || '/icon-192x192.png',
              tag: `neyisek-${data?.type || 'general'}`,
              data: data
            }
          );

          // Notification tıklanırsa
          browserNotification.onclick = () => {
            if (data?.url) {
              window.open(data.url, '_blank');
            }
            browserNotification.close();
          };
        }
      }
    });

    return () => unsubscribeOnMessage();
  }, [isSupported, permission]);

  // Token'ı otomatik al (kullanıcı giriş yaptığında)
  useEffect(() => {
    if (user && permission === 'granted' && !token) {
      getNotificationToken().then(setToken);
    }
  }, [user, permission, token, getNotificationToken]);

  return {
    token,
    permission,
    isSupported,
    isLoading,
    requestPermission,
    unsubscribe,
    sendTestNotification
  };
} 