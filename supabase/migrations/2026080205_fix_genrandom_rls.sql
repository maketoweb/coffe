-- ============================================================================
-- Roll-up fix para la base en produccion. Sin esto:
--   1) El PATCH/UPDATE de orders falla con 42883
--      "function gen_random_bytes(integer) does not exist" (los triggers
--      handle_new_order_actions / handle_order_status_push_update la usan),
--      y al lanzar la excepcion se omiten efectos colaterales importantes
--      como la REVERSION de puntos de fidelidad al cancelar un pedido.
--   2) Los broadcasts de notificaciones ('todos'/'admin') fallan en el panel
--      admin por RLS aunque el operador este autenticado.
-- ============================================================================
SET search_path = public;

-- ----------------------------------------------------------------------------
-- 1) Habilitar la extension. Belt-and-suspenders: ademas de esto, los triggers
--    se redefinen mas abajo para NO depender de pgcrypto (usamos gen_random_uuid,
--    integrado en PostgreSQL 13+), de modo que funcione con o sin la extension.
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 2) Triggers de orders: IDs de notificacion generados con gen_random_uuid()
--    (built-in) en lugar de gen_random_bytes() (requiere pgcrypto).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_order_actions()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_part_id text;
    v_cantidad integer;
    v_notif_id text;
    v_admin_phone text;
BEGIN
    -- Decrementar stock por item
    IF NEW.items IS NOT NULL THEN
        FOR v_part_id, v_cantidad IN
            SELECT elem->>'id', (elem->>'quantity')::integer
            FROM jsonb_array_elements(NEW.items) AS elem
        LOOP
            IF v_part_id IS NOT NULL AND v_cantidad IS NOT NULL THEN
                UPDATE public.products
                SET stock = GREATEST(0, stock - v_cantidad)
                WHERE id = v_part_id;
            END IF;
        END LOOP;
    END IF;

    -- Notificacion admin del nuevo pedido
    v_notif_id := 'notif-' || substring(replace(gen_random_uuid()::text, '-', '') from 1 for 12);
    SELECT telefono_soporte INTO v_admin_phone FROM public.store_config WHERE id = 1;

    INSERT INTO public.notifications (id, titulo, mensaje, fecha, tipo, destinatario_telefono, leida)
    VALUES (
        v_notif_id,
        'Nuevo Pedido: ' || NEW.id,
        'El cliente ' || COALESCE(NEW.cliente_nombre, 'N/A') || ' ha realizado una compra por $' || COALESCE(NEW.total_usd::text, '0'),
        to_char(NOW(), 'DD/MM/YYYY HH24:MI'),
        'admin',
        COALESCE(v_admin_phone, ''),
        FALSE
    );

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Fallo en trigger handle_new_order_actions: %', SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_order_status_push_update()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_notif_id text;
    v_mensaje text;
    v_admin_phone text;
    v_reversed_points int;
    v_client_uid text;
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) AND NEW.status = 'En camino' THEN
        v_notif_id := 'notif-status-' || substring(replace(gen_random_uuid()::text, '-', '') from 1 for 12);
        v_mensaje := 'Buenas noticias, ' || COALESCE(NEW.cliente_nombre, 'Cliente') || '! Tu pedido ' || NEW.id || ' ha sido despachado.';
        INSERT INTO public.notifications (id, titulo, mensaje, fecha, tipo, destinatario_telefono, link_url, leida)
        VALUES (v_notif_id, 'Pedido en camino!', v_mensaje, to_char(NOW(), 'DD/MM/YYYY HH24:MI'), 'personal', NEW.cliente_telefono, '/?tab=profile', FALSE);

    ELSIF (OLD.status IS DISTINCT FROM NEW.status) AND NEW.status = 'Cancelado' THEN
        SELECT telefono_soporte INTO v_admin_phone FROM public.store_config WHERE id = 1;
        v_notif_id := 'notif-cancel-' || substring(replace(gen_random_uuid()::text, '-', '') from 1 for 12);
        v_mensaje := 'El pedido ' || NEW.id || ' de ' || COALESCE(NEW.cliente_nombre, 'N/A') || ' ha sido cancelado.';
        INSERT INTO public.notifications (id, titulo, mensaje, fecha, tipo, destinatario_telefono, link_url, leida)
        VALUES (v_notif_id, 'Pedido Cancelado', v_mensaje, to_char(NOW(), 'DD/MM/YYYY HH24:MI'), 'admin', COALESCE(v_admin_phone, ''), '/admin', FALSE);

        -- REVERSAR PUNTOS DE FIDELIDAD ganados en este pedido
        v_client_uid := COALESCE(NEW.cliente_uid, '');
        IF v_client_uid != '' THEN
            SELECT COALESCE(SUM(points), 0) INTO v_reversed_points
            FROM loyalty_transactions
            WHERE user_id = v_client_uid AND order_id = NEW.id AND type = 'earn';

            IF v_reversed_points > 0 THEN
                INSERT INTO loyalty_transactions (user_id, type, points, description, order_id)
                VALUES (v_client_uid, 'redeem', -v_reversed_points, 'Reversal por cancelacion pedido ' || NEW.id, NEW.id)
                ON CONFLICT DO NOTHING;

                UPDATE usuarios_clientes
                SET loyalty_points = GREATEST(0, loyalty_points - v_reversed_points)
                WHERE id = v_client_uid;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3) Helpers de rol: admite admin_users, el email de administracion y el role
--    en app_metadata (igual que el resto del esquema). Esto hace que el operador
--    autenticado SI pase la policy de insercion de broadcasts 'todos'/'admin'.
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
  )
  OR auth.jwt() ->> 'email' = 'kecho8a@gmail.com'
  OR auth.jwt() -> 'app_metadata' ->> 'role' = 'admin';
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
  )
  OR auth.jwt() ->> 'email' = 'kecho8a@gmail.com'
  OR auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'operator');
$$;

-- ----------------------------------------------------------------------------
-- 4) Asegurar grants de insercion/lectura para notifications
-- ----------------------------------------------------------------------------
GRANT SELECT, INSERT ON public.notifications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;