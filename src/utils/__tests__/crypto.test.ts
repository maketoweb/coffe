import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../crypto';

describe('crypto - Hash de contraseñas', () => {
  it('hashPassword retorna un hash SHA-256 de 64 caracteres', async () => {
    const hash = await hashPassword('miPassword123');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('mismo password produce mismo hash (determinístico)', async () => {
    const hash1 = await hashPassword('testPassword');
    const hash2 = await hashPassword('testPassword');
    expect(hash1).toBe(hash2);
  });

  it('passwords diferentes producen hashes diferentes', async () => {
    const hash1 = await hashPassword('password1');
    const hash2 = await hashPassword('password2');
    expect(hash1).not.toBe(hash2);
  });

  it('hashPassword maneja string vacío', async () => {
    const hash = await hashPassword('');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('hashPassword maneja caracteres especiales y unicode', async () => {
    const hash = await hashPassword('p@$$w0rd!ñáéíóú🔥');
    expect(hash).toHaveLength(64);
  });

  it('verifyPassword retorna true para password correcto', async () => {
    const password = 'miPasswordSeguro';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('verifyPassword retorna false para password incorrecto', async () => {
    const hash = await hashPassword('passwordCorrecto');
    const isValid = await verifyPassword('passwordIncorrecto', hash);
    expect(isValid).toBe(false);
  });

  it('hash es de 256 bits (32 bytes)', async () => {
    const hash = await hashPassword('test');
    const bytes = hash.match(/.{1,2}/g)!.map((b) => parseInt(b, 16));
    expect(bytes).toHaveLength(32);
  });
});
