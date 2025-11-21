"use client";

import Link from 'next/link';
import { Home, UtensilsCrossed, Filter, ShoppingCart, User } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';

export default function MobileBottomNav() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[61] safe-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="mx-auto max-w-screen-md">
        <div className="m-3 rounded-2xl bg-white/95 backdrop-blur-md border border-gray-200/70 shadow-2xl pointer-events-auto">
          <div className="grid grid-cols-5">
            <Link href="/" className="relative flex flex-col items-center justify-center py-3 text-gray-700 hover:text-green-600" aria-label="Ana Sayfa">
              <Home className="h-5 w-5" />
              <span className="text-[11px] font-medium">Ana Sayfa</span>
            </Link>
            <Link href="/menu" className="relative flex flex-col items-center justify-center py-3 text-gray-700 hover:text-green-600" aria-label="Menü">
              <UtensilsCrossed className="h-5 w-5" />
              <span className="text-[11px] font-medium">Menü</span>
            </Link>
            <button onClick={() => setIsFilterOpen(true)} className="flex flex-col items-center justify-center py-3 text-gray-700 hover:text-green-600" aria-label="Filtre">
              <Filter className="h-5 w-5" />
              <span className="text-[11px] font-medium">Filtre</span>
            </button>
            <Link href="/cart" className="relative flex flex-col items-center justify-center py-3 text-gray-700 hover:text-green-600" aria-label="Sepet">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-[22%] bg-yellow-500 text-gray-900 text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
              <span className="text-[11px] font-medium">Sepet</span>
            </Link>
            <Link href="/profile" className="relative flex flex-col items-center justify-center py-3 text-gray-700 hover:text-green-600" aria-label="Profil">
              <User className="h-5 w-5" />
              <span className="text-[11px] font-medium">Profil</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
