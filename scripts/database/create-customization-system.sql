-- =====================================================
-- SISTEMA SIMPLIFICADO DE PERSONALIZAÇÃO
-- =====================================================
-- Criado em: 05/11/2024
-- Descrição: Sistema universal de personalização para qualquer categoria
-- =====================================================

-- Tabela: Configuração de personalização por categoria
CREATE TABLE IF NOT EXISTS category_customization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  
  -- Flags de ativação
  is_customizable BOOLEAN DEFAULT false,
  has_sizes BOOLEAN DEFAULT false,
  has_flavors BOOLEAN DEFAULT false,
  has_extras BOOLEAN DEFAULT false,
  
  -- Configurações de sabores
  max_flavors INTEGER DEFAULT 1, -- Máximo de sabores permitidos
  flavors_required BOOLEAN DEFAULT false, -- Sabor obrigatório?
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(category_id, restaurant_id)
);

-- Tabela: Tamanhos disponíveis
CREATE TABLE IF NOT EXISTS customization_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_customization_id UUID NOT NULL REFERENCES category_customization(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL, -- Ex: "Pequena", "Média", "Grande"
  description VARCHAR(255), -- Ex: "4 fatias", "6 fatias"
  price_multiplier DECIMAL(10,2) DEFAULT 1.0, -- Multiplicador do preço base (0.7, 1.0, 1.3)
  display_order INTEGER DEFAULT 0, -- Ordem de exibição
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: Sabores/Opções disponíveis
CREATE TABLE IF NOT EXISTS customization_flavors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_customization_id UUID NOT NULL REFERENCES category_customization(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL, -- Ex: "Calabresa", "Marguerita"
  price DECIMAL(10,2) NOT NULL, -- Preço do sabor
  description VARCHAR(255), -- Descrição opcional
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: Adicionais disponíveis
CREATE TABLE IF NOT EXISTS customization_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_customization_id UUID NOT NULL REFERENCES category_customization(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL, -- Ex: "Borda Catupiry", "Extra Bacon"
  price DECIMAL(10,2) NOT NULL, -- Preço adicional
  description VARCHAR(255), -- Descrição opcional
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_category_customization_category ON category_customization(category_id);
CREATE INDEX IF NOT EXISTS idx_category_customization_restaurant ON category_customization(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_customization_sizes_category ON customization_sizes(category_customization_id);
CREATE INDEX IF NOT EXISTS idx_customization_flavors_category ON customization_flavors(category_customization_id);
CREATE INDEX IF NOT EXISTS idx_customization_extras_category ON customization_extras(category_customization_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_customization_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_category_customization_updated_at
  BEFORE UPDATE ON category_customization
  FOR EACH ROW
  EXECUTE FUNCTION update_customization_updated_at();

CREATE TRIGGER update_customization_sizes_updated_at
  BEFORE UPDATE ON customization_sizes
  FOR EACH ROW
  EXECUTE FUNCTION update_customization_updated_at();

CREATE TRIGGER update_customization_flavors_updated_at
  BEFORE UPDATE ON customization_flavors
  FOR EACH ROW
  EXECUTE FUNCTION update_customization_updated_at();

CREATE TRIGGER update_customization_extras_updated_at
  BEFORE UPDATE ON customization_extras
  FOR EACH ROW
  EXECUTE FUNCTION update_customization_updated_at();

-- =====================================================
-- DADOS DE EXEMPLO (PIZZA)
-- =====================================================
-- Descomente para inserir dados de exemplo:

/*
-- 1. Buscar ID da categoria Pizzas (ajuste conforme necessário)
-- 2. Inserir configuração de personalização
INSERT INTO category_customization (category_id, restaurant_id, is_customizable, has_sizes, has_flavors, has_extras, max_flavors, flavors_required)
VALUES (
  'SEU_CATEGORY_ID_AQUI',
  'SEU_RESTAURANT_ID_AQUI',
  true, -- personalizável
  true, -- tem tamanhos
  true, -- tem sabores
  true, -- tem extras
  2,    -- máximo 2 sabores
  true  -- sabor obrigatório
);

-- 3. Inserir tamanhos
INSERT INTO customization_sizes (category_customization_id, name, description, price_multiplier, display_order)
VALUES
  ('ID_DA_CUSTOMIZATION', 'Pequena', '4 fatias', 0.7, 1),
  ('ID_DA_CUSTOMIZATION', 'Média', '6 fatias', 1.0, 2),
  ('ID_DA_CUSTOMIZATION', 'Grande', '8 fatias', 1.3, 3),
  ('ID_DA_CUSTOMIZATION', 'Gigante', '12 fatias', 1.6, 4);

-- 4. Inserir sabores
INSERT INTO customization_flavors (category_customization_id, name, price, display_order)
VALUES
  ('ID_DA_CUSTOMIZATION', 'Calabresa', 35.00, 1),
  ('ID_DA_CUSTOMIZATION', 'Marguerita', 32.00, 2),
  ('ID_DA_CUSTOMIZATION', 'Portuguesa', 38.00, 3),
  ('ID_DA_CUSTOMIZATION', '4 Queijos', 36.00, 4),
  ('ID_DA_CUSTOMIZATION', 'Frango c/ Catupiry', 37.00, 5);

-- 5. Inserir adicionais
INSERT INTO customization_extras (category_customization_id, name, price, display_order)
VALUES
  ('ID_DA_CUSTOMIZATION', 'Borda Catupiry', 5.00, 1),
  ('ID_DA_CUSTOMIZATION', 'Borda Cheddar', 5.00, 2),
  ('ID_DA_CUSTOMIZATION', 'Extra Bacon', 4.00, 3),
  ('ID_DA_CUSTOMIZATION', 'Extra Queijo', 3.00, 4);
*/

-- =====================================================
-- CONSULTAS ÚTEIS
-- =====================================================

-- Ver todas as personalizações de um restaurante
/*
SELECT 
  c.name as category_name,
  cc.is_customizable,
  cc.has_sizes,
  cc.has_flavors,
  cc.has_extras,
  cc.max_flavors
FROM category_customization cc
JOIN categories c ON c.id = cc.category_id
WHERE cc.restaurant_id = 'SEU_RESTAURANT_ID';
*/

-- Ver tamanhos de uma categoria
/*
SELECT name, description, price_multiplier
FROM customization_sizes
WHERE category_customization_id = 'ID_DA_CUSTOMIZATION'
ORDER BY display_order;
*/

-- Ver sabores de uma categoria
/*
SELECT name, price
FROM customization_flavors
WHERE category_customization_id = 'ID_DA_CUSTOMIZATION'
ORDER BY display_order;
*/

-- Ver adicionais de uma categoria
/*
SELECT name, price
FROM customization_extras
WHERE category_customization_id = 'ID_DA_CUSTOMIZATION'
ORDER BY display_order;
*/
