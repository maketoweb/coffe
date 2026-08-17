-- ============================================================================
-- Add 'customer' role to admin panel
-- Customers can manage orders, products, promotions, notifications, reports
-- but CANNOT access store personalization, roles, or settings
-- ============================================================================

-- 1. Update CHECK constraint to include 'customer'
ALTER TABLE public.admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;
ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_role_check
  CHECK (role IN ('admin', 'operator', 'customer'));

-- 2. Helper function: is_customer()
CREATE OR REPLACE FUNCTION public.is_customer()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users a
    WHERE a.id::text = auth.uid()::text
      AND a.active = true
      AND a.role = 'customer'
  );
$$;

-- 3. Update is_operator() to also include customers (customers have same read access)
CREATE OR REPLACE FUNCTION public.is_operator()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users a
    WHERE a.id::text = auth.uid()::text
      AND a.active = true
      AND a.role IN ('admin', 'operator', 'customer')
  );
$$;

-- 4. Anti-spam notifications: customers CAN also broadcast (same as admin/operator)
DROP POLICY IF EXISTS "notifications_insert_guardada" ON public.notifications;
CREATE POLICY "notifications_insert_guardada" ON public.notifications
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    public.is_admin_or_operator()
    OR public.is_customer()
    OR tipo IN ('personal', 'request')
  );

-- 5. Note: store_config, admin_users RLS policies remain admin/operator only
--    Customers cannot modify store configuration or manage roles
--    This is enforced at the application level (section filtering in admin/index.tsx)
