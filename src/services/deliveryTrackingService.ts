import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  getDocs 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MapsAdvanced, DeliveryLocation, RealTimeLocation } from '@/lib/maps-advanced';

export type DeliveryStatus = 
  | 'pending'        // Kurye atanmayı bekliyor
  | 'assigned'       // Kurye atandı, yola çıkmadı
  | 'picked_up'      // Sipariş alındı, yolda
  | 'delivered'      // Teslim edildi
  | 'cancelled'      // İptal edildi
  | 'failed';        // Teslimat başarısız

export interface DeliveryTracking {
  id?: string;
  orderId: string;
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  status: DeliveryStatus;
  
  // Lokasyon bilgileri
  restaurantLocation: DeliveryLocation;
  customerLocation: DeliveryLocation;
  currentLocation?: RealTimeLocation;
  
  // Rota ve süre bilgileri
  estimatedDistance?: number; // metre
  estimatedDuration?: number; // saniye
  actualDistance?: number;
  actualDuration?: number;
  
  // Zaman bilgileri
  assignedAt?: Timestamp;
  pickedUpAt?: Timestamp;
  deliveredAt?: Timestamp;
  estimatedDeliveryTime?: Timestamp;
  
  // Ek bilgiler
  deliveryFee: number;
  courierNotes?: string;
  customerNotes?: string;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CourierLocation {
  courierId: string;
  location: RealTimeLocation;
  isActive: boolean;
  lastUpdated: Timestamp;
  currentDeliveries: string[]; // order IDs
}

export class DeliveryTrackingService {
  private static readonly DELIVERY_COLLECTION = 'deliveryTracking';
  private static readonly COURIER_LOCATION_COLLECTION = 'courierLocations';
  
  // Tracking watchers
  private static trackingWatchers: Map<string, () => void> = new Map();
  private static locationWatchers: Map<string, number> = new Map();

  // 1. TESLİMAT TAKİBİ OLUŞTUR
  static async createDeliveryTracking(
    orderId: string,
    restaurantLocation: DeliveryLocation,
    customerLocation: DeliveryLocation,
    deliveryFee: number
  ): Promise<string> {
    try {
      // Mesafe ve süre hesapla
      const route = await MapsAdvanced.calculateDeliveryTime(
        restaurantLocation,
        customerLocation
      );

      // Tahmini teslimat zamanı (mevcut zaman + hesaplanan süre + 15dk hazırlık)
      const preparationTime = 15 * 60; // 15 dakika
      const estimatedDuration = (route?.durationValue || 1800) + preparationTime;
      const estimatedDeliveryTime = new Date(Date.now() + estimatedDuration * 1000);

      const trackingData: Omit<DeliveryTracking, 'id'> = {
        orderId,
        status: 'pending',
        restaurantLocation,
        customerLocation,
        estimatedDistance: route?.distanceValue,
        estimatedDuration: route?.durationValue,
        estimatedDeliveryTime: Timestamp.fromDate(estimatedDeliveryTime),
        deliveryFee,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      const docRef = await addDoc(collection(db, this.DELIVERY_COLLECTION), trackingData);
      console.log('🚚 Delivery tracking created:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('🔴 Delivery tracking creation error:', error);
      throw error;
    }
  }

  // 2. KURYE ATAN
  static async assignCourier(
    trackingId: string,
    courierId: string,
    courierName: string,
    courierPhone: string
  ): Promise<void> {
    try {
      const trackingRef = doc(db, this.DELIVERY_COLLECTION, trackingId);
      
      await updateDoc(trackingRef, {
        courierId,
        courierName,
        courierPhone,
        status: 'assigned',
        assignedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('🚚 Courier assigned to delivery:', trackingId);
    } catch (error) {
      console.error('🔴 Courier assignment error:', error);
      throw error;
    }
  }

  // 3. SİPARİŞ ALINDI (PICKED UP)
  static async markPickedUp(
    trackingId: string,
    courierLocation: RealTimeLocation
  ): Promise<void> {
    try {
      const trackingRef = doc(db, this.DELIVERY_COLLECTION, trackingId);
      
      await updateDoc(trackingRef, {
        status: 'picked_up',
        currentLocation: courierLocation,
        pickedUpAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('📦 Order picked up:', trackingId);
    } catch (error) {
      console.error('🔴 Pick up update error:', error);
      throw error;
    }
  }

  // 4. KURYE KONUMU GÜNCELLE
  static async updateCourierLocation(
    trackingId: string,
    courierId: string,
    location: RealTimeLocation
  ): Promise<void> {
    try {
      // Delivery tracking güncelle
      const trackingRef = doc(db, this.DELIVERY_COLLECTION, trackingId);
      await updateDoc(trackingRef, {
        currentLocation: location,
        updatedAt: serverTimestamp(),
      });

      // Kurye lokasyon koleksiyonunu güncelle
      await this.updateCourierLocationCollection(courierId, location, [trackingId]);

      console.log('📍 Courier location updated:', courierId);
    } catch (error) {
      console.error('🔴 Location update error:', error);
      throw error;
    }
  }

  // 5. TESLİM EDİLDİ
  static async markDelivered(
    trackingId: string,
    finalLocation: RealTimeLocation,
    actualDuration?: number,
    courierNotes?: string
  ): Promise<void> {
    try {
      const trackingRef = doc(db, this.DELIVERY_COLLECTION, trackingId);
      
      const updateData: any = {
        status: 'delivered',
        currentLocation: finalLocation,
        deliveredAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (actualDuration) updateData.actualDuration = actualDuration;
      if (courierNotes) updateData.courierNotes = courierNotes;

      await updateDoc(trackingRef, updateData);

      console.log('✅ Delivery completed:', trackingId);
    } catch (error) {
      console.error('🔴 Delivery completion error:', error);
      throw error;
    }
  }

  // 6. TESLİMAT TAKİBİNİ DİNLE (Real-time)
  static subscribeToDeliveryTracking(
    orderId: string,
    callback: (tracking: DeliveryTracking | null) => void
  ): () => void {
    try {
      const q = query(
        collection(db, this.DELIVERY_COLLECTION),
        where('orderId', '==', orderId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const tracking = { id: doc.id, ...doc.data() } as DeliveryTracking;
          callback(tracking);
        } else {
          callback(null);
        }
      }, (error) => {
        console.error('🔴 Delivery tracking subscription error:', error);
        callback(null);
      });

      // Watcher'ı kaydet
      this.trackingWatchers.set(orderId, unsubscribe);
      
      return unsubscribe;
    } catch (error) {
      console.error('🔴 Delivery tracking subscription setup error:', error);
      return () => {};
    }
  }

  // 7. TAKİP ABONELĞINI İPTAL ET
  static unsubscribeFromDeliveryTracking(orderId: string): void {
    const unsubscribe = this.trackingWatchers.get(orderId);
    if (unsubscribe) {
      unsubscribe();
      this.trackingWatchers.delete(orderId);
    }
  }

  // 8. KURYE REAL-TIME KONUM TAKİBİNİ BAŞLAT
  static startCourierLocationTracking(
    courierId: string,
    currentDeliveries: string[] = []
  ): number | null {
    try {
      const watchId = MapsAdvanced.startLocationTracking(
        async (location: RealTimeLocation) => {
          await this.updateCourierLocationCollection(courierId, location, currentDeliveries);
          
          // Aktif teslimatları güncelle
          for (const trackingId of currentDeliveries) {
            await this.updateCourierLocation(trackingId, courierId, location);
          }
        },
        {
          highAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
          minDistance: 10, // 10 metre minimum hareket
        }
      );

      if (watchId) {
        this.locationWatchers.set(courierId, watchId);
      }

      return watchId;
    } catch (error) {
      console.error('🔴 Courier location tracking start error:', error);
      return null;
    }
  }

  // 9. KURYE KONUM TAKİBİNİ DURDUR
  static stopCourierLocationTracking(courierId: string): void {
    const watchId = this.locationWatchers.get(courierId);
    if (watchId) {
      MapsAdvanced.stopLocationTracking(watchId);
      this.locationWatchers.delete(courierId);
    }
  }

  // 10. KURYE KONUM KOLEKSİYONUNU GÜNCELLE
  private static async updateCourierLocationCollection(
    courierId: string,
    location: RealTimeLocation,
    currentDeliveries: string[]
  ): Promise<void> {
    try {
      const courierLocationRef = doc(db, this.COURIER_LOCATION_COLLECTION, courierId);
      
      const courierLocationData: Omit<CourierLocation, 'courierId'> = {
        location,
        isActive: true,
        lastUpdated: serverTimestamp() as Timestamp,
        currentDeliveries,
      };

      await updateDoc(courierLocationRef, courierLocationData);
    } catch (error) {
      // Doküman yoksa oluştur
      try {
        const courierLocationData: CourierLocation = {
          courierId,
          location,
          isActive: true,
          lastUpdated: serverTimestamp() as Timestamp,
          currentDeliveries,
        };

        await addDoc(collection(db, this.COURIER_LOCATION_COLLECTION), courierLocationData);
      } catch (createError) {
        console.error('🔴 Courier location creation error:', createError);
      }
    }
  }

  // 11. TESLİMAT TAHMİN SÜRESİNİ GÜNCELLE (Trafik Dahil)
  static async updateDeliveryETA(trackingId: string): Promise<void> {
    try {
      // Tracking bilgilerini al
      const trackingDoc = await getDocs(
        query(collection(db, this.DELIVERY_COLLECTION), where('id', '==', trackingId))
      );

      if (trackingDoc.empty) return;

      const tracking = trackingDoc.docs[0].data() as DeliveryTracking;
      
      if (!tracking.currentLocation || tracking.status !== 'picked_up') return;

      // Güncel ETA hesapla
      const eta = await MapsAdvanced.getDeliveryETA(
        {
          lat: tracking.currentLocation.lat,
          lng: tracking.currentLocation.lng,
          address: 'Current Location'
        },
        tracking.customerLocation
      );

      if (eta) {
        const newEstimatedDeliveryTime = new Date(Date.now() + eta.withTraffic * 1000);
        
        await updateDoc(doc(db, this.DELIVERY_COLLECTION, trackingId), {
          estimatedDeliveryTime: Timestamp.fromDate(newEstimatedDeliveryTime),
          updatedAt: serverTimestamp(),
        });

        console.log('⏰ Delivery ETA updated:', trackingId);
      }
    } catch (error) {
      console.error('🔴 ETA update error:', error);
    }
  }

  // 12. AKTİF TESLİMATLARI GETIR (Kurye Dashboard için)
  static async getActiveDeliveries(courierId?: string): Promise<DeliveryTracking[]> {
    try {
      let q = query(
        collection(db, this.DELIVERY_COLLECTION),
        where('status', 'in', ['assigned', 'picked_up']),
        orderBy('createdAt', 'desc')
      );

      if (courierId) {
        q = query(
          collection(db, this.DELIVERY_COLLECTION),
          where('courierId', '==', courierId),
          where('status', 'in', ['assigned', 'picked_up']),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DeliveryTracking));
    } catch (error) {
      console.error('🔴 Active deliveries fetch error:', error);
      return [];
    }
  }

  // 13. TESLİMAT GEÇMİŞİNİ GETIR
  static async getDeliveryHistory(
    courierId?: string,
    limit: number = 50
  ): Promise<DeliveryTracking[]> {
    try {
      let q = query(
        collection(db, this.DELIVERY_COLLECTION),
        where('status', 'in', ['delivered', 'cancelled', 'failed']),
        orderBy('createdAt', 'desc')
      );

      if (courierId) {
        q = query(
          collection(db, this.DELIVERY_COLLECTION),
          where('courierId', '==', courierId),
          where('status', 'in', ['delivered', 'cancelled', 'failed']),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs
        .slice(0, limit)
        .map(doc => ({ id: doc.id, ...doc.data() } as DeliveryTracking));
    } catch (error) {
      console.error('🔴 Delivery history fetch error:', error);
      return [];
    }
  }

  // 14. TESLİMAT İSTATİSTİKLERİ
  static async getDeliveryStats(courierId?: string, days: number = 30): Promise<{
    totalDeliveries: number;
    successfulDeliveries: number;
    averageTime: number; // dakika
    totalDistance: number; // km
    totalEarnings: number; // ₺
    successRate: number; // %
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let q = query(
        collection(db, this.DELIVERY_COLLECTION),
        where('createdAt', '>=', Timestamp.fromDate(startDate))
      );

      if (courierId) {
        q = query(
          collection(db, this.DELIVERY_COLLECTION),
          where('courierId', '==', courierId),
          where('createdAt', '>=', Timestamp.fromDate(startDate))
        );
      }

      const snapshot = await getDocs(q);
      const deliveries = snapshot.docs.map(doc => doc.data() as DeliveryTracking);

      const totalDeliveries = deliveries.length;
      const successfulDeliveries = deliveries.filter(d => d.status === 'delivered').length;
      
      const completedDeliveries = deliveries.filter(d => 
        d.status === 'delivered' && d.actualDuration
      );
      
      const averageTime = completedDeliveries.length > 0
        ? completedDeliveries.reduce((sum, d) => sum + (d.actualDuration || 0), 0) / completedDeliveries.length / 60
        : 0;

      const totalDistance = deliveries.reduce((sum, d) => sum + (d.actualDistance || d.estimatedDistance || 0), 0) / 1000;
      const totalEarnings = deliveries.filter(d => d.status === 'delivered').reduce((sum, d) => sum + d.deliveryFee, 0);
      const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;

      return {
        totalDeliveries,
        successfulDeliveries,
        averageTime,
        totalDistance,
        totalEarnings,
        successRate,
      };
    } catch (error) {
      console.error('🔴 Delivery stats calculation error:', error);
      return {
        totalDeliveries: 0,
        successfulDeliveries: 0,
        averageTime: 0,
        totalDistance: 0,
        totalEarnings: 0,
        successRate: 0,
      };
    }
  }
}
