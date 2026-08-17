-- ============================================================================
-- Correccion de "permission denied" en tablas publicas.
-- RLS estaba habilitado con policies publicas, pero el rol `anon` no tenia
-- GRANT a nivel de tabla para estas lecturas/escrituras publicas:
--   promotions, product_reviews, flash_sales, reward_catalog, loyalty_transactions
-- ============================================================================
SET search_path = public;

-- Lecturas publicas (las policies SELECT existentes ya filtran el acceso por fila).
GRANT SELECT ON public.promotions TO anon;
GRANT SELECT ON public.flash_sales TO anon;
GRANT SELECT ON public.reward_catalog TO anon;
GRANT SELECT ON public.product_reviews TO anon;
GRANT SELECT ON public.loyalty_transactions TO anon;

-- Escritura public de resenas de clientes (policy reviews_insert_anon ya existe).
GRANT INSERT ON public.product_reviews TO anon;

-- Asegurar los permisos completos para el rol autenticado (admin/operador/cliente logueado).
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flash_sales TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reward_catalog TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loyalty_transactions TO authenticated;