import { NextResponse } from 'next/server';
import { OrderService } from '@/services/orderService';
import { OrderStatus, PaymentMethod } from '@/types';
import { ProductService } from '@/services/productService';
import { RestaurantService } from '@/services/restaurantService';
import { canPlaceOrder } from '@/utils/restaurantUtils';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { estimateDeliveryFee } from '@/lib/maps-advanced';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Idempotency-Key (header veya body)
    const headerKey = (request.headers.get('Idempotency-Key') || '').trim();
    const bodyKey = (body.idempotencyKey || '').trim();
    const idempotencyKey = headerKey || bodyKey || '';

    const {
      restaurantId,
      items,
      customerInfo,
      deliveryAddress,
      paymentMethod,
      notes,
      totalAmount
    } = body;

    // 1) Alan kontrolü
    if (!restaurantId || !items || items.length === 0 || !customerInfo || !totalAmount) {
      return NextResponse.json({ success: false, error: 'Eksik sipariş bilgileri' }, { status: 400 });
    }

    // 2) Ödeme yöntemi validasyonu (sadece kapıda nakit / kapıda kart)
    const allowed = [PaymentMethod.CASH_ON_DELIVERY, PaymentMethod.CARD_ON_DELIVERY];
    if (!allowed.includes(paymentMethod)) {
      return NextResponse.json({ success: false, error: 'Geçersiz ödeme yöntemi' }, { status: 400 });
    }

    // 3) Idempotency: aynı anahtar varsa mevcut sonucu döndür
    if (idempotencyKey) {
      const idemRef = doc(db, 'idempotency_keys', idempotencyKey);
      const idemSnap = await getDoc(idemRef);
      if (idemSnap.exists()) {
        const data = idemSnap.data() as any;
        if (data.orderId) {
          return NextResponse.json({ success: true, orderId: data.orderId, idempotent: true });
        }
      } else {
        await setDoc(idemRef, { userId: customerInfo.userId || null, status: 'processing', createdAt: serverTimestamp() });
      }
    }

    // 4) Restoran uygunluk kontrolü
    const restaurant = await RestaurantService.getRestaurant(restaurantId);
    if (!restaurant) {
      return NextResponse.json({ success: false, error: 'Restoran bulunamadı' }, { status: 404 });
    }
    const orderability = canPlaceOrder(restaurant);
    if (!orderability.canOrder) {
      return NextResponse.json({ success: false, error: orderability.reason || 'Restoran şu an sipariş almıyor' }, { status: 400 });
    }

    // 5) Ürün doğrulama ve sunucu tarafı fiyatlandırma
    const validatedItems: any[] = [];
    let computedSubtotal = 0;
    for (const raw of items) {
      const pid = raw.product?.id || raw.id;
      const quantity = Math.max(1, Number(raw.quantity) || 1);
      const product = await ProductService.getProduct(pid);
      if (!product || !product.isActive) {
        return NextResponse.json({ success: false, error: `Ürün uygun değil: ${pid}` }, { status: 400 });
      }
      if (product.stock !== undefined && product.stock < quantity) {
        return NextResponse.json({ success: false, error: `${product.name} için stok yetersiz` }, { status: 400 });
      }
      const unitPrice = product.price;
      computedSubtotal += unitPrice * quantity;
      validatedItems.push({
        productId: product.id,
        product: {
          id: product.id,
          name: product.name,
          price: unitPrice,
          categoryId: product.categoryId,
          description: product.description,
          restaurantId,
          imageUrl: product.imageUrl,
          images: product.images || [],
          variants: product.variants || [],
          ingredients: product.ingredients || [],
          allergens: product.allergens || [],
          isVegetarian: !!product.isVegetarian,
          isVegan: !!product.isVegan,
          isGlutenFree: !!product.isGlutenFree,
          preparationTime: product.preparationTime || 0,
          calories: product.calories || 0,
          isActive: true,
          stock: product.stock ?? 0,
          minStock: product.minStock ?? 0,
          maxStock: product.maxStock ?? 0,
          tags: product.tags || [],
          rating: product.rating || 0,
          reviewCount: product.reviewCount || 0,
          isPopular: !!product.isPopular,
          isFeatured: !!product.isFeatured,
          createdAt: product.createdAt || new Date(),
          updatedAt: product.updatedAt || new Date()
        },
        quantity,
        specialInstructions: raw.notes || '',
        categoryId: product.categoryId,
        price: unitPrice
      });
    }

    // 6) Mesafe/ücret/ETA hesaplama (server-side fallback)
    const rLat = restaurant.address?.coordinates?.lat ?? 38.4946;
    const rLng = restaurant.address?.coordinates?.lng ?? 27.9264;
    const cLat = deliveryAddress?.coordinates?.lat ?? 38.4946;
    const cLng = deliveryAddress?.coordinates?.lng ?? 27.9264;

    // Koordinatlar eksikse (0,0) ise varsayılan değerlerle hesapla ve mesafe kontrolünü esnek yap
    const missingCoords = (Number(cLat) === 0 && Number(cLng) === 0);
    const distanceMeters = missingCoords
      ? 3000 // varsayılan 3km
      : haversineMeters(rLat, rLng, cLat, cLng);
    if (!missingCoords && distanceMeters > 10000) {
      return NextResponse.json({ success: false, error: 'Teslimat alanı dışında' }, { status: 400 });
    }
    const avgSpeedMps = 30000 / 3600; // ~30 km/saat
    const durationSeconds = Math.max(900, Math.round(distanceMeters / avgSpeedMps)); // min 15dk
    const deliveryFee = estimateDeliveryFee(distanceMeters, durationSeconds);

    const finalSubtotal = computedSubtotal;
    const finalTotal = finalSubtotal + deliveryFee;

    // 7) Sipariş verisi
    const orderData = {
      userId: customerInfo.userId,
      user: {
        uid: customerInfo.userId,
        displayName: customerInfo.name,
        email: customerInfo.email || '',
        phoneNumber: customerInfo.phone,
        role: 'customer' as const,
        isActive: true,
        createdAt: new Date()
      },
      restaurantId,
      items: validatedItems,
      subtotal: finalSubtotal,
      deliveryFee,
      total: finalTotal,
      status: OrderStatus.PENDING,
      deliveryAddress: {
        ...deliveryAddress,
        street: deliveryAddress?.street || '',
        city: deliveryAddress?.city || '',
        district: deliveryAddress?.district || '',
        zipCode: deliveryAddress?.zipCode || '',
        country: deliveryAddress?.country || 'Türkiye',
        coordinates: deliveryAddress?.coordinates || { lat: cLat, lng: cLng },
        fullName: deliveryAddress?.fullName || customerInfo.name,
        phone: deliveryAddress?.phone || customerInfo.phone,
        isDefault: deliveryAddress?.isDefault || false,
        instructions: deliveryAddress?.instructions || ''
      },
      paymentMethod,
      specialInstructions: notes || '',
      estimatedDeliveryTime: new Date(Date.now() + durationSeconds * 1000)
    } as any;

    const orderId = await OrderService.createOrder(orderData);

    if (orderId) {
      if (idempotencyKey) {
        try { await updateDoc(doc(db, 'idempotency_keys', idempotencyKey), { orderId, status: 'completed', updatedAt: serverTimestamp() }); } catch {}
      }
      return NextResponse.json({ success: true, orderId, message: 'Sipariş başarıyla oluşturuldu!' });
    } else {
      if (idempotencyKey) {
        try { await updateDoc(doc(db, 'idempotency_keys', idempotencyKey), { status: 'failed', updatedAt: serverTimestamp() }); } catch {}
      }
      return NextResponse.json({ success: false, error: 'Sipariş oluşturulamadı' }, { status: 500 });
    }

  } catch (error: any) {
    const errorMessage = error?.message || 'Sipariş işlemi başarısız';
    const statusCode = (error as any)?.code === 'permission-denied' ? 403 : 500;
    return NextResponse.json({ success: false, error: errorMessage }, { status: statusCode });
  }
}

// Haversine (metre)
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const restaurantId = searchParams.get('restaurantId');

    if (userId) {
      // Kullanıcının siparişlerini getir
      const orders = await OrderService.getUserOrders(userId);
      return NextResponse.json({ success: true, orders });
    } else if (restaurantId) {
      // Restoranın siparişlerini getir
      const orders = await OrderService.getRestaurantOrders(restaurantId);
      return NextResponse.json({ success: true, orders });
    } else {
      return NextResponse.json({
        success: false,
        error: 'userId veya restaurantId gerekli'
      }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 