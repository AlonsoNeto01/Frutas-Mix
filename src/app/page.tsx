import { getCategories } from '@/lib/actions/categories';
import { getActiveProducts } from '@/lib/actions/products';
import { checkStoreOpen } from '@/lib/actions/business-hours';
import { getStoreSettings } from '@/lib/actions/store-settings';
import Header from '@/components/Header';
import StoreStatusBanner from '@/components/StoreStatusBanner';
import HomeClient from './HomeClient';
import type { Category, Product } from '@/lib/types';

export default async function Home() {
  const [categoriesResult, productsResult, storeStatus, settingsResult] = await Promise.all([
    getCategories(),
    getActiveProducts(),
    checkStoreOpen(),
    getStoreSettings(),
  ]);

  const categories = (categoriesResult.data || []) as Category[];
  const products = (productsResult.data || []) as Product[];
  const storeName = settingsResult.data?.store_name || 'LancheFlow';

  return (
    <>
      <Header />
      <StoreStatusBanner isOpen={storeStatus.isOpen} message={storeStatus.message} />
      
      {/* Hero Section */}
      <section className="relative w-full bg-orange-50 dark:bg-neutral-900/50 pt-12 pb-16 overflow-hidden border-b border-orange-100 dark:border-neutral-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-orange-400/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-neutral-800 text-xs font-semibold text-orange-600 dark:text-orange-400 shadow-sm border border-orange-100 dark:border-neutral-700 mb-6 animate-bounce-slow">
            🛵 Entrega Rápida e Segura
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
            Bateu aquela fome? <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
              Peça no {storeName}.
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Os melhores lanches da região, preparados com ingredientes selecionados e muito amor, direto na sua porta.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 -mt-6">
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
        © {new Date().getFullYear()} {storeName} · Feito com 🧡
      </footer>
    </>
  );
}
