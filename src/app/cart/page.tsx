'use client';

import { useState, useEffect } from 'react';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { OrderService } from '@/services/orderService';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import UnifiedMapPicker from '@/components/UnifiedMapPicker';
import AddressBook from '@/components/AddressBook';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  User,
  Phone,
  MapPin,
  ArrowLeft,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Analytics, createAnalyticsProduct, createAnalyticsUser } from '@/lib/analytics';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    subtotal, 
    deliveryFee, 
    total, 
    hasItems
  } = useCart();

  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [guestFormData, setGuestFormData] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'cash_on_delivery'
  });
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [addressInputMethod, setAddressInputMethod] = useState<'manual' | 'map'>('manual');
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
    city?: string;
    district?: string;
  } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [showAddressBook, setShowAddressBook] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Misafir sipariş verme
  const handleGuestOrderSubmit = async () => {
    // Adres kontrolü
    if (addressInputMethod === 'map' && !selectedLocation) {
      toast.error('Lütfen haritadan teslimat adresini seçin');
      setShowMapPicker(true);
      return;
    }
    
    if (addressInputMethod === 'manual' && !guestFormData.address.trim()) {
      toast.error('Lütfen teslimat adresini girin');
      return;
    }

    // Misafir bilgileri için basit form göster
    const guestName = prompt('Adınız ve soyadınız:');
    if (!guestName?.trim()) {
      toast.error('Lütfen adınızı girin');
      return;
    }

    const guestPhone = prompt('Telefon numaranız:');
    if (!guestPhone?.trim()) {
      toast.error('Lütfen telefon numaranızı girin');
      return;
    }

    // Form data'yı güncelle
    setGuestFormData(prev => ({
      ...prev,
      name: guestName.trim(),
      phone: guestPhone.trim(),
      address: addressInputMethod === 'map' && selectedLocation ? selectedLocation.address : prev.address,
      paymentMethod
    }));

    await submitOrder();
  };

  // Kayıtlı kullanıcı sipariş verme
  const handleUserOrderSubmit = async () => {
    if (!user) {
      setShowGuestForm(true);
      return;
    }
    await submitOrder();
  };

  // Sipariş gönderme (ortak fonksiyon)
  const submitOrder = async () => {
    if (!hasItems) {
      toast.error('Sepetiniz boş');
      return;
    }

    // Google Analytics - Begin Checkout Event
    try {
      const analyticsProducts = cartItems.map(item => 
        createAnalyticsProduct(item.product, item.quantity)
      );
      const analyticsUser = createAnalyticsUser(user);
      
      Analytics.beginCheckout(analyticsProducts, total, analyticsUser);
    } catch (error) {
      console.error('🟡 Analytics begin checkout error (non-blocking):', error);
    }

    const restaurantIds = Array.from(new Set(cartItems.map(item => item.product.restaurantId).filter(Boolean)));
    if (restaurantIds.length > 1) {
      toast.error('Sepetinizde farklı restoranlardan ürünler var. Lütfen tek restorandan sipariş verin.');
      return;
    }

    const restaurantId = restaurantIds[0];
    if (!restaurantId) {
      toast.error('Restoran bilgisi eksik');
      return;
    }

    setIsSubmitting(true);

    try {
      // Kullanıcı bilgilerini hazırla
      let customerInfo;
      let deliveryAddress;

      if (user) {
        // Kayıtlı kullanıcı
        customerInfo = {
          userId: user.uid,
          name: user.displayName || 'Kullanıcı',
          phone: user.phoneNumber || '',
          email: user.email || ''
        };
        
        // Seçilen adres varsa onu kullan, yoksa varsayılan
        if (selectedAddress) {
          deliveryAddress = {
            street: selectedAddress.address,
            city: selectedAddress.city,
            district: selectedAddress.district,
            zipCode: selectedAddress.postalCode || '',
            country: 'Türkiye',
            coordinates: { lat: 0, lng: 0 },
            fullName: selectedAddress.fullName,
            phone: selectedAddress.phone,
            isDefault: selectedAddress.isDefault,
            instructions: selectedAddress.instructions
          };
        } else {
          deliveryAddress = {
            street: 'Kullanıcı adresi',
            city: 'Manisa',
            district: 'Merkez',
            zipCode: '45000',
            country: 'Türkiye',
            coordinates: { lat: 0, lng: 0 }
          };
        }
      } else {
        // Misafir kullanıcı
        const guestId = `guest-${Date.now()}`;
        customerInfo = {
          userId: guestId,
          name: guestFormData.name,
          phone: guestFormData.phone,
          email: '',
          isGuest: true
        };
        // Misafir kullanıcı için adres bilgilerini hazırla
        let streetAddress = guestFormData.address;
        let city = 'Manisa';
        let district = 'Merkez';
        let coordinates = { lat: 0, lng: 0 };

        if (addressInputMethod === 'map' && selectedLocation) {
          streetAddress = selectedLocation.address;
          city = selectedLocation.city || 'Manisa';
          district = selectedLocation.district || 'Merkez';
          coordinates = { lat: selectedLocation.lat, lng: selectedLocation.lng };
        }

        deliveryAddress = {
          street: streetAddress,
          city: city,
          district: district,
          zipCode: '45000',
          country: 'Türkiye',
          coordinates: coordinates
        };
      }

      const orderData = {
        restaurantId,
        items: cartItems.map(item => ({
          product: {
            id: item.productId,
            name: item.product.name,
            price: item.price || item.product.price,
            categoryId: item.categoryId,
            imageUrl: item.product.imageUrl
          },
          quantity: item.quantity,
          notes: item.specialInstructions || ''
        })),
        customerInfo,
        deliveryAddress,
        paymentMethod: user ? paymentMethod : guestFormData.paymentMethod,
        notes: '',
        totalAmount: total
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': `${customerInfo.userId}-${Date.now()}-${cartItems.length}`
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Misafir kullanıcı siparişini localStorage'a kaydet
        if (!user) {
          try {
            const guestOrder = {
              id: result.orderId,
              status: 'PENDING',
              total: total,
              createdAt: new Date().toISOString(),
              phone: guestFormData.phone,
              customerName: guestFormData.name,
              items: cartItems.map(item => ({
                product: { name: item.product.name },
                quantity: item.quantity
              }))
            };
            
            const existingOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
            existingOrders.push(guestOrder);
            localStorage.setItem('guestOrders', JSON.stringify(existingOrders));
          } catch (error) {
            console.error('Misafir sipariş kaydedilirken hata:', error);
          }
        }
        
        clearCart();
        toast.success('🎉 Siparişiniz başarıyla alındı!');
        router.push('/tesekkurler');
      } else {
        // Sunucu tarafı başarısızsa client-side fallback ile Firestore'a yaz
        const fallbackOrderData: any = {
          userId: customerInfo.userId,
          user: {
            uid: customerInfo.userId,
            displayName: customerInfo.name,
            email: customerInfo.email || '',
            phoneNumber: customerInfo.phone,
            role: 'customer',
            isActive: true,
            createdAt: new Date()
          },
          restaurantId,
          items: cartItems.map((item) => ({
            productId: item.productId,
            product: {
              id: item.productId,
              name: item.product.name,
              price: item.price || item.product.price,
              categoryId: item.categoryId,
              restaurantId,
              imageUrl: item.product.imageUrl,
              images: [],
              variants: [],
              ingredients: [],
              allergens: [],
              isVegetarian: false,
              isVegan: false,
              isGlutenFree: false,
              preparationTime: 0,
              calories: 0,
              isActive: true,
              stock: 999,
              minStock: 0,
              maxStock: 9999,
              tags: [],
              rating: 0,
              reviewCount: 0,
              isPopular: false,
              isFeatured: false,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            quantity: item.quantity,
            specialInstructions: item.specialInstructions || '',
            categoryId: item.categoryId,
            price: item.price || item.product.price
          })),
          subtotal: total,
          deliveryFee: 0,
          total: total,
          status: 'PENDING',
          deliveryAddress,
          paymentMethod: user ? paymentMethod : guestFormData.paymentMethod,
          specialInstructions: '',
          estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000)
        };

        const orderId = await OrderService.createOrder(fallbackOrderData);

        if (!orderId) {
          throw new Error(result.error || 'Sipariş oluşturulamadı');
        }

        if (!user) {
          try {
            const guestOrder = {
              id: orderId,
              status: 'PENDING',
              total: total,
              createdAt: new Date().toISOString(),
              phone: guestFormData.phone,
              customerName: guestFormData.name,
              items: cartItems.map(item => ({
                product: { name: item.product.name },
                quantity: item.quantity
              }))
            };
            const existingOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
            existingOrders.push(guestOrder);
            localStorage.setItem('guestOrders', JSON.stringify(existingOrders));
          } catch {}
        }

        clearCart();
        toast.success('🎉 Siparişiniz başarıyla alındı!');
        router.push('/tesekkurler');
      }
      
    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error);
      
      // Detaylı hata mesajı
      let errorMessage = 'Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Firebase hatası kontrolü
        if ('code' in error && error.code === 'permission-denied') {
          errorMessage = 'Yetki hatası: Sipariş oluşturma izni yok. Lütfen tekrar giriş yapın.';
        } else if ('message' in error) {
          errorMessage = String(error.message);
        }
      }
      
      toast.error(`Sipariş oluşturulurken bir hata oluştu: ${errorMessage}`);
      
      // Debug için console'a yazdır
      console.log('🔍 Detaylı hata bilgisi:', {
        error,
        errorType: typeof error,
        errorKeys: error && typeof error === 'object' ? Object.keys(error) : 'N/A',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Sayfa yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Misafir formu göster
  if (showGuestForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => setShowGuestForm(false)}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Sepete Dön</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Sipariş Bilgileri
            </h2>
            
            <div className="space-y-6">
              {/* Ad Soyad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={guestFormData.name}
                    onChange={(e) => setGuestFormData({...guestFormData, name: e.target.value})}
                    placeholder="Adınızı ve soyadınızı girin"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon Numarası *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={guestFormData.phone}
                    onChange={(e) => setGuestFormData({...guestFormData, phone: e.target.value})}
                    placeholder="05XX XXX XX XX"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Adres Giriş Yöntemi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Adres Giriş Yöntemi *
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="addressMethod"
                      value="manual"
                      checked={addressInputMethod === 'manual'}
                      onChange={(e) => {
                        const newMethod = e.target.value as 'manual' | 'map';
                        setAddressInputMethod(newMethod);
                        // Adres yöntemi değiştiğinde form verilerini temizle
                        if (newMethod === 'manual') {
                          setSelectedLocation(null);
                        } else {
                          setGuestFormData(prev => ({ ...prev, address: '' }));
                        }
                      }}
                      className="mr-3 text-green-600 focus:ring-green-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        ✏️
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Manuel Adres Girişi</p>
                        <p className="text-sm text-gray-600">Adresinizi manuel olarak yazın</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="addressMethod"
                      value="map"
                      checked={addressInputMethod === 'map'}
                      onChange={(e) => {
                        const newMethod = e.target.value as 'manual' | 'map';
                        setAddressInputMethod(newMethod);
                        // Adres yöntemi değiştiğinde form verilerini temizle
                        if (newMethod === 'manual') {
                          setSelectedLocation(null);
                        } else {
                          setGuestFormData(prev => ({ ...prev, address: '' }));
                        }
                      }}
                      className="mr-3 text-green-600 focus:ring-green-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        🗺️
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Haritadan Seç</p>
                        <p className="text-sm text-gray-600">Haritadan konumunuzu seçin</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Manuel Adres Girişi */}
              {addressInputMethod === 'manual' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teslimat Adresi *
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <textarea
                        value={guestFormData.address}
                        onChange={(e) => setGuestFormData({...guestFormData, address: e.target.value})}
                        placeholder="Sokak adresi, mahalle, ilçe, şehir"
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      Örnek: Atatürk Caddesi No:123, Merkez Mahallesi, Ahmetli/Manisa
                    </div>
                  </div>
                </div>
              )}

              {/* Harita Seçimi */}
              {addressInputMethod === 'map' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Haritadan Konum Seçin *
                  </label>
                  {selectedLocation ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-900 mb-1">Seçili Adres</p>
                          <p className="text-sm text-green-700">{selectedLocation.address}</p>
                          {selectedLocation.city && selectedLocation.district && (
                            <p className="text-xs text-green-600 mt-1">
                              {selectedLocation.district}, {selectedLocation.city}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => setShowMapPicker(true)}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          Değiştir
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowMapPicker(true)}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
                    >
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <MapPin className="h-5 w-5" />
                        <span>Haritadan konum seçin</span>
                      </div>
                    </button>
                  )}
                </div>
              )}

              {/* Ödeme Yöntemi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ödeme Yöntemi *
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={guestFormData.paymentMethod === 'cash_on_delivery'}
                      onChange={(e) => setGuestFormData({...guestFormData, paymentMethod: e.target.value})}
                      className="mr-3 text-green-600 focus:ring-green-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        💵
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Kapıda Nakit Ödeme</p>
                        <p className="text-sm text-gray-600">Sipariş teslim edilirken nakit olarak ödeyin</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card_on_delivery"
                      checked={guestFormData.paymentMethod === 'card_on_delivery'}
                      onChange={(e) => setGuestFormData({...guestFormData, paymentMethod: e.target.value})}
                      className="mr-3 text-green-600 focus:ring-green-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        💳
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Kapıda Kart ile Ödeme</p>
                        <p className="text-sm text-gray-600">Sipariş teslim edilirken kart ile ödeyin</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Sipariş Özeti */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Sipariş Özeti</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ara Toplam</span>
                    <span>₺{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Teslimat Ücreti</span>
                    <span>₺{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-medium">
                      <span>Toplam</span>
                      <span>₺{total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Ödeme Yöntemi</span>
                      <span>{guestFormData.paymentMethod === 'cash_on_delivery' ? 'Kapıda Nakit' : 'Kapıda Kart'}</span>
                    </div>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Adres Yöntemi</span>
                      <span>{addressInputMethod === 'manual' ? 'Manuel Giriş' : 'Harita Seçimi'}</span>
                    </div>
                  </div>
                  {addressInputMethod === 'manual' && guestFormData.address.trim() && (
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Teslimat Adresi</span>
                        <span className="text-right max-w-xs truncate" title={guestFormData.address}>
                          {guestFormData.address}
                        </span>
                      </div>
                    </div>
                  )}
                  {addressInputMethod === 'map' && selectedLocation && (
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Teslimat Adresi</span>
                        <span className="text-right max-w-xs truncate" title={selectedLocation.address}>
                          {selectedLocation.address}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sipariş Ver Butonu */}
              <button
                onClick={handleGuestOrderSubmit}
                disabled={isSubmitting || 
                  !guestFormData.name.trim() || 
                  !guestFormData.phone.trim() || 
                  (addressInputMethod === 'manual' && !guestFormData.address.trim()) ||
                  (addressInputMethod === 'map' && !selectedLocation)
                }
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sipariş Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Siparişi Tamamla (₺{total.toFixed(2)})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Harita Picker Modal - Misafir Formu */}
        {showMapPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Teslimat Adresi Seçin</h3>
                  <button
                    onClick={() => setShowMapPicker(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <UnifiedMapPicker
                  initialLat={selectedLocation?.lat || 38.5205}  // Manisa Ahmetli
                  initialLng={selectedLocation?.lng || 27.9380}  // Manisa Ahmetli
                  initialAddress={selectedLocation?.address || ''}
                  initialCity="45"  // Manisa
                  initialDistrict="45-01"  // Ahmetli
                  onLocationSelect={(address, lat, lng, city, district) => {
                    setSelectedLocation({ address, lat, lng, city, district });
                    setGuestFormData(prev => ({ ...prev, address }));
                    setShowMapPicker(false);
                  }}
                  height="500px"
                  showSearch={true}
                  showCitySelector={true}
                  showCurrentLocation={true}
                  showNearbyPlaces={true}
                  accentColor="#10b981"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-content">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Alışverişe Devam Et</span>
          </Link>
        </div>

        {!hasItems ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sepetiniz Boş</h2>
            <p className="text-gray-600 mb-8">Lezzetli yemekler keşfetmek için menüye göz atın</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <ShoppingCart className="w-5 h-5" />
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sepet İçeriği */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Sepetiniz</h2>
                
                                 <div className="space-y-4">
                   {cartItems.map((item) => (
                     <div key={item.productId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                       <ImageWithFallback 
                         src={item.product.imageUrl || ''} 
                         alt={item.product.name}
                         width={64}
                         height={64}
                         className="w-16 h-16 object-cover rounded-lg"
                         fallbackSrc="/images/restaurant-placeholder.svg"
                       />
                       
                       <div className="flex-1">
                         <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                         <p className="text-sm text-gray-600">₺{item.product.price.toFixed(2)}</p>
                       </div>
                       
                       <div className="flex items-center gap-3">
                         <button
                           onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                           className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                         >
                           <Minus className="w-4 h-4" />
                         </button>
                         <span className="w-8 text-center font-medium">{item.quantity}</span>
                         <button
                           onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                           className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                         >
                           <Plus className="w-4 h-4" />
                         </button>
                         <button
                           onClick={() => removeFromCart(item.productId)}
                           className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors ml-2"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            </div>

            {/* Sipariş Özeti */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Sipariş Özeti</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Ara Toplam</span>
                  <span>₺{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Teslimat Ücreti</span>
                  <span>₺{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Toplam</span>
                    <span>₺{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Ödeme Yöntemi Seçimi */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Ödeme Yöntemi</h4>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 text-green-600 focus:ring-green-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        💵
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Kapıda Nakit Ödeme</p>
                        <p className="text-sm text-gray-600">Sipariş teslim edilirken nakit olarak ödeyin</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card_on_delivery"
                      checked={paymentMethod === 'card_on_delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 text-green-600 focus:ring-green-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        💳
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Kapıda Kart ile Ödeme</p>
                        <p className="text-sm text-gray-600">Sipariş teslim edilirken kart ile ödeyin</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Adres Seçimi */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Teslimat Adresi</h4>
                
                {user ? (
                  // Kayıtlı kullanıcı için adres defteri seçeneği
                  <div className="space-y-3">
                    {selectedAddress ? (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-green-900">{selectedAddress.title}</p>
                              {selectedAddress.isDefault && (
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                  Varsayılan
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-green-700">{selectedAddress.address}</p>
                            <p className="text-xs text-green-600 mt-1">
                              {selectedAddress.district}, {selectedAddress.city}
                            </p>
                          </div>
                          <button
                            onClick={() => setShowAddressBook(true)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Değiştir
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => setShowAddressBook(true)}
                          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
                        >
                          <div className="flex items-center justify-center gap-2 text-gray-600">
                            <BookOpen className="h-5 w-5" />
                            <span>Adres defterinden seçin</span>
                          </div>
                        </button>
                        <button
                          onClick={() => setShowMapPicker(true)}
                          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
                        >
                          <div className="flex items-center justify-center gap-2 text-gray-600">
                            <MapPin className="h-5 w-5" />
                            <span>Haritadan yeni adres seçin</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  // Misafir kullanıcı için harita seçimi
                  <>
                    {selectedLocation ? (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-900 mb-1">Seçili Adres</p>
                            <p className="text-sm text-green-700">{selectedLocation.address}</p>
                            {selectedLocation.city && selectedLocation.district && (
                              <p className="text-xs text-green-600 mt-1">
                                {selectedLocation.district}, {selectedLocation.city}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => setShowMapPicker(true)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Değiştir
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowMapPicker(true)}
                        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
                      >
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <MapPin className="h-5 w-5" />
                          <span>Teslimat adresini seçin</span>
                        </div>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Adres Defteri Modal */}
              {showAddressBook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                  <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Adres Defterinden Seçin</h3>
                        <button
                          onClick={() => setShowAddressBook(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <AddressBook
                        user={user}
                        showSelection={true}
                        selectedAddressId={selectedAddress?.id}
                        onAddressSelect={(address) => {
                          setSelectedAddress(address);
                          setShowAddressBook(false);
                          toast.success(`${address.title} adresi seçildi`);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Harita Picker Modal */}
              {showMapPicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                  <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Teslimat Adresi Seçin</h3>
                        <button
                          onClick={() => setShowMapPicker(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <UnifiedMapPicker
                        initialLat={selectedLocation?.lat || 38.5205}  // Manisa Ahmetli
                        initialLng={selectedLocation?.lng || 27.9380}  // Manisa Ahmetli
                        initialAddress={selectedLocation?.address || ''}
                        initialCity="45"  // Manisa
                        initialDistrict="45-01"  // Ahmetli
                        onLocationSelect={(address, lat, lng, city, district) => {
                          setSelectedLocation({ address, lat, lng, city, district });
                          setGuestFormData(prev => ({ ...prev, address }));
                          setShowMapPicker(false);
                        }}
                        height="500px"
                        showSearch={true}
                        showCitySelector={true}
                        showCurrentLocation={true}
                        showNearbyPlaces={true}
                        accentColor="#10b981"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={user ? handleUserOrderSubmit : handleGuestOrderSubmit}
                disabled={isSubmitting || !hasItems || (!user && !selectedLocation) || (user && !selectedAddress && !selectedLocation) || false}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sipariş Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Siparişi Tamamla (₺{total.toFixed(2)})
                  </>
                )}
              </button>

              {/* Kullanıcı Bilgisi */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  {user ? (
                    <>👤 {user.displayName || user.email} olarak sipariş veriyorsunuz</>
                  ) : (
                    <>👤 Misafir olarak sipariş vereceksiniz</>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 