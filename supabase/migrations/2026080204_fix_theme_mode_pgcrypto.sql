-- ============================================================================
-- Correcciones de base de datos:
--  1) Habilitar pgcrypto (gen_random_uuid / gen_random_bytes) para ids y triggers
--     de notificaciones. Sin esto, el PATCH de orders falla con 42883
--     "function gen_random_bytes(integer) does not exist".
--  2) Agregar la columna "theme_mode" a store_config (el esquema la usaba
--     pero la tabla no la tenia -> error "Could not find the 'theme_mode' column").
-- ============================================================================
SET search_path = public;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE IF EXISTS public.store_config
  ADD COLUMN IF NOT EXISTS theme_mode VARCHAR(10) DEFAULT 'light';