'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import CartItemRow from './CartItem';
import Button from './ui/Button';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { items, total, clearCart } = useCart();
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex justify-end animate-fadeIn"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-white dark:bg-neutral-900 shadow-2xl flex flex-col animate-slideRight">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            🛒 Carrinho
            {items.length > 0 && (
              <span className="text-sm font-normal text-gray-400">
                ({items.length} {items.length === 1 ? 'item' : 'itens'})
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Fechar carrinho"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <span className="text-5xl mb-4">🛒</span>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Seu carrinho está vazio
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Adicione itens do cardápio
              </p>
            </div>
          ) : (
            <div className="py-2">
              {items.map((_, index) => (
                <CartItemRow key={index} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 dark:border-neutral-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(total)}
              </span>
            </div>
            <Button onClick={handleCheckout} className="w-full" size="lg" id="go-to-checkout-btn">
              Ir para Checkout
            </Button>
            <button
              onClick={clearCart}
              className="w-full text-center text-sm text-red-500 hover:text-red-600 dark:text-red-400 transition-colors"
            >
              Limpar carrinho
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
