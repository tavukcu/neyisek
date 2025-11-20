import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    orderId?: string;
    type: 'order_confirmed' | 'order_preparing' | 'order_delivered' | 'promotion' | 'system' | 'general';
    action?: string;
    url?: string;
  };
}

export interface NotificationOptions {
  userId?: string;
  userIds?: string[];
  fcmTokens?: string[];
  topic?: string;
  condition?: string;
  scheduleTime?: Date;
  priority?: 'high' | 'normal';
}

export class NotificationService {
  
  // Tek kullanıcıya bildirim gönder
  static async sendToUser(userId: string, payload: NotificationPayload, options: Partial<NotificationOptions> = {}) {
    try {
      // Kullanıcının aktif FCM token'larını al
      const tokens = await this.getUserTokens(userId);
      
      if (tokens.length === 0) {
        console.warn(`❌ Kullanıcı ${userId} için aktif token bulunamadı`);
        return { success: false, error: 'No active tokens' };
      }

      return await this.sendToTokens(tokens, payload, { ...options, userId });
    } catch (error) {
      console.error('❌ SendToUser hatası:', error);
      return { success: false, error: error.message };
    }
  }

  // Çoklu kullanıcıya bildirim gönder
  static async sendToUsers(userIds: string[], payload: NotificationPayload, options: Partial<NotificationOptions> = {}) {
    try {
      const allTokens = [];
      
      for (const userId of userIds) {
        const tokens = await this.getUserTokens(userId);
        allTokens.push(...tokens);
      }

      if (allTokens.length === 0) {
        console.warn('❌ Hiçbir kullanıcı için aktif token bulunamadı');
        return { success: false, error: 'No active tokens' };
      }

      return await this.sendToTokens(allTokens, payload, { ...options, userIds });
    } catch (error) {
      console.error('❌ SendToUsers hatası:', error);
      return { success: false, error: error.message };
    }
  }

  // FCM token'lara bildirim gönder
  static async sendToTokens(tokens: string[], payload: NotificationPayload, options: Partial<NotificationOptions> = {}) {
    try {
      // Bildirim verisini database'e kaydet
      const notificationData = {
        payload,
        tokens,
        options,
        status: 'pending',
        createdAt: serverTimestamp(),
        sentAt: null,
        deliveredCount: 0,
        failedCount: 0
      };

      const notificationRef = await addDoc(collection(db, 'notifications'), notificationData);
      
      // Firebase Functions trigger edecek
      // Bu normalde backend'de yapılır, burada simüle ediyoruz
      console.log('📤 Bildirim database\'e kaydedildi:', notificationRef.id);
      
      // Demo amaçlı - gerçekte Firebase Functions bunu yapar
      await this.simulateFCMSend(notificationRef.id, tokens, payload);
      
      return { 
        success: true, 
        notificationId: notificationRef.id,
        tokensCount: tokens.length 
      };
    } catch (error) {
      console.error('❌ SendToTokens hatası:', error);
      return { success: false, error: error.message };
    }
  }

  // Kullanıcının aktif FCM token'larını al
  static async getUserTokens(userId: string): Promise<string[]> {
    try {
      const tokensQuery = query(
        collection(db, 'fcm_tokens'),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(tokensQuery);
      const tokens = snapshot.docs.map(doc => doc.data().token);
      
      console.log(`📱 Kullanıcı ${userId} için ${tokens.length} aktif token bulundu`);
      return tokens;
    } catch (error) {
      console.error('❌ getUserTokens hatası:', error);
      return [];
    }
  }

  // Sipariş bildirimleri - özel fonksiyonlar
  static async sendOrderConfirmation(orderId: string, userId: string, restaurantName: string, estimatedTime: number) {
    const payload: NotificationPayload = {
      title: '🎉 Siparişiniz Onaylandı!',
      body: `${restaurantName} siparişinizi hazırlamaya başladı. Tahmini teslimat süresi: ${estimatedTime} dakika.`,
      icon: '/images/order-confirmed.png',
      data: {
        orderId,
        type: 'order_confirmed',
        action: 'track_order',
        url: `/orders/${orderId}`
      }
    };

    return await this.sendToUser(userId, payload, { priority: 'high' });
  }

  static async sendOrderPreparing(orderId: string, userId: string, restaurantName: string) {
    const payload: NotificationPayload = {
      title: '👨‍🍳 Siparişiniz Hazırlanıyor',
      body: `${restaurantName} siparişinizi aktif olarak hazırlıyor. Kısa süre sonra yola çıkacak!`,
      icon: '/images/order-preparing.png',
      data: {
        orderId,
        type: 'order_preparing',
        action: 'track_order',
        url: `/orders/track?id=${orderId}`
      }
    };

    return await this.sendToUser(userId, payload, { priority: 'high' });
  }

  static async sendOrderDelivered(orderId: string, userId: string, total: number) {
    const payload: NotificationPayload = {
      title: '🚀 Siparişiniz Teslim Edildi!',
      body: `${total} TL değerindeki siparişiniz başarıyla teslim edildi. Afiyet olsun! Deneyiminizi değerlendirmeyi unutmayın.`,
      icon: '/images/order-delivered.png',
      data: {
        orderId,
        type: 'order_delivered',
        action: 'rate_order',
        url: `/orders/${orderId}?tab=review`
      }
    };

    return await this.sendToUser(userId, payload, { priority: 'high' });
  }

  // Promosyon bildirimleri
  static async sendPromotionNotification(userIds: string[], title: string, message: string, promoUrl?: string) {
    const payload: NotificationPayload = {
      title: `🎉 ${title}`,
      body: message,
      icon: '/images/promotion.png',
      data: {
        type: 'promotion',
        action: 'view_promotion',
        url: promoUrl || '/menu?filter=offers'
      }
    };

    return await this.sendToUsers(userIds, payload);
  }

  // Restoran bildirimleri
  static async sendRestaurantNotification(restaurantId: string, payload: NotificationPayload) {
    try {
      // Restoran sahiplerinin user ID'lerini al
      const restaurantDoc = await getDoc(doc(db, 'restaurants', restaurantId));
      
      if (!restaurantDoc.exists()) {
        throw new Error('Restoran bulunamadı');
      }

      const restaurantData = restaurantDoc.data();
      const ownerIds = restaurantData.ownerIds || [restaurantData.ownerId];

      return await this.sendToUsers(ownerIds, payload);
    } catch (error) {
      console.error('❌ sendRestaurantNotification hatası:', error);
      return { success: false, error: error.message };
    }
  }

  // Demo amaçlı FCM gönderimi simülasyonu
  private static async simulateFCMSend(notificationId: string, tokens: string[], payload: NotificationPayload) {
    try {
      console.log('🔄 FCM gönderimi simüle ediliyor...');
      
      // 2 saniye bekle (gerçek FCM gecikme simülasyonu)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // %90 başarı oranı simüle et
      const successCount = Math.floor(tokens.length * 0.9);
      const failedCount = tokens.length - successCount;
      
      // Database'i güncelle
      await updateDoc(doc(db, 'notifications', notificationId), {
        status: 'sent',
        sentAt: serverTimestamp(),
        deliveredCount: successCount,
        failedCount: failedCount,
        results: {
          success: successCount,
          failed: failedCount,
          successRate: (successCount / tokens.length * 100).toFixed(2) + '%'
        }
      });
      
      console.log(`✅ FCM gönderimi tamamlandı: ${successCount}/${tokens.length} başarılı`);
    } catch (error) {
      console.error('❌ FCM simulation hatası:', error);
      
      // Hata durumunu kaydet
      await updateDoc(doc(db, 'notifications', notificationId), {
        status: 'failed',
        sentAt: serverTimestamp(),
        error: error.message
      });
    }
  }

  // Bildirim istatistikleri
  static async getNotificationStats(startDate?: Date, endDate?: Date) {
    try {
      let notificationQuery = collection(db, 'notifications');
      
      // Tarih filtresi varsa ekle
      if (startDate && endDate) {
        notificationQuery = query(
          notificationQuery,
          where('createdAt', '>=', startDate),
          where('createdAt', '<=', endDate)
        ) as any;
      }
      
      const snapshot = await getDocs(notificationQuery);
      
      let totalSent = 0;
      let totalDelivered = 0;
      let totalFailed = 0;
      let byType: Record<string, number> = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        totalSent += (data.tokens?.length || 0);
        totalDelivered += (data.deliveredCount || 0);
        totalFailed += (data.failedCount || 0);
        
        const type = data.payload?.data?.type || 'general';
        byType[type] = (byType[type] || 0) + 1;
      });
      
      return {
        totalNotifications: snapshot.size,
        totalSent,
        totalDelivered,
        totalFailed,
        deliveryRate: totalSent > 0 ? (totalDelivered / totalSent * 100).toFixed(2) + '%' : '0%',
        byType
      };
    } catch (error) {
      console.error('❌ getNotificationStats hatası:', error);
      return null;
    }
  }
}

export default NotificationService;
