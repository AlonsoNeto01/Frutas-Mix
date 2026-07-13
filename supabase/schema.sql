-- ============================================
-- Frutas Mix — Schema SQL Completo
-- ============================================

-- Tabela de categorias
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de produtos
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_highlight BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Horários de funcionamento
CREATE TABLE business_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME NOT NULL DEFAULT '08:00',
  close_time TIME NOT NULL DEFAULT '22:00',
  is_open BOOLEAN DEFAULT true,
  UNIQUE(day_of_week)
);

-- Pedidos
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  neighborhood TEXT,
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'cartao', 'dinheiro')),
  change_for NUMERIC(10,2),
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'preparando', 'entrega', 'concluido')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Itens do pedido
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  observation TEXT,
  addons JSONB DEFAULT '[]'::jsonb
);

-- Configurações da loja
CREATE TABLE store_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_name TEXT NOT NULL DEFAULT 'Frutas Mix',
  whatsapp_number TEXT,
  logo_url TEXT,
  cover_url TEXT,
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bairros para Taxa de Entrega
CREATE TABLE delivery_neighborhoods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Grupos de Adicionais (Addon Groups) p/ Produtos
CREATE TABLE addon_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  is_mandatory BOOLEAN DEFAULT false,
  max_choices INT DEFAULT 1,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Opções de Adicionais (Addon Items)
CREATE TABLE addon_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  addon_group_id UUID REFERENCES addon_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Seed: Horários de funcionamento (7 dias)
-- ============================================
INSERT INTO business_hours (day_of_week, open_time, close_time, is_open)
VALUES
  (0, '08:00', '22:00', false),  -- Domingo
  (1, '08:00', '22:00', true),   -- Segunda
  (2, '08:00', '22:00', true),   -- Terça
  (3, '08:00', '22:00', true),   -- Quarta
  (4, '08:00', '22:00', true),   -- Quinta
  (5, '08:00', '22:00', true),   -- Sexta
  (6, '08:00', '22:00', true);   -- Sábado

-- ============================================
-- Seed: Categorias
-- ============================================
INSERT INTO categories (id, name, sort_order) VALUES
  ('a1000000-0000-0000-0000-000000000001', '🥤 Copos Tropicais', 1),
  ('a1000000-0000-0000-0000-000000000002', '🍍 Frutas Temperadas', 2),
  ('a1000000-0000-0000-0000-000000000003', '🧃 Sucos Naturais', 3),
  ('a1000000-0000-0000-0000-000000000004', '🍮 Pudim', 4);

-- ============================================
-- Seed: Produtos
-- ============================================

-- Copos Tropicais (cliente escolhe até 5 frutas)
INSERT INTO products (id, name, description, price, category_id, is_highlight) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Copo Tropical — Pote 250ml', 'Monte seu pote com até 5 frutas frescas cortadas. Frete: R$ 3,00.', 10.00, 'a1000000-0000-0000-0000-000000000001', false),
  ('b1000000-0000-0000-0000-000000000002', 'Copo Tropical — Copo 550ml', 'Monte seu copo com até 5 frutas frescas cortadas. Frete grátis!', 20.00, 'a1000000-0000-0000-0000-000000000001', true);

-- Frutas Temperadas (copo 550ml, com temperos)
INSERT INTO products (id, name, description, price, category_id, is_highlight) VALUES
  ('b1000000-0000-0000-0000-000000000003', 'Abacaxi Temperado', 'Abacaxi cortado em copo 550ml. Escolha seus temperos! Frete grátis.', 20.00, 'a1000000-0000-0000-0000-000000000002', false),
  ('b1000000-0000-0000-0000-000000000004', 'Manga Temperada', 'Manga cortada em copo 550ml. Escolha seus temperos! Frete grátis.', 20.00, 'a1000000-0000-0000-0000-000000000002', false),
  ('b1000000-0000-0000-0000-000000000005', 'Melancia Temperada', 'Melancia cortada em copo 550ml. Escolha seus temperos! Frete grátis.', 20.00, 'a1000000-0000-0000-0000-000000000002', false);

-- Sucos Naturais (1 litro)
INSERT INTO products (id, name, description, price, category_id) VALUES
  ('b1000000-0000-0000-0000-000000000006', 'Suco de Mamão', 'Suco natural de 1 litro. Frete grátis!', 15.00, 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000007', 'Suco de Banana', 'Suco natural de 1 litro. Frete grátis!', 15.00, 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000008', 'Suco de Melancia', 'Suco natural de 1 litro. Frete grátis!', 15.00, 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000009', 'Suco de Morango', 'Suco natural de 1 litro. Frete grátis!', 15.00, 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000010', 'Suco de Melão', 'Suco natural de 1 litro. Frete grátis!', 15.00, 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000011', 'Suco de Uva', 'Suco natural de 1 litro. Frete grátis!', 15.00, 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000012', 'Suco de Kiwi', 'Suco natural de 1 litro. Frete grátis!', 15.00, 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000013', 'Suco de Manga', 'Suco natural de 1 litro. Frete grátis!', 15.00, 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000014', 'Suco de Goiaba', 'Suco natural de 1 litro. Frete grátis!', 15.00, 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000015', 'Suco de Abacaxi', 'Suco natural de 1 litro. Frete grátis!', 15.00, 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000016', 'Suco de Abacaxi com Hortelã', 'Suco natural de abacaxi com hortelã, 1 litro. Frete grátis! 🌿', 15.00, 'a1000000-0000-0000-0000-000000000003');

-- Pudim
INSERT INTO products (id, name, description, price, category_id) VALUES
  ('b1000000-0000-0000-0000-000000000017', 'Pudim Pequeno', 'Pudim caseiro — porção individual.', 8.00, 'a1000000-0000-0000-0000-000000000004'),
  ('b1000000-0000-0000-0000-000000000018', 'Pudim Inteiro', 'Pudim caseiro — tamanho família.', 30.00, 'a1000000-0000-0000-0000-000000000004');

-- ============================================
-- Seed: Addon Groups + Items
-- ============================================

-- Grupo: Frutas para o Copo Tropical — Pote 250ml
INSERT INTO addon_groups (id, name, is_mandatory, max_choices, product_id, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Escolha suas Frutas (até 5)', true, 5, 'b1000000-0000-0000-0000-000000000001', 1);

INSERT INTO addon_items (addon_group_id, name, price, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Mamão', 0, 1),
  ('c1000000-0000-0000-0000-000000000001', 'Banana', 0, 2),
  ('c1000000-0000-0000-0000-000000000001', 'Melancia', 0, 3),
  ('c1000000-0000-0000-0000-000000000001', 'Morango', 0, 4),
  ('c1000000-0000-0000-0000-000000000001', 'Melão', 0, 5),
  ('c1000000-0000-0000-0000-000000000001', 'Uva', 0, 6),
  ('c1000000-0000-0000-0000-000000000001', 'Kiwi', 0, 7),
  ('c1000000-0000-0000-0000-000000000001', 'Manga', 0, 8),
  ('c1000000-0000-0000-0000-000000000001', 'Goiaba', 0, 9),
  ('c1000000-0000-0000-0000-000000000001', 'Abacaxi', 0, 10);

-- Grupo: Frutas para o Copo Tropical — Copo 550ml
INSERT INTO addon_groups (id, name, is_mandatory, max_choices, product_id, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000002', 'Escolha suas Frutas (até 5)', true, 5, 'b1000000-0000-0000-0000-000000000002', 1);

INSERT INTO addon_items (addon_group_id, name, price, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000002', 'Mamão', 0, 1),
  ('c1000000-0000-0000-0000-000000000002', 'Banana', 0, 2),
  ('c1000000-0000-0000-0000-000000000002', 'Melancia', 0, 3),
  ('c1000000-0000-0000-0000-000000000002', 'Morango', 0, 4),
  ('c1000000-0000-0000-0000-000000000002', 'Melão', 0, 5),
  ('c1000000-0000-0000-0000-000000000002', 'Uva', 0, 6),
  ('c1000000-0000-0000-0000-000000000002', 'Kiwi', 0, 7),
  ('c1000000-0000-0000-0000-000000000002', 'Manga', 0, 8),
  ('c1000000-0000-0000-0000-000000000002', 'Goiaba', 0, 9),
  ('c1000000-0000-0000-0000-000000000002', 'Abacaxi', 0, 10);

-- Grupo: Temperos para Abacaxi Temperado
INSERT INTO addon_groups (id, name, is_mandatory, max_choices, product_id, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000003', 'Temperos', false, 6, 'b1000000-0000-0000-0000-000000000003', 1);

INSERT INTO addon_items (addon_group_id, name, price, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000003', 'Sal', 0, 1),
  ('c1000000-0000-0000-0000-000000000003', 'Limão', 0, 2),
  ('c1000000-0000-0000-0000-000000000003', 'Cominho', 0, 3),
  ('c1000000-0000-0000-0000-000000000003', 'Canela', 0, 4),
  ('c1000000-0000-0000-0000-000000000003', 'Páprica', 0, 5),
  ('c1000000-0000-0000-0000-000000000003', 'Pimenta Calabresa', 0, 6);

-- Grupo: Temperos para Manga Temperada
INSERT INTO addon_groups (id, name, is_mandatory, max_choices, product_id, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000004', 'Temperos', false, 6, 'b1000000-0000-0000-0000-000000000004', 1);

INSERT INTO addon_items (addon_group_id, name, price, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000004', 'Sal', 0, 1),
  ('c1000000-0000-0000-0000-000000000004', 'Limão', 0, 2),
  ('c1000000-0000-0000-0000-000000000004', 'Cominho', 0, 3),
  ('c1000000-0000-0000-0000-000000000004', 'Canela', 0, 4),
  ('c1000000-0000-0000-0000-000000000004', 'Páprica', 0, 5),
  ('c1000000-0000-0000-0000-000000000004', 'Pimenta Calabresa', 0, 6);

-- Grupo: Temperos para Melancia Temperada
INSERT INTO addon_groups (id, name, is_mandatory, max_choices, product_id, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000005', 'Temperos', false, 6, 'b1000000-0000-0000-0000-000000000005', 1);

INSERT INTO addon_items (addon_group_id, name, price, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000005', 'Sal', 0, 1),
  ('c1000000-0000-0000-0000-000000000005', 'Limão', 0, 2),
  ('c1000000-0000-0000-0000-000000000005', 'Cominho', 0, 3),
  ('c1000000-0000-0000-0000-000000000005', 'Canela', 0, 4),
  ('c1000000-0000-0000-0000-000000000005', 'Páprica', 0, 5),
  ('c1000000-0000-0000-0000-000000000005', 'Pimenta Calabresa', 0, 6);

-- ============================================
-- Seed: Configurações da loja
-- ============================================
INSERT INTO store_settings (store_name) VALUES ('Frutas Mix');

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE addon_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE addon_items ENABLE ROW LEVEL SECURITY;

-- Leitura pública (anon) para vitrine
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read business_hours" ON business_hours FOR SELECT USING (true);
CREATE POLICY "Public read store_settings" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Public read delivery_neighborhoods" ON delivery_neighborhoods FOR SELECT USING (true);
CREATE POLICY "Public read addon_groups" ON addon_groups FOR SELECT USING (true);
CREATE POLICY "Public read addon_items" ON addon_items FOR SELECT USING (true);

-- Clientes (anon) podem criar e ler pedidos
CREATE POLICY "Anon can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon can read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Anon can insert order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon can read order_items" ON order_items FOR SELECT USING (true);

-- Admin (authenticated) pode tudo
CREATE POLICY "Admin full access categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access business_hours" ON business_hours FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access order_items" ON order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access store_settings" ON store_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access delivery_neighborhoods" ON delivery_neighborhoods FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access addon_groups" ON addon_groups FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access addon_items" ON addon_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Habilitar Realtime para pedidos
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
