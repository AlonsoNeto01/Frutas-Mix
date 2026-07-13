'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { AddonGroup, AddonItem } from '@/lib/types';

export async function getAddonGroupsByProduct(productId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('addon_groups')
    .select(`
      *,
      items:addon_items(*)
    `)
    .eq('product_id', productId)
    .order('sort_order');

  if (error) {
    return { error: error.message, data: null };
  }

  // Ordenar items também
  const groups = data.map((g) => ({
    ...g,
    items: (g.items as AddonItem[]).sort((a, b) => a.sort_order - b.sort_order),
  })) as AddonGroup[];

  return { data: groups, error: null };
}

export async function createAddonGroup(productId: string, name: string, isMandatory: boolean, maxChoices: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('addon_groups')
    .insert({
      product_id: productId,
      name,
      is_mandatory: isMandatory,
      max_choices: maxChoices,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/admin');
  return { data, error: null };
}

export async function deleteAddonGroup(groupId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('addon_groups').delete().eq('id', groupId);
  if (error) return { error: error.message };
  revalidatePath('/admin');
  return { success: true };
}

export async function createAddonItem(groupId: string, name: string, price: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('addon_items')
    .insert({
      addon_group_id: groupId,
      name,
      price,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/admin');
  return { data, error: null };
}

export async function deleteAddonItem(itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('addon_items').delete().eq('id', itemId);
  if (error) return { error: error.message };
  revalidatePath('/admin');
  return { success: true };
}
