-- Índices para mejorar la latencia y rendimiento de FinanzIA en producción

-- 1. Index compuesto para transacciones (orden y filtros frecuentes)
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions (user_id, date DESC);

-- 2. Index compuesto para inventario (búsquedas y ordenamiento frecuente)
CREATE INDEX IF NOT EXISTS idx_inventory_user_name ON inventory (user_id, name);

-- 3. Index para metas financieras (filtrado por usuario)
CREATE INDEX IF NOT EXISTS idx_financial_goals_user ON financial_goals (user_id);

-- 4. Index para negocios (filtrado de perfil del usuario)
CREATE INDEX IF NOT EXISTS idx_businesses_user ON businesses (user_id);
