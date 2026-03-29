'use client';

import type { Order, OrderStatus } from '@/lib/types';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/types';
import { formatCurrency, formatDateTime, formatPhone } from '@/lib/utils';
import Button from '../ui/Button';

interface OrderCardProps {
  order: Order;
  onAdvance: () => void;
  nextStatus: OrderStatus | null;
}

export default function OrderCard({ order, onAdvance, nextStatus }: OrderCardProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 p-4 shadow-sm animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-sm text-gray-900 dark:text-gray-100">
            {order.customer_name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            📞 {formatPhone(order.customer_phone)}
          </p>
        </div>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
          {formatDateTime(order.created_at)}
        </span>
      </div>

      {/* Endereço */}
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 bg-gray-50 dark:bg-neutral-800 rounded-lg p-2">
        📍 {order.address}
      </p>

      {/* Items */}
      {order.order_items && order.order_items.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {order.order_items.map((item) => (
            <div key={item.id} className="text-xs">
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {item.quantity}x {item.product_name}
              </span>
              {item.observation && (
                <span className="text-gray-400 dark:text-gray-500 ml-1">
                  — {item.observation}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-neutral-800">
        <div>
          <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(order.total)}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">
            {PAYMENT_METHOD_LABELS[order.payment_method]}
            {order.change_for ? ` · Troco: ${formatCurrency(order.change_for)}` : ''}
          </p>
        </div>

        {nextStatus && (
          <Button size="sm" onClick={onAdvance}>
            → {ORDER_STATUS_LABELS[nextStatus]}
          </Button>
        )}
      </div>
    </div>
  );
}
