'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { createOrder } from '@/lib/actions/orders';
import { formatCurrency } from '@/lib/utils';
import { buildWhatsAppMessage, getWhatsAppUrl } from '@/lib/whatsapp';
import Button from './ui/Button';
import Input from './ui/Input';

import type { DeliveryNeighborhood } from '@/lib/types';

interface CheckoutFormProps {
  isStoreOpen: boolean;
  defaultDeliveryFee: number;
  whatsappNumber: string | null;
  neighborhoods: DeliveryNeighborhood[];
  orderTrackingMode: 'tracking' | 'whatsapp_only';
}

export default function CheckoutForm({ isStoreOpen, defaultDeliveryFee, whatsappNumber, neighborhoods, orderTrackingMode }: CheckoutFormProps) {
  const { items, total: subtotal, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', payment_method: 'pix', change_for: '', neighborhood_id: '',
  });

  // Carregar dados salvos do cliente após montagem (evita hydration mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('frutasmix-customer');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed, payment_method: 'pix', change_for: '', neighborhood_id: parsed.neighborhood_id || '' }));
      }
    } catch { /* ignore */ }
  }, []);

  const selectedNeighborhood = neighborhoods.find(n => n.id === formData.neighborhood_id);
  const allItemsFreeShipping = items.length > 0 && items.every(item => item.product.has_free_shipping);
  const baseDeliveryFee = selectedNeighborhood ? Number(selectedNeighborhood.fee) : Number(defaultDeliveryFee);
  const deliveryFee = allItemsFreeShipping ? 0 : baseDeliveryFee;
  const grandTotal = subtotal + deliveryFee;

  const handleChange = (field: string, value: string) => {
    setFormData((prev: typeof formData) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStoreOpen) return;
    if (items.length === 0) return;

    setLoading(true);
    setError('');

    try {
      // Salvar dados do cliente
      localStorage.setItem(
        'frutasmix-customer',
        JSON.stringify({ name: formData.name, phone: formData.phone, address: formData.address, neighborhood_id: formData.neighborhood_id })
      );

      const result = await createOrder({
        customer_name: formData.name,
        customer_phone: formData.phone,
        neighborhood: selectedNeighborhood ? selectedNeighborhood.name : null,
        delivery_fee: deliveryFee,
        address: formData.address,
        payment_method: formData.payment_method,
        change_for: formData.payment_method === 'dinheiro' && formData.change_for
          ? parseFloat(formData.change_for)
          : null,
        total: grandTotal,
        items: items.map((item) => {
          const addonsTotal = item.addons?.reduce((sum, a) => sum + Number(a.price), 0) || 0;
          return {
            product_id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            unit_price: Number(item.product.price) + addonsTotal,
            observation: item.observation || null,
            addons: item.addons || [],
          };
        }),
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setOrderId(result.orderId ?? null);
      if (result.orderId && orderTrackingMode === 'tracking') {
        localStorage.setItem('frutasmix-active-order', result.orderId);
      }

      // Gerar link WhatsApp se tiver número configurado
      let generatedUrl = '';
      if (whatsappNumber) {
        const message = buildWhatsAppMessage({
          customerName: formData.name,
          customerPhone: formData.phone,
          address: formData.address,
          paymentMethod: formData.payment_method,
          changeFor: formData.payment_method === 'dinheiro' && formData.change_for
            ? parseFloat(formData.change_for)
            : null,
          items,
          subtotal,
          deliveryFee,
          total: grandTotal,
        });
        generatedUrl = getWhatsAppUrl(whatsappNumber, message);
        setWhatsappUrl(generatedUrl);
      }
      
      clearCart();
      setSuccess(true);

      // Redireciona automaticamente para o WhatsApp (usa window.location.href no iOS/Safari para evitar bloqueador de popups)
      if (generatedUrl) {
        window.location.href = generatedUrl;
      }
    } catch {
      setError('Erro ao enviar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-16 animate-fadeIn">
        <span className="text-6xl block mb-4">🎉</span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Pedido enviado com sucesso!
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Seu pedido foi registrado! Já estamos separando suas frutas! 🍍
        </p>
        <p className="mt-4 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl max-w-sm mx-auto">
          ⚠️ Se você não foi redirecionado automaticamente para o WhatsApp, clique no botão verde abaixo para enviar seu pedido manualmente.
        </p>

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 mt-8 px-8 py-4 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold rounded-2xl shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300 hover:scale-[1.02] text-lg w-full max-w-sm justify-center mx-auto"
            id="whatsapp-send-btn"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Enviar via WhatsApp
          </a>
        )}

        {orderId && orderTrackingMode === 'tracking' && (
          <Button
            onClick={() => router.push(`/order/${orderId}`)}
            className="w-full max-w-sm mx-auto mt-4"
            size="lg"
          >
            📍 Acompanhar Pedido
          </Button>
        )}

        <button
          onClick={() => router.push('/')}
          className="block mx-auto mt-8 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          ← Voltar ao cardápio
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl block mb-4">🛒</span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Carrinho vazio
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Adicione itens ao carrinho antes de fazer o checkout.
        </p>
        <Button onClick={() => router.push('/')} className="mt-6">
          Ver Cardápio
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Resumo do Pedido */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-5">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">📋 Resumo do Pedido</h3>
        <div className="space-y-3">
          {items.map((item, i) => {
            const addonsTotal = item.addons?.reduce((sum, a) => sum + Number(a.price), 0) || 0;
            const itemTotal = (Number(item.product.price) + addonsTotal) * item.quantity;
            
            return (
              <div key={i} className="flex justify-between items-start text-sm">
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {item.quantity}x {item.product.name}
                  </span>
                  {item.addons && item.addons.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1 pl-2 border-l-2 border-gray-200 dark:border-neutral-700">
                      {item.addons.map(a => (
                        <div key={a.id}>+ {a.name}</div>
                      ))}
                    </div>
                  )}
                  {item.observation && (
                    <p className="text-xs text-gray-400 mt-0.5">📝 {item.observation}</p>
                  )}
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap ml-4">
                  {formatCurrency(itemTotal)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
              🛵 Taxa de entrega
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Grátis'}
            </span>
          </div>
          {allItemsFreeShipping && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl">
              <span className="text-green-600 dark:text-green-400 text-sm font-semibold">
                🎉 Frete grátis aplicado! Todos os itens possuem frete grátis.
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-neutral-800">
            <span className="font-bold text-gray-900 dark:text-gray-100">Total</span>
            <span className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Dados do Cliente */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-5 space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-gray-100">👤 Seus Dados</h3>
        <Input
          id="customer-name"
          label="Nome"
          placeholder="Seu nome completo"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
        />
        <Input
          id="customer-phone"
          label="WhatsApp"
          placeholder="(00) 00000-0000"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          required
        />
        <div className="space-y-1">
          <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Bairro (Taxa de Entrega)
          </label>
          <select
            id="neighborhood"
            value={formData.neighborhood_id}
            onChange={(e) => handleChange('neighborhood_id', e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900 dark:text-gray-100"
          >
            <option value="">Selecione seu bairro...</option>
            {neighborhoods.filter(n => n.is_active).map(n => (
              <option key={n.id} value={n.id}>
                {n.name} — {formatCurrency(n.fee)}
              </option>
            ))}
          </select>
        </div>
        <Input
          id="customer-address"
          label="Endereço de Entrega (Rua, Número, Complemento)"
          placeholder="Rua, número, complemento"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          required
        />
      </div>

      {/* Pagamento */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-5 space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-gray-100">💳 Forma de Pagamento</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'pix', label: '💠 Pix' },
            { value: 'cartao', label: '💳 Cartão' },
            { value: 'dinheiro', label: '💵 Dinheiro' },
          ].map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => handleChange('payment_method', method.value)}
              className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                formData.payment_method === method.value
                  ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 dark:border-green-400'
                  : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-neutral-600'
              }`}
            >
              {method.label}
            </button>
          ))}
        </div>

        {formData.payment_method === 'dinheiro' && (
          <Input
            id="change-for"
            label="Troco para quanto?"
            placeholder={`Mínimo: ${formatCurrency(grandTotal)}`}
            type="number"
            step="0.01"
            min={grandTotal}
            value={formData.change_for}
            onChange={(e) => handleChange('change_for', e.target.value)}
          />
        )}
      </div>

      {/* Loja Fechada */}
      {!isStoreOpen && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-5 text-center">
          <p className="text-red-700 dark:text-red-400 font-semibold">
            🔒 A loja está fechada no momento. Você não pode finalizar o pedido.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={loading || !isStoreOpen}
        id="submit-order-btn"
      >
        {loading ? 'Enviando pedido...' : `Finalizar Pedido · ${formatCurrency(grandTotal)}`}
      </Button>
    </form>
  );
}
