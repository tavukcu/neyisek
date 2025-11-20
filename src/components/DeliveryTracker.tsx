'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Truck, 
  Clock, 
  Package, 
  CheckCircle, 
  Phone,
  MessageCircle,
  Navigation,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useDeliveryTracking, getDeliveryStatusText, getDeliveryStatusColor, formatETA, formatDeliveryDistance } from '@/hooks/useDeliveryTracking';
import { DeliveryTracking } from '@/services/deliveryTrackingService';

interface DeliveryTrackerProps {
  orderId: string;
  className?: string;
  showMap?: boolean;
  compact?: boolean;
}

export default function DeliveryTracker({ 
  orderId, 
  className = '', 
  showMap = true,
  compact = false 
}: DeliveryTrackerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [courierMarker, setCourierMarker] = useState<any>(null);
  const [routePolyline, setRoutePolyline] = useState<any>(null);

  const {
    tracking,
    isLoading,
    error,
    estimatedTimeRemaining,
    distanceRemaining,
    isLate,
    refreshTracking,
  } = useDeliveryTracking(orderId);

  // Initialize Google Maps
  useEffect(() => {
    if (!showMap || !mapRef.current || typeof window === 'undefined' || !window.google) return;

    const initMap = () => {
      const mapInstance = new window.google.maps.Map(mapRef.current!, {
        zoom: 13,
        center: { lat: 38.4946, lng: 27.9264 }, // Default to Ahmetli
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(mapInstance);
    };

    if (window.google?.maps) {
      initMap();
    } else {
      // Google Maps henüz yüklenmemişse bekle
      const checkGoogle = setInterval(() => {
        if (window.google?.maps) {
          initMap();
          clearInterval(checkGoogle);
        }
      }, 100);

      return () => clearInterval(checkGoogle);
    }
  }, [showMap]);

  // Update map markers and route
  useEffect(() => {
    if (!map || !tracking) return;

    // Customer location marker
    const customerMarker = new window.google.maps.Marker({
      position: {
        lat: tracking.customerLocation.lat,
        lng: tracking.customerLocation.lng
      },
      map: map,
      title: 'Teslimat Adresi',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#4CAF50"/>
            <circle cx="12" cy="9" r="2.5" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24),
      }
    });

    // Restaurant location marker
    const restaurantMarker = new window.google.maps.Marker({
      position: {
        lat: tracking.restaurantLocation.lat,
        lng: tracking.restaurantLocation.lng
      },
      map: map,
      title: 'Restoran',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#FF9800"/>
            <circle cx="12" cy="9" r="2.5" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24),
      }
    });

    // Courier location marker (if available)
    if (tracking.currentLocation) {
      if (courierMarker) {
        courierMarker.setPosition({
          lat: tracking.currentLocation.lat,
          lng: tracking.currentLocation.lng
        });
      } else {
        const newCourierMarker = new window.google.maps.Marker({
          position: {
            lat: tracking.currentLocation.lat,
            lng: tracking.currentLocation.lng
          },
          map: map,
          title: tracking.courierName || 'Kurye',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#2196F3"/>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#2196F3"/>
                <path d="M8 11h8v2H8z" fill="white"/>
                <path d="M11 8h2v8h-2z" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
          }
        });
        setCourierMarker(newCourierMarker);
      }

      // Fit map bounds to include all markers
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: tracking.restaurantLocation.lat, lng: tracking.restaurantLocation.lng });
      bounds.extend({ lat: tracking.customerLocation.lat, lng: tracking.customerLocation.lng });
      bounds.extend({ lat: tracking.currentLocation.lat, lng: tracking.currentLocation.lng });
      map.fitBounds(bounds);
    } else {
      // No courier location, fit to restaurant and customer
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: tracking.restaurantLocation.lat, lng: tracking.restaurantLocation.lng });
      bounds.extend({ lat: tracking.customerLocation.lat, lng: tracking.customerLocation.lng });
      map.fitBounds(bounds);
    }

    // Cleanup function
    return () => {
      customerMarker.setMap(null);
      restaurantMarker.setMap(null);
    };
  }, [map, tracking, courierMarker]);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Teslimat Bilgisi Bulunamadı</h3>
          <p className="text-gray-500 mb-4">{error || 'Teslimat takip bilgisi henüz oluşturulmamış.'}</p>
          <button
            onClick={refreshTracking}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: DeliveryTracking['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-600" />;
      case 'assigned':
        return <Package className="h-6 w-6 text-blue-600" />;
      case 'picked_up':
        return <Truck className="h-6 w-6 text-green-600" />;
      case 'delivered':
        return <CheckCircle className="h-6 w-6 text-gray-600" />;
      default:
        return <MapPin className="h-6 w-6 text-gray-600" />;
    }
  };

  const statusColorClass = getDeliveryStatusColor(tracking.status);

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(tracking.status)}
            <div>
              <h3 className="text-lg font-semibold">
                {getDeliveryStatusText(tracking.status)}
              </h3>
              <p className="text-green-100 text-sm">
                Sipariş #{orderId.slice(-8)}
              </p>
            </div>
          </div>
          
          <button
            onClick={refreshTracking}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Status Badge */}
        <div className="mb-6">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColorClass}`}>
            {getDeliveryStatusText(tracking.status)}
            {isLate && tracking.status === 'picked_up' && (
              <AlertCircle className="h-4 w-4 ml-1 text-red-500" />
            )}
          </span>
          {isLate && tracking.status === 'picked_up' && (
            <p className="text-red-600 text-sm mt-1">
              Tahmini süre geçildi
            </p>
          )}
        </div>

        {/* Delivery Info */}
        {!compact && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Time Remaining */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Kalan Süre</p>
                  <p className="font-semibold text-gray-900">
                    {tracking.status === 'delivered' 
                      ? 'Teslim edildi' 
                      : formatETA(estimatedTimeRemaining)}
                  </p>
                </div>
              </div>
            </div>

            {/* Distance Remaining */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Navigation className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Kalan Mesafe</p>
                  <p className="font-semibold text-gray-900">
                    {tracking.status === 'delivered' 
                      ? '0 km' 
                      : formatDeliveryDistance(distanceRemaining)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Courier Info */}
        {tracking.courierName && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Kurye Bilgileri</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800 font-medium">{tracking.courierName}</p>
                {tracking.courierPhone && (
                  <p className="text-blue-600 text-sm">{tracking.courierPhone}</p>
                )}
              </div>
              {tracking.courierPhone && (
                <div className="flex space-x-2">
                  <a
                    href={`tel:${tracking.courierPhone}`}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                  <a
                    href={`sms:${tracking.courierPhone}`}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map */}
        {showMap && (
          <div className="mb-6">
            <div 
              ref={mapRef} 
              className="w-full h-64 rounded-lg bg-gray-100"
              style={{ minHeight: '256px' }}
            />
          </div>
        )}

        {/* Status Timeline */}
        {!compact && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Teslimat Süreci</h4>
            <div className="space-y-3">
              {[
                { status: 'pending', text: 'Kurye aranıyor', time: tracking.createdAt },
                { status: 'assigned', text: 'Kurye atandı', time: tracking.assignedAt },
                { status: 'picked_up', text: 'Sipariş alındı', time: tracking.pickedUpAt },
                { status: 'delivered', text: 'Teslim edildi', time: tracking.deliveredAt },
              ].map((step, index) => {
                const isCompleted = getStatusOrder(tracking.status) >= getStatusOrder(step.status as any);
                const isCurrent = tracking.status === step.status;
                
                return (
                  <div key={step.status} className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      isCompleted 
                        ? isCurrent 
                          ? 'bg-green-600 ring-4 ring-green-200' 
                          : 'bg-green-600'
                        : 'bg-gray-300'
                    }`} />
                    <div className="flex-1">
                      <p className={`text-sm ${
                        isCompleted ? 'text-gray-900 font-medium' : 'text-gray-500'
                      }`}>
                        {step.text}
                      </p>
                      {step.time && isCompleted && (
                        <p className="text-xs text-gray-500">
                          {step.time.toDate().toLocaleString('tr-TR')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get status order
function getStatusOrder(status: DeliveryTracking['status']): number {
  switch (status) {
    case 'pending': return 0;
    case 'assigned': return 1;
    case 'picked_up': return 2;
    case 'delivered': return 3;
    case 'cancelled':
    case 'failed': return -1;
    default: return -1;
  }
}
