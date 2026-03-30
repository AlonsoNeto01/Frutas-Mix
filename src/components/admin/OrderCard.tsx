'use client';

import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Order, OrderStatus } from '@/lib/types';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/types';
import { formatCurrency, formatDateTime, formatPhone } from '@/lib/utils';
import OrderReceipt from './OrderReceipt';
import Button from '../ui/Button';

interface OrderCardProps {
  order: Order;
  onAdvance: () => void;
  nextStatus: OrderStatus | null;
}

export default function OrderCard({ order, onAdvance, nextStatus }: OrderCardProps) {
  const [printing, setPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    setPrinting(true);
    // aguardar render do portal, depois imprimir
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrinting(false), 500);
    }, 100);
  };

  // Link WhatsApp para o cliente
  const customerPhone = order.customer_phone.replace(/\D/g, '');
  const whatsappLink = `https://wa.me/55${customerPhone}`;

  return (
    <>
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 p-4 shadow-sm animate-fadeIn">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-bold text-sm text-gray-900 dark:text-gray-100">
              {order.customer_name}
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
            >
              📞 {formatPhone(order.customer_phone)}
            </a>
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

          <div className="flex items-center gap-2">
            {/* Botão Imprimir */}
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-neutral-800 transition-all"
              title="Imprimir comanda"
              aria-label="Imprimir comanda"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6,9 6,2 18,2 18,9" />
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
            </button>

            {nextStatus && (
              <Button size="sm" onClick={onAdvance}>
                → {ORDER_STATUS_LABELS[nextStatus]}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Portal para impressão */}
      {printing && typeof document !== 'undefined' && createPortal(
        <div id="print-area" ref={printRef} className="hidden print:block">
          <OrderReceipt order={order} />
        </div>,
        document.body
      )}
    </>
  );
}
