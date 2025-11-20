'use client';

import { useState, useEffect, useCallback } from 'react';
import { DeliveryTracking, DeliveryTrackingService } from '@/services/deliveryTrackingService';
import { MapsAdvanced, formatDuration, formatDistance } from '@/lib/maps-advanced';

interface UseDeliveryTrackingReturn {
  tracking: DeliveryTracking | null;
  isLoading: boolean;
  error: string | null;
  estimatedTimeRemaining: number | null; // seconds
  distanceRemaining: number | null; // meters
  isLate: boolean;
  refreshTracking: () => void;
}

export function useDeliveryTracking(orderId: string): UseDeliveryTrackingReturn {
  const [tracking, setTracking] = useState<DeliveryTracking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  const [distanceRemaining, setDistanceRemaining] = useState<number | null>(null);

  // Real-time tracking subscription
  useEffect(() => {
    if (!orderId) return;

    setIsLoading(true);
    setError(null);

    const unsubscribe = DeliveryTrackingService.subscribeToDeliveryTracking(
      orderId,
      (trackingData) => {
        if (trackingData) {
          setTracking(trackingData);
          setError(null);
        } else {
          setError('Teslimat bilgisi bulunamadı');
        }
        setIsLoading(false);
      }
    );

    // Cleanup function
    return () => {
      unsubscribe();
      DeliveryTrackingService.unsubscribeFromDeliveryTracking(orderId);
    };
  }, [orderId]);

  // Calculate remaining time and distance
  useEffect(() => {
    if (!tracking || !tracking.currentLocation || tracking.status === 'delivered') {
      setEstimatedTimeRemaining(null);
      setDistanceRemaining(null);
      return;
    }

    const calculateRemaining = async () => {
      try {
        const route = await MapsAdvanced.calculateDeliveryTime(
          {
            lat: tracking.currentLocation!.lat,
            lng: tracking.currentLocation!.lng,
            address: 'Kurye Konumu'
          },
          tracking.customerLocation
        );

        if (route) {
          setEstimatedTimeRemaining(route.durationValue);
          setDistanceRemaining(route.distanceValue);
        }
      } catch (error) {
        console.error('Remaining calculation error:', error);
      }
    };

    // İlk hesaplama
    calculateRemaining();

    // Her 30 saniyede bir güncelle
    const interval = setInterval(calculateRemaining, 30000);

    return () => clearInterval(interval);
  }, [tracking?.currentLocation, tracking?.customerLocation]);

  // Check if delivery is late
  const isLate = tracking?.estimatedDeliveryTime 
    ? tracking.estimatedDeliveryTime.toDate().getTime() < Date.now()
    : false;

  // Manual refresh function
  const refreshTracking = useCallback(() => {
    if (tracking?.id) {
      DeliveryTrackingService.updateDeliveryETA(tracking.id);
    }
  }, [tracking?.id]);

  return {
    tracking,
    isLoading,
    error,
    estimatedTimeRemaining,
    distanceRemaining,
    isLate,
    refreshTracking,
  };
}

// Kurye için tracking hook
export function useCourierTracking(courierId: string) {
  const [activeDeliveries, setActiveDeliveries] = useState<DeliveryTracking[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);

  // Start location tracking
  const startTracking = useCallback(async () => {
    try {
      const deliveries = await DeliveryTrackingService.getActiveDeliveries(courierId);
      setActiveDeliveries(deliveries);

      const watchId = DeliveryTrackingService.startCourierLocationTracking(
        courierId,
        deliveries.map(d => d.id!).filter(Boolean)
      );

      if (watchId) {
        setLocationWatchId(watchId);
        setIsTracking(true);
      }
    } catch (error) {
      console.error('Start tracking error:', error);
    }
  }, [courierId]);

  // Stop location tracking
  const stopTracking = useCallback(() => {
    if (locationWatchId) {
      DeliveryTrackingService.stopCourierLocationTracking(courierId);
      setLocationWatchId(null);
      setIsTracking(false);
    }
  }, [courierId, locationWatchId]);

  // Load active deliveries
  const loadActiveDeliveries = useCallback(async () => {
    try {
      const deliveries = await DeliveryTrackingService.getActiveDeliveries(courierId);
      setActiveDeliveries(deliveries);
    } catch (error) {
      console.error('Load deliveries error:', error);
    }
  }, [courierId]);

  // Mark order as picked up
  const markPickedUp = useCallback(async (trackingId: string) => {
    if (!currentLocation) return;

    try {
      await DeliveryTrackingService.markPickedUp(trackingId, currentLocation);
      await loadActiveDeliveries();
    } catch (error) {
      console.error('Mark picked up error:', error);
    }
  }, [currentLocation, loadActiveDeliveries]);

  // Mark order as delivered
  const markDelivered = useCallback(async (
    trackingId: string, 
    notes?: string
  ) => {
    if (!currentLocation) return;

    try {
      await DeliveryTrackingService.markDelivered(trackingId, currentLocation, undefined, notes);
      await loadActiveDeliveries();
    } catch (error) {
      console.error('Mark delivered error:', error);
    }
  }, [currentLocation, loadActiveDeliveries]);

  // Load on mount
  useEffect(() => {
    loadActiveDeliveries();
  }, [loadActiveDeliveries]);

  return {
    activeDeliveries,
    isTracking,
    currentLocation,
    startTracking,
    stopTracking,
    loadActiveDeliveries,
    markPickedUp,
    markDelivered,
  };
}

// Delivery statistics hook
export function useDeliveryStats(courierId?: string, days: number = 30) {
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    successfulDeliveries: 0,
    averageTime: 0,
    totalDistance: 0,
    totalEarnings: 0,
    successRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const statsData = await DeliveryTrackingService.getDeliveryStats(courierId, days);
        setStats(statsData);
      } catch (error) {
        console.error('Stats loading error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [courierId, days]);

  return {
    stats,
    isLoading,
  };
}

// Utility functions for components
export function getDeliveryStatusText(status: DeliveryTracking['status']): string {
  switch (status) {
    case 'pending':
      return 'Kurye aranıyor...';
    case 'assigned':
      return 'Kurye atandı';
    case 'picked_up':
      return 'Yolda';
    case 'delivered':
      return 'Teslim edildi';
    case 'cancelled':
      return 'İptal edildi';
    case 'failed':
      return 'Teslimat başarısız';
    default:
      return 'Bilinmeyen durum';
  }
}

export function getDeliveryStatusColor(status: DeliveryTracking['status']): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'assigned':
      return 'text-blue-600 bg-blue-100';
    case 'picked_up':
      return 'text-green-600 bg-green-100';
    case 'delivered':
      return 'text-gray-600 bg-gray-100';
    case 'cancelled':
    case 'failed':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function formatETA(seconds: number | null): string {
  if (!seconds || seconds <= 0) return 'Hesaplanıyor...';
  return formatDuration(seconds);
}

export function formatDeliveryDistance(meters: number | null): string {
  if (!meters || meters <= 0) return 'Hesaplanıyor...';
  return formatDistance(meters);
}
