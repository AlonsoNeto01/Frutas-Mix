import { getOrderById } from '@/lib/actions/orders';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import OrderTrackerClient from './OrderTrackerClient';
import type { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'Acompanhar Pedido — Frutas Mix',
  description: 'Acompanhe o status do seu pedido em tempo real.',
};

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const { data: order, error } = await getOrderById(id);

  if (error || !order) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
        <OrderTrackerClient initialOrder={order} />
      </main>
    </>
  );
}
