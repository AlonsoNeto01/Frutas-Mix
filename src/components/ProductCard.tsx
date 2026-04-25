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
      className="group flex w-full text-left bg-transparent rounded-xl overflow-hidden hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors p-3 gap-4 items-center focus:outline-none focus:ring-2 focus:ring-orange-500/40"
      id={`product-card-${product.id}`}
    >
      {/* Image */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-gray-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 112px, 112px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl opacity-40">
            🍔
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-1">
        <div className="flex justify-between items-start mb-1 gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
            {product.name}
          </h3>
          {product.is_highlight && (
            <span className="shrink-0 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded">
              ⭐
            </span>
          )}
        </div>
        
        {product.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2 leading-relaxed">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(product.price)}
          </span>
        </div>
      </div>
    </button>
  );
}
