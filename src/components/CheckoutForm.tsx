'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { createOrder } from '@/lib/actions/orders';
import { formatCurrency } from '@/lib/utils';
import Button from './ui/Button';
import Input from './ui/Input';

interface CheckoutFormProps {
  isStoreOpen: boolean;
}

export default function CheckoutForm({ isStoreOpen }: CheckoutFormProps) {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState(() => {
    // Tentar carregar dados salvos
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lancheflow-customer');
        if (saved) return { ...JSON.parse(saved), payment_method: 'pix', change_for: '' };
      } catch { /* ignore */ }
    }
    return { name: '', phone: '', address: '', payment_method: 'pix', change_for: '' };
  });

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
        'lancheflow-customer',
        JSON.stringify({ name: formData.name, phone: formData.phone, address: formData.address })
      );

      const result = await createOrder({
        customer_name: formData.name,
        customer_phone: formData.phone,
        address: formData.address,
        payment_method: formData.payment_method,
        change_for: formData.payment_method === 'dinheiro' && formData.change_for
          ? parseFloat(formData.change_for)
          : null,
        total,
        items: items.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price,
          observation: item.observation || null,
        })),
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      clearCart();
      setSuccess(true);
      setTimeout(() => router.push('/'), 3000);
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
          Acompanhe seu pedido. Você será redirecionado em instantes...
        </p>
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
          {items.map((item, i) => (
            <div key={i} className="flex justify-between items-start text-sm">
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {item.quantity}x {item.product.name}
                </span>
                {item.observation && (
                  <p className="text-xs text-gray-400 mt-0.5">📝 {item.observation}</p>
                )}
              </div>
              <span className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap ml-4">
                {formatCurrency(item.product.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800 flex justify-between items-center">
          <span className="font-bold text-gray-900 dark:text-gray-100">Total</span>
          <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(total)}
          </span>
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
        <Input
          id="customer-address"
          label="Endereço de Entrega"
          placeholder="Rua, número, bairro, complemento"
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
                  ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-400'
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
            placeholder={`Mínimo: ${formatCurrency(total)}`}
            type="number"
            step="0.01"
            min={total}
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
        {loading ? 'Enviando pedido...' : `Finalizar Pedido · ${formatCurrency(total)}`}
      </Button>
    </form>
  );
}
