'use client';

import type { Order, Product, Category, BusinessHours } from '@/lib/types';
import Tabs from '@/components/ui/Tabs';
import OrderKanban from '@/components/admin/OrderKanban';
import ProductTable from '@/components/admin/ProductTable';
import BusinessHoursForm from '@/components/admin/BusinessHoursForm';

interface AdminPageClientProps {
  initialOrders: Order[];
  initialProducts: Product[];
  initialCategories: Category[];
  initialHours: BusinessHours[];
}

export default function AdminPageClient({
  initialOrders,
  initialProducts,
  initialCategories,
  initialHours,
}: AdminPageClientProps) {
  return (
    <Tabs
      tabs={[
        {
          id: 'pedidos',
          label: 'Pedidos',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          ),
          content: <OrderKanban initialOrders={initialOrders} />,
        },
        {
          id: 'cardapio',
          label: 'Cardápio & Horários',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5V4.5A2.5 2.5 0 016.5 2z" />
            </svg>
          ),
          content: (
            <div className="space-y-8">
              <ProductTable initialProducts={initialProducts} initialCategories={initialCategories} />
              <BusinessHoursForm initialHours={initialHours} />
            </div>
          ),
        },
      ]}
    />
  );
}
