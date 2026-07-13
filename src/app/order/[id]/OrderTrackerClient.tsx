'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import type { Order, OrderStatus } from '@/lib/types';
import { ORDER_STATUS_LABELS } from '@/lib/types';

interface OrderTrackerClientProps {
  initialOrder: Order;
}

const STATUS_STEPS: OrderStatus[] = ['novo', 'preparando', 'entrega', 'concluido'];

const STATUS_CONFIG: Record<OrderStatus, { icon: string; description: string; color: string }> = {
  novo: {
    icon: '📝',
    description: 'Aguardando confirmação do restaurante.',
    color: 'bg-blue-500',
  },
  preparando: {
    icon: '👨‍🍳',
    description: 'Seu pedido está sendo preparado com carinho.',
    color: 'bg-orange-500',
  },
  entrega: {
    icon: '🛵',
    description: 'O entregador já está a caminho!',
    color: 'bg-purple-500',
  },
  concluido: {
    icon: '✅',
    description: 'Pedido entregue. Bom apetite!',
    color: 'bg-green-500',
  },
};

export default function OrderTrackerClient({ initialOrder }: OrderTrackerClientProps) {
  const router = useRouter();
  const [order, setOrder] = useState<Order>(initialOrder);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // If initially loaded as completed, clear it
    if (order.status === 'concluido') {
      localStorage.removeItem('frutasmix-active-order');
    }

    // Setup realtime subscription
    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          setOrder((prev) => {
            const newOrder = { ...prev, ...payload.new } as Order;
            
            // Clear active order from localStorage if completed
            if (newOrder.status === 'concluido') {
              localStorage.removeItem('frutasmix-active-order');
              window.dispatchEvent(new Event('frutasmix-order-update'));
            }
            
            return newOrder;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order.id, supabase]);

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Acompanhe seu pedido
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Pedido #{order.id.split('-')[0].toUpperCase()}
        </p>
      </div>

      {/* Progress Tracker */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-neutral-800">
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-8 left-6 right-6 md:left-12 md:right-12 h-1 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-1000 ease-out"
              style={{
                width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {STATUS_STEPS.map((status, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const config = STATUS_CONFIG[status];

              return (
                <div key={status} className="flex flex-col items-center group">
                  <div
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-2xl z-10 transition-all duration-500
                      ${
                        isCompleted
                          ? `${config.color} text-white shadow-lg shadow-${config.color.split('-')[1]}-500/30 scale-110`
                          : 'bg-gray-100 dark:bg-neutral-800 text-gray-400'
                      }
                      ${isCurrent ? 'ring-4 ring-orange-500/20' : ''}
                    `}
                  >
                    {config.icon}
                  </div>
                  <div className="mt-4 text-center max-w-[80px] md:max-w-[120px]">
                    <p
                      className={`text-xs md:text-sm font-semibold transition-colors duration-500 ${
                        isCompleted ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {ORDER_STATUS_LABELS[status]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Status Message */}
        <div className="mt-12 text-center p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-2xl border border-gray-100 dark:border-neutral-800/50">
          <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
            {STATUS_CONFIG[order.status].description}
          </p>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-neutral-800">
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
          <span>📋</span> Resumo do Pedido
        </h3>
        
        <div className="space-y-4">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm md:text-base">
              <div>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {item.quantity}x {item.product_name}
                </span>
                {item.observation && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Nota: {item.observation}
                  </p>
                )}
              </div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(item.unit_price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-neutral-800 space-y-3">
          <div className="flex justify-between items-center text-sm md:text-base">
            <span className="text-gray-500 dark:text-gray-400">Nome</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{order.customer_name}</span>
          </div>
          <div className="flex justify-between items-center text-sm md:text-base">
            <span className="text-gray-500 dark:text-gray-400">Endereço</span>
            <span className="font-medium text-gray-900 dark:text-gray-100 text-right max-w-[60%]">
              {order.address}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm md:text-base">
            <span className="text-gray-500 dark:text-gray-400">Pagamento</span>
            <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
              {order.payment_method}
            </span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-neutral-800 mt-4">
            <span className="font-bold text-gray-900 dark:text-gray-100">Total</span>
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>
      </div>

      <div className="text-center pb-8">
        <button
          onClick={() => router.push('/')}
          className="text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 font-medium transition-colors"
        >
          Fazer um novo pedido
        </button>
      </div>
    </div>
  );
}
