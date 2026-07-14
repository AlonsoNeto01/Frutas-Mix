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
    const logoFile = formData.get('logo') as File | null;
    const coverFile = formData.get('cover') as File | null;

    const updateData: Record<string, unknown> = {
      store_name,
      whatsapp_number: whatsapp_number || null,
      delivery_fee,
    };

    // Upload do logo se fornecido
    if (logoFile && logoFile.size > 0) {
      const ext = logoFile.name ? logoFile.name.split('.').pop() : 'png';
      const fileName = `logo-${Date.now()}.${ext}`;
      const fileBuffer = Buffer.from(await logoFile.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, fileBuffer, {
          contentType: logoFile.type || 'image/png',
          upsert: true,
        });

      if (uploadError) {
        return { error: `Erro no upload do logo: ${uploadError.message}` };
      }

      updateData.logo_url = fileName;
    }

    // Upload da capa se fornecida
    if (coverFile && coverFile.size > 0) {
      const ext = coverFile.name ? coverFile.name.split('.').pop() : 'png';
      const fileName = `cover-${Date.now()}.${ext}`;
      const fileBuffer = Buffer.from(await coverFile.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, fileBuffer, {
          contentType: coverFile.type || 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        return { error: `Erro no upload da capa: ${uploadError.message}` };
      }

      updateData.cover_url = fileName;
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
