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
      
      {/* Cover Image */}
      <div className="w-full h-48 md:h-64 lg:h-80 relative bg-neutral-800">
        <img 
          src="https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=2000&auto=format&fit=crop" 
          alt="Capa da Loja" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
      </div>

      {/* Store Info Header */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center -mt-16 sm:-mt-20 z-10 mb-8">
        <div className="inline-block p-1 bg-background rounded-full shadow-lg">
          {settingsResult.data?.logo_url ? (
            <img 
              src={`https://tvixlkkntovgqqycyrhr.supabase.co/storage/v1/object/public/images/${settingsResult.data.logo_url}`}
              alt={storeName}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-background"
            />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center border-4 border-background shadow-inner">
              <span className="text-white text-3xl sm:text-4xl font-bold">🍔</span>
            </div>
          )}
        </div>
        
        <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-foreground">
          {storeName}
        </h1>
        
        <div className="mt-3 flex items-center justify-center gap-3">
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
            storeStatus.isOpen 
              ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
              : 'bg-red-500/20 text-red-600 dark:text-red-400'
          }`}>
            {storeStatus.isOpen ? 'Aberto' : 'Fechado'}
          </span>
          {storeStatus.message && (
            <span className="text-sm text-muted">
              • {storeStatus.message}
            </span>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">
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
