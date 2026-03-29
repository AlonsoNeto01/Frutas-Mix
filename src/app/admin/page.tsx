import { getOrders } from '@/lib/actions/orders';
import { getProducts } from '@/lib/actions/products';
import { getCategories } from '@/lib/actions/categories';
import { getBusinessHours } from '@/lib/actions/business-hours';
import AdminPageClient from './AdminPageClient';
import type { Order, Product, Category, BusinessHours } from '@/lib/types';

export default async function AdminPage() {
  const [ordersResult, productsResult, categoriesResult, hoursResult] = await Promise.all([
    getOrders(),
    getProducts(),
    getCategories(),
    getBusinessHours(),
  ]);

  return (
    <AdminPageClient
      initialOrders={(ordersResult.data || []) as Order[]}
      initialProducts={(productsResult.data || []) as Product[]}
      initialCategories={(categoriesResult.data || []) as Category[]}
      initialHours={(hoursResult.data || []) as BusinessHours[]}
    />
  );
}
