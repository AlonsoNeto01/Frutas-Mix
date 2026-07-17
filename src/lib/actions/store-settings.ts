'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';

export const getStoreSettings = cache(async function getStoreSettings() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    return {
      error: error.message,
      data: {
        id: '',
        store_name: 'Frutas Mix',
        whatsapp_number: null,
        logo_url: null,
        cover_url: null,
        delivery_fee: 0,
        order_tracking_mode: 'tracking' as const,
        created_at: '',
      },
    };
  }

  return { data, error: null };
});

export async function updateStoreSettings(formData: FormData) {
  try {
    const supabase = await createClient();

    const id = formData.get('id') as string;
    const store_name = formData.get('store_name') as string;
    const whatsapp_number = formData.get('whatsapp_number') as string;
    const delivery_fee = parseFloat(formData.get('delivery_fee') as string) || 0;
    const order_tracking_mode = (formData.get('order_tracking_mode') as string) || 'tracking';

    // Os caminhos das imagens já foram enviados diretamente ao Storage pelo cliente
    const logoPath = formData.get('logo_path') as string | null;
    const coverPath = formData.get('cover_path') as string | null;

    const updateData: Record<string, unknown> = {
      store_name,
      whatsapp_number: whatsapp_number || null,
      delivery_fee,
      order_tracking_mode,
    };

    if (logoPath) {
      updateData.logo_url = logoPath;
    }
    if (coverPath) {
      updateData.cover_url = coverPath;
    }

    const { error } = await supabase
      .from('store_settings')
      .update(updateData)
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/', 'layout');
    revalidatePath('/checkout');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Error in updateStoreSettings:', error);
    return { error: error.message || 'Ocorreu um erro interno ao salvar.' };
  }
}
