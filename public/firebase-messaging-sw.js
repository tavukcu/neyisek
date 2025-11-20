// Firebase Cloud Messaging Service Worker
// Import and configure the Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsTexiSuSnyhK17G49Qqz_6O7pMV9f42M",
  authDomain: "neyisek-6b8bc.firebaseapp.com",
  projectId: "neyisek-6b8bc",
  storageBucket: "neyisek-6b8bc.firebasestorage.app",
  messagingSenderId: "187489868178",
  appId: "1:187489868178:web:3f2ee1ca2cabfbbfbf094b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);
  
  const { title, body, icon, badge } = payload.notification || {};
  const { orderId, type, action } = payload.data || {};
  
  // Bildirim ayarları
  const notificationTitle = title || 'Neyisek.com';
  const notificationOptions = {
    body: body || 'Yeni bir güncelleme var!',
    icon: icon || '/icon-192x192.png',
    badge: badge || '/favicon-32x32.png',
    tag: `neyisek-${type || 'general'}`,
    data: {
      orderId,
      type,
      action,
      url: orderId ? `/orders/${orderId}` : '/',
      timestamp: Date.now()
    },
    actions: [],
    vibrate: [200, 100, 200],
    requireInteraction: true,
    silent: false
  };

  // Bildirim türüne göre özel ayarlar
  switch (type) {
    case 'order_confirmed':
      notificationOptions.actions = [
        { action: 'track', title: '📍 Takip Et' },
        { action: 'view', title: '👁️ Görüntüle' }
      ];
      notificationOptions.icon = '/images/order-confirmed.png';
      break;
    
    case 'order_preparing':
      notificationOptions.actions = [
        { action: 'track', title: '📍 Takip Et' }
      ];
      notificationOptions.icon = '/images/order-preparing.png';
      break;
    
    case 'order_delivered':
      notificationOptions.actions = [
        { action: 'rate', title: '⭐ Değerlendir' },
        { action: 'reorder', title: '🔄 Tekrar Sipariş' }
      ];
      notificationOptions.icon = '/images/order-delivered.png';
      break;
    
    case 'promotion':
      notificationOptions.actions = [
        { action: 'view_offers', title: '🎉 Teklifleri Gör' }
      ];
      notificationOptions.icon = '/images/promotion.png';
      break;
  }

  // Bildirimi göster
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Bildirim tıklama olayını yönet
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  
  event.notification.close();
  
  const { action, data } = event;
  const { orderId, type, url } = data || {};
  
  let targetUrl = '/';
  
  // Aksiyon türüne göre yönlendirme
  switch (action) {
    case 'track':
      targetUrl = orderId ? `/orders/track?id=${orderId}` : '/orders';
      break;
    case 'view':
      targetUrl = orderId ? `/orders/${orderId}` : '/orders';
      break;
    case 'rate':
      targetUrl = orderId ? `/orders/${orderId}?tab=review` : '/orders';
      break;
    case 'reorder':
      targetUrl = orderId ? `/orders/${orderId}?action=reorder` : '/menu';
      break;
    case 'view_offers':
      targetUrl = '/menu?filter=offers';
      break;
    default:
      targetUrl = url || '/';
  }
  
  // Analytics event
  if (self.gtag) {
    self.gtag('event', 'notification_click', {
      'custom_parameter': action || 'default',
      'order_id': orderId,
      'notification_type': type
    });
  }
  
  // Sayfayı aç veya odaklan
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Eğer zaten açık bir sekme varsa odaklan
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      
      // Yoksa yeni sekme aç
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Service Worker kurulumu
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker activating...');
  event.waitUntil(clients.claim());
});