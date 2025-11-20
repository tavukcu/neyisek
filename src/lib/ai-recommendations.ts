'use client';

// Google Cloud AI/ML - Advanced Recommendation Engine
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface UserBehaviorData {
  userId: string;
  sessionId: string;
  interactions: UserInteraction[];
  preferences: UserPreferences;
  orderHistory: OrderHistoryItem[];
  contextualData: ContextualData;
}

export interface UserInteraction {
  type: 'view' | 'add_to_cart' | 'remove_from_cart' | 'search' | 'filter' | 'order' | 'review';
  timestamp: number;
  productId?: string;
  categoryId?: string;
  restaurantId?: string;
  searchQuery?: string;
  filterCriteria?: any;
  duration?: number; // seconds
  rating?: number;
  metadata?: any;
}

export interface UserPreferences {
  cuisineTypes: string[];
  priceRange: [number, number];
  dietaryRestrictions: string[];
  favoriteIngredients: string[];
  dislikedIngredients: string[];
  preferredMealTimes: string[];
  spiceLevel: 'mild' | 'medium' | 'hot' | 'extra_hot';
  healthGoals: string[];
  locationPreference: 'nearby' | 'quality' | 'price';
}

export interface OrderHistoryItem {
  orderId: string;
  restaurantId: string;
  items: {
    productId: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    rating?: number;
  }[];
  totalAmount: number;
  orderDate: Date;
  rating?: number;
  feedback?: string;
}

export interface ContextualData {
  timeOfDay: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dayOfWeek: string;
  weather?: 'sunny' | 'rainy' | 'cold' | 'hot';
  location: {
    lat: number;
    lng: number;
    district: string;
  };
  deviceType: 'mobile' | 'tablet' | 'desktop';
  sessionDuration: number;
  isFirstTime: boolean;
}

export interface RecommendationRequest {
  userId: string;
  userBehavior: UserBehaviorData;
  contextualData: ContextualData;
  requestType: 'homepage' | 'restaurant' | 'search' | 'cart' | 'checkout';
  maxResults: number;
  includeExplanation: boolean;
}

export interface RecommendationResponse {
  recommendations: ProductRecommendation[];
  explanations: string[];
  confidence: number;
  strategyUsed: string;
  personalizedScore: number;
  diversityScore: number;
}

export interface ProductRecommendation {
  productId: string;
  restaurantId: string;
  score: number;
  reasons: string[];
  category: string;
  estimatedRating: number;
  priceScore: number;
  popularityScore: number;
  personalizedScore: number;
  urgencyScore?: number;
  metadata?: any;
}

export class AIRecommendationEngine {
  private static genAI: GoogleGenerativeAI | null = null;
  private static model: any = null;

  // Initialize Gemini AI
  private static initializeAI() {
    if (!this.genAI && typeof window !== 'undefined') {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      }
    }
    return this.model !== null;
  }

  // 1. KULLANICI DAVRANIŞI ANALİZİ
  static analyzeUserBehavior(interactions: UserInteraction[]): {
    preferences: Partial<UserPreferences>;
    patterns: any;
    insights: string[];
  } {
    const analysis = {
      preferences: {} as Partial<UserPreferences>,
      patterns: {},
      insights: [] as string[]
    };

    // Kategori tercihleri
    const categoryFrequency: { [key: string]: number } = {};
    const timePatterns: { [key: string]: number } = {};
    const searchQueries: string[] = [];

    interactions.forEach(interaction => {
      // Kategori analizi
      if (interaction.categoryId) {
        categoryFrequency[interaction.categoryId] = (categoryFrequency[interaction.categoryId] || 0) + 1;
      }

      // Zaman analizi
      const hour = new Date(interaction.timestamp).getHours();
      const timeSlot = hour < 11 ? 'breakfast' : hour < 16 ? 'lunch' : 'dinner';
      timePatterns[timeSlot] = (timePatterns[timeSlot] || 0) + 1;

      // Arama analizi
      if (interaction.type === 'search' && interaction.searchQuery) {
        searchQueries.push(interaction.searchQuery);
      }
    });

    // En çok tercih edilen kategoriler
    const topCategories = Object.entries(categoryFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);

    analysis.preferences.cuisineTypes = topCategories;

    // Zaman tercihleri
    const preferredMealTime = Object.entries(timePatterns)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    if (preferredMealTime) {
      analysis.preferences.preferredMealTimes = [preferredMealTime];
    }

    // İçgörüler
    if (topCategories.length > 0) {
      analysis.insights.push(`En çok ${topCategories[0]} kategorisini tercih ediyor`);
    }

    if (searchQueries.length > 3) {
      analysis.insights.push(`Aktif araştırmacı kullanıcı - ${searchQueries.length} arama yaptı`);
    }

    analysis.patterns = {
      categoryFrequency,
      timePatterns,
      searchQueries: searchQueries.slice(0, 10)
    };

    return analysis;
  }

  // 2. AI-POWERED ÜRÜN ÖNERİLERİ
  static async generateRecommendations(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    try {
      if (!this.initializeAI()) {
        // Fallback: Basit kural tabanlı öneriler
        return this.generateRuleBasedRecommendations(request);
      }

      // AI prompt oluştur
      const prompt = this.buildRecommendationPrompt(request);
      
      // Gemini AI'dan öneri al
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const aiResponse = response.text();

      // AI cevabını parse et
      return this.parseAIResponse(aiResponse, request);
    } catch (error) {
      console.error('AI recommendation error:', error);
      // Hata durumunda kural tabanlı öneri
      return this.generateRuleBasedRecommendations(request);
    }
  }

  // 3. KURAL TABANLI ÖNERİ SİSTEMİ (Fallback)
  private static generateRuleBasedRecommendations(
    request: RecommendationRequest
  ): RecommendationResponse {
    const { userBehavior, contextualData, maxResults } = request;
    const recommendations: ProductRecommendation[] = [];

    // Zaman bazlı öneriler
    const timeScore = this.calculateTimeBasedScore(contextualData.timeOfDay);
    
    // Popülerlik skorları (mock data)
    const popularProducts = this.getPopularProducts(contextualData.timeOfDay);
    
    // Kullanıcı geçmişi bazlı skorlama
    const personalizedProducts = this.getPersonalizedProducts(userBehavior);

    // Skorları birleştir ve sırala
    const combinedProducts = [...popularProducts, ...personalizedProducts]
      .slice(0, maxResults * 2) // Daha fazla ürün al
      .map(product => ({
        ...product,
        score: (product.popularityScore * 0.3) + 
               (product.personalizedScore * 0.4) + 
               (timeScore * 0.3)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    return {
      recommendations: combinedProducts,
      explanations: this.generateExplanations(combinedProducts, contextualData),
      confidence: 0.75,
      strategyUsed: 'rule-based',
      personalizedScore: 0.7,
      diversityScore: 0.8
    };
  }

  // 4. AI PROMPT OLUŞTURUCU
  private static buildRecommendationPrompt(request: RecommendationRequest): string {
    const { userBehavior, contextualData, requestType, maxResults } = request;

    return `
Bir yemek sipariş platformu için AI-powered öneri sistemi olarak görev yapıyorsun. 
Aşağıdaki kullanıcı verilerine dayanarak ${maxResults} adet yemek önerisi yap.

KULLANICI PROFİLİ:
- Kullanıcı ID: ${userBehavior.userId}
- İlk kez kullanıyor mu: ${contextualData.isFirstTime}
- Tercih edilen mutfaklar: ${userBehavior.preferences.cuisineTypes.join(', ')}
- Fiyat aralığı: ${userBehavior.preferences.priceRange[0]}-${userBehavior.preferences.priceRange[1]} ₺
- Diyet kısıtlamaları: ${userBehavior.preferences.dietaryRestrictions.join(', ')}
- Baharat seviyesi: ${userBehavior.preferences.spiceLevel}

BAĞLAMSAL BİLGİLER:
- Şu anki zaman: ${contextualData.timeOfDay}
- Haftanın günü: ${contextualData.dayOfWeek}
- Hava durumu: ${contextualData.weather}
- Konum: ${contextualData.location.district}
- Cihaz: ${contextualData.deviceType}

SON AKTİVİTELER:
${userBehavior.interactions.slice(-5).map(i => 
  `- ${i.type}: ${i.productId || i.searchQuery || i.categoryId}`
).join('\n')}

SİPARİŞ GEÇMİŞİ:
${userBehavior.orderHistory.slice(-3).map(order => 
  `- ${order.items.map(item => item.name).join(', ')} (${order.totalAmount}₺, Rating: ${order.rating || 'N/A'})`
).join('\n')}

GÖREV:
${requestType} sayfası için kişiselleştirilmiş yemek önerileri oluştur.

YANIT FORMATI (JSON):
{
  "recommendations": [
    {
      "productName": "ürün adı",
      "restaurantName": "restoran adı",
      "category": "kategori",
      "estimatedPrice": fiyat,
      "score": 0.0-1.0,
      "reasons": ["neden 1", "neden 2"],
      "estimatedRating": 1-5,
      "personalizedScore": 0.0-1.0,
      "popularityScore": 0.0-1.0,
      "priceScore": 0.0-1.0
    }
  ],
  "explanations": ["açıklama 1", "açıklama 2"],
  "confidence": 0.0-1.0,
  "strategy": "kullanılan strateji"
}

Türkçe yemek isimleri kullan ve Türk mutfağına odaklan. Seçimlerini gerekçelendir.
`;
  }

  // 5. AI CEVABINI PARSE ET
  private static parseAIResponse(
    aiResponse: string, 
    request: RecommendationRequest
  ): RecommendationResponse {
    try {
      // JSON formatındaki AI cevabını parse et
      const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanedResponse);

      // AI cevabını standart formata çevir
      const recommendations: ProductRecommendation[] = parsed.recommendations.map((rec: any, index: number) => ({
        productId: `ai-${Date.now()}-${index}`,
        restaurantId: `restaurant-${index}`,
        score: rec.score || 0.8,
        reasons: rec.reasons || ['AI önerisi'],
        category: rec.category || 'Genel',
        estimatedRating: rec.estimatedRating || 4.0,
        priceScore: rec.priceScore || 0.7,
        popularityScore: rec.popularityScore || 0.6,
        personalizedScore: rec.personalizedScore || 0.8,
        metadata: {
          productName: rec.productName,
          restaurantName: rec.restaurantName,
          estimatedPrice: rec.estimatedPrice
        }
      }));

      return {
        recommendations,
        explanations: parsed.explanations || ['AI destekli kişiselleştirilmiş öneriler'],
        confidence: parsed.confidence || 0.85,
        strategyUsed: 'ai-powered',
        personalizedScore: 0.9,
        diversityScore: 0.8
      };
    } catch (error) {
      console.error('AI response parsing error:', error);
      // Parse hatası durumunda kural tabanlı öneriye geç
      return this.generateRuleBasedRecommendations(request);
    }
  }

  // 6. AKILLI FİYATLANDIRMA
  static calculateDynamicPricing(
    basePrice: number,
    demand: number,
    userPreferences: UserPreferences,
    contextualData: ContextualData
  ): {
    suggestedPrice: number;
    discount: number;
    reasoning: string;
  } {
    let multiplier = 1.0;
    let reasoning = 'Standart fiyatlandırma';

    // Talep bazlı fiyatlandırma
    if (demand > 0.8) {
      multiplier += 0.1;
      reasoning = 'Yüksek talep nedeniyle fiyat artışı';
    } else if (demand < 0.3) {
      multiplier -= 0.15;
      reasoning = 'Düşük talep nedeniyle indirim';
    }

    // Zaman bazlı fiyatlandırma
    if (contextualData.timeOfDay === 'breakfast' && basePrice > 50) {
      multiplier -= 0.1;
      reasoning += ' + Kahvaltı indirimi';
    }

    // Kullanıcı sadakati
    if (userPreferences.cuisineTypes.length > 3) {
      multiplier -= 0.05;
      reasoning += ' + Sadık müşteri indirimi';
    }

    const suggestedPrice = Math.max(basePrice * 0.7, basePrice * multiplier);
    const discount = basePrice - suggestedPrice;

    return {
      suggestedPrice: Math.round(suggestedPrice),
      discount: Math.round(discount),
      reasoning
    };
  }

  // 7. TREND ANALİZİ
  static analyzeTrends(interactions: UserInteraction[]): {
    trendingCategories: string[];
    emergingPreferences: string[];
    seasonalTrends: any;
  } {
    const now = Date.now();
    const last7Days = interactions.filter(i => now - i.timestamp < 7 * 24 * 60 * 60 * 1000);
    const last30Days = interactions.filter(i => now - i.timestamp < 30 * 24 * 60 * 60 * 1000);

    // Son 7 günün trend kategorileri
    const recentCategories: { [key: string]: number } = {};
    last7Days.forEach(i => {
      if (i.categoryId) {
        recentCategories[i.categoryId] = (recentCategories[i.categoryId] || 0) + 1;
      }
    });

    const trendingCategories = Object.entries(recentCategories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);

    // Yükselen tercihler (son 7 günde artış gösteren)
    const oldCategories: { [key: string]: number } = {};
    const oldInteractions = interactions.filter(i => 
      i.timestamp < now - 7 * 24 * 60 * 60 * 1000 && 
      i.timestamp > now - 14 * 24 * 60 * 60 * 1000
    );

    oldInteractions.forEach(i => {
      if (i.categoryId) {
        oldCategories[i.categoryId] = (oldCategories[i.categoryId] || 0) + 1;
      }
    });

    const emergingPreferences = Object.keys(recentCategories).filter(category => {
      const recentCount = recentCategories[category] || 0;
      const oldCount = oldCategories[category] || 0;
      return recentCount > oldCount * 1.5; // %50+ artış
    });

    return {
      trendingCategories,
      emergingPreferences,
      seasonalTrends: this.calculateSeasonalTrends(last30Days)
    };
  }

  // 8. A/B TEST ÖNERİLERİ
  static generateABTestRecommendations(
    request: RecommendationRequest,
    testGroup: 'control' | 'variant_a' | 'variant_b'
  ): Promise<RecommendationResponse> {
    const modifiedRequest = { ...request };

    switch (testGroup) {
      case 'control':
        // Standart öneri algoritması
        break;
      case 'variant_a':
        // Daha çok kişiselleştirme
        modifiedRequest.maxResults = Math.ceil(request.maxResults * 1.2);
        break;
      case 'variant_b':
        // Daha çok popülerlik odaklı
        modifiedRequest.userBehavior.preferences = {
          ...modifiedRequest.userBehavior.preferences,
          cuisineTypes: [] // Kişisel tercihleri sıfırla
        };
        break;
    }

    return this.generateRecommendations(modifiedRequest);
  }

  // YARDIMCI FONKSİYONLAR

  private static calculateTimeBasedScore(timeOfDay: string): number {
    const timeScores = {
      'breakfast': 0.9,
      'lunch': 1.0,
      'dinner': 0.95,
      'snack': 0.7
    };
    return timeScores[timeOfDay as keyof typeof timeScores] || 0.8;
  }

  private static getPopularProducts(timeOfDay: string): ProductRecommendation[] {
    // Mock popüler ürünler (gerçekte DB'den gelecek)
    const popularityData = {
      breakfast: [
        { productId: 'menemen', score: 0.9, category: 'Kahvaltı' },
        { productId: 'sucuklu-yumurta', score: 0.85, category: 'Kahvaltı' },
        { productId: 'borek', score: 0.8, category: 'Hamur İşi' }
      ],
      lunch: [
        { productId: 'doner', score: 0.95, category: 'Et Yemekleri' },
        { productId: 'pide', score: 0.9, category: 'Hamur İşi' },
        { productId: 'corba', score: 0.8, category: 'Çorbalar' }
      ],
      dinner: [
        { productId: 'kebap', score: 0.9, category: 'Et Yemekleri' },
        { productId: 'pizza', score: 0.85, category: 'İtalyan' },
        { productId: 'pilav', score: 0.75, category: 'Ana Yemek' }
      ]
    };

    const products = popularityData[timeOfDay as keyof typeof popularityData] || popularityData.lunch;
    
    return products.map(p => ({
      productId: p.productId,
      restaurantId: 'popular-restaurant',
      score: p.score,
      reasons: ['Popüler ürün'],
      category: p.category,
      estimatedRating: 4.2,
      priceScore: 0.7,
      popularityScore: p.score,
      personalizedScore: 0.5
    }));
  }

  private static getPersonalizedProducts(userBehavior: UserBehaviorData): ProductRecommendation[] {
    // Kullanıcının geçmiş davranışlarına göre öneriler
    const viewedCategories = userBehavior.interactions
      .filter(i => i.type === 'view' && i.categoryId)
      .map(i => i.categoryId!);

    const uniqueCategories = [...new Set(viewedCategories)];
    
    return uniqueCategories.slice(0, 5).map((category, index) => ({
      productId: `personalized-${category}-${index}`,
      restaurantId: 'personalized-restaurant',
      score: 0.8,
      reasons: [`${category} kategorisine ilginiz var`],
      category: category,
      estimatedRating: 4.0,
      priceScore: 0.8,
      popularityScore: 0.6,
      personalizedScore: 0.9
    }));
  }

  private static generateExplanations(
    recommendations: ProductRecommendation[], 
    contextualData: ContextualData
  ): string[] {
    const explanations = [
      `${contextualData.timeOfDay} için özel olarak seçildi`,
      'Geçmiş siparişlerinize göre beğeneceğiniz ürünler',
      'Popüler ve beğenilen seçenekler'
    ];

    if (contextualData.weather === 'cold') {
      explanations.push('Soğuk havaya uygun sıcak yemekler');
    }

    return explanations;
  }

  private static calculateSeasonalTrends(interactions: UserInteraction[]): any {
    // Basit sezonsal trend analizi
    const hourly: { [key: number]: number } = {};
    
    interactions.forEach(i => {
      const hour = new Date(i.timestamp).getHours();
      hourly[hour] = (hourly[hour] || 0) + 1;
    });

    return {
      peakHours: Object.entries(hourly)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => parseInt(hour)),
      totalInteractions: interactions.length
    };
  }
}

// Utility functions
export function calculateRecommendationScore(
  popularityScore: number,
  personalizedScore: number,
  priceScore: number,
  contextualScore: number,
  weights: { popularity: number; personalized: number; price: number; contextual: number } = 
    { popularity: 0.25, personalized: 0.4, price: 0.2, contextual: 0.15 }
): number {
  return (
    popularityScore * weights.popularity +
    personalizedScore * weights.personalized +
    priceScore * weights.price +
    contextualScore * weights.contextual
  );
}

export function formatRecommendationReason(reason: string, confidence: number): string {
  const confidenceText = confidence > 0.8 ? 'Kesinlikle' : confidence > 0.6 ? 'Muhtemelen' : 'Belki';
  return `${confidenceText} ${reason.toLowerCase()}`;
}
