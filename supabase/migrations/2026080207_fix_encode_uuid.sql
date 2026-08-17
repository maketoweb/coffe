-- ============================================================================
-- Hotfix 42883: "function encode(uuid, unknown) does not exist"
--   La correccion previa (2026080205) generaba los IDs de notificacion con
--   encode(gen_random_uuid(), 'hex'), pero encode() espera un bytea y
--   gen_random_uuid() devuelve UUID. Por eso fallaba el trigger al PATCH-ear
--   / crear pedidos. Se pasa el UUID a texto y se toman los 12 caracteres.
-- ============================================================================
SET search_path = public;

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