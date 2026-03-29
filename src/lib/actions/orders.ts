'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { OrderStatus } from '@/lib/types';

export async function createOrder(data: {
  customer_name: string;
  customer_phone: string;
  address: string;
  payment_method: string;
  change_for: number | null;
  total: number;
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    observation: string | null;
  }[];
}) {
  const supabase = await createClient();

  // Inserir pedido
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      address: data.address,
      payment_method: data.payment_method,
      change_for: data.change_for,
      total: data.total,
      status: 'novo',
    })
    .select()
    .single();

  if (orderError || !order) {
    return { error: orderError?.message || 'Erro ao criar pedido' };
  }

  // Inserir itens do pedido
  const orderItems = data.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    observation: item.observation,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    return { error: itemsError.message };
  }

  revalidatePath('/admin');
  return { success: true, orderId: order.id };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function getOrders() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}
