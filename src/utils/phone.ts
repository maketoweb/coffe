import { StoreConfig, Sede } from '../types/store';

export const toInternational = (phone: string): string => {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = '58' + digits.substring(1);
  if (!digits.startsWith('58')) digits = '58' + digits;
  return digits;
};

export const waLink = (phone: string, message = ''): string => {
  if (!phone) return '';
  return `https://wa.me/${toInternational(phone)}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
};

interface WhatsOptions {
  sede?: Sede | null;
}

export const getWhatsAppPhone = (
  config: StoreConfig,
  opts: WhatsOptions = {}
): string => {
  const activeSedes = (config.sedes || []).filter(s => s.activa);
  const chosen = opts.sede || activeSedes.find(s => s.es_principal) || activeSedes[0];
  if (chosen) {
    return chosen.whatsapp_numero || chosen.telefono || config.telefono_soporte || '';
  }
  return config.telefono_soporte || '';
};