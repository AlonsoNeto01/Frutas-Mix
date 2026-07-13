// ============================================
// Frutas Mix — WhatsApp Integration
// ============================================

import type { CartItem } from './types';
import { formatCurrency } from './utils';

interface WhatsAppOrderData {
  customerName: string;
  customerPhone: string;
  address: string;
  paymentMethod: string;
  changeFor: number | null;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

const PAYMENT_LABELS: Record<string, string> = {
  pix: 'Pix',
  cartao: 'Cartão',
  dinheiro: 'Dinheiro',
};

export function buildWhatsAppMessage(data: WhatsAppOrderData): string {
  const lines: string[] = [];

  lines.push('🍉 *NOVO PEDIDO — Frutas Mix*');
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  lines.push(`👤 *Cliente:* ${data.customerName}`);
  lines.push(`📞 *Telefone:* ${data.customerPhone}`);
  lines.push(`📍 *Endereço:* ${data.address}`);
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('📋 *ITENS DO PEDIDO:*');
  lines.push('');

  for (const item of data.items) {
    lines.push(`  ▸ ${item.quantity}x ${item.product.name} — ${formatCurrency(item.product.price * item.quantity)}`);
    if (item.observation) {
      lines.push(`    📝 _${item.observation}_`);
    }
  }

  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━');

  if (data.deliveryFee > 0) {
    lines.push(`🛒 *Subtotal:* ${formatCurrency(data.subtotal)}`);
    lines.push(`🛵 *Taxa de entrega:* ${formatCurrency(data.deliveryFee)}`);
  }

  lines.push(`💰 *TOTAL: ${formatCurrency(data.total)}*`);
  lines.push('');
  lines.push(`💳 *Pagamento:* ${PAYMENT_LABELS[data.paymentMethod] || data.paymentMethod}`);

  if (data.paymentMethod === 'dinheiro' && data.changeFor) {
    lines.push(`💵 *Troco para:* ${formatCurrency(data.changeFor)}`);
  }

  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('_Pedido enviado via Frutas Mix_ 🍍');

  return lines.join('\n');
}

export function getWhatsAppUrl(phone: string, message: string): string {
  // Remove tudo que não é número
  const cleanPhone = phone.replace(/\D/g, '');
  // Se não começar com 55 (Brasil), adicionar
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${fullPhone}?text=${encodedMessage}`;
}
