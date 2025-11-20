'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  MousePointer, 
  ShoppingCart,
  Play,
  Pause,
  Trash2,
  Settings,
  BarChart3,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  RefreshCw,
  Download,
  Filter,
  Calendar
} from 'lucide-react';
import { useGoogleAds, useRealtimeAdsMonitoring, useBudgetOptimization } from '@/hooks/useGoogleAds';
import { formatCurrency, formatPercentage } from '@/lib/google-ads';
import toast from 'react-hot-toast';

interface GoogleAdsDashboardProps {
  className?: string;
  showCreateButton?: boolean;
  compactView?: boolean;
}

export default function GoogleAdsDashboard({
  className = '',
  showCreateButton = true,
  compactView = false
}: GoogleAdsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const {
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
    refreshCampaigns
  } = useGoogleAds();

  const { realtimeData, alerts, clearAlert } = useRealtimeAdsMonitoring(
    campaigns.map(c => c.id)
  );

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Google Ads Yüklenemedi</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={refreshCampaigns}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Target className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Google Ads Dashboard</h2>
              <p className="text-blue-100">Smart campaign yönetimi ve optimizasyonu</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="1d">Son 1 Gün</option>
              <option value="7d">Son 7 Gün</option>
              <option value="30d">Son 30 Gün</option>
              <option value="90d">Son 90 Gün</option>
            </select>

            {/* Create Campaign Button */}
            {showCreateButton && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-4 py-2 text-white text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Yeni Kampanya</span>
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={refreshCampaigns}
              disabled={isLoading}
              className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-2 text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <MetricCard
            icon={<DollarSign className="h-5 w-5" />}
            title="Toplam Harcama"
            value={formatCurrency(totalSpend)}
            change="+12.5%"
            positive={false}
          />
          <MetricCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="Toplam Gelir"
            value={formatCurrency(totalRevenue)}
            change="+18.3%"
            positive={true}
          />
          <MetricCard
            icon={<Target className="h-5 w-5" />}
            title="Ortalama ROAS"
            value={`${averageROAS.toFixed(2)}x`}
            change="+5.7%"
            positive={true}
          />
          <MetricCard
            icon={<Play className="h-5 w-5" />}
            title="Aktif Kampanya"
            value={activeCampaigns.toString()}
            change={campaigns.length > activeCampaigns ? '-2' : '0'}
            positive={campaigns.length === activeCampaigns}
          />
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <AlertsSection alerts={alerts} onClearAlert={clearAlert} />
      )}

      {/* Campaigns Grid */}
      {compactView ? (
        <CompactCampaignsView 
          campaigns={campaigns}
          isLoading={isLoading}
          realtimeData={realtimeData}
          onPause={pauseCampaign}
          onResume={resumeCampaign}
          onOptimize={optimizeCampaign}
        />
      ) : (
        <DetailedCampaignsView 
          campaigns={campaigns}
          isLoading={isLoading}
          realtimeData={realtimeData}
          onPause={pauseCampaign}
          onResume={resumeCampaign}
          onDelete={deleteCampaign}
          onOptimize={optimizeCampaign}
        />
      )}

      {/* Create Campaign Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateCampaignModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={async (data) => {
              const campaignId = await createCampaign(data);
              if (campaignId) {
                setShowCreateModal(false);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  positive: boolean;
}

function MetricCard({ icon, title, value, change, positive }: MetricCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-white/70">{icon}</div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          positive 
            ? 'bg-green-500/20 text-green-200' 
            : 'bg-red-500/20 text-red-200'
        }`}>
          {change}
        </span>
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-white/70">{title}</div>
      </div>
    </div>
  );
}

// Alerts Section Component
interface AlertsSectionProps {
  alerts: string[];
  onClearAlert: (alert: string) => void;
}

function AlertsSection({ alerts, onClearAlert }: AlertsSectionProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div className="flex items-center space-x-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <h3 className="font-medium text-amber-900">Dikkat Gereken Durumlar</h3>
      </div>
      <div className="space-y-2">
        {alerts.map((alert, index) => (
          <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
            <span className="text-amber-800">{alert}</span>
            <button
              onClick={() => onClearAlert(alert)}
              className="text-amber-600 hover:text-amber-800 text-sm"
            >
              Kapat
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Compact Campaigns View
interface CompactCampaignsViewProps {
  campaigns: any[];
  isLoading: boolean;
  realtimeData: { [campaignId: string]: any };
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onOptimize: (id: string) => void;
}

function CompactCampaignsView({ 
  campaigns, 
  isLoading, 
  realtimeData, 
  onPause, 
  onResume, 
  onOptimize 
}: CompactCampaignsViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz Kampanya Yok</h3>
        <p className="text-gray-500 mb-4">İlk Google Ads kampanyanızı oluşturun</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {campaigns.map((campaign) => (
        <CompactCampaignCard
          key={campaign.id}
          campaign={campaign}
          realtimeData={realtimeData[campaign.id]}
          onPause={() => onPause(campaign.id)}
          onResume={() => onResume(campaign.id)}
          onOptimize={() => onOptimize(campaign.id)}
        />
      ))}
    </div>
  );
}

// Detailed Campaigns View
interface DetailedCampaignsViewProps extends CompactCampaignsViewProps {
  onDelete: (id: string) => void;
}

function DetailedCampaignsView({ 
  campaigns, 
  isLoading, 
  realtimeData, 
  onPause, 
  onResume, 
  onDelete,
  onOptimize 
}: DetailedCampaignsViewProps) {
  if (isLoading) {
    return <div className="text-center py-8">Kampanyalar yükleniyor...</div>;
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">Henüz Kampanya Yok</h3>
        <p className="text-gray-500 mb-6">Google Ads ile müşterilerinize ulaşın ve satışlarınızı artırın</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Google Ads Avantajları:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Hedefli reklam gösterimi</li>
            <li>• Ölçülebilir sonuçlar</li>
            <li>• Bütçe kontrolü</li>
            <li>• Otomatik optimizasyon</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Kampanyalar</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kampanya
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bütçe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ROAS
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <CampaignRow
                key={campaign.id}
                campaign={campaign}
                realtimeData={realtimeData[campaign.id]}
                onPause={() => onPause(campaign.id)}
                onResume={() => onResume(campaign.id)}
                onDelete={() => onDelete(campaign.id)}
                onOptimize={() => onOptimize(campaign.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Compact Campaign Card
function CompactCampaignCard({ campaign, realtimeData, onPause, onResume, onOptimize }: any) {
  const performance = campaign.currentPerformance || {};
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow border border-gray-200 p-4 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 truncate">{campaign.name}</h4>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          campaign.status === 'ENABLED' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {campaign.status === 'ENABLED' ? 'Aktif' : 'Duraklı'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500">CTR</div>
          <div className="font-medium">{formatPercentage(performance.ctr || 0)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">CPC</div>
          <div className="font-medium">{formatCurrency(performance.cpc || 0)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Dönüşüm</div>
          <div className="font-medium">{performance.conversions || 0}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">ROAS</div>
          <div className="font-medium">{(performance.roas || 0).toFixed(2)}x</div>
        </div>
      </div>

      <div className="flex space-x-2">
        {campaign.status === 'ENABLED' ? (
          <button
            onClick={onPause}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-2 px-3 rounded transition-colors flex items-center justify-center"
          >
            <Pause className="h-3 w-3 mr-1" />
            Duraklat
          </button>
        ) : (
          <button
            onClick={onResume}
            className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium py-2 px-3 rounded transition-colors flex items-center justify-center"
          >
            <Play className="h-3 w-3 mr-1" />
            Başlat
          </button>
        )}
        
        <button
          onClick={onOptimize}
          className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium py-2 px-3 rounded transition-colors flex items-center justify-center"
        >
          <Zap className="h-3 w-3 mr-1" />
          Optimize
        </button>
      </div>
    </motion.div>
  );
}

// Campaign Row for detailed table
function CampaignRow({ campaign, realtimeData, onPause, onResume, onDelete, onOptimize }: any) {
  const performance = campaign.currentPerformance || {};

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
          <div className="text-sm text-gray-500">{campaign.type}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          campaign.status === 'ENABLED' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {campaign.status === 'ENABLED' ? 'Aktif' : 'Duraklı'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{formatCurrency(campaign.budget?.amount || 0)}</div>
        <div className="text-sm text-gray-500">günlük</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{performance.clicks || 0} tıklama</div>
        <div className="text-sm text-gray-500">{formatPercentage(performance.ctr || 0)} CTR</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{(performance.roas || 0).toFixed(2)}x</div>
        <div className="text-sm text-gray-500">{performance.conversions || 0} dönüşüm</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        {campaign.status === 'ENABLED' ? (
          <button onClick={onPause} className="text-gray-600 hover:text-gray-900">
            <Pause className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={onResume} className="text-green-600 hover:text-green-900">
            <Play className="h-4 w-4" />
          </button>
        )}
        
        <button onClick={onOptimize} className="text-blue-600 hover:text-blue-900">
          <Zap className="h-4 w-4" />
        </button>
        
        <button onClick={onDelete} className="text-red-600 hover:text-red-900">
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

// Create Campaign Modal
interface CreateCampaignModalProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

function CreateCampaignModal({ onClose, onSubmit }: CreateCampaignModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    budget: 100,
    targetLocation: 'Ahmetli, Manisa',
    businessType: 'restaurant',
    products: [] as string[],
    objectives: ['sales'] as string[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Yeni Google Ads Kampanyası</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kampanya Adı
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="örn: Ahmetli Yemek Kampanyası"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Günlük Bütçe (₺)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="50"
                max="10000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hedef Lokasyon
              </label>
              <input
                type="text"
                value={formData.targetLocation}
                onChange={(e) => setFormData({ ...formData, targetLocation: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Oluşturuluyor...' : 'Kampanya Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
