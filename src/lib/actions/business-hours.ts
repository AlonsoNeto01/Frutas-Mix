'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getBusinessHours() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .order('day_of_week', { ascending: true });

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function updateBusinessHours(
  hours: {
    id: string;
    open_time: string;
    close_time: string;
    is_open: boolean;
  }[]
) {
  const supabase = await createClient();

  for (const hour of hours) {
    const { error } = await supabase
      .from('business_hours')
      .update({
        open_time: hour.open_time,
        close_time: hour.close_time,
        is_open: hour.is_open,
      })
      .eq('id', hour.id);

    if (error) return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function checkStoreOpen() {
  const supabase = await createClient();

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Domingo
  const currentTime = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Sao_Paulo',
  });

  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .eq('day_of_week', dayOfWeek)
    .single();

  if (error || !data) {
    return { isOpen: false, message: 'Não foi possível verificar o horário' };
  }

  if (!data.is_open) {
    return { isOpen: false, message: 'Estamos fechados hoje' };
  }

  const openTime = data.open_time.slice(0, 5);
  const closeTime = data.close_time.slice(0, 5);

  if (currentTime >= openTime && currentTime <= closeTime) {
    return { isOpen: true, message: `Aberto até ${closeTime}` };
  }

  return {
    isOpen: false,
    message: `Fechado agora · Abrimos às ${openTime}`,
  };
}
