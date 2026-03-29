import { checkStoreOpen } from '@/lib/actions/business-hours';
import Header from '@/components/Header';
import CheckoutForm from '@/components/CheckoutForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout — LancheFlow',
  description: 'Finalize seu pedido no LancheFlow',
};

export default async function CheckoutPage() {
  const storeStatus = await checkStoreOpen();

  return (
    <>
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Finalizar Pedido
        </h1>
        <CheckoutForm isStoreOpen={storeStatus.isOpen} />
      </main>
    </>
  );
}
