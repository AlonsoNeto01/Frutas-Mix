// ============================================
// Frutas Mix — Tipos TypeScript
// ============================================

export type OrderStatus = 'novo' | 'preparando' | 'entrega' | 'concluido';
export type PaymentMethod = 'pix' | 'cartao' | 'dinheiro';

export interface Category {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  is_highlight: boolean;
  is_active: boolean;
  has_free_shipping: boolean;
  created_at: string;
}

export interface AddonGroup {
  id: string;
  name: string;
  is_mandatory: boolean;
  max_choices: number;
  product_id: string;
  sort_order: number;
  created_at: string;
  items?: AddonItem[];
}

export interface AddonItem {
  id: string;
  addon_group_id: string;
  name: string;
  price: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

// Addon serializado (salvo como JSONB nos pedidos)
export interface SerializedAddon {
  id: string;
  name: string;
  price: number;
}

export interface DeliveryNeighborhood {
  id: string;
  name: string;
  fee: number;
  is_active: boolean;
  created_at: string;
}

export interface BusinessHours {
  id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_open: boolean;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  neighborhood: string | null;
  payment_method: PaymentMethod;
  change_for: number | null;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  observation: string | null;
  addons?: SerializedAddon[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  observation: string;
  addons: AddonItem[];
}

export interface StoreSettings {
  id: string;
  store_name: string;
  whatsapp_number: string | null;
  logo_url: string | null;
  cover_url: string | null;
  delivery_fee: number;
  order_tracking_mode: 'tracking' | 'whatsapp_only';
  created_at: string;
}

// Helpers para status labels
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  novo: 'Novo',
  preparando: 'Preparando',
  entrega: 'Saiu para Entrega',
  concluido: 'Concluído',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'Pix',
  cartao: 'Cartão',
  dinheiro: 'Dinheiro',
};

export const DAY_LABELS: string[] = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];
