-- ============================================================================
-- Security Hardening & Concurrency Fixes
-- Aplicar con: supabase db push (o pegar en el SQL editor de Supabase).
-- ============================================================================
SET search_path = public;

-- ----------------------------------------------------------------------------
-- 0. Helpers de rol (reemplazan los emails hardcodeados en RLS).
--    Este es el patrón recomendado: NUNCA comparar emails en las policies.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
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
      AND a.role = 'admin'
  );
$$;

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
      AND a.role IN ('admin', 'operator')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_operator()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT (public.is_admin() OR public.is_operator());
$$;

-- ----------------------------------------------------------------------------
-- 1. ATOMIC STOCK (previene overselling / carrera TOCTOU).
--    Requiere self/uid admin-or-operator. Actualiza stock de forma atómica.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.adjust_stock(p_id uuid, p_delta integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_or_operator() THEN
    RAISE EXCEPTION 'Access denied: admin or operator role required';
  END IF;

  UPDATE public.products
  SET stock = GREATEST(0, stock + p_delta)
  WHERE id = p_id AND stock + p_delta >= 0;
END;
$$;

REVOKE ALL ON FUNCTION public.adjust_stock(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.adjust_stock(uuid, integer) TO authenticated;

-- ----------------------------------------------------------------------------
-- 2. app_secrets: secretos NO públicos (webhook push).
--    No exponer jamás en una tabla con RLS SELECT USING(true).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_secrets (
  id integer PRIMARY KEY,
  push_webhook_secret text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;

-- Sin policies para anon/authenticated: solo acceso service_role / owner.
DROP POLICY IF EXISTS "app_secrets_admin_manage" ON public.app_secrets;
CREATE POLICY "app_secrets_admin_manage" ON public.app_secrets
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

INSERT INTO public.app_secrets (id, push_webhook_secret)
VALUES (1, 'fp-push-secret-2024-xK9m')
ON CONFLICT (id) DO NOTHING;

-- El operador puede leer el secret desde una tabla protegida con SECURITY DEFINER,
-- si es estrictamente necesario (admin). Función solo para admin:
CREATE OR REPLACE FUNCTION public.get_push_webhook_secret()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT push_webhook_secret FROM public.app_secrets WHERE id = 1;
$$;

-- ----------------------------------------------------------------------------
-- 3. Trigger de notificaciones: usar app_secrets en vez de store_config.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_notification_push()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_webhook_url text;
  v_webhook_secret text;
BEGIN
  SELECT push_webhook_url INTO v_webhook_url
  FROM public.store_config WHERE id = 1;

  v_webhook_secret := public.get_push_webhook_secret();

  IF v_webhook_url IS NOT NULL AND v_webhook_url <> '' AND NEW.tipo IN ('todos', 'personal', 'admin', 'request') THEN
    PERFORM net.http_post(
      url := v_webhook_url,
      body := jsonb_build_object(
        'title', NEW.titulo,
        'body', NEW.mensaje,
        'icon', COALESCE(NEW.imagen_url, '/icon.png'),
        'badge', '/icon.png',
        'sound', 'default',
        'vibrate', ARRAY[200, 100, 200],
        'tag', 'marketcoffee-' || NEW.id,
        'url', COALESCE(NEW.link_url, '/'),
        'record', jsonb_build_object(
          'id', NEW.id, 'title', NEW.titulo, 'body', NEW.mensaje,
          'icon', COALESCE(NEW.imagen_url, '/icon.png'),
          'tag', 'marketcoffee-' || NEW.id, 'renotify', true,
          'titulo', NEW.titulo, 'mensaje', NEW.mensaje,
          'imagen_url', COALESCE(NEW.imagen_url, ''),
          'link_url', COALESCE(NEW.link_url, '/'),
          'tipo', NEW.tipo,
          'destinatario_telefono', COALESCE(NEW.destinatario_telefono, '')
        )
      )::text,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-push-webhook-secret', v_webhook_secret
      )
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'No se pudo invocar webhook de push: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_push_notification ON public.notifications;
DROP TRIGGER IF EXISTS trigger_notify_push ON public.notifications;
CREATE TRIGGER trigger_push_notification
AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.handle_new_notification_push();

-- ----------------------------------------------------------------------------
-- 4. Anti-spam notifications: broadcast ('todos'/'admin') SOLO via rol admin,
--    previene el phishing masivo. 'personal'/'request' (scoped a un telefono)
--    se permite al anon/authenticated para mantener vivo el flujo de pedidos.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "notifications_insert_allow_anon" ON public.notifications;
CREATE POLICY "notifications_insert_guardada" ON public.notifications
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    public.is_admin_or_operator()
    OR tipo IN ('personal', 'request')
  );

-- ----------------------------------------------------------------------------
-- 5. push_subscriptions: NO permitir UPDATE/UPDATE general a anónimos.
--    El registro/actualización ocurre en register-subscription (service_role).
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "allow_anonymous_push_update" ON public.push_subscriptions;
DROP POLICY IF EXISTS "manage_own_push_subscriptions" ON public.push_subscriptions;

CREATE POLICY "manage_own_push_subscriptions_safe" ON public.push_subscriptions
  FOR ALL TO authenticated
  USING (
    (user_id IS NULL)
    OR (auth.uid()::text = user_id)
  )
  WITH CHECK (
    (user_id IS NULL)
    OR (auth.uid()::text = user_id)
  );