'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import GoogleAdsDashboard from '@/components/GoogleAdsDashboard';
import { useAuth } from '@/hooks/useAuth';
import { Target, TrendingUp, Zap, BarChart3 } from 'lucide-react';

export default function AdminAdsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/admin-login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Google Ads Yönetimi</h1>
              <p className="text-blue-100">
                Smart campaigns, otomatik optimizasyon ve performans analizi
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Target className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm text-blue-100">Smart Targeting</div>
              </div>
              <div className="text-center">
                <Zap className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm text-blue-100">Auto Optimization</div>
              </div>
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm text-blue-100">Performance Tracking</div>
              </div>
              <div className="text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm text-blue-100">ROI Analytics</div>
              </div>
            </div>
          </div>
        </div>

        {/* Google Ads Dashboard */}
        <GoogleAdsDashboard 
          className="w-full"
          showCreateButton={true}
          compactView={false}
        />

        {/* Additional Admin Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campaign Performance Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Kampanya Performans Özeti
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Toplam Kampanya</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Aktif Kampanya</span>
                <span className="font-medium text-green-600">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Bu Ay Harcama</span>
                <span className="font-medium">₺15,420</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ortalama ROAS</span>
                <span className="font-medium text-blue-600">4.2x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Toplam Dönüşüm</span>
                <span className="font-medium">248</span>
              </div>
            </div>
          </div>

          {/* Optimization Insights */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Optimizasyon İçgörüleri
            </h3>
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium text-green-900">
                      Budget Optimizasyonu
                    </div>
                    <div className="text-xs text-green-700">
                      3 kampanyada %15 performans artışı fırsatı
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium text-blue-900">
                      Keyword Optimizasyonu
                    </div>
                    <div className="text-xs text-blue-700">
                      12 yeni trending keyword ekleme önerisi
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium text-amber-900">
                      Ad Testing
                    </div>
                    <div className="text-xs text-amber-700">
                      5 kampanyada A/B test başlatma önerisi
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Son Aktiviteler
          </h3>
          <div className="space-y-3">
            {[
              {
                time: '2 saat önce',
                action: 'Kampanya "Ahmetli Lezzet" otomatik optimize edildi',
                result: '+%12 CTR artışı',
                type: 'optimization'
              },
              {
                time: '4 saat önce',
                action: 'Yeni keyword "hızlı teslimat" eklendi',
                result: 'Quality Score: 8/10',
                type: 'keyword'
              },
              {
                time: '6 saat önce',
                action: 'A/B test tamamlandı - Variant B kazandı',
                result: '+%25 conversion rate',
                type: 'test'
              },
              {
                time: '1 gün önce',
                action: 'Budget optimizasyonu uygulandı',
                result: 'ROAS 3.2x → 4.1x',
                type: 'budget'
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  activity.type === 'optimization' ? 'bg-green-500' :
                  activity.type === 'keyword' ? 'bg-blue-500' :
                  activity.type === 'test' ? 'bg-purple-500' :
                  'bg-amber-500'
                }`}></div>
                <div className="flex-1">
                  <div className="text-sm text-gray-900">{activity.action}</div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
                <div className="text-sm font-medium text-green-600">
                  {activity.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
