'use client';

import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';

interface CartItemRowProps {
  index: number;
}

export default function CartItemRow({ index }: CartItemRowProps) {
  const { items, updateQuantity, removeItem } = useCart();
  const item = items[index];

  if (!item) return null;

  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 dark:border-neutral-800 last:border-0 animate-fadeIn">
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {item.product.name}
        </h4>
        {item.observation && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            📝 {item.observation}
          </p>
        )}
        <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">
          {formatCurrency((Number(item.product.price) + (item.addons?.reduce((s, a) => s + Number(a.price), 0) || 0)) * item.quantity)}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => updateQuantity(index, item.quantity - 1)}
          className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
          aria-label="Diminuir quantidade"
        >
          −
        </button>
        <span className="w-7 text-center text-sm font-bold text-gray-900 dark:text-gray-100">
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(index, item.quantity + 1)}
          className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
          aria-label="Aumentar quantidade"
        >
          +
        </button>
        <button
          onClick={() => removeItem(index)}
          className="ml-1 w-7 h-7 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-colors"
          aria-label="Remover item"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
