'use client';

import { useState } from 'react';
import type { StoreSettings } from '@/lib/types';
import { updateStoreSettings } from '@/lib/actions/store-settings';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface StoreSettingsFormProps {
  initialSettings: StoreSettings;
}

export default function StoreSettingsForm({ initialSettings }: StoreSettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (field: string, value: string | number) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    const result = await updateStoreSettings({
      id: settings.id,
      store_name: settings.store_name,
      whatsapp_number: settings.whatsapp_number || null,
      delivery_fee: Number(settings.delivery_fee) || 0,
    });

    if (result.error) {
      setMessage(`Erro: ${result.error}`);
    } else {
      setMessage('Configurações salvas com sucesso! ✅');
    }

    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-5">
      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-5">⚙️ Configurações da Loja</h3>

      <div className="space-y-4">
        {/* Nome da loja */}
        <Input
          id="store-name"
          label="Nome da Loja"
          placeholder="LancheFlow"
          value={settings.store_name}
          onChange={(e) => handleChange('store_name', e.target.value)}
        />

        {/* WhatsApp */}
        <div>
          <Input
            id="whatsapp-number"
            label="WhatsApp da Loja (com DDD)"
            placeholder="11999999999"
            type="tel"
            value={settings.whatsapp_number || ''}
            onChange={(e) => handleChange('whatsapp_number', e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Apenas números com DDD. Ex: 11999999999. Os clientes poderão enviar o pedido via WhatsApp.
          </p>
        </div>

        {/* Taxa de entrega */}
        <div>
          <Input
            id="delivery-fee"
            label="Taxa de Entrega (R$)"
            placeholder="0.00"
            type="number"
            step="0.50"
            min="0"
            value={String(settings.delivery_fee)}
            onChange={(e) => handleChange('delivery_fee', e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Defina 0 para entrega grátis.
          </p>
        </div>
      </div>

      {message && (
        <div className={`mt-4 text-sm font-medium ${
          message.includes('Erro') ? 'text-red-500' : 'text-green-600 dark:text-green-400'
        }`}>
          {message}
        </div>
      )}

      <Button onClick={handleSave} disabled={loading} className="mt-5">
        {loading ? 'Salvando...' : 'Salvar Configurações'}
      </Button>
    </div>
  );
}
