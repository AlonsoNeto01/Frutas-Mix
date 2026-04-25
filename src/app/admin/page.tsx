import { getOrders } from '@/lib/actions/orders';
import { getProducts } from '@/lib/actions/products';
import { getCategories } from '@/lib/actions/categories';
import { getBusinessHours } from '@/lib/actions/business-hours';
import { getStoreSettings } from '@/lib/actions/store-settings';
import { getNeighborhoods } from '@/lib/actions/neighborhoods';
import AdminPageClient from './AdminPageClient';
import type { Order, Product, Category, BusinessHours, StoreSettings, DeliveryNeighborhood } from '@/lib/types';

export default async function AdminPage() {
  const [ordersResult, productsResult, categoriesResult, hoursResult, settingsResult, neighborhoodsResult] = await Promise.all([
    getOrders(),
    getProducts(),
    getCategories(),
    getBusinessHours(),
    getStoreSettings(),
    getNeighborhoods(),
  ]);

  return (
    <AdminPageClient
      initialOrders={(ordersResult.data || []) as Order[]}
      initialProducts={(productsResult.data || []) as Product[]}
      initialCategories={(categoriesResult.data || []) as Category[]}
      initialHours={(hoursResult.data || []) as BusinessHours[]}
      initialSettings={settingsResult.data as StoreSettings}
      initialNeighborhoods={(neighborhoodsResult.data || []) as DeliveryNeighborhood[]}
    />
  );
}
