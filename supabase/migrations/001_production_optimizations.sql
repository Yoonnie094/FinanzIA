-- Archivo: 001_production_optimizations.sql
-- Instrucciones: Copia y pega todo este código en el SQL Editor de tu panel de Supabase y ejecútalo (Run).

-- 1. Tabla de Rate Limits (Si no existe y añadir índice único para atomicidad)
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  window_start TIMESTAMP NOT NULL,
  request_count INT NOT NULL DEFAULT 1
);

-- Aseguramos que exista la restricción única (ignora error si ya existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rate_limits_user_id_window_start_key') THEN
        ALTER TABLE rate_limits ADD CONSTRAINT rate_limits_user_id_window_start_key UNIQUE (user_id, window_start);
    END IF;
END $$;


-- 2. Función Atómica para Rate Limiting (Evita Race Conditions)
CREATE OR REPLACE FUNCTION increment_rate_limit(p_user_id UUID, p_window_start TIMESTAMP)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT;
BEGIN
  INSERT INTO rate_limits (user_id, window_start, request_count)
  VALUES (p_user_id, p_window_start, 1)
  ON CONFLICT (user_id, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1
  RETURNING request_count INTO v_count;
  
  RETURN v_count;
END;
$$;


-- 3. Función de Resumen de Dashboard (Procesa datos masivos en el backend)
CREATE OR REPLACE FUNCTION get_dashboard_summary(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_income NUMERIC := 0;
  v_total_expenses NUMERIC := 0;
  v_monthly_income NUMERIC := 0;
  v_monthly_expenses NUMERIC := 0;
  v_current_month TIMESTAMP := date_trunc('month', now());
  v_category_breakdown JSON;
  v_monthly_trend JSON;
BEGIN
  -- Totales Globales
  SELECT 
    COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0),
    COALESCE(SUM(ABS(amount)) FILTER (WHERE type = 'expense'), 0)
  INTO v_total_income, v_total_expenses
  FROM transactions
  WHERE user_id = p_user_id;

  -- Totales del Mes Actual
  SELECT 
    COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0),
    COALESCE(SUM(ABS(amount)) FILTER (WHERE type = 'expense'), 0)
  INTO v_monthly_income, v_monthly_expenses
  FROM transactions
  WHERE user_id = p_user_id AND date >= v_current_month;

  -- Desglose por Categoría (Mes actual)
  SELECT COALESCE(json_agg(row_to_json(cat)), '[]'::json) INTO v_category_breakdown
  FROM (
    SELECT COALESCE(category, 'Otros') as category, SUM(ABS(amount)) as amount
    FROM transactions
    WHERE user_id = p_user_id AND type = 'expense' AND date >= v_current_month
    GROUP BY COALESCE(category, 'Otros')
    ORDER BY amount DESC
    LIMIT 5
  ) cat;

  -- Tendencia Mensual (Últimos 6 meses)
  SELECT COALESCE(json_agg(row_to_json(trend)), '[]'::json) INTO v_monthly_trend
  FROM (
    SELECT 
      EXTRACT(MONTH FROM date) as month_index,
      EXTRACT(YEAR FROM date) as year_val,
      date_trunc('month', date) as sort_date,
      COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0) as income,
      COALESCE(SUM(ABS(amount)) FILTER (WHERE type = 'expense'), 0) as expenses
    FROM transactions
    WHERE user_id = p_user_id AND date >= date_trunc('month', now() - interval '5 months')
    GROUP BY date_trunc('month', date), EXTRACT(MONTH FROM date), EXTRACT(YEAR FROM date)
    ORDER BY sort_date ASC
  ) trend;

  RETURN json_build_object(
    'balance', v_total_income - v_total_expenses,
    'monthlyIncome', v_monthly_income,
    'monthlyExpenses', v_monthly_expenses,
    'categoryBreakdown', v_category_breakdown,
    'monthlyTrend', v_monthly_trend
  );
END;
$$;
