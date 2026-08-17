import { create } from 'zustand';

type AdminSection = 'reports' | 'orders' | 'tracking' | 'inventory' | 'tables' | 'customers' | 'coupons' | 'settings' | 'branding' | 'sedes' | 'extras' | 'notifications' | 'chat' | 'promos' | 'combos' | 'loyalty' | 'tienda' | 'roles' | 'marketing';

interface AdminState {
  activeSection: AdminSection;
  sidebarOpen: boolean;
  orderFilter: string;
  crudSearch: string;
  isEditorOpen: boolean;
  
  setActiveSection: (section: AdminSection) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setOrderFilter: (filter: string) => void;
  setCrudSearch: (search: string) => void;
  setEditorOpen: (open: boolean) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  activeSection: 'reports',
  sidebarOpen: false,
  orderFilter: 'all',
  crudSearch: '',
  isEditorOpen: false,

  setActiveSection: (section) => set({ activeSection: section }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setOrderFilter: (filter) => set({ orderFilter: filter }),
  setCrudSearch: (search) => set({ crudSearch: search }),
  setEditorOpen: (open) => set({ isEditorOpen: open }),
}));
