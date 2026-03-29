'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Order, OrderStatus } from '@/lib/types';
import { ORDER_STATUS_LABELS } from '@/lib/types';
import { updateOrderStatus } from '@/lib/actions/orders';
import { createClient } from '@/lib/supabase/client';
import OrderCard from './OrderCard';

interface OrderKanbanProps {
  initialOrders: Order[];
}

const COLUMNS: { status: OrderStatus; color: string; borderColor: string }[] = [
  { status: 'novo', color: 'bg-red-500/10', borderColor: 'border-red-500' },
  { status: 'preparando', color: 'bg-yellow-500/10', borderColor: 'border-yellow-500' },
  { status: 'entrega', color: 'bg-blue-500/10', borderColor: 'border-blue-500' },
  { status: 'concluido', color: 'bg-green-500/10', borderColor: 'border-green-500' },
];

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  novo: 'preparando',
  preparando: 'entrega',
  entrega: 'concluido',
  concluido: null,
};

export default function OrderKanban({ initialOrders }: OrderKanbanProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        async (payload) => {
          // Buscar o pedido completo com items
          const { data } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setOrders((prev) => [data as Order, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === payload.new.id ? { ...o, ...payload.new } as Order : o
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAdvanceStatus = useCallback(async (orderId: string, currentStatus: OrderStatus) => {
    const nextStatus = NEXT_STATUS[currentStatus];
    if (!nextStatus) return;

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );

    const result = await updateOrderStatus(orderId, nextStatus);
    if (result.error) {
      // Rollback
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: currentStatus } : o))
      );
    }
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {COLUMNS.map(({ status, color, borderColor }) => {
        const columnOrders = orders.filter((o) => o.status === status);

        return (
          <div key={status} className="flex flex-col">
            {/* Column Header */}
            <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl border-t-4 ${borderColor} ${color}`}>
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                {ORDER_STATUS_LABELS[status]}
              </h3>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-neutral-900 px-2 py-0.5 rounded-full">
                {columnOrders.length}
              </span>
            </div>

            {/* Cards */}
            <div className={`flex-1 min-h-[200px] p-3 rounded-b-xl space-y-3 ${color}`}>
              {columnOrders.length === 0 ? (
                <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">
                  Nenhum pedido
                </p>
              ) : (
                columnOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onAdvance={() => handleAdvanceStatus(order.id, status)}
                    nextStatus={NEXT_STATUS[status]}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
