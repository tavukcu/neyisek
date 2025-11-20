'use client';

// Google Maps Advanced APIs - Delivery Optimization & Real-time Tracking
declare global {
  interface Window {
    google: any;
  }
}

export interface DeliveryLocation {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
  formattedAddress?: string;
}

export interface DeliveryRoute {
  distance: string;
  duration: string;
  distanceValue: number; // meters
  durationValue: number; // seconds
  steps: any[];
  overview_polyline: string;
  warnings?: string[];
}

export interface DeliveryOptimization {
  totalDistance: number;
  totalDuration: number;
  optimizedOrder: number[];
  routes: DeliveryRoute[];
  estimatedCost: number;
}

export interface RealTimeLocation {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

export class MapsAdvanced {
  private static directionsService: any = null;
  private static distanceService: any = null;
  private static routesService: any = null;

  // Google Maps servislerini başlat
  private static initServices() {
    if (typeof window === 'undefined' || !window.google) return false;
    
    if (!this.directionsService) {
      this.directionsService = new window.google.maps.DirectionsService();
    }
    if (!this.distanceService) {
      this.distanceService = new window.google.maps.DistanceMatrixService();
    }
    
    return true;
  }

  // 1. MESAFE VE SÜRE HESAPLAMA (Distance Matrix API)
  static async calculateDeliveryTime(
    restaurantLocation: DeliveryLocation,
    customerLocation: DeliveryLocation,
    travelMode: 'DRIVING' | 'WALKING' | 'BICYCLING' = 'DRIVING'
  ): Promise<DeliveryRoute | null> {
    if (!this.initServices()) return null;

    try {
      return new Promise((resolve, reject) => {
        this.distanceService.getDistanceMatrix({
          origins: [`${restaurantLocation.lat},${restaurantLocation.lng}`],
          destinations: [`${customerLocation.lat},${customerLocation.lng}`],
          travelMode: window.google.maps.TravelMode[travelMode],
          unitSystem: window.google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: true,
        }, (response: any, status: any) => {
          if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
            const element = response.rows[0].elements[0];
            resolve({
              distance: element.distance.text,
              duration: element.duration.text,
              distanceValue: element.distance.value,
              durationValue: element.duration.value,
              steps: [],
              overview_polyline: '',
            });
          } else {
            console.error('Distance Matrix API error:', status);
            reject(new Error(`Distance calculation failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Distance calculation error:', error);
      return null;
    }
  }

  // 2. DETAYLI ROTA PLANLAMASİ (Directions API)
  static async getDetailedRoute(
    origin: DeliveryLocation,
    destination: DeliveryLocation,
    waypoints: DeliveryLocation[] = [],
    optimize: boolean = true
  ): Promise<DeliveryRoute | null> {
    if (!this.initServices()) return null;

    try {
      return new Promise((resolve, reject) => {
        const waypointsFormatted = waypoints.map(point => ({
          location: `${point.lat},${point.lng}`,
          stopover: true
        }));

        this.directionsService.route({
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          waypoints: waypointsFormatted,
          optimizeWaypoints: optimize,
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: true,
        }, (response: any, status: any) => {
          if (status === 'OK') {
            const route = response.routes[0];
            const leg = route.legs[0];
            
            resolve({
              distance: leg.distance.text,
              duration: leg.duration.text,
              distanceValue: leg.distance.value,
              durationValue: leg.duration.value,
              steps: leg.steps,
              overview_polyline: route.overview_polyline,
              warnings: route.warnings,
            });
          } else {
            console.error('Directions API error:', status);
            reject(new Error(`Route calculation failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Route calculation error:', error);
      return null;
    }
  }

  // 3. ÇOK DURAKLI ROTA OPTİMİZASYONU
  static async optimizeMultipleDeliveries(
    restaurantLocation: DeliveryLocation,
    deliveryLocations: DeliveryLocation[]
  ): Promise<DeliveryOptimization | null> {
    if (!this.initServices() || deliveryLocations.length === 0) return null;

    try {
      // Tüm lokasyonlar arası mesafe matrisini hesapla
      const allLocations = [restaurantLocation, ...deliveryLocations];
      const distanceMatrix = await this.calculateDistanceMatrix(allLocations);
      
      if (!distanceMatrix) return null;

      // Traveling Salesman Problem (TSP) optimizasyonu
      const optimizedOrder = this.solveTSP(distanceMatrix);
      
      // Optimize edilmiş rotayı hesapla
      const routes: DeliveryRoute[] = [];
      let totalDistance = 0;
      let totalDuration = 0;

      for (let i = 0; i < optimizedOrder.length - 1; i++) {
        const fromIndex = optimizedOrder[i];
        const toIndex = optimizedOrder[i + 1];
        const route = await this.getDetailedRoute(
          allLocations[fromIndex],
          allLocations[toIndex]
        );
        
        if (route) {
          routes.push(route);
          totalDistance += route.distanceValue;
          totalDuration += route.durationValue;
        }
      }

      // Teslimat maliyeti hesapla (₺2/km + ₺1/dakika)
      const estimatedCost = Math.round(
        (totalDistance / 1000 * 2) + (totalDuration / 60 * 1)
      );

      return {
        totalDistance,
        totalDuration,
        optimizedOrder: optimizedOrder.slice(1), // Restoran hariç
        routes,
        estimatedCost,
      };
    } catch (error) {
      console.error('Multi-delivery optimization error:', error);
      return null;
    }
  }

  // 4. GERÇEK ZAMANLI KONUM TAKİBİ
  static startLocationTracking(
    callback: (location: RealTimeLocation) => void,
    options: {
      highAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
      minDistance?: number; // minimum hareket mesafesi (metre)
    } = {}
  ): number | null {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return null;
    }

    let lastLocation: RealTimeLocation | null = null;

    const watchOptions = {
      enableHighAccuracy: options.highAccuracy ?? true,
      timeout: options.timeout ?? 10000,
      maximumAge: options.maximumAge ?? 1000,
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: RealTimeLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
          accuracy: position.coords.accuracy,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
        };

        // Minimum hareket mesafesi kontrolü
        if (lastLocation && options.minDistance) {
          const distance = this.calculateDistance(
            lastLocation.lat, lastLocation.lng,
            newLocation.lat, newLocation.lng
          );
          
          if (distance < options.minDistance) {
            return; // Çok küçük hareket, güncelleme yapma
          }
        }

        lastLocation = newLocation;
        callback(newLocation);
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      watchOptions
    );

    return watchId;
  }

  // 5. KONUM TAKİBİNİ DURDUR
  static stopLocationTracking(watchId: number) {
    if (navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  // 6. TESLİMAT SÜRE TAHMİNİ (Trafik Dahil)
  static async getDeliveryETA(
    currentLocation: DeliveryLocation,
    destinationLocation: DeliveryLocation,
    departureTime?: Date
  ): Promise<{
    normal: number; // saniye
    withTraffic: number; // saniye
    delay: number; // saniye
  } | null> {
    if (!this.initServices()) return null;

    try {
      return new Promise((resolve, reject) => {
        const request: any = {
          origins: [`${currentLocation.lat},${currentLocation.lng}`],
          destinations: [`${destinationLocation.lat},${destinationLocation.lng}`],
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
          drivingOptions: {
            departureTime: departureTime || new Date(),
            trafficModel: window.google.maps.TrafficModel.BEST_GUESS,
          },
        };

        this.distanceService.getDistanceMatrix(request, (response: any, status: any) => {
          if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
            const element = response.rows[0].elements[0];
            const normalDuration = element.duration.value;
            const trafficDuration = element.duration_in_traffic?.value || normalDuration;
            
            resolve({
              normal: normalDuration,
              withTraffic: trafficDuration,
              delay: trafficDuration - normalDuration,
            });
          } else {
            reject(new Error(`ETA calculation failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('ETA calculation error:', error);
      return null;
    }
  }

  // YARDIMCI FONKSİYONLAR

  // Mesafe hesaplama (Haversine formula)
  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  // Mesafe matrisi hesaplama
  private static async calculateDistanceMatrix(locations: DeliveryLocation[]): Promise<number[][] | null> {
    if (!this.initServices()) return null;

    try {
      return new Promise((resolve, reject) => {
        const origins = locations.map(loc => `${loc.lat},${loc.lng}`);
        const destinations = [...origins];

        this.distanceService.getDistanceMatrix({
          origins,
          destinations,
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: true,
        }, (response: any, status: any) => {
          if (status === 'OK') {
            const matrix: number[][] = [];
            
            for (let i = 0; i < response.rows.length; i++) {
              matrix[i] = [];
              for (let j = 0; j < response.rows[i].elements.length; j++) {
                const element = response.rows[i].elements[j];
                if (element.status === 'OK') {
                  matrix[i][j] = element.distance.value;
                } else {
                  matrix[i][j] = Infinity;
                }
              }
            }
            
            resolve(matrix);
          } else {
            reject(new Error(`Distance matrix calculation failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Distance matrix error:', error);
      return null;
    }
  }

  // Basit TSP çözümü (Nearest Neighbor Algorithm)
  private static solveTSP(distanceMatrix: number[][]): number[] {
    const n = distanceMatrix.length;
    if (n <= 1) return [0];

    const visited = new Array(n).fill(false);
    const route = [0]; // Restoran ile başla
    visited[0] = true;

    for (let i = 1; i < n; i++) {
      let nearestIndex = -1;
      let nearestDistance = Infinity;

      const currentIndex = route[route.length - 1];
      
      for (let j = 0; j < n; j++) {
        if (!visited[j] && distanceMatrix[currentIndex][j] < nearestDistance) {
          nearestDistance = distanceMatrix[currentIndex][j];
          nearestIndex = j;
        }
      }

      if (nearestIndex !== -1) {
        route.push(nearestIndex);
        visited[nearestIndex] = true;
      }
    }

    return route;
  }

  // 7. GEOFENCİNG - Teslimat alanı kontrolü
  static isWithinDeliveryArea(
    location: DeliveryLocation,
    deliveryCenter: DeliveryLocation,
    radiusKm: number
  ): boolean {
    const distance = this.calculateDistance(
      location.lat, location.lng,
      deliveryCenter.lat, deliveryCenter.lng
    );
    return distance <= (radiusKm * 1000);
  }

  // 8. ADRES DOĞRULAMA VE FORMAT
  static async validateAndFormatAddress(address: string): Promise<DeliveryLocation | null> {
    if (typeof window === 'undefined' || !window.google) return null;

    try {
      const geocoder = new window.google.maps.Geocoder();
      
      return new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results: any[], status: any) => {
          if (status === 'OK' && results[0]) {
            const result = results[0];
            resolve({
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng(),
              address: address,
              placeId: result.place_id,
              formattedAddress: result.formatted_address,
            });
          } else {
            reject(new Error(`Address validation failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Address validation error:', error);
      return null;
    }
  }
}

// Utility functions
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}sa ${minutes}dk`;
  }
  return `${minutes} dakika`;
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}

export function estimateDeliveryFee(distanceMeters: number, durationSeconds: number): number {
  // Temel ücret: ₺5
  // Mesafe ücreti: ₺2/km  
  // Süre ücreti: ₺1/dakika (trafik için)
  const baseFee = 5;
  const distanceFee = (distanceMeters / 1000) * 2;
  const timeFee = (durationSeconds / 60) * 0.5;
  
  return Math.max(baseFee, Math.round(baseFee + distanceFee + timeFee));
}
