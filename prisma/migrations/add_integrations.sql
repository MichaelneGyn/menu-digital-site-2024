-- Migration: Adicionar suporte para integrações com plataformas de delivery
-- Data: 2024-11-09

-- Tabela de integrações configuradas
CREATE TABLE IF NOT EXISTS integrations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  restaurant_id TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'ifood', '99food', 'rappi', 'ubereats', 'aiqfome'
  display_name TEXT NOT NULL, -- Nome para exibir
  is_active BOOLEAN DEFAULT false,
  
  -- Credenciais (criptografadas)
  client_id TEXT,
  client_secret TEXT,
  api_key TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  
  -- Configurações específicas
  webhook_url TEXT,
  webhook_secret TEXT,
  store_id TEXT, -- ID da loja na plataforma
  merchant_id TEXT,
  
  -- Configurações de sincronização
  auto_accept_orders BOOLEAN DEFAULT false,
  auto_sync_menu BOOLEAN DEFAULT true,
  sync_interval_minutes INTEGER DEFAULT 15,
  
  -- Metadados
  last_sync_at TIMESTAMP,
  last_error TEXT,
  sync_status TEXT DEFAULT 'pending', -- 'pending', 'syncing', 'synced', 'error'
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  UNIQUE(restaurant_id, platform)
);

-- Tabela de pedidos externos (de plataformas)
CREATE TABLE IF NOT EXISTS external_orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  restaurant_id TEXT NOT NULL,
  integration_id TEXT NOT NULL,
  
  -- Identificação
  platform TEXT NOT NULL, -- 'ifood', '99food', etc
  external_order_id TEXT NOT NULL, -- ID do pedido na plataforma
  display_order_number TEXT, -- Número amigável (#1234)
  
  -- Dados do pedido (JSON completo)
  order_data JSONB NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled'
  platform_status TEXT, -- Status original da plataforma
  
  -- Cliente
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  
  -- Valores
  subtotal DECIMAL(10,2),
  delivery_fee DECIMAL(10,2),
  discount DECIMAL(10,2),
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Pagamento
  payment_method TEXT, -- 'online', 'cash', 'card'
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
  
  -- Entrega
  delivery_type TEXT, -- 'delivery', 'pickup'
  estimated_delivery_time TIMESTAMP,
  actual_delivery_time TIMESTAMP,
  
  -- Itens (denormalizado para queries rápidas)
  items_count INTEGER,
  items_summary TEXT, -- "2x Pizza, 1x Refrigerante"
  
  -- Sincronização
  last_synced_at TIMESTAMP,
  sync_error TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE,
  UNIQUE(integration_id, external_order_id)
);

-- Tabela de sincronização de produtos
CREATE TABLE IF NOT EXISTS product_sync (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  restaurant_id TEXT NOT NULL,
  integration_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  
  -- Mapeamento
  external_product_id TEXT, -- ID do produto na plataforma
  external_sku TEXT,
  
  -- Status de sincronização
  sync_status TEXT DEFAULT 'pending', -- 'pending', 'synced', 'error', 'disabled'
  last_sync_at TIMESTAMP,
  sync_error TEXT,
  
  -- Dados específicos da plataforma
  platform_data JSONB, -- Dados extras da plataforma
  
  -- Controle
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  UNIQUE(integration_id, product_id)
);

-- Tabela de logs de integração
CREATE TABLE IF NOT EXISTS integration_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  restaurant_id TEXT NOT NULL,
  integration_id TEXT,
  
  -- Tipo de evento
  event_type TEXT NOT NULL, -- 'order_received', 'order_updated', 'menu_synced', 'error', 'webhook'
  event_level TEXT DEFAULT 'info', -- 'info', 'warning', 'error'
  
  -- Detalhes
  message TEXT NOT NULL,
  details JSONB,
  
  -- Request/Response (para debug)
  request_data JSONB,
  response_data JSONB,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE
);

-- Tabela de webhooks recebidos (para auditoria)
CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  restaurant_id TEXT,
  integration_id TEXT,
  
  -- Identificação
  platform TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_id TEXT, -- ID único do evento (se fornecido)
  
  -- Dados
  payload JSONB NOT NULL,
  headers JSONB,
  
  -- Processamento
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP,
  processing_error TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_integrations_restaurant ON integrations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_integrations_platform ON integrations(platform);
CREATE INDEX IF NOT EXISTS idx_integrations_active ON integrations(is_active);

CREATE INDEX IF NOT EXISTS idx_external_orders_restaurant ON external_orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_external_orders_integration ON external_orders(integration_id);
CREATE INDEX IF NOT EXISTS idx_external_orders_status ON external_orders(status);
CREATE INDEX IF NOT EXISTS idx_external_orders_created ON external_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_external_orders_platform_id ON external_orders(platform, external_order_id);

CREATE INDEX IF NOT EXISTS idx_product_sync_restaurant ON product_sync(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_product_sync_integration ON product_sync(integration_id);
CREATE INDEX IF NOT EXISTS idx_product_sync_product ON product_sync(product_id);

CREATE INDEX IF NOT EXISTS idx_integration_logs_restaurant ON integration_logs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_integration ON integration_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created ON integration_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created ON webhook_events(created_at DESC);

-- Comentários
COMMENT ON TABLE integrations IS 'Configurações de integrações com plataformas de delivery';
COMMENT ON TABLE external_orders IS 'Pedidos recebidos de plataformas externas';
COMMENT ON TABLE product_sync IS 'Sincronização de produtos com plataformas';
COMMENT ON TABLE integration_logs IS 'Logs de eventos das integrações';
COMMENT ON TABLE webhook_events IS 'Webhooks recebidos das plataformas';
