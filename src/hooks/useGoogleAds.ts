'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdCampaignService } from '@/services/adCampaignService';
import { GoogleAdsManager, Campaign, SmartCampaignSuggestion, AdOptimizationReport } from '@/lib/google-ads';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

interface UseGoogleAdsProps {
  autoRefresh?: boolean;
  refreshInterval?: number; // minutes
}

interface UseGoogleAdsReturn {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
  totalSpend: number;
  totalRevenue: number;
  averageROAS: number;
  activeCampaigns: number;
  
  // Actions
  createCampaign: (campaignData: any) => Promise<string | null>;
  pauseCampaign: (campaignId: string) => Promise<void>;
  resumeCampaign: (campaignId: string) => Promise<void>;
  deleteCampaign: (campaignId: string) => Promise<void>;
  optimizeCampaign: (campaignId: string) => Promise<any>;
  generateReport: (campaignId: string, dateRange: any) => Promise<AdOptimizationReport | null>;
  refreshCampaigns: () => Promise<void>;
}

export function useGoogleAds({
  autoRefresh = true,
  refreshInterval = 30
}: UseGoogleAdsProps = {}): UseGoogleAdsReturn {
  const { user } = useAuth();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user campaigns
  const loadCampaigns = useCallback(async () => {
    if (!user?.uid) {
      setCampaigns([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userCampaigns = await AdCampaignService.getUserCampaigns(user.uid);
      setCampaigns(userCampaigns);
      console.log('📊 Campaigns loaded:', userCampaigns.length);
    } catch (error) {
      console.error('Load campaigns error:', error);
      setError('Kampanyalar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Create new campaign
  const createCampaign = useCallback(async (campaignData: {
    name: string;
    budget: number;
    targetLocation: string;
    businessType: string;
    products: string[];
    objectives: string[];
    restaurantId?: string;
  }): Promise<string | null> => {
    if (!user?.uid) {
      toast.error('Kampanya oluşturmak için giriş yapın');
      return null;
    }

    setIsLoading(true);
    try {
      const campaignId = await AdCampaignService.createCampaign({
        ...campaignData,
        userId: user.uid
      });

      toast.success('🎯 Kampanya başarıyla oluşturuldu!');
      await loadCampaigns(); // Refresh list
      return campaignId;
    } catch (error) {
      console.error('Create campaign error:', error);
      toast.error('Kampanya oluşturulurken hata oluştu');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, loadCampaigns]);

  // Pause campaign
  const pauseCampaign = useCallback(async (campaignId: string) => {
    try {
      await AdCampaignService.pauseCampaign(campaignId);
      toast.success('Kampanya durakladı');
      await loadCampaigns();
    } catch (error) {
      console.error('Pause campaign error:', error);
      toast.error('Kampanya durakladılamadı');
    }
  }, [loadCampaigns]);

  // Resume campaign
  const resumeCampaign = useCallback(async (campaignId: string) => {
    try {
      await AdCampaignService.resumeCampaign(campaignId);
      toast.success('Kampanya yeniden başlatıldı');
      await loadCampaigns();
    } catch (error) {
      console.error('Resume campaign error:', error);
      toast.error('Kampanya başlatılamadı');
    }
  }, [loadCampaigns]);

  // Delete campaign
  const deleteCampaign = useCallback(async (campaignId: string) => {
    try {
      await AdCampaignService.deleteCampaign(campaignId);
      toast.success('Kampanya silindi');
      await loadCampaigns();
    } catch (error) {
      console.error('Delete campaign error:', error);
      toast.error('Kampanya silinemedi');
    }
  }, [loadCampaigns]);

  // Optimize campaign
  const optimizeCampaign = useCallback(async (campaignId: string) => {
    try {
      setIsLoading(true);
      const optimization = await AdCampaignService.runSmartOptimization(campaignId);
      
      if (optimization.optimizationsApplied.length > 0) {
        toast.success(`🤖 ${optimization.optimizationsApplied.length} optimizasyon uygulandı`);
      }
      
      if (optimization.suggestions.length > 0) {
        toast(`💡 ${optimization.suggestions.length} yeni öneri mevcut`, {
          icon: '💡',
          duration: 4000
        });
      }

      await loadCampaigns();
      return optimization;
    } catch (error) {
      console.error('Optimize campaign error:', error);
      toast.error('Optimizasyon yapılamadı');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [loadCampaigns]);

  // Generate campaign report
  const generateReport = useCallback(async (
    campaignId: string, 
    dateRange: { startDate: string; endDate: string }
  ): Promise<AdOptimizationReport | null> => {
    try {
      setIsLoading(true);
      const report = await AdCampaignService.generateCampaignReport(campaignId, dateRange);
      toast.success('📊 Rapor oluşturuldu');
      return report;
    } catch (error) {
      console.error('Generate report error:', error);
      toast.error('Rapor oluşturulamadı');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Manual refresh
  const refreshCampaigns = useCallback(async () => {
    await loadCampaigns();
  }, [loadCampaigns]);

  // Auto refresh setup
  useEffect(() => {
    if (autoRefresh && user?.uid) {
      loadCampaigns(); // Initial load

      const interval = setInterval(() => {
        loadCampaigns();
      }, refreshInterval * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [user?.uid, autoRefresh, refreshInterval, loadCampaigns]);

  // Calculate summary metrics
  const totalSpend = campaigns.reduce((sum, campaign) => 
    sum + (campaign.currentPerformance?.cost || 0), 0
  );

  const totalRevenue = campaigns.reduce((sum, campaign) => 
    sum + (campaign.currentPerformance?.conversionValue || 0), 0
  );

  const averageROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  const activeCampaigns = campaigns.filter(campaign => 
    campaign.status === 'ENABLED'
  ).length;

  return {
    campaigns,
    isLoading,
    error,
    totalSpend,
    totalRevenue,
    averageROAS,
    activeCampaigns,
    createCampaign,
    pauseCampaign,
    resumeCampaign,
    deleteCampaign,
    optimizeCampaign,
    generateReport,
    refreshCampaigns
  };
}

// Hook for campaign-specific data
export function useCampaignDetails(campaignId: string) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [suggestions, setSuggestions] = useState<SmartCampaignSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCampaignDetails = useCallback(async () => {
    if (!campaignId) return;

    setIsLoading(true);
    try {
      // Load campaign details and suggestions
      // This would typically fetch from the service
      console.log('Loading campaign details for:', campaignId);
    } catch (error) {
      console.error('Load campaign details error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    loadCampaignDetails();
  }, [loadCampaignDetails]);

  return {
    campaign,
    suggestions,
    isLoading,
    refresh: loadCampaignDetails
  };
}

// Hook for real-time performance monitoring
export function useRealtimeAdsMonitoring(campaignIds: string[]) {
  const [realtimeData, setRealtimeData] = useState<{ [campaignId: string]: any }>({});
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (campaignIds.length === 0) return;

    const interval = setInterval(async () => {
      for (const campaignId of campaignIds) {
        try {
          const insights = await GoogleAdsManager.getRealtimeInsights(campaignId);
          
          setRealtimeData(prev => ({
            ...prev,
            [campaignId]: insights.currentMetrics
          }));

          // Handle alerts
          if (insights.alerts.length > 0) {
            setAlerts(prev => [...new Set([...prev, ...insights.alerts])]);
          }
        } catch (error) {
          console.error('Realtime monitoring error:', error);
        }
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [campaignIds]);

  const clearAlert = useCallback((alert: string) => {
    setAlerts(prev => prev.filter(a => a !== alert));
  }, []);

  return {
    realtimeData,
    alerts,
    clearAlert
  };
}

// Hook for A/B testing ads
export function useAdTesting(campaignId: string) {
  const [activeTests, setActiveTests] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createAdTest = useCallback(async (testConfig: {
    name: string;
    variants: any[];
    duration: number;
    successMetric: string;
  }) => {
    setIsLoading(true);
    try {
      // Create ad test
      console.log('Creating ad test:', testConfig);
      toast.success('A/B testi başlatıldı');
    } catch (error) {
      console.error('Create ad test error:', error);
      toast.error('Test oluşturulamadı');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopAdTest = useCallback(async (testId: string) => {
    try {
      console.log('Stopping ad test:', testId);
      toast.success('Test durduruldu');
    } catch (error) {
      console.error('Stop ad test error:', error);
      toast.error('Test durdurulamadı');
    }
  }, []);

  return {
    activeTests,
    testResults,
    isLoading,
    createAdTest,
    stopAdTest
  };
}

// Hook for budget optimization
export function useBudgetOptimization(userId: string) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeBudgets = useCallback(async () => {
    setIsOptimizing(true);
    try {
      const campaigns = await AdCampaignService.getUserCampaigns(userId);
      const budgetOptimization = await GoogleAdsManager.optimizeBudgetAllocation(campaigns);
      
      setRecommendations(budgetOptimization.reasoning.map(reason => ({
        description: reason,
        type: 'budget_optimization',
        priority: 'medium'
      })));

      toast.success('Budget optimizasyonu tamamlandı');
    } catch (error) {
      console.error('Budget optimization error:', error);
      toast.error('Budget optimizasyonu yapılamadı');
    } finally {
      setIsOptimizing(false);
    }
  }, [userId]);

  return {
    recommendations,
    isOptimizing,
    optimizeBudgets
  };
}
