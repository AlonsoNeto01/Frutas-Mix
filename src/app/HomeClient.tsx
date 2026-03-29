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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
