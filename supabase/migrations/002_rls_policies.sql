-- Archivo: 002_rls_policies.sql
-- Propósito: Implementación global de Row Level Security (RLS) para aislamiento de inquilinos.
-- Instrucciones: Ejecutar este script en el editor SQL de Supabase en el entorno de Producción.

-- 1. Habilitar RLS en TODAS las tablas identificadas
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS insights_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS error_auditoria ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. POLÍTICAS PARA: profiles
-- ==========================================
-- Condición estricta: auth.uid() debe coincidir con la Primary Key (id)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ==========================================
-- 3. POLÍTICAS PARA: ENTIDADES FINANCIERAS (Ownership basado en user_id)
-- ==========================================
-- Condición estricta: user_id = auth.uid()

-- Tabla: businesses
DROP POLICY IF EXISTS "Users can manage their own businesses" ON businesses;
CREATE POLICY "Users can manage their own businesses"
  ON businesses FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tabla: transactions
DROP POLICY IF EXISTS "Users can manage their own transactions" ON transactions;
CREATE POLICY "Users can manage their own transactions"
  ON transactions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tabla: inventory
DROP POLICY IF EXISTS "Users can manage their own inventory" ON inventory;
CREATE POLICY "Users can manage their own inventory"
  ON inventory FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tabla: financial_goals
DROP POLICY IF EXISTS "Users can manage their own financial goals" ON financial_goals;
CREATE POLICY "Users can manage their own financial goals"
  ON financial_goals FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tabla: chat_messages
DROP POLICY IF EXISTS "Users can manage their own chat history" ON chat_messages;
CREATE POLICY "Users can manage their own chat history"
  ON chat_messages FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tabla: insights_cache
DROP POLICY IF EXISTS "Users can view and manage their insights" ON insights_cache;
CREATE POLICY "Users can view and manage their insights"
  ON insights_cache FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tabla: rate_limits
DROP POLICY IF EXISTS "Users can manage their rate limits" ON rate_limits;
CREATE POLICY "Users can manage their rate limits"
  ON rate_limits FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 4. POLÍTICAS PARA: error_auditoria
-- ==========================================
-- Permitir solo INSERT al rol público/anon/authenticated.
-- Nadie puede hacer SELECT, UPDATE o DELETE desde el cliente web.
-- Solo Supabase Admins (service_role) podrán leer esta tabla para monitoreo.
DROP POLICY IF EXISTS "Anyone can insert errors" ON error_auditoria;
CREATE POLICY "Anyone can insert errors"
  ON error_auditoria FOR INSERT
  TO public
  WITH CHECK (true);

-- ==========================================
-- NOTA DE SEGURIDAD:
-- El rol 'service_role' de Supabase (usado por el cliente de servidor seguro o Supabase Studio)
-- esquiva (bypasses) el RLS por defecto. Es seguro utilizarlo para tareas CRON o administrativas,
-- siempre que no se exponga la ANON_KEY para este tipo de operaciones.
