'use client';

import type { Order, Product, Category, BusinessHours, StoreSettings } from '@/lib/types';
import Tabs from '@/components/ui/Tabs';
import OrderKanban from '@/components/admin/OrderKanban';
import DashboardStats from '@/components/admin/DashboardStats';
import ProductTable from '@/components/admin/ProductTable';
import BusinessHoursForm from '@/components/admin/BusinessHoursForm';
import StoreSettingsForm from '@/components/admin/StoreSettingsForm';
import NeighborhoodSettings from '@/components/admin/NeighborhoodSettings';

interface AdminPageClientProps {
  initialOrders: Order[];
  initialProducts: Product[];
  initialCategories: Category[];
  initialHours: BusinessHours[];
  initialSettings: StoreSettings;
  initialNeighborhoods: DeliveryNeighborhood[];
}

export default function AdminPageClient({
  initialOrders,
  initialProducts,
  initialCategories,
  initialHours,
  initialSettings,
  initialNeighborhoods,
}: AdminPageClientProps) {
  return (
    <Tabs
      tabs={[
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          ),
          content: <DashboardStats initialOrders={initialOrders} />,
        },
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
        {
          id: 'configuracoes',
          label: 'Configurações',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          ),
          content: (
            <div className="space-y-8">
              <StoreSettingsForm initialSettings={initialSettings} />
              <NeighborhoodSettings initialNeighborhoods={initialNeighborhoods} />
            </div>
          ),
        },
      ]}
    />
  );
}
