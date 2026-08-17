-- ============================================================================
-- Multi-sucursal: credenciales por sucursal para el panel de administración.
-- Agrega a admin_users el vínculo a una sede (sucursal).
--   - role = 'admin'  -> sede_id vacío = ve TODAS las tiendas.
--   - role = 'operator' + sede_id = ve SOLO esa sucursal (pedidos / panel / rastreo).
-- ============================================================================
SET search_path = public;

ALTER TABLE IF EXISTS public.admin_users
  ADD COLUMN IF NOT EXISTS sede_id TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_admin_users_sede ON public.admin_users(sede_id)
  WHERE sede_id IS NOT NULL AND sede_id != '';