'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import type { StoreSettings } from '@/lib/types';
import { updateStoreSettings } from '@/lib/actions/store-settings';
import { getSupabaseImageUrl } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
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
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<File | null>(null);
  const coverFileRef = useRef<File | null>(null);

  const handleChange = (field: string, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      logoFileRef.current = file;
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      coverFileRef.current = file;
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Upload direto do navegador para o Supabase Storage
  async function uploadFile(file: File, prefix: string): Promise<string> {
    const supabase = createClient();
    const ext = file.name.split('.').pop() || 'png';
    const fileName = `${prefix}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      throw new Error(`Erro no upload: ${error.message}`);
    }

    return fileName;
  }

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      let newLogoPath: string | undefined;
      let newCoverPath: string | undefined;

      // Upload de imagens direto do navegador (sem passar pelo servidor)
      if (logoFileRef.current) {
        setMessage('Enviando logo...');
        newLogoPath = await uploadFile(logoFileRef.current, 'logo');
      }
      if (coverFileRef.current) {
        setMessage('Enviando capa...');
        newCoverPath = await uploadFile(coverFileRef.current, 'cover');
      }

      // Agora salva apenas os dados de texto + caminhos das imagens via Server Action
      setMessage('Salvando configurações...');
      const formData = new FormData();
      formData.set('id', settings.id);
      formData.set('store_name', settings.store_name);
      formData.set('whatsapp_number', settings.whatsapp_number || '');
      formData.set('delivery_fee', String(settings.delivery_fee));
      formData.set('order_tracking_mode', settings.order_tracking_mode || 'tracking');

      if (newLogoPath) {
        formData.set('logo_path', newLogoPath);
      }
      if (newCoverPath) {
        formData.set('cover_path', newCoverPath);
      }

      const result = await updateStoreSettings(formData);

      if (result.error) {
        setMessage(`Erro: ${result.error}`);
      } else {
        setMessage('Configurações salvas! Recarregue a página para ver as mudanças. ✅');
        logoFileRef.current = null;
        coverFileRef.current = null;
      }
    } catch (err: any) {
      console.error(err);
      setMessage(`Erro: ${err.message || 'Erro de conexão ou servidor'}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const currentLogoUrl = logoPreview || (settings.logo_url ? getSupabaseImageUrl(settings.logo_url) : null);
  const currentCoverUrl = coverPreview || (settings.cover_url ? getSupabaseImageUrl(settings.cover_url) : null);

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
                onClick={() => logoInputRef.current?.click()}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                {settings.logo_url ? 'Trocar Logo' : 'Enviar Logo'}
              </button>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                PNG, JPG ou WebP. Recomendado: 200x200px.
              </p>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Capa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Imagem de Capa (Banner)
          </label>
          <div className="flex flex-col gap-4">
            {/* Preview da Capa */}
            <div className="w-full h-32 rounded-xl border-2 border-dashed border-gray-300 dark:border-neutral-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-neutral-800 relative">
              {currentCoverUrl ? (
                <Image
                  src={currentCoverUrl}
                  alt="Capa"
                  fill
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 dark:text-gray-500 text-sm">Nenhuma capa enviada</span>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                {settings.cover_url ? 'Trocar Capa' : 'Enviar Capa'}
              </button>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Resolução horizontal recomendada (ex: 1200x400px).
              </p>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Nome da loja */}
        <Input
          id="store-name"
          label="Nome da Loja"
          placeholder="Frutas Mix"
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

        {/* Modo de acompanhamento do pedido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Acompanhamento do Pedido
          </label>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
            Escolha como o cliente acompanha o status do pedido após finalizar.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleChange('order_tracking_mode', 'tracking')}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                settings.order_tracking_mode === 'tracking'
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 shadow-sm shadow-orange-500/10'
                  : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
              }`}
            >
              {settings.order_tracking_mode === 'tracking' && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
              <span className="text-2xl">📍</span>
              <span className={`text-sm font-semibold ${
                settings.order_tracking_mode === 'tracking'
                  ? 'text-orange-700 dark:text-orange-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                Acompanhar na Loja
              </span>
              <span className={`text-xs text-center ${
                settings.order_tracking_mode === 'tracking'
                  ? 'text-orange-600/70 dark:text-orange-400/70'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                Cliente vê o status em tempo real no site
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleChange('order_tracking_mode', 'whatsapp_only')}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                settings.order_tracking_mode === 'whatsapp_only'
                  ? 'border-green-500 bg-green-50 dark:bg-green-500/10 shadow-sm shadow-green-500/10'
                  : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
              }`}
            >
              {settings.order_tracking_mode === 'whatsapp_only' && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
              <span className="text-2xl">💬</span>
              <span className={`text-sm font-semibold ${
                settings.order_tracking_mode === 'whatsapp_only'
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                Apenas WhatsApp
              </span>
              <span className={`text-xs text-center ${
                settings.order_tracking_mode === 'whatsapp_only'
                  ? 'text-green-600/70 dark:text-green-400/70'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                Cliente acompanha somente pelo WhatsApp
              </span>
            </button>
          </div>
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
