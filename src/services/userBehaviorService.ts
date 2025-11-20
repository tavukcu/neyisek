import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  UserBehaviorData, 
  UserInteraction, 
  UserPreferences, 
  ContextualData,
  OrderHistoryItem 
} from '@/lib/ai-recommendations';

export class UserBehaviorService {
  private static readonly BEHAVIOR_COLLECTION = 'userBehavior';
  private static readonly INTERACTIONS_COLLECTION = 'userInteractions';
  private static readonly PREFERENCES_COLLECTION = 'userPreferences';
  
  // Session tracking
  private static sessionId: string = '';
  private static sessionStartTime: number = 0;
  private static interactionBuffer: UserInteraction[] = [];

  // 1. SESSION BAŞLATMA
  static initializeSession(userId: string): string {
    this.sessionId = `session_${userId}_${Date.now()}`;
    this.sessionStartTime = Date.now();
    this.interactionBuffer = [];

    // Contextual data topla
    this.trackPageView('/', { source: 'session_start' });

    console.log('🧠 User behavior session started:', this.sessionId);
    return this.sessionId;
  }

  // 2. ETKİLEŞİM TAKİBİ
  static async trackInteraction(
    userId: string,
    interaction: Omit<UserInteraction, 'timestamp'>
  ): Promise<void> {
    try {
      const fullInteraction: UserInteraction = {
        ...interaction,
        timestamp: Date.now()
      };

      // Buffer'a ekle (batch processing için)
      this.interactionBuffer.push(fullInteraction);

      // Gerçek zamanlı analiz için kritik etkileşimler
      if (['order', 'add_to_cart', 'review'].includes(interaction.type)) {
        await this.flushInteractionBuffer(userId);
      }

      // Buffer çok büyükse flush et
      if (this.interactionBuffer.length >= 10) {
        await this.flushInteractionBuffer(userId);
      }

      console.log('🔍 Tracked interaction:', interaction.type, interaction.productId || interaction.searchQuery);
    } catch (error) {
      console.error('🔴 Interaction tracking error:', error);
    }
  }

  // 3. SAYFA GÖRÜNTÜLEMESİ TAKİBİ
  static trackPageView(
    path: string, 
    metadata: any = {},
    userId?: string
  ): void {
    if (userId) {
      this.trackInteraction(userId, {
        type: 'view',
        metadata: {
          path,
          referrer: typeof window !== 'undefined' ? document.referrer : '',
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
          ...metadata
        }
      });
    }
  }

  // 4. ÜRÜN GÖRÜNTÜLEMESİ TAKİBİ
  static trackProductView(
    userId: string,
    productId: string,
    categoryId: string,
    restaurantId: string,
    duration?: number
  ): void {
    this.trackInteraction(userId, {
      type: 'view',
      productId,
      categoryId,
      restaurantId,
      duration,
      metadata: {
        viewType: 'product_detail'
      }
    });
  }

  // 5. ARAMA TAKİBİ
  static trackSearch(
    userId: string,
    searchQuery: string,
    resultsCount: number,
    filters?: any
  ): void {
    this.trackInteraction(userId, {
      type: 'search',
      searchQuery,
      filterCriteria: filters,
      metadata: {
        resultsCount,
        searchType: 'text_search'
      }
    });
  }

  // 6. FİLTRE TAKİBİ
  static trackFilter(
    userId: string,
    filterCriteria: any,
    resultsCount: number
  ): void {
    this.trackInteraction(userId, {
      type: 'filter',
      filterCriteria,
      metadata: {
        resultsCount,
        filterType: Object.keys(filterCriteria).join(',')
      }
    });
  }

  // 7. SEPET ETKİLEŞİMLERİ
  static trackCartAction(
    userId: string,
    action: 'add_to_cart' | 'remove_from_cart',
    productId: string,
    categoryId: string,
    restaurantId: string,
    quantity: number = 1
  ): void {
    this.trackInteraction(userId, {
      type: action,
      productId,
      categoryId,
      restaurantId,
      metadata: {
        quantity,
        cartAction: action
      }
    });
  }

  // 8. SİPARİŞ TAKİBİ
  static async trackOrder(
    userId: string,
    orderId: string,
    restaurantId: string,
    items: any[],
    totalAmount: number
  ): Promise<void> {
    // Sipariş etkileşimi
    await this.trackInteraction(userId, {
      type: 'order',
      restaurantId,
      metadata: {
        orderId,
        itemCount: items.length,
        totalAmount,
        orderType: 'online'
      }
    });

    // Her ürün için ayrı etkileşim
    for (const item of items) {
      await this.trackInteraction(userId, {
        type: 'order',
        productId: item.productId,
        categoryId: item.categoryId,
        restaurantId,
        metadata: {
          orderId,
          quantity: item.quantity,
          price: item.price,
          orderItem: true
        }
      });
    }
  }

  // 9. DEĞERLENDİRME TAKİBİ
  static trackReview(
    userId: string,
    productId: string,
    orderId: string,
    rating: number,
    comment?: string
  ): void {
    this.trackInteraction(userId, {
      type: 'review',
      productId,
      rating,
      metadata: {
        orderId,
        comment: comment?.substring(0, 200), // İlk 200 karakter
        hasComment: !!comment
      }
    });
  }

  // 10. KULLANICI TERCİHLERİNİ GÜNCELLEME
  static async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    try {
      const preferencesRef = doc(db, this.PREFERENCES_COLLECTION, userId);
      
      await updateDoc(preferencesRef, {
        ...preferences,
        updatedAt: serverTimestamp()
      });

      console.log('🎯 User preferences updated');
    } catch (error) {
      // Doküman yoksa oluştur
      try {
        await addDoc(collection(db, this.PREFERENCES_COLLECTION), {
          userId,
          ...preferences,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (createError) {
        console.error('🔴 Preferences update error:', createError);
      }
    }
  }

  // 11. KULLANICI DAVRANIŞI VERİSİNİ ALMA
  static async getUserBehaviorData(userId: string): Promise<UserBehaviorData | null> {
    try {
      // Son 30 günün etkileşimlerini al
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const interactionsQuery = query(
        collection(db, this.INTERACTIONS_COLLECTION),
        where('userId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo)),
        orderBy('timestamp', 'desc'),
        limit(1000)
      );

      const interactionsSnapshot = await getDocs(interactionsQuery);
      const interactions = interactionsSnapshot.docs.map(doc => doc.data() as UserInteraction);

      // Kullanıcı tercihlerini al
      const preferencesQuery = query(
        collection(db, this.PREFERENCES_COLLECTION),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(1)
      );

      const preferencesSnapshot = await getDocs(preferencesQuery);
      const preferences = preferencesSnapshot.docs[0]?.data() as UserPreferences || this.getDefaultPreferences();

      // Sipariş geçmişini al
      const orderHistory = await this.getOrderHistory(userId);

      // Contextual data oluştur
      const contextualData = this.getCurrentContextualData();

      const behaviorData: UserBehaviorData = {
        userId,
        sessionId: this.sessionId,
        interactions,
        preferences,
        orderHistory,
        contextualData
      };

      return behaviorData;
    } catch (error) {
      console.error('🔴 Get user behavior data error:', error);
      return null;
    }
  }

  // 12. ETKİLEŞİM BUFFER'INI FLUSH ET
  private static async flushInteractionBuffer(userId: string): Promise<void> {
    if (this.interactionBuffer.length === 0) return;

    try {
      const batch = this.interactionBuffer.splice(0); // Buffer'ı temizle

      // Firestore'a toplu yaz
      for (const interaction of batch) {
        await addDoc(collection(db, this.INTERACTIONS_COLLECTION), {
          userId,
          sessionId: this.sessionId,
          ...interaction,
          timestamp: Timestamp.fromMillis(interaction.timestamp),
          createdAt: serverTimestamp()
        });
      }

      console.log(`📦 Flushed ${batch.length} interactions to Firestore`);
    } catch (error) {
      console.error('🔴 Interaction buffer flush error:', error);
    }
  }

  // 13. SİPARİŞ GEÇMİŞİNİ ALMA
  private static async getOrderHistory(userId: string): Promise<OrderHistoryItem[]> {
    try {
      // Son 6 ayın siparişlerini al
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(sixMonthsAgo)),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          orderId: doc.id,
          restaurantId: data.restaurantId,
          items: data.items.map((item: any) => ({
            productId: item.productId,
            name: item.product?.name || 'Unknown',
            category: item.product?.category || 'Unknown',
            price: item.price,
            quantity: item.quantity
          })),
          totalAmount: data.total,
          orderDate: data.createdAt.toDate(),
          rating: data.rating
        };
      });

      return orders;
    } catch (error) {
      console.error('🔴 Order history fetch error:', error);
      return [];
    }
  }

  // 14. MEVCUT CONTEXTUAL DATA ALMA
  private static getCurrentContextualData(): ContextualData {
    const now = new Date();
    const hour = now.getHours();
    
    // Zaman dilimi belirleme
    let timeOfDay: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    if (hour >= 6 && hour < 11) timeOfDay = 'breakfast';
    else if (hour >= 11 && hour < 16) timeOfDay = 'lunch';
    else if (hour >= 16 && hour < 22) timeOfDay = 'dinner';
    else timeOfDay = 'snack';

    // Cihaz tipi belirleme
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 768) deviceType = 'mobile';
      else if (width < 1024) deviceType = 'tablet';
    }

    return {
      timeOfDay,
      dayOfWeek: now.toLocaleDateString('tr-TR', { weekday: 'long' }),
      location: {
        lat: 38.4946, // Default Ahmetli
        lng: 27.9264,
        district: 'Ahmetli'
      },
      deviceType,
      sessionDuration: Date.now() - this.sessionStartTime,
      isFirstTime: !this.sessionId.includes('returning')
    };
  }

  // 15. VARSAYILAN TERCİHLER
  private static getDefaultPreferences(): UserPreferences {
    return {
      cuisineTypes: [],
      priceRange: [0, 200],
      dietaryRestrictions: [],
      favoriteIngredients: [],
      dislikedIngredients: [],
      preferredMealTimes: [],
      spiceLevel: 'medium',
      healthGoals: [],
      locationPreference: 'nearby'
    };
  }

  // 16. ANALİTİK RAPORLARI
  static async generateBehaviorReport(
    userId: string,
    days: number = 30
  ): Promise<{
    totalInteractions: number;
    topCategories: string[];
    searchPatterns: string[];
    conversionRate: number;
    sessionDuration: number;
    peakHours: number[];
    insights: string[];
  }> {
    try {
      const behaviorData = await this.getUserBehaviorData(userId);
      if (!behaviorData) {
        throw new Error('No behavior data found');
      }

      const { interactions } = behaviorData;

      // Kategori analizi
      const categoryCount: { [key: string]: number } = {};
      interactions.forEach(i => {
        if (i.categoryId) {
          categoryCount[i.categoryId] = (categoryCount[i.categoryId] || 0) + 1;
        }
      });

      const topCategories = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category]) => category);

      // Arama analizi
      const searchQueries = interactions
        .filter(i => i.type === 'search' && i.searchQuery)
        .map(i => i.searchQuery!)
        .slice(0, 10);

      // Dönüşüm oranı
      const cartAdds = interactions.filter(i => i.type === 'add_to_cart').length;
      const orders = interactions.filter(i => i.type === 'order').length;
      const conversionRate = cartAdds > 0 ? (orders / cartAdds) * 100 : 0;

      // Ortalama session süresi
      const sessionDuration = behaviorData.contextualData.sessionDuration / 1000 / 60; // dakika

      // Peak saatler
      const hourCounts: { [key: number]: number } = {};
      interactions.forEach(i => {
        const hour = new Date(i.timestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const peakHours = Object.entries(hourCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => parseInt(hour));

      // İçgörüler
      const insights = [];
      if (topCategories.length > 0) {
        insights.push(`En çok ${topCategories[0]} kategorisine ilgi gösteriyor`);
      }
      if (conversionRate > 50) {
        insights.push('Yüksek dönüşüm oranına sahip değerli müşteri');
      }
      if (sessionDuration > 10) {
        insights.push('Uzun session süreleri ile detaylı inceleme yapıyor');
      }

      return {
        totalInteractions: interactions.length,
        topCategories,
        searchPatterns: searchQueries,
        conversionRate,
        sessionDuration,
        peakHours,
        insights
      };
    } catch (error) {
      console.error('🔴 Behavior report generation error:', error);
      return {
        totalInteractions: 0,
        topCategories: [],
        searchPatterns: [],
        conversionRate: 0,
        sessionDuration: 0,
        peakHours: [],
        insights: []
      };
    }
  }

  // 17. SESSION SONLANDIRMA
  static async finalizeSession(userId: string): Promise<void> {
    try {
      // Son etkileşimleri flush et
      await this.flushInteractionBuffer(userId);

      // Session özeti oluştur
      const sessionSummary = {
        sessionId: this.sessionId,
        userId,
        startTime: this.sessionStartTime,
        endTime: Date.now(),
        duration: Date.now() - this.sessionStartTime,
        totalInteractions: this.interactionBuffer.length
      };

      console.log('📊 Session finalized:', sessionSummary);

      // Session'ı sıfırla
      this.sessionId = '';
      this.sessionStartTime = 0;
      this.interactionBuffer = [];
    } catch (error) {
      console.error('🔴 Session finalization error:', error);
    }
  }
}
