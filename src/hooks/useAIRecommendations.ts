'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  AIRecommendationEngine, 
  RecommendationRequest, 
  RecommendationResponse, 
  UserBehaviorData 
} from '@/lib/ai-recommendations';
import { UserBehaviorService } from '@/services/userBehaviorService';
import { useAuth } from './useAuth';

interface UseAIRecommendationsProps {
  pageType: 'homepage' | 'restaurant' | 'search' | 'cart' | 'checkout';
  maxResults?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // minutes
}

interface UseAIRecommendationsReturn {
  recommendations: RecommendationResponse | null;
  isLoading: boolean;
  error: string | null;
  confidence: number;
  personalizedScore: number;
  refreshRecommendations: () => Promise<void>;
  trackInteraction: (type: string, productId?: string, metadata?: any) => void;
  updatePreferences: (preferences: any) => Promise<void>;
  getBehaviorInsights: () => Promise<any>;
}

export function useAIRecommendations({
  pageType,
  maxResults = 10,
  autoRefresh = true,
  refreshInterval = 15
}: UseAIRecommendationsProps): UseAIRecommendationsReturn {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  // Get user behavior data
  const getUserBehaviorData = useCallback(async (): Promise<UserBehaviorData | null> => {
    if (!user?.uid) {
      // Return mock/default behavior data for anonymous users
      return getDefaultBehaviorData();
    }

    try {
      const behaviorData = await UserBehaviorService.getUserBehaviorData(user.uid);
      return behaviorData;
    } catch (error) {
      console.error('Error fetching user behavior data:', error);
      // Return default data as fallback
      return getDefaultBehaviorData();
    }
  }, [user?.uid]);

  // Get default behavior data for anonymous users
  const getDefaultBehaviorData = useCallback((): UserBehaviorData => {
    return {
      userId: 'anonymous',
      sessionId: `anonymous_${Date.now()}`,
      interactions: [],
      preferences: {
        cuisineTypes: ['Türk', 'Fast Food', 'Pizza'],
        priceRange: [0, 100],
        dietaryRestrictions: [],
        favoriteIngredients: [],
        dislikedIngredients: [],
        preferredMealTimes: ['lunch', 'dinner'],
        spiceLevel: 'medium',
        healthGoals: [],
        locationPreference: 'nearby'
      },
      orderHistory: [],
      contextualData: {
        timeOfDay: getTimeOfDay(),
        dayOfWeek: new Date().toLocaleDateString('tr-TR', { weekday: 'long' }),
        location: {
          lat: 38.4946,
          lng: 27.9264,
          district: 'Ahmetli'
        },
        deviceType: getDeviceType(),
        sessionDuration: 0,
        isFirstTime: true
      }
    };
  }, []);

  // Helper functions
  const getTimeOfDay = (): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    if (hour >= 16 && hour < 22) return 'dinner';
    return 'snack';
  };

  const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
    }
    return 'desktop';
  };

  // Generate AI recommendations
  const generateRecommendations = useCallback(async () => {
    // Allow recommendations for both logged in and anonymous users
    const userId = user?.uid || 'anonymous';

    setIsLoading(true);
    setError(null);

    try {
      // Get user behavior data
      const behaviorData = await getUserBehaviorData();
      
      if (!behaviorData) {
        throw new Error('No user behavior data available');
      }

      // Create recommendation request
      const request: RecommendationRequest = {
        userId: userId,
        userBehavior: behaviorData,
        contextualData: behaviorData.contextualData,
        requestType: pageType,
        maxResults,
        includeExplanation: true
      };

      // Generate recommendations using AI
      const aiRecommendations = await AIRecommendationEngine.generateRecommendations(request);
      
      setRecommendations(aiRecommendations);
      setLastRefresh(Date.now());
      
      console.log('🤖 AI Recommendations generated:', aiRecommendations.recommendations.length);
    } catch (error) {
      console.error('AI Recommendations error:', error);
      setError(error instanceof Error ? error.message : 'Öneriler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, pageType, maxResults, getUserBehaviorData]);

  // Track user interactions
  const trackInteraction = useCallback((
    type: string, 
    productId?: string, 
    metadata?: any
  ) => {
    const userId = user?.uid || 'anonymous';
    if (!userId) return;

    // Map interaction types
    const interactionMap: { [key: string]: any } = {
      'view': { type: 'view', productId },
      'click': { type: 'view', productId },
      'add_cart': { type: 'add_to_cart', productId },
      'remove_cart': { type: 'remove_from_cart', productId },
      'search': { type: 'search', searchQuery: metadata?.query },
      'filter': { type: 'filter', filterCriteria: metadata?.filters }
    };

    const interaction = interactionMap[type];
    if (interaction) {
      // Only track if user is logged in (not anonymous)
      if (user?.uid) {
        UserBehaviorService.trackInteraction(user.uid, {
          ...interaction,
          metadata: {
            pageType,
            source: 'ai_recommendations',
            ...metadata
          }
        });
      }
    }
  }, [user?.uid, pageType]);

  // Update user preferences
  const updatePreferences = useCallback(async (preferences: any) => {
    if (!user?.uid) return;

    try {
      await UserBehaviorService.updateUserPreferences(user.uid, preferences);
      
      // Refresh recommendations after preference update
      setTimeout(() => {
        generateRecommendations();
      }, 1000);
      
      console.log('✅ User preferences updated');
    } catch (error) {
      console.error('Preferences update error:', error);
    }
  }, [user?.uid, generateRecommendations]);

  // Get behavior insights
  const getBehaviorInsights = useCallback(async () => {
    if (!user?.uid) return null;

    try {
      const insights = await UserBehaviorService.generateBehaviorReport(user.uid);
      return insights;
    } catch (error) {
      console.error('Behavior insights error:', error);
      return null;
    }
  }, [user?.uid]);

  // Auto refresh logic
  useEffect(() => {
    if (!autoRefresh) return;

    const shouldRefresh = lastRefresh === 0 || 
      (Date.now() - lastRefresh > refreshInterval * 60 * 1000);

    if (shouldRefresh) {
      generateRecommendations();
    }

    const interval = setInterval(() => {
      generateRecommendations();
    }, refreshInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, lastRefresh, generateRecommendations]);

  // Initialize session on mount
  useEffect(() => {
    const userId = user?.uid;
    if (userId) {
      UserBehaviorService.initializeSession(userId);
      
      // Track page view
      UserBehaviorService.trackPageView(`/${pageType}`, { 
        source: 'ai_recommendations_hook' 
      }, userId);
    }

    // Cleanup session on unmount
    return () => {
      if (userId) {
        UserBehaviorService.finalizeSession(userId);
      }
    };
  }, [user?.uid, pageType]);

  // Manual refresh function
  const refreshRecommendations = useCallback(async () => {
    await generateRecommendations();
  }, [generateRecommendations]);

  return {
    recommendations,
    isLoading,
    error,
    confidence: recommendations?.confidence || 0,
    personalizedScore: recommendations?.personalizedScore || 0,
    refreshRecommendations,
    trackInteraction,
    updatePreferences,
    getBehaviorInsights
  };
}

// Hook for restaurant-specific recommendations
export function useRestaurantRecommendations(restaurantId: string, maxResults: number = 8) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateRestaurantRecommendations = useCallback(async () => {
    if (!user?.uid || !restaurantId) return;

    setIsLoading(true);
    try {
      const behaviorData = await UserBehaviorService.getUserBehaviorData(user.uid);
      
      if (behaviorData) {
        const request: RecommendationRequest = {
          userId: user.uid,
          userBehavior: behaviorData,
          contextualData: behaviorData.contextualData,
          requestType: 'restaurant',
          maxResults,
          includeExplanation: false
        };

        const aiRecommendations = await AIRecommendationEngine.generateRecommendations(request);
        
        // Filter by restaurant
        const restaurantSpecific = aiRecommendations.recommendations.filter(
          rec => rec.restaurantId === restaurantId
        );
        
        setRecommendations(restaurantSpecific);
      }
    } catch (error) {
      console.error('Restaurant recommendations error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, restaurantId, maxResults]);

  useEffect(() => {
    generateRestaurantRecommendations();
  }, [generateRestaurantRecommendations]);

  return {
    recommendations,
    isLoading,
    refresh: generateRestaurantRecommendations
  };
}

// Hook for search recommendations
export function useSearchRecommendations(query: string, filters: any = {}) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateSearchRecommendations = useCallback(async () => {
    if (!user?.uid || !query.trim()) {
      setRecommendations([]);
      return;
    }

    setIsLoading(true);
    try {
      // Track search interaction
      UserBehaviorService.trackSearch(user.uid, query, 0, filters);

      const behaviorData = await UserBehaviorService.getUserBehaviorData(user.uid);
      
      if (behaviorData) {
        const request: RecommendationRequest = {
          userId: user.uid,
          userBehavior: behaviorData,
          contextualData: behaviorData.contextualData,
          requestType: 'search',
          maxResults: 20,
          includeExplanation: false
        };

        const aiRecommendations = await AIRecommendationEngine.generateRecommendations(request);
        
        // Filter recommendations based on search query and filters
        const searchFiltered = aiRecommendations.recommendations.filter(rec => {
          const matchesQuery = rec.metadata?.productName?.toLowerCase().includes(query.toLowerCase()) ||
                              rec.category.toLowerCase().includes(query.toLowerCase());
          
          // Apply additional filters if provided
          let matchesFilters = true;
          if (filters.category && rec.category !== filters.category) {
            matchesFilters = false;
          }
          if (filters.priceRange) {
            const price = rec.metadata?.estimatedPrice || 0;
            if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
              matchesFilters = false;
            }
          }
          
          return matchesQuery && matchesFilters;
        });
        
        setRecommendations(searchFiltered);
      }
    } catch (error) {
      console.error('Search recommendations error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, query, filters]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      generateSearchRecommendations();
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimer);
  }, [generateSearchRecommendations]);

  return {
    recommendations,
    isLoading,
    refresh: generateSearchRecommendations
  };
}

// Hook for dynamic pricing
export function useDynamicPricing(productId: string, basePrice: number) {
  const { user } = useAuth();
  const [pricingData, setPricingData] = useState({
    suggestedPrice: basePrice,
    discount: 0,
    reasoning: 'Standart fiyatlandırma'
  });

  useEffect(() => {
    if (!user?.uid) return;

    const calculatePricing = async () => {
      try {
        const behaviorData = await UserBehaviorService.getUserBehaviorData(user.uid!);
        
        if (behaviorData) {
          // Mock demand calculation (would be from analytics in real app)
          const demand = Math.random(); // 0-1
          
          const pricing = AIRecommendationEngine.calculateDynamicPricing(
            basePrice,
            demand,
            behaviorData.preferences,
            behaviorData.contextualData
          );
          
          setPricingData(pricing);
        }
      } catch (error) {
        console.error('Dynamic pricing error:', error);
      }
    };

    calculatePricing();
  }, [user?.uid, productId, basePrice]);

  return pricingData;
}
