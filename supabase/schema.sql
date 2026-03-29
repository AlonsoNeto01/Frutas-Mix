-- ============================================
-- LancheFlow — Schema SQL
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
  observation TEXT
);

-- ============================================
-- Seed: Inserir os 7 dias da semana
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

-- Seed: Categorias de exemplo
INSERT INTO categories (name, sort_order) VALUES
  ('🍔 Hambúrgueres', 1),
  ('🍕 Pizzas', 2),
  ('🌭 Hot Dogs', 3),
  ('🍟 Porções', 4),
  ('🥤 Bebidas', 5),
  ('🍰 Sobremesas', 6);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Leitura pública (anon) para vitrine
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read business_hours" ON business_hours FOR SELECT USING (true);

-- Clientes podem criar pedidos (anon)
CREATE POLICY "Anon can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon can insert order_items" ON order_items FOR INSERT WITH CHECK (true);

-- Admin (authenticated) pode tudo
CREATE POLICY "Admin full access categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access business_hours" ON business_hours FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access order_items" ON order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Admin can read order_items
CREATE POLICY "Admin read order_items" ON order_items FOR SELECT TO authenticated USING (true);

-- Habilitar Realtime para pedidos
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
