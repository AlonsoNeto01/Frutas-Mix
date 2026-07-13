'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function ActiveOrderBanner() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const checkActiveOrder = useCallback(() => {
    const saved = localStorage.getItem('frutasmix-active-order');
    setOrderId(saved);
  }, []);

  useEffect(() => {
    checkActiveOrder();

    // Detectar mudanças do localStorage em outras abas
    window.addEventListener('storage', checkActiveOrder);

    // Custom event para atualizações na mesma aba (despachado manualmente onde necessário)
    window.addEventListener('frutasmix-order-update', checkActiveOrder);

    // Polling leve como fallback (a cada 2s) para capturar mudanças no localStorage
    // sem precisar monkey-patch as funções nativas
    const interval = setInterval(checkActiveOrder, 2000);

    return () => {
      window.removeEventListener('storage', checkActiveOrder);
      window.removeEventListener('frutasmix-order-update', checkActiveOrder);
      clearInterval(interval);
    };
  }, [checkActiveOrder]);

  // Hide the banner if the user is already on the tracking page for this order
  if (!orderId || pathname === `/order/${orderId}`) return null;
  // Also don't show it in the admin panel
  if (pathname.startsWith('/admin')) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-80 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-4 shadow-2xl shadow-green-500/30 z-50 animate-slideUp cursor-pointer hover:scale-[1.02] transition-all duration-300"
      onClick={() => router.push(`/order/${orderId}`)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-bounce">🛵</span>
          <div>
            <p className="font-bold text-sm">Pedido em Andamento</p>
            <p className="text-xs text-green-100 font-medium mt-0.5">Clique para acompanhar</p>
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
