-- 1. Bairros para Taxa de Entrega
CREATE TABLE delivery_neighborhoods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Grupos de Adicionais (Addon Groups) p/ Produtos
CREATE TABLE addon_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  is_mandatory BOOLEAN DEFAULT false,
  max_choices INT DEFAULT 1,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Opções de Adicionais (Addon Items)
CREATE TABLE addon_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  addon_group_id UUID REFERENCES addon_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Modificar tabelas existentes
ALTER TABLE order_items ADD COLUMN addons JSONB DEFAULT '[]'::jsonb;
ALTER TABLE orders ADD COLUMN neighborhood TEXT;
ALTER TABLE orders ADD COLUMN delivery_fee NUMERIC(10,2) DEFAULT 0;

-- RLS
ALTER TABLE delivery_neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE addon_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE addon_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read delivery_neighborhoods" ON delivery_neighborhoods FOR SELECT USING (true);
CREATE POLICY "Public read addon_groups" ON addon_groups FOR SELECT USING (true);
CREATE POLICY "Public read addon_items" ON addon_items FOR SELECT USING (true);

CREATE POLICY "Admin full access delivery_neighborhoods" ON delivery_neighborhoods FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access addon_groups" ON addon_groups FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access addon_items" ON addon_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Inserir os bairros de Macapá / áreas especificadas
INSERT INTO delivery_neighborhoods (name, fee) VALUES 
('Centro', 5.00),
('Cidade Nova', 5.00),
('Nossa Senhora das Graças', 5.00),
('Nossa Senhora de Fátima', 5.00),
('Nossa Senhora do Perpétuo Socorro', 5.00),
('Santa Luzia', 5.00),
('Santa Terezinha', 5.00),
('São José Operário', 5.00),
('São Lázaro', 5.00),
('São Pedro', 5.00),
('Residencial Tia Ana', 5.00);
