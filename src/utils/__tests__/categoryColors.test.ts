import { describe, it, expect } from 'vitest';
import { getCategoryColor, CATEGORY_COLORS } from '../categoryColors';

describe('getCategoryColor', () => {
  it('retorna colores válidos para categorías conocidas', () => {
    const result = getCategoryColor('hamburguesas');
    expect(result).toHaveProperty('primary');
    expect(result).toHaveProperty('gradient');
    expect(result).toHaveProperty('light');
    expect(result).toHaveProperty('textColor');
    expect(result.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('retorna colores para cada categoría definida', () => {
    Object.keys(CATEGORY_COLORS).forEach((key) => {
      const result = getCategoryColor(key);
      expect(result.primary).toBeTruthy();
      expect(result.gradient).toContain('linear-gradient');
      expect(result.light).toMatch(/^#/);
    });
  });

  it('maneja mayúsculas y minúsculas correctamente', () => {
    const lower = getCategoryColor('hamburguesas');
    const upper = getCategoryColor('HAMBURGUESAS');
    const mixed = getCategoryColor('HaMbUrGuEsAs');
    expect(lower.primary).toBe(upper.primary);
    expect(lower.primary).toBe(mixed.primary);
  });

  it('maneja espacios extra al inicio y final', () => {
    const result = getCategoryColor('  hamburguesas  ');
    expect(result.primary).toBe(CATEGORY_COLORS['hamburguesas'].primary);
  });

  it('retorna color por defecto para categorías desconocidas', () => {
    const result = getCategoryColor('categoria_inexistente_xyz');
    expect(result.primary).toBe('#FF6B35');
    expect(result.gradient).toContain('linear-gradient');
  });

  it('retorna color por defecto para string vacío', () => {
    const result = getCategoryColor('');
    expect(result.primary).toBe('#FF6B35');
  });

  it('todas las categorías tienen colores hex válidos', () => {
    Object.values(CATEGORY_COLORS).forEach((color) => {
      expect(color.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(color.light).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(color.textColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});
