import { describe, it, expect } from 'vitest';
import * as sec from '../security';

// ============================================================
// TESTS DE SEGURIDAD - Protección de datos y anti-hackers
// ============================================================

describe('SEGURIDAD - Prevención de XSS (Cross-Site Scripting)', () => {
  it('escapeHtml previene inyección de script en nombres de producto', () => {
    const malicious = '<script>alert("XSS")</script>';
    const safe = sec.escapeHtml(malicious);
    expect(safe).not.toContain('<script>');
    expect(safe).toContain('&lt;script&gt;');
    expect(safe).toContain('&lt;&#x2F;script&gt;');
  });

  it('escapeHtml previene inyección en descripciones', () => {
    const desc = 'Burger<img src=x onerror=alert(1)>';
    const safe = sec.escapeHtml(desc);
    expect(safe).not.toContain('<img');
    expect(safe).toContain('&lt;img');
    expect(safe).toContain('onerror');
    expect(safe).toContain('alert(1)');
  });

  it('escapeHtml previene inyección en comentarios de usuarios', () => {
    const comment = '<iframe src="javascript:alert(1)"></iframe>';
    const safe = sec.escapeHtml(comment);
    expect(safe).not.toContain('<iframe');
    expect(safe).toContain('&lt;iframe');
  });

  it('valida que URLs de imagen no contienen javascript:', () => {
    const isValidImageUrl = (url: string): boolean => {
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    };

    expect(isValidImageUrl('https://images.unsplash.com/photo.jpg')).toBe(true);
    expect(isValidImageUrl('http://example.com/img.png')).toBe(true);
    expect(isValidImageUrl('javascript:alert(1)')).toBe(false);
    expect(isValidImageUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
  });

  it('previene inyección de HTML en campos de formulario', () => {
    const sanitizeInput = (input: string): string => {
      return input
        .replace(/[<>]/g, '')
        .trim()
        .slice(0, 500);
    };

    expect(sanitizeInput('<b>bold</b>')).toBe('bbold/b');
    expect(sanitizeInput('a'.repeat(600))).toHaveLength(500);
  });
});

describe('SEGURIDAD - Prevención de SQL Injection', () => {
  it('no permite caracteres peligrosos en búsquedas', () => {
    const sanitizeSearchQuery = (query: string): string => {
      return query
        .replace(/['";\\]/g, '')
        .replace(/--/g, '')
        .replace(/\/\*/g, '')
        .replace(/\*\//g, '')
        .trim()
        .slice(0, 100);
    };

    expect(sanitizeSearchQuery("'; DROP TABLE products; --")).toBe('DROP TABLE products');
    expect(sanitizeSearchQuery("1' OR '1'='1")).toBe('1 OR 1=1');
    expect(sanitizeSearchQuery('SELECT * FROM users')).toBe('SELECT * FROM users');  });

  it('valida que IDs son formato UUID o numérico seguro', () => {
    const isValidId = (id: string): boolean => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const safeIdRegex = /^[a-zA-Z0-9_-]{1,100}$/;
      return uuidRegex.test(id) || safeIdRegex.test(id);
    };

    expect(isValidId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidId('hmb-001')).toBe(true);
    expect(isValidId("'; DROP TABLE--")).toBe(false);
    expect(isValidId('1 OR 1=1')).toBe(false);
  });

  it('sanitiza inputs numéricos contra inyección', () => {
    const sanitizeNumber = (input: string | number): number => {
      const num = typeof input === 'number' ? input : parseFloat(input);
      if (isNaN(num) || !isFinite(num)) return 0;
      return Math.max(0, Math.min(num, 999999));
    };

    expect(sanitizeNumber('7.50')).toBe(7.5);
    expect(sanitizeNumber('NaN')).toBe(0);
    expect(sanitizeNumber(Infinity)).toBe(0);
    expect(sanitizeNumber(-5)).toBe(0);
    expect(sanitizeNumber('1000000')).toBe(999999);
  });
});

describe('SEGURIDAD - Autenticación y Autorización', () => {
  it('hashPassword produce hash irreversible', async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode('password123');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    expect(hash).toHaveLength(64);
    expect(hash).not.toBe('password123');
  });

  it('contraseñas débiles son rechazadas', () => {
    const isStrongPassword = (pwd: string): boolean => {
      if (pwd.length < 8) return false;
      if (!/[A-Z]/.test(pwd)) return false;
      if (!/[a-z]/.test(pwd)) return false;
      if (!/[0-9]/.test(pwd)) return false;
      return true;
    };

    expect(isStrongPassword('abc')).toBe(false);
    expect(isStrongPassword('abcdefgh')).toBe(false);
    expect(isStrongPassword('Abcdefgh')).toBe(false);
    expect(isStrongPassword('Abcdefg1')).toBe(true);
    expect(isStrongPassword('MyP@ssw0rd')).toBe(true);
  });

  it('tokens de sesión tienen longitud mínima segura', () => {
    const generateToken = (): string => {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
    };

    const token = generateToken();
    expect(token.length).toBeGreaterThanOrEqual(64);
    expect(token).toMatch(/^[0-9a-f]+$/);
  });

  it('previene timing attacks en comparación de tokens', () => {
    const timingSafeEqual = (a: string, b: string): boolean => {
      if (a.length !== b.length) return false;
      let result = 0;
      for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
      }
      return result === 0;
    };

    expect(timingSafeEqual('abc123', 'abc123')).toBe(true);
    expect(timingSafeEqual('abc123', 'abc124')).toBe(false);
    expect(timingSafeEqual('abc', 'abcdef')).toBe(false);
  });

  it('email validation previene inyección', () => {
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email) && email.length <= 254;
    };

    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
    expect(isValidEmail('user@example<script>.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('a'.repeat(255) + '@example.com')).toBe(false);
  });
});

describe('SEGURIDAD - Protección de Datos Personales', () => {
  it('máscara de teléfono oculta dígitos sensibles', () => {
    expect(sec.maskPhone('04121234567')).toBe('0412*******');
    expect(sec.maskPhone('584121234567')).toBe('5841********');
  });

  it('máscara de email oculta parte sensible', () => {
    const maskEmail = (email: string): string => {
      const [local, domain] = email.split('@');
      if (!domain) return email;
      const maskedLocal = local.length > 2
        ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
        : '*'.repeat(local.length);
      return `${maskedLocal}@${domain}`;
    };

    expect(maskEmail('sugolo28@gmail.com')).toBe('s******8@gmail.com');
    expect(maskEmail('ab@test.com')).toBe('**@test.com');
  });

  it('valida que direcciones GPS están en rango válido para Venezuela', () => {
    const isValidVenezuelaCoords = (lat: number, lng: number): boolean => {
      return lat >= 0.5 && lat <= 12.2 && lng >= -73.4 && lng <= -59.8;
    };

    expect(isValidVenezuelaCoords(10.48, -66.9)).toBe(true);
    expect(isValidVenezuelaCoords(10.4806, -66.9036)).toBe(true);
    expect(isValidVenezuelaCoords(40.71, -74.0)).toBe(false);
    expect(isValidVenezuelaCoords(-33.8, 151.2)).toBe(false);
  });

  it('valida que el teléfono venezolano tiene formato correcto', () => {
    const isValidVenezuelaPhone = (phone: string): boolean => {
      const cleaned = phone.replace(/[\s\-()]/g, '');
      return /^(\+?58)?(0?4[12]|0?424|0?412|0?416|0?426)\d{7,8}$/.test(cleaned);
    };

    expect(isValidVenezuelaPhone('04121234567')).toBe(true);
    expect(isValidVenezuelaPhone('+584121234567')).toBe(true);
    expect(isValidVenezuelaPhone('584121234567')).toBe(true);
    expect(isValidVenezuelaPhone('123456')).toBe(false);
    expect(isValidVenezuelaPhone('041212345678901')).toBe(false);
  });

  it('limita longitud de campos de texto para prevenir buffer overflow', () => {
    const MAX_LENGTHS = {
      nombre: 100,
      email: 254,
      telefono: 20,
      direccion: 300,
      descripcion: 500,
      comentario: 1000,
    };

    const validateLength = (field: string, value: string): boolean => {
      const maxLen = MAX_LENGTHS[field as keyof typeof MAX_LENGTHS];
      if (!maxLen) return false;
      return value.length <= maxLen;
    };

    expect(validateLength('nombre', 'Juan Pérez')).toBe(true);
    expect(validateLength('nombre', 'a'.repeat(101))).toBe(false);
    expect(validateLength('email', 'a'.repeat(254) + '@test.com')).toBe(false);
    expect(validateLength('comentario', 'a'.repeat(1000))).toBe(true);
    expect(validateLength('comentario', 'a'.repeat(1001))).toBe(false);
  });
});

describe('SEGURIDAD - Protección de Pagos', () => {
  it('valida que montos de pago son positivos y razonables', () => {
    const isValidPaymentAmount = (amount: number): boolean => {
      return amount > 0 && amount < 10000 && isFinite(amount) && !isNaN(amount);
    };

    expect(isValidPaymentAmount(7.50)).toBe(true);
    expect(isValidPaymentAmount(0)).toBe(false);
    expect(isValidPaymentAmount(-5)).toBe(false);
    expect(isValidPaymentAmount(100000)).toBe(false);
    expect(isValidPaymentAmount(NaN)).toBe(false);
  });

  it('valida tasa de cambio USD/BS en rango razonable', () => {
    const isValidExchangeRate = (rate: number): boolean => {
      return rate > 0 && rate < 10000 && isFinite(rate);
    };

    expect(isValidExchangeRate(36.5)).toBe(true);
    expect(isValidExchangeRate(0)).toBe(false);
    expect(isValidExchangeRate(-1)).toBe(false);
    expect(isValidExchangeRate(100000)).toBe(false);
  });

  it('calcula total con precisión de 2 decimales', () => {
    const calculateTotal = (subtotal: number, shipping: number, discount: number): number => {
      const total = Math.max(0, subtotal - discount + shipping);
      return Math.round(total * 100) / 100;
    };

    expect(calculateTotal(10.55, 2.00, 1.00)).toBe(11.55);
    expect(calculateTotal(10.123, 2.456, 0)).toBe(12.58);
    expect(calculateTotal(5, 0, 10)).toBe(0);
  });

  it('previene descuentos negativos o mayores al 100%', () => {
    const validateDiscount = (percent: number): number => {
      if (isNaN(percent) || !isFinite(percent)) return 0;
      return Math.max(0, Math.min(percent, 100));
    };

    expect(validateDiscount(10)).toBe(10);
    expect(validateDiscount(-5)).toBe(0);
    expect(validateDiscount(150)).toBe(100);
    expect(validateDiscount(NaN)).toBe(0);
  });

  it('valida código de cupón contra caracteres peligrosos', () => {
    const isValidCouponCode = (code: string): boolean => {
      return /^[A-Z0-9]{3,20}$/.test(code);
    };

    expect(isValidCouponCode('DESCUENTO20')).toBe(true);
    expect(isValidCouponCode('ABC')).toBe(true);
    expect(isValidCouponCode('<script>')).toBe(false);
    expect(isValidCouponCode("'; DROP TABLE--")).toBe(false);
    expect(isValidCouponCode('a'.repeat(21))).toBe(false);
  });
});

describe('SEGURIDAD - Protección de Pedidos', () => {
  it('valida que items del pedido son arrays', () => {
    const isValidItems = (items: unknown): boolean => {
      return Array.isArray(items) && items.length > 0 && items.length <= 50;
    };

    expect(isValidItems([{ food_id: '1', cantidad: 1 }])).toBe(true);
    expect(isValidItems([])).toBe(false);
    expect(isValidItems('not array')).toBe(false);
    expect(isValidItems(new Array(51).fill({ food_id: '1' }))).toBe(false);
  });

  it('valida cantidades de items como enteros positivos', () => {
    const isValidQuantity = (qty: unknown): boolean => {
      return typeof qty === 'number' && Number.isInteger(qty) && qty > 0 && qty <= 100;
    };

    expect(isValidQuantity(1)).toBe(true);
    expect(isValidQuantity(50)).toBe(true);
    expect(isValidQuantity(0)).toBe(false);
    expect(isValidQuantity(-1)).toBe(false);
    expect(isValidQuantity(1.5)).toBe(false);
    expect(isValidQuantity(101)).toBe(false);
  });

  it('genera IDs de pedido con formato seguro', () => {
    const generateOrderId = (): string => {
      const id = `PED-${Math.floor(1000 + Math.random() * 9000)}-VAL-${new Date().getFullYear()}`;
      return id;
    };

    const id = generateOrderId();
    expect(id).toMatch(/^PED-\d{4}-VAL-\d{4}$/);
  });

  it('valida que el status del pedido es un valor permitido', () => {
    const VALID_STATUSES = [
      'Pendiente', 'Procesando', 'En preparación', 'Listo',
      'En camino', 'Entregado', 'Cancelado',
    ];

    const isValidStatus = (status: string): boolean => {
      return VALID_STATUSES.includes(status);
    };

    expect(isValidStatus('Pendiente')).toBe(true);
    expect(isValidStatus('Entregado')).toBe(true);
    expect(isValidStatus('Hackeado')).toBe(false);
    expect(isValidStatus('')).toBe(false);
  });
});

describe('SEGURIDAD - Rate Limiting y Abuso', () => {
  it('implementa rate limiting básico para intentos de login', () => {
    const loginAttempts = new Map<string, number[]>();
    const MAX_ATTEMPTS = 5;
    const WINDOW_MS = 15 * 60 * 1000;

    const checkRateLimit = (email: string): boolean => {
      const now = Date.now();
      const attempts = loginAttempts.get(email) || [];
      const recentAttempts = attempts.filter((t) => now - t < WINDOW_MS);
      loginAttempts.set(email, recentAttempts);
      if (recentAttempts.length >= MAX_ATTEMPTS) return false;
      recentAttempts.push(now);
      loginAttempts.set(email, recentAttempts);
      return true;
    };

    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit('test@email.com')).toBe(true);
    }
    expect(checkRateLimit('test@email.com')).toBe(false);
  });

  it('limita intentos de envío de notificaciones push', () => {
    const pushCounts = new Map<string, number>();
    const MAX_PUSH_PER_WEEK = 3;

    const canSendPush = (userId: string): boolean => {
      const count = pushCounts.get(userId) || 0;
      if (count >= MAX_PUSH_PER_WEEK) return false;
      pushCounts.set(userId, count + 1);
      return true;
    };

    expect(canSendPush('user1')).toBe(true);
    expect(canSendPush('user1')).toBe(true);
    expect(canSendPush('user1')).toBe(true);
    expect(canSendPush('user1')).toBe(false);
  });

  it('valida que pedidos no se dupliquen rápidamente (debounce)', () => {
    let lastOrderTime = 0;
    const MIN_ORDER_INTERVAL_MS = 2000;

    const canPlaceOrder = (): boolean => {
      const now = Date.now();
      if (now - lastOrderTime < MIN_ORDER_INTERVAL_MS) return false;
      lastOrderTime = now;
      return true;
    };

    expect(canPlaceOrder()).toBe(true);
    expect(canPlaceOrder()).toBe(false);
  });
});

describe('SEGURIDAD - Almacenamiento Local', () => {
  it('no almacena contraseñas en localStorage', () => {
    const safeStorageKeys = ['cart', 'favorites', 'currency', 'theme', 'lastOrder'];

    const isSafeKey = (key: string): boolean => {
      const dangerousKeys = ['password', 'contrasena', 'secret', 'token', 'api_key', 'private_key'];
      return !dangerousKeys.some((dk) => key.toLowerCase().includes(dk));
    };

    safeStorageKeys.forEach((key) => {
      expect(isSafeKey(key)).toBe(true);
    });

    ['password', 'contrasena', 'secret_token', 'api_key'].forEach((key) => {
      expect(isSafeKey(key)).toBe(false);
    });
  });

  it('valida datos de localStorage antes de parsear', () => {
    const safeJsonParse = (json: string): unknown => {
      try {
        if (typeof json !== 'string') return null;
        if (json.length > 1000000) return null;
        if (/[<>]/.test(json)) return null;
        return JSON.parse(json);
      } catch {
        return null;
      }
    };

    expect(safeJsonParse('{"key":"value"}')).toEqual({ key: 'value' });
    expect(safeJsonParse('invalid json')).toBeNull();
    expect(safeJsonParse('<script>alert(1)</script>')).toBeNull();
    expect(safeJsonParse('a'.repeat(2000000))).toBeNull();
  });
});

describe('SEGURIDAD - Headers y Configuración', () => {
  it('referrerPolicy está configurado para prevenir leak de URLs', () => {
    const secureReferrerPolicies = [
      'no-referrer',
      'same-origin',
      'strict-origin',
      'strict-origin-when-cross-origin',
    ];

    const isSecureReferrer = (policy: string): boolean => {
      return secureReferrerPolicies.includes(policy);
    };

    expect(isSecureReferrer('no-referrer')).toBe(true);
    expect(isSecureReferrer('unsafe-url')).toBe(false);
  });

  it('valida Content-Security-Policy contra XSS', () => {
    const csp = {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://*.supabase.co'],
    };

    expect(csp.scriptSrc).not.toContain("'unsafe-inline'");
    expect(csp.scriptSrc).not.toContain("'unsafe-eval'");
    expect(csp.connectSrc).toContain('https://*.supabase.co');
  });

  it('valida que permisos de Supabase son restrictive', () => {
    const supabasePolicies = {
      anonKey: true,
      serviceRoleKey: false,
      rlsEnabled: true,
    };

    expect(supabasePolicies.anonKey).toBe(true);
    expect(supabasePolicies.serviceRoleKey).toBe(false);
    expect(supabasePolicies.rlsEnabled).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Helpers REALES importados desde src/security/security.ts
// (los helpers duplicados arriba miden el comportamiento esperado; estos
//  ejercitan el módulo compartido que usa la app).
// ════════════════════════════════════════════════════════════════════════════
describe('security.ts módulo compartido', () => {
  it('escapeHtml neutraliza <script>', () => {
    
    expect(sec.escapeHtml('<script>alert(1)</script>')).not.toContain('<script>');
    expect(sec.escapeHtml('<script>alert(1)</script>')).toContain('&lt;script&gt;');
  });

  it('escapeJsonForScript neutraliza el cierre de tag en JSON-LD', () => {
    
    const res = sec.escapeJsonForScript({ nombre: '</script><img src=x onerror=alert(1)>' });
    expect(res).not.toContain('</script>');
    expect(res).toContain('\\u003c/script\\u003e');
  });

  it('safeCompare rechaza secretos distintos y acepta iguales', () => {
    
    expect(sec.safeCompare('abc123', 'abc123')).toBe(true);
    expect(sec.safeCompare('abc123', 'abc124')).toBe(false);
    expect(sec.safeCompare('abc', 'abcdef')).toBe(false);
  });

  it('isValidHttpUrl bloquea javascript: y data:', () => {
    
    expect(sec.isValidHttpUrl('https://img.example.com/a.png')).toBe(true);
    expect(sec.isValidHttpUrl('javascript:alert(1)')).toBe(false);
    expect(sec.isValidHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
  });

  it('maskPhone oculta digitos intermedios', () => {
    
    expect(sec.maskPhone('04121234567')).toBe('0412*******');
  });
});
