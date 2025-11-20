'use client';

import { useState } from 'react';
import { Bell, BellOff, BellRing, Settings } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationButtonProps {
  className?: string;
  variant?: 'icon' | 'button' | 'card';
  showText?: boolean;
}

export default function NotificationButton({ 
  className = '', 
  variant = 'icon',
  showText = true 
}: NotificationButtonProps) {
  const [showSettings, setShowSettings] = useState(false);
  const {
    permission,
    isSupported,
    isLoading,
    requestPermission,
    unsubscribe,
    sendTestNotification
  } = useNotifications();

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  if (!isSupported) {
    return null;
  }

  const getIconComponent = () => {
    switch (permission) {
      case 'granted':
        return <BellRing className="h-5 w-5 text-green-600" />;
      case 'denied':
        return <BellOff className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (permission) {
      case 'granted':
        return 'Bildirimler Aktif';
      case 'denied':
        return 'Bildirimler Kapalı';
      default:
        return 'Bildirimi Etkinleştir';
    }
  };

  const getStatusColor = () => {
    switch (permission) {
      case 'granted':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'denied':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  const handleMainAction = async () => {
    if (permission === 'granted') {
      setShowSettings(!showSettings);
    } else {
      await requestPermission();
    }
  };

  if (variant === 'card') {
    return (
      <div className={`relative ${className}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${getStatusColor()}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                {getIconComponent()}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  Push Bildirimler
                </h3>
                <p className="text-sm opacity-80 leading-relaxed">
                  {permission === 'granted' 
                    ? 'Sipariş durumu ve özel teklifler hakkında anlık bildirim alın'
                    : 'Sipariş güncellemelerini kaçırmamak için bildirimleri etkinleştirin'
                  }
                </p>
                <div className="mt-3 text-xs font-medium">
                  Durum: {getStatusText()}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {permission === 'granted' && (
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                  title="Ayarlar"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}
              
              <button
                onClick={handleMainAction}
                className="px-4 py-2 bg-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                {permission === 'granted' ? 'Yönet' : 'Etkinleştir'}
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && permission === 'granted' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-white/30"
              >
                <div className="flex flex-col gap-3">
                  <button
                    onClick={sendTestNotification}
                    className="flex items-center gap-2 px-3 py-2 bg-white/70 hover:bg-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <BellRing className="h-4 w-4" />
                    Test Bildirimi Gönder
                  </button>
                  
                  <button
                    onClick={unsubscribe}
                    className="flex items-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors text-sm font-medium text-red-700"
                  >
                    <BellOff className="h-4 w-4" />
                    Bildirimleri Kapat
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleMainAction}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${getStatusColor()} ${className}`}
      >
        {getIconComponent()}
        {showText && (
          <span className="font-medium text-sm">
            {getStatusText()}
          </span>
        )}
      </button>
    );
  }

  // Default icon variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleMainAction}
        className="relative p-2 rounded-full transition-all duration-200 hover:scale-110 hover:bg-gray-100"
        title={getStatusText()}
      >
        {getIconComponent()}
        
        {/* Status indicator dot */}
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
          permission === 'granted' ? 'bg-green-500' : 
          permission === 'denied' ? 'bg-red-500' : 'bg-gray-400'
        }`} />
      </button>

      {/* Settings dropdown for icon variant */}
      <AnimatePresence>
        {showSettings && permission === 'granted' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
          >
            <div className="p-4 space-y-3">
              <div className="text-sm font-medium text-gray-900 border-b pb-2">
                Bildirim Ayarları
              </div>
              
              <button
                onClick={sendTestNotification}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors text-sm"
              >
                <BellRing className="h-4 w-4 text-blue-600" />
                Test Bildirimi Gönder
              </button>
              
              <button
                onClick={unsubscribe}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-red-50 rounded-lg transition-colors text-sm text-red-600"
              >
                <BellOff className="h-4 w-4" />
                Bildirimleri Kapat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
