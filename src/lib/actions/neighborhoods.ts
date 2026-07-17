'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { DeliveryNeighborhood } from '@/lib/types';

export async function getNeighborhoods() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('delivery_neighborhoods')
    .select('*')
    .order('name');

  if (error) {
    return { error: error.message, data: null };
  }

  return { data: data ?? [], error: null };
}

export async function updateNeighborhoodStatus(id: string, is_active: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('delivery_neighborhoods')
    .update({ is_active })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function updateNeighborhoodFee(id: string, fee: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('delivery_neighborhoods')
    .update({ fee })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function addNeighborhood(name: string, fee: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('delivery_neighborhoods')
    .insert({ name, fee, is_active: true })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath('/admin');
  revalidatePath('/checkout');
  return { data, error: null };
}

export async function deleteNeighborhood(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('delivery_neighborhoods')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/checkout');
  return { success: true };
}
