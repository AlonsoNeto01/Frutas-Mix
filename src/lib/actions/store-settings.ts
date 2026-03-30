'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getStoreSettings() {
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
        store_name: 'LancheFlow',
        whatsapp_number: null,
        delivery_fee: 0,
        created_at: '',
      },
    };
  }

  return { data, error: null };
}

export async function updateStoreSettings(settings: {
  id: string;
  store_name: string;
  whatsapp_number: string | null;
  delivery_fee: number;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('store_settings')
    .update({
      store_name: settings.store_name,
      whatsapp_number: settings.whatsapp_number,
      delivery_fee: settings.delivery_fee,
    })
    .eq('id', settings.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/checkout');
  revalidatePath('/admin');
  return { success: true };
}
