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
    <section className="mb-10" id={`category-${category.id}`}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
        {category.name}
        <span className="text-sm font-normal text-gray-400 dark:text-gray-500">
          ({products.length})
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
