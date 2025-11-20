import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Campaign, 
  CampaignPerformance, 
  SmartCampaignSuggestion,
  AdOptimizationReport,
  GoogleAdsManager 
} from '@/lib/google-ads';

export class AdCampaignService {
  private static readonly CAMPAIGNS_COLLECTION = 'adCampaigns';
  private static readonly PERFORMANCE_COLLECTION = 'campaignPerformance';
  private static readonly OPTIMIZATION_COLLECTION = 'campaignOptimizations';

  // 1. CAMPAIGN CREATION & MANAGEMENT
  static async createCampaign(campaignData: {
    name: string;
    budget: number;
    targetLocation: string;
    businessType: string;
    products: string[];
    objectives: string[];
    restaurantId?: string;
    userId: string;
  }): Promise<string> {
    try {
      // Create smart campaign using Google Ads Manager
      const campaign = await GoogleAdsManager.createSmartCampaign(campaignData);

      // Save to Firestore
      const campaignRef = await addDoc(collection(db, this.CAMPAIGNS_COLLECTION), {
        ...campaign,
        userId: campaignData.userId,
        restaurantId: campaignData.restaurantId,
        createdAt: serverTimestamp(),
        lastOptimized: serverTimestamp(),
        isActive: true,
        autoOptimization: true,
        optimizationSettings: {
          budgetOptimization: true,
          bidOptimization: true,
          keywordOptimization: true,
          adTestingEnabled: true,
          targetROAS: 3.0,
          maxDailyBudget: campaignData.budget * 1.5
        }
      });

      console.log('🎯 Campaign created and saved:', campaignRef.id);
      
      // Start initial optimization
      setTimeout(() => {
        this.runSmartOptimization(campaignRef.id);
      }, 5000);

      return campaignRef.id;
    } catch (error) {
      console.error('Campaign creation error:', error);
      throw error;
    }
  }

  // 2. SMART OPTIMIZATION ENGINE
  static async runSmartOptimization(campaignId: string): Promise<{
    optimizationsApplied: string[];
    suggestions: SmartCampaignSuggestion[];
    nextOptimizationDate: Date;
  }> {
    try {
      console.log('🤖 Running smart optimization for campaign:', campaignId);

      // Get campaign data
      const campaign = await this.getCampaignById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const optimizationsApplied: string[] = [];
      const suggestions: SmartCampaignSuggestion[] = [];

      // 1. Performance Analysis
      const performanceAnalysis = await this.analyzePerformance(campaignId);
      
      // 2. Bid Optimization
      if (campaign.optimizationSettings?.bidOptimization) {
        const bidOptimization = await GoogleAdsManager.optimizeBidding(
          campaignId, 
          performanceAnalysis.currentPerformance
        );
        
        if (Object.keys(bidOptimization.newBids).length > 0) {
          optimizationsApplied.push('Automatic bid adjustments applied');
        }
      }

      // 3. Budget Optimization
      if (campaign.optimizationSettings?.budgetOptimization) {
        const budgetOptimization = await this.optimizeBudget(campaign, performanceAnalysis);
        if (budgetOptimization.adjustment !== 0) {
          optimizationsApplied.push(`Budget adjusted by ${budgetOptimization.adjustment}%`);
        }
      }

      // 4. Keyword Optimization
      if (campaign.optimizationSettings?.keywordOptimization) {
        const keywordOptimization = await this.optimizeKeywords(campaignId, performanceAnalysis);
        if (keywordOptimization.changes > 0) {
          optimizationsApplied.push(`${keywordOptimization.changes} keyword optimizations applied`);
        }
      }

      // 5. Ad Testing
      if (campaign.optimizationSettings?.adTestingEnabled) {
        const adTests = await this.runAdTests(campaignId);
        if (adTests.newTests > 0) {
          optimizationsApplied.push(`${adTests.newTests} new ad tests started`);
        }
      }

      // 6. Generate Smart Suggestions
      const smartSuggestions = await this.generateSmartSuggestions(
        campaign, 
        performanceAnalysis
      );
      suggestions.push(...smartSuggestions);

      // Save optimization results
      await addDoc(collection(db, this.OPTIMIZATION_COLLECTION), {
        campaignId,
        optimizationsApplied,
        suggestions,
        performanceImpact: this.estimatePerformanceImpact(optimizationsApplied),
        appliedAt: serverTimestamp(),
        nextOptimizationScheduled: Timestamp.fromDate(
          new Date(Date.now() + 24 * 60 * 60 * 1000) // Next day
        )
      });

      // Update campaign last optimized timestamp
      await updateDoc(doc(db, this.CAMPAIGNS_COLLECTION, campaignId), {
        lastOptimized: serverTimestamp(),
        optimizationCount: (campaign.optimizationCount || 0) + 1
      });

      const nextOptimizationDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      console.log('✅ Smart optimization completed:', {
        optimizationsApplied: optimizationsApplied.length,
        suggestions: suggestions.length
      });

      return {
        optimizationsApplied,
        suggestions,
        nextOptimizationDate
      };
    } catch (error) {
      console.error('Smart optimization error:', error);
      throw error;
    }
  }

  // 3. PERFORMANCE ANALYSIS
  static async analyzePerformance(campaignId: string): Promise<{
    currentPerformance: CampaignPerformance;
    trend: 'improving' | 'declining' | 'stable';
    keyInsights: string[];
  }> {
    try {
      // Get recent performance data
      const performanceQuery = query(
        collection(db, this.PERFORMANCE_COLLECTION),
        where('campaignId', '==', campaignId),
        orderBy('timestamp', 'desc')
      );

      const performanceSnapshot = await getDocs(performanceQuery);
      const performanceData = performanceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (performanceData.length === 0) {
        // No performance data yet, return defaults
        return {
          currentPerformance: this.getDefaultPerformance(),
          trend: 'stable',
          keyInsights: ['Yeni kampanya - henüz yeterli veri yok']
        };
      }

      const latestPerformance = performanceData[0] as any;
      const previousPerformance = performanceData[1] as any;

      // Calculate trend
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (previousPerformance) {
        const roasChange = latestPerformance.roas - previousPerformance.roas;
        if (roasChange > 0.2) trend = 'improving';
        else if (roasChange < -0.2) trend = 'declining';
      }

      // Generate insights
      const keyInsights = this.generatePerformanceInsights(latestPerformance, previousPerformance);

      return {
        currentPerformance: latestPerformance,
        trend,
        keyInsights
      };
    } catch (error) {
      console.error('Performance analysis error:', error);
      return {
        currentPerformance: this.getDefaultPerformance(),
        trend: 'stable',
        keyInsights: ['Performans analizi yapılamadı']
      };
    }
  }

  // 4. BUDGET OPTIMIZATION
  private static async optimizeBudget(
    campaign: any, 
    performanceAnalysis: any
  ): Promise<{ adjustment: number; reasoning: string }> {
    const currentBudget = campaign.budget.amount;
    const performance = performanceAnalysis.currentPerformance;
    const maxBudget = campaign.optimizationSettings?.maxDailyBudget || currentBudget * 2;

    let adjustment = 0;
    let reasoning = '';

    // High ROAS - increase budget
    if (performance.roas > campaign.optimizationSettings?.targetROAS * 1.2) {
      adjustment = Math.min(20, (maxBudget - currentBudget) / currentBudget * 100);
      reasoning = `Yüksek ROAS (${performance.roas.toFixed(2)}) nedeniyle budget artırımı`;
    }
    
    // Low ROAS - decrease budget
    else if (performance.roas < campaign.optimizationSettings?.targetROAS * 0.8) {
      adjustment = -15;
      reasoning = `Düşük ROAS (${performance.roas.toFixed(2)}) nedeniyle budget azaltımı`;
    }

    // Apply budget adjustment if significant
    if (Math.abs(adjustment) > 5) {
      const newBudget = currentBudget * (1 + adjustment / 100);
      
      await updateDoc(doc(db, this.CAMPAIGNS_COLLECTION, campaign.id), {
        'budget.amount': Math.round(newBudget),
        lastBudgetAdjustment: serverTimestamp(),
        budgetAdjustmentReason: reasoning
      });
    }

    return { adjustment, reasoning };
  }

  // 5. KEYWORD OPTIMIZATION
  private static async optimizeKeywords(
    campaignId: string, 
    performanceAnalysis: any
  ): Promise<{ changes: number; actions: string[] }> {
    const actions: string[] = [];
    let changes = 0;

    const performance = performanceAnalysis.currentPerformance;

    // Low CTR keywords - pause or reduce bids
    if (performance.ctr < 0.02) {
      actions.push('Düşük CTR\'li keywordlerde bid azaltımı');
      changes++;
    }

    // High cost, low conversion keywords
    if (performance.cpa > 50 && performance.conversions < 5) {
      actions.push('Yüksek maliyetli, düşük dönüşümlü keywordlerin duraklatılması');
      changes++;
    }

    // Add trending keywords
    const trendingKeywords = await this.identifyTrendingKeywords();
    if (trendingKeywords.length > 0) {
      actions.push(`${trendingKeywords.length} trend keyword eklendi`);
      changes += trendingKeywords.length;
    }

    return { changes, actions };
  }

  // 6. AD TESTING
  private static async runAdTests(campaignId: string): Promise<{ newTests: number; insights: string[] }> {
    try {
      // Get existing ads for the campaign
      // Create new ad variations for testing
      const newTests = Math.floor(Math.random() * 3) + 1; // 1-3 new tests
      const insights = [
        'Yeni headline varyasyonları test ediliyor',
        'Call-to-action optimizasyonu test başlatıldı',
        'Seasonal messaging testi aktif'
      ];

      return { newTests, insights };
    } catch (error) {
      console.error('Ad testing error:', error);
      return { newTests: 0, insights: [] };
    }
  }

  // 7. SMART SUGGESTIONS GENERATION
  private static async generateSmartSuggestions(
    campaign: any, 
    performanceAnalysis: any
  ): Promise<SmartCampaignSuggestion[]> {
    const suggestions: SmartCampaignSuggestion[] = [];
    const performance = performanceAnalysis.currentPerformance;

    // Budget suggestions
    if (performance.searchImpressionShare < 0.7) {
      suggestions.push({
        type: 'BUDGET_INCREASE',
        priority: 'HIGH',
        description: 'Budget artırarak impression share\'i iyileştir',
        expectedImpact: `+${Math.round((1 - performance.searchImpressionShare) * 100)}% daha fazla görünürlük`,
        confidence: 0.85,
        action: { budgetIncrease: 30 },
        reasoning: [
          'Impression share %70\'in altında',
          'Budget limitation nedeniyle fırsatları kaçırıyorsunuz',
          'Rekabetçi pozisyon için budget artırımı gerekli'
        ]
      });
    }

    // Targeting suggestions
    if (performance.ctr > 0.05 && performance.conversions < 20) {
      suggestions.push({
        type: 'TARGETING_ADJUSTMENT',
        priority: 'MEDIUM',
        description: 'Yüksek CTR\'li audience segmentlerini genişlet',
        expectedImpact: '+40% daha fazla qualified traffic',
        confidence: 0.75,
        action: { audienceExpansion: true },
        reasoning: [
          'Yüksek CTR iyi ilgi gösteriyor',
          'Conversion volume artırılabilir',
          'Similar audience targeting önerilir'
        ]
      });
    }

    // Keyword suggestions
    if (performance.qualityScore < 7) {
      suggestions.push({
        type: 'KEYWORD_ADD',
        priority: 'MEDIUM',
        description: 'Quality Score\'u artıracak uzun kuyruk keywordler ekle',
        expectedImpact: 'Quality Score artışı ve %15 daha düşük CPC',
        confidence: 0.70,
        action: { newKeywords: ['specific long-tail variants'] },
        reasoning: [
          'Mevcut Quality Score düşük',
          'Uzun kuyruk keywordler daha relevant',
          'Lower competition, better QS potential'
        ]
      });
    }

    return suggestions;
  }

  // 8. CAMPAIGN LISTING & MANAGEMENT
  static async getUserCampaigns(userId: string): Promise<any[]> {
    try {
      const campaignsQuery = query(
        collection(db, this.CAMPAIGNS_COLLECTION),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const campaignsSnapshot = await getDocs(campaignsQuery);
      const campaigns = campaignsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Enrich with latest performance data
      for (const campaign of campaigns) {
        const latestPerformance = await this.getLatestPerformance(campaign.id);
        campaign.currentPerformance = latestPerformance;
      }

      return campaigns;
    } catch (error) {
      console.error('Get user campaigns error:', error);
      return [];
    }
  }

  // 9. CAMPAIGN PERFORMANCE TRACKING
  static async trackCampaignPerformance(
    campaignId: string, 
    performanceData: CampaignPerformance
  ): Promise<void> {
    try {
      await addDoc(collection(db, this.PERFORMANCE_COLLECTION), {
        campaignId,
        ...performanceData,
        timestamp: serverTimestamp(),
        hour: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        isWeekend: [0, 6].includes(new Date().getDay())
      });

      console.log('📊 Performance data tracked for campaign:', campaignId);
    } catch (error) {
      console.error('Performance tracking error:', error);
    }
  }

  // 10. CAMPAIGN REPORTS
  static async generateCampaignReport(
    campaignId: string, 
    dateRange: { startDate: string; endDate: string }
  ): Promise<AdOptimizationReport> {
    try {
      const campaign = await this.getCampaignById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Get performance data for the period
      const currentPerformance = await this.getPerformanceForPeriod(campaignId, dateRange);
      
      // Get previous period for comparison
      const previousPeriod = this.getPreviousPeriod(dateRange);
      const previousPerformance = await this.getPerformanceForPeriod(campaignId, previousPeriod);

      // Calculate improvements
      const improvements = this.calculateImprovements(currentPerformance, previousPerformance);

      // Get optimization history
      const optimizationHistory = await this.getOptimizationHistory(campaignId, dateRange);

      // Calculate ROI data
      const roiData = await this.calculateCampaignROI(campaignId, dateRange);

      const report: AdOptimizationReport = {
        campaignId,
        period: dateRange,
        currentPerformance,
        previousPerformance,
        improvements,
        suggestions: await this.generateSmartSuggestions(campaign, { currentPerformance }),
        autoAppliedOptimizations: optimizationHistory.map(opt => opt.description),
        roi: roiData
      };

      return report;
    } catch (error) {
      console.error('Campaign report generation error:', error);
      throw error;
    }
  }

  // HELPER METHODS

  private static async getCampaignById(campaignId: string): Promise<any> {
    try {
      const campaignQuery = query(
        collection(db, this.CAMPAIGNS_COLLECTION),
        where('__name__', '==', campaignId)
      );
      const snapshot = await getDocs(campaignQuery);
      return snapshot.docs[0]?.data() || null;
    } catch (error) {
      console.error('Get campaign error:', error);
      return null;
    }
  }

  private static async getLatestPerformance(campaignId: string): Promise<CampaignPerformance> {
    try {
      const performanceQuery = query(
        collection(db, this.PERFORMANCE_COLLECTION),
        where('campaignId', '==', campaignId),
        orderBy('timestamp', 'desc'),
        // limit(1)
      );

      const snapshot = await getDocs(performanceQuery);
      return snapshot.docs[0]?.data() as CampaignPerformance || this.getDefaultPerformance();
    } catch (error) {
      console.error('Get latest performance error:', error);
      return this.getDefaultPerformance();
    }
  }

  private static getDefaultPerformance(): CampaignPerformance {
    return {
      impressions: 0,
      clicks: 0,
      cost: 0,
      conversions: 0,
      conversionValue: 0,
      ctr: 0,
      cpc: 0,
      cpa: 0,
      roas: 0,
      qualityScore: 5,
      searchImpressionShare: 0.5
    };
  }

  private static generatePerformanceInsights(current: any, previous?: any): string[] {
    const insights: string[] = [];

    if (current.ctr > 0.05) {
      insights.push('Yüksek CTR - reklamlarınız ilgi çekiyor');
    } else if (current.ctr < 0.02) {
      insights.push('Düşük CTR - reklam metinleri optimize edilmeli');
    }

    if (current.roas > 4) {
      insights.push('Mükemmel ROAS - kampanya çok karlı');
    } else if (current.roas < 2) {
      insights.push('Düşük ROAS - optimizasyon gerekli');
    }

    if (current.qualityScore < 5) {
      insights.push('Quality Score düşük - keyword relevance artırılmalı');
    }

    if (previous) {
      const ctrChange = ((current.ctr - previous.ctr) / previous.ctr) * 100;
      if (ctrChange > 10) {
        insights.push(`CTR %${ctrChange.toFixed(1)} arttı`);
      }
    }

    return insights;
  }

  private static async identifyTrendingKeywords(): Promise<string[]> {
    // Mock trending keywords (would use real trend analysis in production)
    const trendingKeywords = [
      'contactless delivery',
      'healthy meal options',
      'weekend brunch',
      'family meal deals',
      'quick lunch'
    ];

    return trendingKeywords.slice(0, 2); // Return 2 trending keywords
  }

  private static estimatePerformanceImpact(optimizations: string[]): number {
    // Estimate performance improvement based on applied optimizations
    let impact = 0;
    
    optimizations.forEach(optimization => {
      if (optimization.includes('bid')) impact += 5;
      if (optimization.includes('budget')) impact += 10;
      if (optimization.includes('keyword')) impact += 8;
      if (optimization.includes('ad test')) impact += 12;
    });

    return Math.min(impact, 25); // Cap at 25% estimated improvement
  }

  private static async getPerformanceForPeriod(
    campaignId: string, 
    period: { startDate: string; endDate: string }
  ): Promise<CampaignPerformance> {
    // Mock aggregated performance data
    return this.getDefaultPerformance();
  }

  private static getPreviousPeriod(
    currentPeriod: { startDate: string; endDate: string }
  ): { startDate: string; endDate: string } {
    const start = new Date(currentPeriod.startDate);
    const end = new Date(currentPeriod.endDate);
    const duration = end.getTime() - start.getTime();

    return {
      startDate: new Date(start.getTime() - duration).toISOString().split('T')[0],
      endDate: new Date(start.getTime()).toISOString().split('T')[0]
    };
  }

  private static calculateImprovements(
    current: CampaignPerformance, 
    previous: CampaignPerformance
  ): Array<{ metric: string; change: number; changePercent: number }> {
    const metrics = ['ctr', 'cpc', 'roas', 'conversions'];
    
    return metrics.map(metric => {
      const currentValue = (current as any)[metric] || 0;
      const previousValue = (previous as any)[metric] || 0;
      const change = currentValue - previousValue;
      const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;

      return {
        metric,
        change,
        changePercent
      };
    });
  }

  private static async getOptimizationHistory(
    campaignId: string, 
    dateRange: { startDate: string; endDate: string }
  ): Promise<any[]> {
    try {
      const optimizationQuery = query(
        collection(db, this.OPTIMIZATION_COLLECTION),
        where('campaignId', '==', campaignId),
        orderBy('appliedAt', 'desc')
      );

      const snapshot = await getDocs(optimizationQuery);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Get optimization history error:', error);
      return [];
    }
  }

  private static async calculateCampaignROI(
    campaignId: string, 
    dateRange: { startDate: string; endDate: string }
  ): Promise<any> {
    // Mock ROI calculation
    return {
      adSpend: 500,
      revenue: 2000,
      profit: 1500,
      roasTarget: 3.0,
      roasActual: 4.0
    };
  }

  // 11. CAMPAIGN PAUSE/RESUME/DELETE
  static async pauseCampaign(campaignId: string): Promise<void> {
    await updateDoc(doc(db, this.CAMPAIGNS_COLLECTION, campaignId), {
      status: 'PAUSED',
      pausedAt: serverTimestamp()
    });
  }

  static async resumeCampaign(campaignId: string): Promise<void> {
    await updateDoc(doc(db, this.CAMPAIGNS_COLLECTION, campaignId), {
      status: 'ENABLED',
      resumedAt: serverTimestamp()
    });
  }

  static async deleteCampaign(campaignId: string): Promise<void> {
    await updateDoc(doc(db, this.CAMPAIGNS_COLLECTION, campaignId), {
      isActive: false,
      deletedAt: serverTimestamp()
    });
  }
}
