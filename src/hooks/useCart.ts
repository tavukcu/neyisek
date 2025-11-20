import { useState, useEffect } from 'react';
import { CartItem, Product } from '@/types';
import { Analytics, createAnalyticsProduct, createAnalyticsUser } from '@/lib/analytics';

// Sepet yönetimi hook'u
export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 🚀 Force refresh fonksiyonu
  const forceRefresh = () => {
    console.log('🛒 useCart - Force refresh tetiklendi');
    setRefreshTrigger(prev => prev + 1);
  };

  // Client-side hydration kontrolü
  useEffect(() => {
    setIsClient(true);
    
    // 🚀 Storage değişikliklerini dinle (farklı tab/component'ler arası senkronizasyon)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'neyisek-cart' && e.newValue) {
        console.log('🛒 useCart - Storage değişikliği algılandı:', e.newValue);
        try {
          const newCartData = JSON.parse(e.newValue);
          setCartItems(newCartData);
          console.log('🛒 useCart - Cart senkronize edildi:', newCartData.length);
        } catch (error) {
          console.error('🛒 useCart - Storage senkronizasyon hatası:', error);
        }
      }
    };

    // Custom cart update event'lerini dinle
    const handleCartUpdate = (event: any) => {
      console.log('🛒 useCart - Cart update eventi alındı:', event.detail);
      const savedCart = localStorage.getItem('neyisek-cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(parsedCart);
          console.log('🛒 useCart - Cart event ile güncellendi:', parsedCart.length);
          
          // Force refresh tetikle
          forceRefresh();
        } catch (error) {
          console.error('🛒 useCart - Event update hatası:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Sayfa yüklendiğinde ve refresh trigger değiştiğinde localStorage'dan sepet verilerini yüklüyoruz
  useEffect(() => {
    if (!isClient) {
      console.log('🛒 useCart - Not client-side yet, skipping localStorage');
      return;
    }
    
    console.log('🛒 useCart - Loading cart from localStorage... (trigger:', refreshTrigger, ')');
    const savedCart = localStorage.getItem('neyisek-cart');
    console.log('🛒 useCart - Saved cart from localStorage:', savedCart);
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('🛒 useCart - Parsed cart data:', parsedCart);
        setCartItems(parsedCart);
        console.log('🛒 useCart - Cart items set successfully, count:', parsedCart.length);
      } catch (error) {
        console.error('🛒 useCart - Error loading cart data:', error);
      }
    } else {
      console.log('🛒 useCart - No saved cart found in localStorage');
    }
  }, [isClient, refreshTrigger]);

  // Sepet değiştiğinde localStorage'a kaydediyoruz
  useEffect(() => {
    if (!isClient) return;
    
    console.log('🛒 useCart - Saving cart to localStorage:', cartItems.length);
    localStorage.setItem('neyisek-cart', JSON.stringify(cartItems));
  }, [cartItems, isClient]);

  // Sepete ürün ekleme fonksiyonu
  const addToCart = (product: Product, quantity: number = 1, specialInstructions?: string) => {
    console.log('🛒 useCart - Adding to cart:', { 
      productId: product.id, 
      productName: product.name, 
      quantity, 
      specialInstructions 
    });
    
    setCartItems(prevItems => {
      console.log('🛒 useCart - Previous cart items:', prevItems.length);
      const existingItem = prevItems.find(item => item.productId === product.id);
      
      if (existingItem) {
        console.log('🛒 useCart - Item exists, updating quantity');
        // Ürün zaten sepette varsa miktarını artırıyoruz
        const updatedItems = prevItems.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity, specialInstructions }
            : item
        );
        console.log('🛒 useCart - Updated cart items:', updatedItems.length);
        return updatedItems;
      } else {
        console.log('🛒 useCart - New item, adding to cart');
        // Yeni ürün ekliyoruz
        const newItems = [...prevItems, {
          productId: product.id,
          product,
          quantity,
          specialInstructions,
          categoryId: product.categoryId,
          price: product.price
        }];
        console.log('🛒 useCart - New cart items:', newItems.length);
        return newItems;
      }
    });
    
    // Google Analytics - Add to Cart Event
    try {
      const analyticsProduct = createAnalyticsProduct(product, quantity);
      Analytics.addToCart(analyticsProduct);
    } catch (error) {
      console.error('🟡 Analytics add to cart error (non-blocking):', error);
    }
  };

  // Sepetten ürün çıkarma fonksiyonu
  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => {
      const removedItem = prevItems.find(item => item.productId === productId);
      
      // Google Analytics - Remove from Cart Event
      if (removedItem) {
        try {
          const analyticsProduct = createAnalyticsProduct(removedItem.product, removedItem.quantity);
          Analytics.removeFromCart(analyticsProduct);
        } catch (error) {
          console.error('🟡 Analytics remove from cart error (non-blocking):', error);
        }
      }
      
      return prevItems.filter(item => item.productId !== productId);
    });
  };

  // Ürün miktarını güncelleme fonksiyonu
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Sepeti temizleme fonksiyonu
  const clearCart = () => {
    setCartItems([]);
  };

  // Sepet toplamı hesaplama
  const subtotal = cartItems.reduce((total, item) => {
    // Use item.price if available, fallback to product.price
    const itemPrice = item.price || item.product.price;
    return total + (itemPrice * item.quantity);
  }, 0);

  // Toplam ürün sayısı
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Teslimat ücreti hesaplama (50 TL altındaki siparişlerde 15 TL)
  const deliveryFee = subtotal >= 50 ? 0 : 15;

  // Genel toplam hesaplama
  const total = subtotal + deliveryFee;

  // Sepetde en az bir ürün var mı kontrolü
  const hasItems = cartItems.length > 0;

  // Belirli bir ürünün sepetteki miktarını getirme
  const getItemQuantity = (productId: string) => {
    const item = cartItems.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  return {
    cartItems,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    deliveryFee,
    total,
    totalItems,
    hasItems,
    getItemQuantity,
    forceRefresh,
  };
} 