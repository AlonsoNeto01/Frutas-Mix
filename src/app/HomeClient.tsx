'use client';

import { useState } from 'react';
import type { Category, Product } from '@/lib/types';
import CategorySection from '@/components/CategorySection';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';

interface HomeClientProps {
  categories: Category[];
  products: Product[];
  isHighlightSection?: boolean;
}

export default function HomeClient({ categories, products, isHighlightSection }: HomeClientProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (isHighlightSection) {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      </>
    );
  }

  return (
    <>
      {categories.length > 0 && (
        <div className="sticky top-[60px] sm:top-16 z-30 bg-background/95 backdrop-blur-md border-y border-border py-3 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide shadow-sm">
          <div className="flex items-center gap-6 min-w-max">
            {categories.map(c => (
              <a 
                key={c.id} 
                href={`#category-${c.id}`} 
                className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted hover:text-foreground transition-colors whitespace-nowrap"
              >
                {c.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {categories.map((category) => {
        const categoryProducts = products.filter(
          (p) => p.category_id === category.id || (category.id === 'uncategorized' && !p.category_id)
        );

        return (
          <CategorySection
            key={category.id}
            category={category}
            products={categoryProducts}
            onProductClick={(product) => setSelectedProduct(product)}
          />
        );
      })}

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
