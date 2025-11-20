'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// RestaurantLayout component not found, using standard layout
import GoogleAdsDashboard from '@/components/GoogleAdsDashboard';
import { useAuth } from '@/hooks/useAuth';
import { Target, TrendingUp, DollarSign, Users } from 'lucide-react';

export default function RestaurantAdsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'restaurant')) {
      router.push('/restaurant-login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'restaurant') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Google Ads Kampanyalarım</h1>
              <p className="text-green-100">
                Restoranınızın görünürlüğünü artırın, daha fazla müşteriye ulaşın
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Target className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm text-green-100">Hedefli Reklam</div>
              </div>
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm text-green-100">Büyüme</div>
              </div>
              <div className="text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm text-green-100">ROI Takibi</div>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm text-green-100">Yeni Müşteri</div>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant-specific info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Restoran Özel Özellikler</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Lokasyon bazlı hedefleme - Ahmetli ve çevre mahalleler</li>
                <li>• Yemek kategorilerine özel anahtar kelimeler</li>
                <li>• Sipariş saatlerine göre otomatik bid ayarlama</li>
                <li>• Menünüze özel dinamik reklamlar</li>
                <li>• Rakip analizi ve pozisyon takibi</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Google Ads Dashboard - Restaurant View */}
        <GoogleAdsDashboard 
          className="w-full"
          showCreateButton={true}
          compactView={false}
        />

        {/* Restaurant-specific suggestions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campaign Suggestions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              📈 Kampanya Önerileri
            </h3>
            <div className="space-y-4">
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <h4 className="font-medium text-green-900 mb-2">Öğle Yemeği Kampanyası</h4>
                <p className="text-sm text-green-800 mb-3">
                  11:00-14:00 arası aktif olan, iş yerlerini hedefleyen kampanya
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-600">Tahmini ROAS: 4.5x</span>
                  <button className="text-xs bg-green-600 text-white px-3 py-1 rounded">
                    Oluştur
                  </button>
                </div>
              </div>

              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium text-blue-900 mb-2">Hafta Sonu Özel</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Cumartesi-Pazar aileler için özel menü tanıtımı
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600">Tahmini ROAS: 3.8x</span>
                  <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded">
                    Oluştur
                  </button>
                </div>
              </div>

              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <h4 className="font-medium text-purple-900 mb-2">Hızlı Teslimat</h4>
                <p className="text-sm text-purple-800 mb-3">
                  "30 dakika teslimat" vurgusuyla acil siparişleri hedefle
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-600">Tahmini ROAS: 5.2x</span>
                  <button className="text-xs bg-purple-600 text-white px-3 py-1 rounded">
                    Oluştur
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Local SEO Tips */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              🎯 Yerel SEO İpuçları
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Google My Business Optimizasyonu
                  </div>
                  <div className="text-xs text-gray-600">
                    Güncel fotoğraflar, menü ve çalışma saatleri
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Müşteri Yorumları
                  </div>
                  <div className="text-xs text-gray-600">
                    Pozitif yorumlar kampanya performansını %30 artırır
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Yerel Anahtar Kelimeler
                  </div>
                  <div className="text-xs text-gray-600">
                    "Ahmetli yemek", "Manisa restoran" gibi lokasyon bazlı kelimeler
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Sosyal Medya Entegrasyonu
                  </div>
                  <div className="text-xs text-gray-600">
                    Instagram ve Facebook ile cross-platform kampanyalar
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ⚡ Hızlı İşlemler
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-sm font-medium">Yeni Kampanya</div>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-sm font-medium">Performans Raporu</div>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-sm font-medium">Budget Analizi</div>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-amber-600" />
              <div className="text-sm font-medium">Müşteri Analizi</div>
            </button>
          </div>
        </div>

        {/* Success Stories */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            🏆 Başarı Hikayeleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">+150%</div>
              <div className="text-sm text-gray-600">Online Sipariş Artışı</div>
              <div className="text-xs text-gray-500 mt-1">Son 3 ayda</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">4.2x</div>
              <div className="text-sm text-gray-600">Ortalama ROAS</div>
              <div className="text-xs text-gray-500 mt-1">Sektör ortalaması: 2.8x</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">₺850</div>
              <div className="text-sm text-gray-600">Ortalama Sipariş Değeri</div>
              <div className="text-xs text-gray-500 mt-1">%25 artış</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
