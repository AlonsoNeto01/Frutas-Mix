-- ============================================
-- Migration: RLS SELECT policies for anon users
-- Permite que clientes anônimos consultem seus pedidos (tracking page)
-- ============================================

-- Clientes anônimos podem ler pedidos (necessário para /order/[id])
CREATE POLICY "Anon can read orders" ON orders FOR SELECT USING (true);

-- Clientes anônimos podem ler itens de pedidos (necessário para exibir resumo)
CREATE POLICY "Anon can read order_items" ON order_items FOR SELECT USING (true);
