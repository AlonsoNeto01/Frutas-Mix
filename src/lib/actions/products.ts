'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getProducts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function getActiveProducts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const category_id = formData.get('category_id') as string;
  const is_highlight = formData.get('is_highlight') === 'true';
  const has_free_shipping = formData.get('has_free_shipping') === 'true';
  const imageFile = formData.get('image') as File | null;

  let image_url: string | null = null;

  // Upload de imagem
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, imageFile);

    if (uploadError) {
      return { error: `Erro no upload: ${uploadError.message}` };
    }

    image_url = fileName;
  }

  const { error } = await supabase.from('products').insert({
    name,
    description: description || null,
    price,
    category_id: category_id || null,
    is_highlight,
    has_free_shipping,
    image_url,
  });

  if (error) return { error: error.message };

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const category_id = formData.get('category_id') as string;
  const is_highlight = formData.get('is_highlight') === 'true';
  const is_active = formData.get('is_active') === 'true';
  const has_free_shipping = formData.get('has_free_shipping') === 'true';
  const imageFile = formData.get('image') as File | null;

  const updateData: Record<string, unknown> = {
    name,
    description: description || null,
    price,
    category_id: category_id || null,
    is_highlight,
    is_active,
    has_free_shipping,
  };

  // Upload nova imagem se fornecida
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, imageFile);

    if (uploadError) {
      return { error: `Erro no upload: ${uploadError.message}` };
    }

    updateData.image_url = fileName;
  }

  const { error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', productId);

  if (error) return { error: error.message };

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) return { error: error.message };

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}
