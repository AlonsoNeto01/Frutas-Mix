'use client';

import type { Order } from '@/lib/types';
import { PAYMENT_METHOD_LABELS } from '@/lib/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface OrderReceiptProps {
  order: Order;
}

export default function OrderReceipt({ order }: OrderReceiptProps) {
  return (
    <div className="receipt-content" style={{
      fontFamily: "'Courier New', monospace",
      fontSize: '12px',
      width: '280px',
      padding: '8px',
      color: '#000',
      background: '#fff',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>🍔 LancheFlow</div>
        <div style={{ fontSize: '10px', marginTop: '4px' }}>
          {formatDateTime(order.created_at)}
        </div>
        <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />
      </div>

      {/* Cliente */}
      <div style={{ marginBottom: '8px' }}>
        <div><strong>Cliente:</strong> {order.customer_name}</div>
        <div><strong>Tel:</strong> {order.customer_phone}</div>
        <div><strong>End:</strong> {order.address}</div>
      </div>

      <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />

      {/* Itens */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>ITENS:</div>
        {order.order_items?.map((item) => (
          <div key={item.id} style={{ marginBottom: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{item.quantity}x {item.product_name}</span>
              <span>{formatCurrency(item.unit_price * item.quantity)}</span>
            </div>
            {item.observation && (
              <div style={{ fontSize: '10px', paddingLeft: '12px', fontStyle: 'italic' }}>
                OBS: {item.observation}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />

      {/* Total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
        <span>TOTAL:</span>
        <span>{formatCurrency(order.total)}</span>
      </div>

      {/* Pagamento */}
      <div style={{ marginTop: '4px', fontSize: '11px' }}>
        <strong>Pagamento:</strong> {PAYMENT_METHOD_LABELS[order.payment_method]}
        {order.change_for ? ` | Troco: ${formatCurrency(order.change_for)}` : ''}
      </div>

      <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '10px' }}>
        <div>Pedido #{order.id.slice(0, 8).toUpperCase()}</div>
        <div style={{ marginTop: '4px' }}>Obrigado pela preferência! 🧡</div>
      </div>
    </div>
  );
}
