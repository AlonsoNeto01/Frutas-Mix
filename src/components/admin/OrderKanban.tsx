'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Order, OrderStatus } from '@/lib/types';
import { ORDER_STATUS_LABELS } from '@/lib/types';
import { updateOrderStatus, deleteOrder } from '@/lib/actions/orders';
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

// Gera um bipe de notificação via Web Audio API
function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    // Tom 1 - nota alta
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.3);

    // Tom 2 - nota mais alta (depois de 0.15s)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gain2.gain.setValueAtTime(0.3, audioCtx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(audioCtx.currentTime + 0.15);
    osc2.stop(audioCtx.currentTime + 0.5);

    // Tom 3 - nota mais alta ainda (depois de 0.3s)
    const osc3 = audioCtx.createOscillator();
    const gain3 = audioCtx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1320, audioCtx.currentTime + 0.3);
    gain3.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gain3.gain.setValueAtTime(0.35, audioCtx.currentTime + 0.3);
    gain3.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
    osc3.connect(gain3);
    gain3.connect(audioCtx.destination);
    osc3.start(audioCtx.currentTime + 0.3);
    osc3.stop(audioCtx.currentTime + 0.6);
  } catch {
    // Fallback silencioso se Web Audio não estiver disponível
  }
}

function sendBrowserNotification(order: Order) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const itemsList = order.order_items
      ?.map((item) => `${item.quantity}x ${item.product_name}`)
      .join(', ') || 'Itens do pedido';

    new Notification('🍔 Novo pedido!', {
      body: `${order.customer_name} — ${itemsList}`,
      icon: '/favicon.ico',
      tag: `order-${order.id}`,
    });
  }
}

export default function OrderKanban({ initialOrders }: OrderKanbanProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [newOrderPulse, setNewOrderPulse] = useState(false);
  const hasInteracted = useRef(false);

  // Solicitar permissão de notificação
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Marcar interação do usuário (necessário para Web Audio)
    const handleInteraction = () => { hasInteracted.current = true; };
    window.addEventListener('click', handleInteraction, { once: true });
    return () => window.removeEventListener('click', handleInteraction);
  }, []);

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
            const newOrder = data as Order;
            setOrders((prev) => [newOrder, ...prev]);

            // 🔔 Tocar som e enviar notificação
            if (hasInteracted.current) {
              playNotificationSound();
            }
            sendBrowserNotification(newOrder);

            // Animação de pulse
            setNewOrderPulse(true);
            setTimeout(() => setNewOrderPulse(false), 2000);
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
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
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

  const handleDeleteOrder = useCallback(async (orderId: string) => {
    if (confirm('Tem certeza que deseja apagar este pedido? Isso não pode ser desfeito.')) {
      // Optimistic delete
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      
      const result = await deleteOrder(orderId);
      if (result.error) {
        alert('Erro ao apagar pedido: ' + result.error);
      }
    }
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {COLUMNS.map(({ status, color, borderColor }) => {
        const columnOrders = orders.filter((o) => o.status === status);
        const isNovoColumn = status === 'novo';

        return (
          <div key={status} className="flex flex-col">
            {/* Column Header */}
            <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl border-t-4 ${borderColor} ${color}`}>
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                {ORDER_STATUS_LABELS[status]}
              </h3>
              <span className={`text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-neutral-900 px-2 py-0.5 rounded-full transition-all ${
                isNovoColumn && newOrderPulse
                  ? 'animate-pulse ring-2 ring-red-500 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                  : ''
              }`}>
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
                    onDelete={() => handleDeleteOrder(order.id)}
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
