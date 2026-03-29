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
      className="group relative w-full text-left bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
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
      <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-neutral-800 overflow-hidden">
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
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(product.price)}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
            Clique para ver →
          </span>
        </div>
      </div>
    </button>
  );
}
