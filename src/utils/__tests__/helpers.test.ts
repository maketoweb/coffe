import { describe, it, expect } from 'vitest';
import type { StoreConfig, DeliveryZone } from '../../types/store';

describe('Utils - categoryColors', () => {
  const defaultColors = {
    'Hamburguesas': { primary: '#FF6B35', light: '#FFF4ED', textColor: '#1A1A2E' },
    'Pizzas': { primary: '#E31837', light: '#FEE2E2', textColor: '#1A1A2E' },
    'Pollo': { primary: '#F59E0B', light: '#FEF3C7', textColor: '#1A1A2E' },
    'Bebidas': { primary: '#3B82F6', light: '#DBEAFE', textColor: '#1A1A2E' },
    'Postres': { primary: '#EC4899', light: '#FCE7F3', textColor: '#1A1A2E' },
  };

  it('returns valid color object for known category', () => {
    const colors = defaultColors['Hamburguesas'];
    expect(colors).toBeDefined();
    expect(colors.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(colors.light).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(colors.textColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('all default categories have colors', () => {
    for (const [, colors] of Object.entries(defaultColors)) {
      expect(colors.primary).toBeTruthy();
      expect(colors.light).toBeTruthy();
      expect(colors.textColor).toBeTruthy();
    }
  });
});

describe('Utils - Delivery Zone Calculation', () => {
  const zones: DeliveryZone[] = [
    { id: 'z1', name: 'Centro', cost: 1.5, minKm: 0, maxKm: 2 },
    { id: 'z2', name: 'Periferia', cost: 2.5, minKm: 2, maxKm: 5 },
    { id: 'z3', name: 'Lejano', cost: 4.0, minKm: 5, maxKm: 10 },
  ];

  const calculateDeliveryCost = (distanceKm: number, config: StoreConfig): number => {
    if (config.delivery_gratis) return 0;
    if (config.delivery_zonas && config.delivery_zonas.length > 0) {
      const zone = config.delivery_zonas.find(z => distanceKm >= z.minKm && distanceKm < z.maxKm);
      return zone ? zone.cost : 0;
    }
    return config.costo_delivery_km ? distanceKm * config.costo_delivery_km : 0;
  };

  it('returns correct cost for zone 1', () => {
    const config: StoreConfig = {
      site_nombre: 'Test', telefono_soporte: '', direccion_fisica: '',
      coordenadas_tienda: { lat: 0, lng: 0 }, banners: [],
      zelle_enabled: false, zelle_data: '', zelle_discount_percent: 0,
      pagomovil_enabled: false, pagomovil_data: '', pagomovil_discount_percent: 0,
      efectivo_enabled: false, efectivo_data: '', efectivo_discount_percent: 0,
      transferencia_enabled: false, transferencia_data: '', transferencia_discount_percent: 0,
      tasa_cambio: 1, delivery_zonas: zones,
    };
    expect(calculateDeliveryCost(1.5, config)).toBe(1.5);
  });

  it('returns correct cost for zone 2', () => {
    const config: StoreConfig = {
      site_nombre: 'Test', telefono_soporte: '', direccion_fisica: '',
      coordenadas_tienda: { lat: 0, lng: 0 }, banners: [],
      zelle_enabled: false, zelle_data: '', zelle_discount_percent: 0,
      pagomovil_enabled: false, pagomovil_data: '', pagomovil_discount_percent: 0,
      efectivo_enabled: false, efectivo_data: '', efectivo_discount_percent: 0,
      transferencia_enabled: false, transferencia_data: '', transferencia_discount_percent: 0,
      tasa_cambio: 1, delivery_zonas: zones,
    };
    expect(calculateDeliveryCost(3, config)).toBe(2.5);
  });

  it('returns free delivery when config says so', () => {
    const config: StoreConfig = {
      site_nombre: 'Test', telefono_soporte: '', direccion_fisica: '',
      coordenadas_tienda: { lat: 0, lng: 0 }, banners: [],
      zelle_enabled: false, zelle_data: '', zelle_discount_percent: 0,
      pagomovil_enabled: false, pagomovil_data: '', pagomovil_discount_percent: 0,
      efectivo_enabled: false, efectivo_data: '', efectivo_discount_percent: 0,
      transferencia_enabled: false, transferencia_data: '', transferencia_discount_percent: 0,
      tasa_cambio: 1, delivery_gratis: true, delivery_zonas: zones,
    };
    expect(calculateDeliveryCost(8, config)).toBe(0);
  });

  it('returns 0 for distance outside all zones', () => {
    const config: StoreConfig = {
      site_nombre: 'Test', telefono_soporte: '', direccion_fisica: '',
      coordenadas_tienda: { lat: 0, lng: 0 }, banners: [],
      zelle_enabled: false, zelle_data: '', zelle_discount_percent: 0,
      pagomovil_enabled: false, pagomovil_data: '', pagomovil_discount_percent: 0,
      efectivo_enabled: false, efectivo_data: '', efectivo_discount_percent: 0,
      transferencia_enabled: false, transferencia_data: '', transferencia_discount_percent: 0,
      tasa_cambio: 1, delivery_zonas: zones,
    };
    expect(calculateDeliveryCost(15, config)).toBe(0);
  });
});

describe('Utils - Exchange Rate Conversion', () => {
  const convertToBs = (usd: number, rate: number): number => {
    return Math.round(usd * rate * 100) / 100;
  };

  it('converts USD to BS correctly', () => {
    expect(convertToBs(10, 36.5)).toBe(365.0);
  });

  it('handles zero amount', () => {
    expect(convertToBs(0, 36.5)).toBe(0);
  });

  it('handles fractional amounts', () => {
    expect(convertToBs(7.5, 36.5)).toBe(273.75);
  });

  it('rounds to 2 decimal places', () => {
    expect(convertToBs(1.1, 36.5)).toBe(40.15);
  });
});

describe('Utils - Coupon Validation', () => {
  interface Coupon {
    code: string;
    discount_percent: number;
    active: boolean;
    usage_limit?: number;
    usage_count: number;
    valid_until?: string;
  }

  const validateCoupon = (coupon: Coupon, subtotal: number): { valid: boolean; reason?: string } => {
    if (!coupon.active) return { valid: false, reason: 'Cupón inactivo' };
    if (coupon.usage_limit !== undefined && coupon.usage_count >= coupon.usage_limit)
      return { valid: false, reason: 'Límite de usos alcanzado' };
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date())
      return { valid: false, reason: 'Cupón expirado' };
    if (subtotal <= 0) return { valid: false, reason: 'Subtotal inválido' };
    return { valid: true };
  };

  it('accepts valid coupon', () => {
    const coupon: Coupon = { code: 'SAVE10', discount_percent: 10, active: true, usage_count: 0 };
    expect(validateCoupon(coupon, 50).valid).toBe(true);
  });

  it('rejects inactive coupon', () => {
    const coupon: Coupon = { code: 'OLD', discount_percent: 10, active: false, usage_count: 0 };
    expect(validateCoupon(coupon, 50).valid).toBe(false);
  });

  it('rejects coupon with zero subtotal', () => {
    const coupon: Coupon = { code: 'SAVE10', discount_percent: 10, active: true, usage_count: 0 };
    expect(validateCoupon(coupon, 0).valid).toBe(false);
  });
});
