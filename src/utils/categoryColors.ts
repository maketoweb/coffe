export interface CategoryColor {
  primary: string;
  gradient: string;
  light: string;
  textColor: string;
}

export const CATEGORY_COLORS: Record<string, CategoryColor> = {
  'mercado': {
    primary: '#2D6A4F',
    gradient: 'linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)',
    light: '#F0FAF4',
    textColor: '#2D6A4F',
  },
  'panaderia': {
    primary: '#D4A373',
    gradient: 'linear-gradient(135deg, #D4A373 0%, #E9C46A 100%)',
    light: '#FFF8F0',
    textColor: '#BC6C25',
  },
  'comida rapida': {
    primary: '#E63946',
    gradient: 'linear-gradient(135deg, #E63946 0%, #FF6B35 100%)',
    light: '#FFF0F0',
    textColor: '#E63946',
  },
  'combos': {
    primary: '#FF2D95',
    gradient: 'linear-gradient(135deg, #FF2D95 0%, #8338EC 100%)',
    light: '#FFF0F8',
    textColor: '#FF2D95',
  },
  'bebidas': {
    primary: '#00B4D8',
    gradient: 'linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)',
    light: '#F0F9FF',
    textColor: '#0077B6',
  },
  'dulces': {
    primary: '#8338EC',
    gradient: 'linear-gradient(135deg, #8338EC 0%, #FF2D95 100%)',
    light: '#F5F0FF',
    textColor: '#6D28D9',
  },
  'hamburguesas': {
    primary: '#FF6B35',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF2D95 100%)',
    light: '#FFF4ED',
    textColor: '#FF6B35',
  },
};

const DEFAULT_COLOR: CategoryColor = {
  primary: '#FF6B35',
  gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF2D95 100%)',
  light: '#FFF4ED',
  textColor: '#FF6B35',
};

export function getCategoryColor(categoryName: string): CategoryColor {
  const key = categoryName.toLowerCase().trim();
  return CATEGORY_COLORS[key] || DEFAULT_COLOR;
}
