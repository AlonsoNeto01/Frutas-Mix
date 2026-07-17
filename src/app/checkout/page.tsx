import { checkStoreOpen } from '@/lib/actions/business-hours';
import { getStoreSettings } from '@/lib/actions/store-settings';
import { getNeighborhoods } from '@/lib/actions/neighborhoods';
import Header from '@/components/Header';
import CheckoutForm from '@/components/CheckoutForm';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Checkout — Frutas Mix',
  description: 'Finalize seu pedido no Frutas Mix',
};

export default async function CheckoutPage() {
  const [storeStatus, settingsResult, neighborhoodsResult] = await Promise.all([
    checkStoreOpen(),
    getStoreSettings(),
    getNeighborhoods(),
  ]);

  const settings = settingsResult.data;
  const neighborhoods = neighborhoodsResult.data || [];

  return (
    <>
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Finalizar Pedido
        </h1>
        <CheckoutForm
          isStoreOpen={storeStatus.isOpen}
          defaultDeliveryFee={settings.delivery_fee ?? 0}
          whatsappNumber={settings.whatsapp_number ?? null}
          neighborhoods={neighborhoods}
          orderTrackingMode={settings.order_tracking_mode ?? 'tracking'}
        />
      </main>
    </>
  );
}
