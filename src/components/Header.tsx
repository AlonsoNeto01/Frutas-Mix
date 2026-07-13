'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useStore } from '@/contexts/StoreContext';
import { getSupabaseImageUrl } from '@/lib/utils';
import ThemeToggle from './ThemeToggle';
import { useState } from 'react';
import Cart from './Cart';

export default function Header() {
  const { itemCount } = useCart();
  const { storeName, logoUrl } = useStore();
  const [cartOpen, setCartOpen] = useState(false);

  const resolvedLogoUrl = logoUrl ? getSupabaseImageUrl(logoUrl) : null;

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-gray-200/50 dark:border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group" id="logo-link">
              {resolvedLogoUrl ? (
                <Image
                  src={resolvedLogoUrl}
                  alt={storeName}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-xl object-cover shadow-lg"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:shadow-green-500/40 transition-shadow">
                  <span className="text-white text-lg font-bold">🍉</span>
                </div>
              )}
              <span className="text-xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                {storeName}
              </span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />

              {/* Cart Button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-all duration-200"
                aria-label="Abrir carrinho"
                id="cart-button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-300">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scaleIn">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
