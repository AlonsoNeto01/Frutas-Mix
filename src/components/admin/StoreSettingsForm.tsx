'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import type { StoreSettings } from '@/lib/types';
import { updateStoreSettings } from '@/lib/actions/store-settings';
import { getSupabaseImageUrl } from '@/lib/utils';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface StoreSettingsFormProps {
  initialSettings: StoreSettings;
}

export default function StoreSettingsForm({ initialSettings }: StoreSettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<File | null>(null);

  const handleChange = (field: string, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      logoFileRef.current = file;
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.set('id', settings.id);
    formData.set('store_name', settings.store_name);
    formData.set('whatsapp_number', settings.whatsapp_number || '');
    formData.set('delivery_fee', String(settings.delivery_fee));

    if (logoFileRef.current) {
      formData.set('logo', logoFileRef.current);
    }

    const result = await updateStoreSettings(formData);

    if (result.error) {
      setMessage(`Erro: ${result.error}`);
    } else {
      setMessage('Configurações salvas! Recarregue a página para ver as mudanças. ✅');
      logoFileRef.current = null;
    }

    setLoading(false);
    setTimeout(() => setMessage(''), 5000);
  };

  const currentLogoUrl = logoPreview || (settings.logo_url ? getSupabaseImageUrl(settings.logo_url) : null);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-5">
      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-5">⚙️ Configurações da Loja</h3>

      <div className="space-y-5">
        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Logo da Loja
          </label>
          <div className="flex items-center gap-4">
            {/* Preview */}
            <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 dark:border-neutral-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-neutral-800">
              {currentLogoUrl ? (
                <Image
                  src={currentLogoUrl}
                  alt="Logo"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <span className="text-3xl">🍔</span>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                {settings.logo_url ? 'Trocar Logo' : 'Enviar Logo'}
              </button>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                PNG, JPG ou WebP. Recomendado: 200x200px.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

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
            Apenas números com DDD. Ex: 11999999999. Clientes poderão enviar o pedido via WhatsApp.
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
