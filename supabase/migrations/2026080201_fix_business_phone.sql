-- ============================================================================
-- Corrección del teléfono principal de la tienda.
-- El número correcto del negocio es 0412-4058904 -> internacional +584124058904.
-- Se propagó un número placeholder (+584124976451) en config y datos de pago.
-- ============================================================================
SET search_path = public;

-- 1. Número maestro de notificaciones / soporte
UPDATE public.store_config
SET telefono_soporte = '+584124058904'
WHERE id = 1
  AND (telefono_soporte IS NULL OR telefono_soporte = '' OR telefono_soporte LIKE '%4976451%');

-- 2. Sede principal: alinear su teléfono/whatsapp con el número maestro.
UPDATE public.store_config
SET sedes = (
  SELECT jsonb_agg(
    CASE
      WHEN (sede->>'es_principal')::boolean
        THEN jsonb_set(
               jsonb_set(
                 sede,
                 '{telefono}',
                 to_jsonb('+584124058904'::text),
                 true
               ),
               '{whatsapp_numero}',
               to_jsonb('+584124058904'::text),
               true
             )
      ELSE sede
    END
  )
  FROM jsonb_array_elements(store_config.sedes) AS sede
)
WHERE id = 1
  AND sedes IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM jsonb_array_elements(store_config.sedes) s
    WHERE (s->>'es_principal')::boolean
      AND (s->>'telefono' LIKE '%4976451%' OR COALESCE(s->>'whatsapp_numero','') LIKE '%4976451%')
  );

-- 3. Textos de pago que referenciaban el NÚMERO viejo (placeholder).
UPDATE public.store_config
SET pagomovil_data = replace(pagomovil_data, '0412-4976451', '0412-4058904')
WHERE id = 1 AND pagomovil_data LIKE '%4976451%';

UPDATE public.store_config
SET transferencia_data = replace(transferencia_data, '0412-4976451', '0412-4058904')
WHERE id = 1 AND transferencia_data LIKE '%4976451%';

UPDATE public.store_config
SET zelle_data = replace(zelle_data, '0412-4976451', '0412-4058904')
WHERE id = 1 AND zelle_data LIKE '%4976451%';