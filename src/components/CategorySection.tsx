'use client';

import type { Product } from '@/lib/types';
import type { Category } from '@/lib/types';
import ProductCard from './ProductCard';

interface CategorySectionProps {
  category: Category;
  products: Product[];
  onProductClick: (product: Product) => void;
}

export default function CategorySection({ category, products, onProductClick }: CategorySectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="mb-12 scroll-mt-24" id={`category-${category.id}`}>
      <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 uppercase tracking-wide border-b border-gray-100 dark:border-neutral-800 pb-2">
        {category.name}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => onProductClick(product)}
          />
        ))}
      </div>
    </section>
  );
}
