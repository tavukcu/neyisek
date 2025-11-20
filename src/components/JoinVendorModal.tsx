'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Store, ArrowRight } from 'lucide-react';
import { AnalyticsService } from '@/services/analyticsService';

interface JoinVendorModalProps {
  localStorageKey?: string;
  suppressionDays?: number;
}

export default function JoinVendorModal({
  localStorageKey = 'ny_join_vendor_modal_v1',
  suppressionDays = 30,
}: JoinVendorModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    try {
      const raw = localStorage.getItem(localStorageKey);
      if (raw) {
        const data = JSON.parse(raw) as { dismissedAt: number };
        const elapsedDays = (Date.now() - data.dismissedAt) / (1000 * 60 * 60 * 24);
        if (elapsedDays < suppressionDays) {
          return; // bastırma süresi devam ediyor
        }
      }
    } catch {}

    const timer = setTimeout(() => {
      setIsOpen(true);
      try {
        localStorage.setItem('ny_popup_suppress_until', String(Date.now() + 10000));
      } catch {}
      AnalyticsService.trackCustomEvent('join_vendor_modal_shown');
    }, 400);

    return () => clearTimeout(timer);
  }, [isMounted, localStorageKey, suppressionDays]);

  const close = () => {
    setIsOpen(false);
    try {
      localStorage.setItem(localStorageKey, JSON.stringify({ dismissedAt: Date.now() }));
    } catch {}
    AnalyticsService.trackCustomEvent('join_vendor_modal_dismissed');
  };

  if (!isMounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #fffef5 100%)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Restoran ortaklığı tanıtım penceresi"
      >
        <button
          onClick={close}
          className="absolute top-3 right-3 inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/90 border border-gray-200 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Kapat"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
               style={{ background: 'linear-gradient(90deg,#22C55E20,#EAB30820)', color: '#065f46' }}>
            İlk Partnerlere Özel
          </div>

          <h3 className="mt-4 text-2xl sm:text-3xl font-black leading-snug text-gray-900">
            Sende NeYisek.com'da yerini al!
          </h3>

          <p className="mt-3 text-base sm:text-lg text-gray-700">
            <span className="font-extrabold text-green-600">İlk üç ay %0 komisyon</span> imkanından faydalan,
            binlerce müşteriye ulaş.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/restaurant-apply"
              onClick={() => AnalyticsService.trackCustomEvent('join_vendor_modal_cta_clicked')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-white font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ background: 'linear-gradient(135deg,#22C55E 0%,#84CC16 100%)' }}
            >
              <Store className="h-5 w-5" />
              Hemen Başvur
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              onClick={close}
              className="rounded-2xl px-5 py-3 font-semibold border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              Daha Sonra
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Bu teklifi {suppressionDays} gün boyunca tekrar göstermeyeceğiz.
          </div>
        </div>

        <div className="h-3 w-full"
             style={{ background: 'linear-gradient(90deg,#22C55E,#EAB308)' }} />
      </div>
    </div>
  );
}


