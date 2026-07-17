-- Adicionar coluna de modo de acompanhamento de pedidos
-- 'tracking' = cliente acompanha status em tempo real na loja
-- 'whatsapp_only' = cliente só acompanha pelo WhatsApp
ALTER TABLE store_settings
  ADD COLUMN order_tracking_mode TEXT NOT NULL DEFAULT 'tracking'
  CHECK (order_tracking_mode IN ('tracking', 'whatsapp_only'));
