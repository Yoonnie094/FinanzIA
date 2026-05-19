-- Archivo: 003_production_hardening.sql
-- Propósito: Optimización de rendimiento mediante índices compuestos, persistencia avanzada de historial (parts) y endurecimiento de seguridad RLS de Rate Limit.
-- Instrucciones: Ejecutar este script en el editor SQL de Supabase en el entorno de Producción.

-- 1. PERSISTENCIA DE TURNOS CONTOOL CALLING
-- Añadimos la columna 'parts' a la tabla 'chat_messages' para almacenar la estructura completa de mensajes de Vercel AI SDK
ALTER TABLE IF EXISTS chat_messages 
ADD COLUMN IF NOT EXISTS parts JSONB DEFAULT NULL;


-- 2. CREACIÓN DE ÍNDICES COMPUESTOS PARA ALTO RENDIMIENTO
-- Optimiza búsquedas en historial de chat y generación de resúmenes semánticos
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created 
ON chat_messages (user_id, created_at ASC);

-- Optimiza búsquedas y validaciones en caché analítico e insights
CREATE INDEX IF NOT EXISTS idx_insights_cache_user_type 
ON insights_cache (user_id, type);


-- 3. ENDURECIMIENTO DE SEGURIDAD EN RATE LIMITS (MITIGACIÓN OWASP)
-- Eliminamos la política permisiva anterior que permitía a los clientes borrar sus contadores
DROP POLICY IF EXISTS "Users can manage their rate limits" ON rate_limits;

-- Permitimos ÚNICAMENTE lectura (SELECT) al cliente autenticado para verificar su consumo.
-- La inserción y el incremento atómico se seguirán realizando mediante la función RPC 'increment_rate_limit', 
-- la cual corre con privilegios elevados de creador (SECURITY DEFINER) evadiendo RLS en el kernel,
-- pero impidiendo que los atacantes borren filas a través de la API REST de Supabase Client.
CREATE POLICY "Users can view their own rate limits"
  ON rate_limits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
