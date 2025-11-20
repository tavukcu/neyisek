'use client';

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
    dataLayer: any[];
  }
}

// Google Analytics 4 Enhanced Ecommerce Events
export interface AnalyticsProduct {
  item_id: string;
  item_name: string;
  item_category: string;
  item_category2?: string;
  item_brand?: string;
  price: number;
  quantity: number;
  index?: number;
  currency?: string;
}

export interface AnalyticsUser {
  user_id?: string;
  user_properties?: {
    customer_lifetime_value?: number;
    preferred_language?: string;
    location?: string;
    user_type?: 'guest' | 'registered';
  };
}

export class Analytics {
  private static isGtagLoaded(): boolean {
    return typeof window !== 'undefined' && typeof window.gtag === 'function';
  }

  // 1. SAYFA GÖRÜNTÜLEMELERİ
  static pageView(url: string, title?: string) {
    if (!this.isGtagLoaded()) return;
    
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
      page_location: url,
      page_title: title,
    });
  }

  // 2. ÜRÜN GÖRÜNTÜLEMELERİ (view_item)
  static viewItem(product: AnalyticsProduct, user?: AnalyticsUser) {
    if (!this.isGtagLoaded()) return;

    window.gtag('event', 'view_item', {
      currency: 'TRY',
      value: product.price,
      items: [product],
      ...user?.user_properties
    });

    console.log('📊 Analytics - Product Viewed:', product.item_name);
  }

  // 3. SEPETE EKLEME (add_to_cart)
  static addToCart(product: AnalyticsProduct, user?: AnalyticsUser) {
    if (!this.isGtagLoaded()) return;

    window.gtag('event', 'add_to_cart', {
      currency: 'TRY',
      value: product.price * product.quantity,
      items: [product],
      ...user?.user_properties
    });

    console.log('📊 Analytics - Added to Cart:', product.item_name, 'x', product.quantity);
  }

  // 4. SEPETTEN ÇIKARMA (remove_from_cart)
  static removeFromCart(product: AnalyticsProduct, user?: AnalyticsUser) {
    if (!this.isGtagLoaded()) return;

    window.gtag('event', 'remove_from_cart', {
      currency: 'TRY',
      value: product.price * product.quantity,
      items: [product],
      ...user?.user_properties
    });

    console.log('📊 Analytics - Removed from Cart:', product.item_name);
  }

  // 5. CHECKOUT BAŞLATMA (begin_checkout)
  static beginCheckout(products: AnalyticsProduct[], totalValue: number, user?: AnalyticsUser) {
    if (!this.isGtagLoaded()) return;

    window.gtag('event', 'begin_checkout', {
      currency: 'TRY',
      value: totalValue,
      items: products,
      ...user?.user_properties
    });

    console.log('📊 Analytics - Checkout Started:', totalValue, 'TRY');
  }

  // 6. ÖDEME BİLGİLERİ (add_payment_info)
  static addPaymentInfo(paymentMethod: string, totalValue: number, user?: AnalyticsUser) {
    if (!this.isGtagLoaded()) return;

    window.gtag('event', 'add_payment_info', {
      currency: 'TRY',
      value: totalValue,
      payment_type: paymentMethod,
      ...user?.user_properties
    });

    console.log('📊 Analytics - Payment Info Added:', paymentMethod);
  }

  // 7. ADRES BİLGİLERİ (add_shipping_info)
  static addShippingInfo(deliveryMethod: string, totalValue: number, user?: AnalyticsUser) {
    if (!this.isGtagLoaded()) return;

    window.gtag('event', 'add_shipping_info', {
      currency: 'TRY',
      value: totalValue,
      shipping_tier: deliveryMethod,
      ...user?.user_properties
    });

    console.log('📊 Analytics - Shipping Info Added:', deliveryMethod);
  }

  // 8. SATIN ALMA (purchase) - EN ÖNEMLİ!
  static purchase(
    orderId: string, 
    products: AnalyticsProduct[], 
    totalValue: number, 
    tax?: number,
    shipping?: number,
    user?: AnalyticsUser
  ) {
    if (!this.isGtagLoaded()) return;

    window.gtag('event', 'purchase', {
      transaction_id: orderId,
      currency: 'TRY',
      value: totalValue,
      tax: tax || 0,
      shipping: shipping || 0,
      items: products,
      ...user?.user_properties
    });

    console.log('📊 Analytics - Purchase Completed:', orderId, totalValue, 'TRY');
  }

  // 9. ARAMA (search)
  static search(searchTerm: string, user?: AnalyticsUser) {
    if (!this.isGtagLoaded()) return;

    window.gtag('event', 'search', {
      search_term: searchTerm,
      ...user?.user_properties
    });

    console.log('📊 Analytics - Search:', searchTerm);
  }

  // 10. RESTORAN GÖRÜNTÜLEMELERİ (view_item_list)
  static viewRestaurantList(restaurantCategory: string, user?: AnalyticsUser) {
    if (!this.isGtagLoaded()) return;

    window.gtag('event', 'view_item_list', {
      item_list_id: restaurantCategory,
      item_list_name: `Restaurants - ${restaurantCategory}`,
      ...user?.user_properties
    });

    console.log('📊 Analytics - Restaurant List Viewed:', restaurantCategory);
  }

  // 11. RESTORAN DETAYI (view_promotion)
  static viewRestaurant(restaurantId: string, restaurantName: string, user?: AnalyticsUser) {
    if (!this.isGtagLoaded()) return;

    window.gtag('event', 'view_promotion', {
      promotion_id: restaurantId,
      promotion_name: restaurantName,
      creative_name: 'restaurant_detail',
      creative_slot: 'main',
      ...user?.user_properties
    });

    console.log('📊 Analytics - Restaurant Viewed:', restaurantName);
  }

  // 12. FORM GÖNDERMELERİ (generate_lead)
  static formSubmission(formName: string, value?: number, user?: AnalyticsUser) {
    if (!this.isGtagLoaded()) return;

    window.gtag('event', 'generate_lead', {
      currency: 'TRY',
      value: value || 0,
      form_name: formName,
      ...user?.user_properties
    });

    console.log('📊 Analytics - Form Submitted:', formName);
  }

  // 13. KULLANICI KAYDİ (sign_up)
  static signUp(method: string, user?: AnalyticsUser) {
    if (!this.isGtagLoaded()) return;

    window.gtag('event', 'sign_up', {
      method: method,
      ...user?.user_properties
    });

    console.log('📊 Analytics - User Signed Up:', method);
  }

  // 14. KULLANICI GİRİŞİ (login)
  static login(method: string, user?: AnalyticsUser) {
    if (!this.isGtagLoaded()) return;

    window.gtag('event', 'login', {
      method: method,
      ...user?.user_properties
    });

    console.log('📊 Analytics - User Logged In:', method);
  }

  // 15. ÖZEL EVENTLER (custom events)
  static customEvent(eventName: string, parameters: any = {}, user?: AnalyticsUser) {
    if (!this.isGtagLoaded()) return;

    window.gtag('event', eventName, {
      ...parameters,
      ...user?.user_properties
    });

    console.log('📊 Analytics - Custom Event:', eventName, parameters);
  }

  // 16. KULLANICI ÖZELLİKLERİ GÜNCELLEME
  static setUserProperties(properties: any) {
    if (!this.isGtagLoaded()) return;

    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
      user_properties: properties
    });

    console.log('📊 Analytics - User Properties Set:', properties);
  }

  // 17. E-TİCARET FUNNEL ANALİZİ
  static trackFunnelStep(step: string, stepNumber: number, value?: number, user?: AnalyticsUser) {
    if (!this.isGtagLoaded()) return;

    window.gtag('event', 'funnel_step', {
      step_name: step,
      step_number: stepNumber,
      currency: 'TRY',
      value: value || 0,
      ...user?.user_properties
    });

    console.log('📊 Analytics - Funnel Step:', step, stepNumber);
  }
}

// Helper function to convert product data
export function createAnalyticsProduct(product: any, quantity: number = 1): AnalyticsProduct {
  return {
    item_id: product.id || product.productId,
    item_name: product.name || product.title,
    item_category: product.category || 'Food',
    item_category2: product.subcategory,
    item_brand: product.restaurant?.name || 'Neyisek',
    price: product.price || 0,
    quantity: quantity,
    currency: 'TRY'
  };
}

// Helper function to create user data
export function createAnalyticsUser(user: any): AnalyticsUser {
  return {
    user_id: user?.uid,
    user_properties: {
      customer_lifetime_value: user?.totalSpent || 0,
      preferred_language: 'tr',
      location: user?.city || 'Ahmetli',
      user_type: user?.isGuest ? 'guest' : 'registered'
    }
  };
}
