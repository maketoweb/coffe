import { useCallback, useMemo } from 'react';
import { useApp } from '../../../store/AppContext';
import { FoodItem } from '../../../types/store';

export function useProducts() {
  const { foodItems, addFoodItem, updateFoodItem, deleteFoodItem, searchItems } = useApp();

  const activeProducts = useMemo(() => foodItems.filter(p => p.activo !== false), [foodItems]);
  const inactiveProducts = useMemo(() => foodItems.filter(p => p.activo === false), [foodItems]);
  const promoProducts = useMemo(() => foodItems.filter(p => p.es_promo), [foodItems]);
  const lowStockProducts = useMemo(() => foodItems.filter(p => p.stock <= 5 && p.activo !== false), [foodItems]);

  const productsByCategory = useMemo(() => {
    const map = new Map<string, FoodItem[]>();
    for (const item of activeProducts) {
      const list = map.get(item.categoria) || [];
      list.push(item);
      map.set(item.categoria, list);
    }
    return map;
  }, [activeProducts]);

  const topSelling = useMemo(() => {
    return [...activeProducts].sort((a, b) => (b.order_count || 0) - (a.order_count || 0)).slice(0, 10);
  }, [activeProducts]);

  const totalStockValue = useMemo(() => {
    return activeProducts.reduce((sum, p) => sum + p.precio_usd * p.stock, 0);
  }, [activeProducts]);

  const togglePromo = useCallback((id: string) => {
    const product = foodItems.find(p => p.id === id);
    if (product) {
      updateFoodItem(id, { es_promo: !product.es_promo });
    }
  }, [foodItems, updateFoodItem]);

  const toggleActive = useCallback((id: string) => {
    const product = foodItems.find(p => p.id === id);
    if (product) {
      updateFoodItem(id, { activo: product.activo === false ? true : false });
    }
  }, [foodItems, updateFoodItem]);

  return {
    foodItems,
    activeProducts,
    inactiveProducts,
    promoProducts,
    lowStockProducts,
    productsByCategory,
    topSelling,
    totalStockValue,
    addFoodItem,
    updateFoodItem,
    deleteFoodItem,
    searchItems,
    togglePromo,
    toggleActive,
  };
}
