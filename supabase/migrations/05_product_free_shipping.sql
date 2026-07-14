-- Adiciona campo de frete grátis por produto
ALTER TABLE products ADD COLUMN IF NOT EXISTS has_free_shipping BOOLEAN DEFAULT false;
