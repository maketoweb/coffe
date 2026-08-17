import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Navigation } from '../Navigation';
import { BottomNav } from '../BottomNav';

vi.mock('../../store/AppContext', () => ({
  useApp: () => ({
    cart: [
      { item: { id: '1', nombre: 'Burger', precio_usd: 7.5, stock: 10 }, quantity: 2 },
      { item: { id: '2', nombre: 'Papas', precio_usd: 3, stock: 20 }, quantity: 1 },
    ],
    config: {
      site_nombre: 'Market Coffee Sweet',
      theme_color: '#E31837',
      telefono_soporte: '04121234567',
      sedes: [{ activa: true, telefono: '04129998877' }],
    },
    currentUser: null,
    logoutUser: vi.fn(),
    isDarkMode: false,
    toggleDarkMode: vi.fn(),
    isAdminAuthenticated: false,
    logoutAdmin: vi.fn(),
    notifications: [],
  }),
}));

const defaultProps = {
  currentTab: 'home' as const,
  setTab: vi.fn(),
  onTriggerAdminLogin: vi.fn(),
  drawerOpen: false,
  setDrawerOpen: vi.fn(),
};

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el nombre de la tienda', () => {
    render(<Navigation {...defaultProps} />);
    expect(screen.getAllByText('Market Coffee Sweet').length).toBeGreaterThanOrEqual(1);
  });

  it('muestra badge del carrito con cantidad correcta (3 items)', () => {
    render(<Navigation {...defaultProps} />);
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
  });

  it('renderiza tabs de navegación en desktop', () => {
    render(<Navigation {...defaultProps} />);
    expect(screen.getAllByText('INICIO').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('MENÚ').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('RECOMPENSAS').length).toBeGreaterThanOrEqual(1);
  });
});

describe('BottomNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('tiene navegación bottom bar en mobile', () => {
    render(<BottomNav currentTab="home" setTab={vi.fn()} />);
    const bottomNav = document.querySelector('nav.fixed.bottom-0');
    expect(bottomNav).toBeInTheDocument();
  });

  it('bottom nav tiene 5 botones (Home, Menu, Search, Profile, Cart)', () => {
    render(<BottomNav currentTab="home" setTab={vi.fn()} />);
    const bottomNav = document.querySelector('nav.fixed.bottom-0');
    expect(bottomNav).not.toBeNull();
    const buttons = bottomNav!.querySelectorAll('button');
    expect(buttons.length).toBe(5);
  });
});
