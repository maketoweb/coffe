-- ============================================================================
-- Fix multi-sucursal:
--   La base de produccion se creo sin estas columnas (solo estan en
--   schema_definitivo.sql), por eso al crear una sucursal el upsert de
--   store_config fallaba silenciosamente y el cliente nunca veia las
--   sucursales ni el selector de "Enviar pedido a".
-- ============================================================================
SET search_path = public;

ALTER TABLE public.store_config
  ADD COLUMN IF NOT EXISTS sedes JSONB DEFAULT '[]'::JSONB;

ALTER TABLE public.store_config
  ADD COLUMN IF NOT EXISTS multi_sucursal_enabled BOOLEAN DEFAULT FALSE;