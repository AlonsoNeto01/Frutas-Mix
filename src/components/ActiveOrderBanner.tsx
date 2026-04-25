'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function ActiveOrderBanner() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkActiveOrder = () => {
      const saved = localStorage.getItem('lancheflow-active-order');
      setOrderId(saved);
    };

    checkActiveOrder();

    // Check again if localStorage changes (e.g., across tabs or after checkout)
    window.addEventListener('storage', checkActiveOrder);
    
    // Custom event for same-tab updates
    const handleLocalUpdate = () => checkActiveOrder();
    window.addEventListener('lancheflow-order-update', handleLocalUpdate);

    return () => {
      window.removeEventListener('storage', checkActiveOrder);
      window.removeEventListener('lancheflow-order-update', handleLocalUpdate);
    };
  }, []);

  // Dispatch custom event when localStorage is updated in the same window
  useEffect(() => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function() {
      // eslint-disable-next-line prefer-rest-params
      originalSetItem.apply(this, arguments as unknown as [string, string]);
      window.dispatchEvent(new Event('lancheflow-order-update'));
    };
    
    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = function() {
      // eslint-disable-next-line prefer-rest-params
      originalRemoveItem.apply(this, arguments as unknown as [string]);
      window.dispatchEvent(new Event('lancheflow-order-update'));
    };

    return () => {
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
    };
  }, []);

  // Hide the banner if the user is already on the tracking page for this order
  if (!orderId || pathname === `/order/${orderId}`) return null;
  // Also don't show it in the admin panel
  if (pathname.startsWith('/admin')) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-80 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-4 shadow-2xl shadow-orange-500/30 z-50 animate-slideUp cursor-pointer hover:scale-[1.02] transition-all duration-300"
      onClick={() => router.push(`/order/${orderId}`)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-bounce">🛵</span>
          <div>
            <p className="font-bold text-sm">Pedido em Andamento</p>
            <p className="text-xs text-orange-100 font-medium mt-0.5">Clique para acompanhar</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
}
