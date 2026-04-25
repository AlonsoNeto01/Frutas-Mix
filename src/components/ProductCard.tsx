'use client';

import type { Product } from '@/lib/types';
import { formatCurrency, getSupabaseImageUrl } from '@/lib/utils';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const imageUrl = getSupabaseImageUrl(product.image_url);

  return (
    <button
      onClick={onClick}
      className="group relative w-full text-left bg-white dark:bg-neutral-900 rounded-[28px] border border-gray-100/50 dark:border-neutral-800/50 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
      id={`product-card-${product.id}`}
    >
      {/* Highlight Badge */}
      {product.is_highlight && (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
            ⭐ Destaque
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative w-full aspect-square bg-gray-50 dark:bg-neutral-800/50 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-40">
            🍔
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 pb-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-black tracking-tight text-gray-900 dark:text-gray-100">
            {formatCurrency(product.price)}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 group-hover:bg-orange-500 text-gray-400 group-hover:text-white transition-colors duration-300 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}
