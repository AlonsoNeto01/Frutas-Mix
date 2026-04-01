import { getCategories } from '@/lib/actions/categories';
import { getActiveProducts } from '@/lib/actions/products';
import { checkStoreOpen } from '@/lib/actions/business-hours';
import Header from '@/components/Header';
import StoreStatusBanner from '@/components/StoreStatusBanner';
import HomeClient from './HomeClient';
import type { Category, Product } from '@/lib/types';

export default async function Home() {
  const [categoriesResult, productsResult, storeStatus] = await Promise.all([
    getCategories(),
    getActiveProducts(),
    checkStoreOpen(),
  ]);

  const categories = (categoriesResult.data || []) as Category[];
  const products = (productsResult.data || []) as Product[];

  return (
    <>
      <Header />
      <StoreStatusBanner isOpen={storeStatus.isOpen} message={storeStatus.message} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Highlights */}
        {products.some((p) => p.is_highlight) && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
              ⭐ Destaques
            </h2>
            <HomeClient
              categories={[]}
              products={products.filter((p) => p.is_highlight)}
              isHighlightSection
            />
          </section>
        )}

        {/* Categorias */}
        <HomeClient categories={categories} products={products} />

        {/* Produtos sem categoria */}
        {products.filter((p) => !p.category_id).length > 0 && (
          <HomeClient
            categories={[{ id: 'uncategorized', name: '📦 Outros', sort_order: 999, created_at: '' }]}
            products={products.filter((p) => !p.category_id)}
          />
        )}

        {products.length === 0 && (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">🍔</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Cardápio em breve!
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Estamos preparando nosso cardápio. Volte em breve!
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-neutral-800 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
        © {new Date().getFullYear()} LancheFlow · Feito com 🧡
      </footer>
    </>
  );
}
