import React from 'react';
import { useApp } from '../../../../store/AppContext';
import { Search } from 'lucide-react';

const SEOSection: React.FC = () => {
  const { config, updateConfig } = useApp();

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="admin-label mb-3">{children}</p>
  );

  const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <label className="text-xs font-semibold" style={{ color: 'var(--ios-text-secondary)' }}>{children}</label>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="admin-card p-4">
        <SectionTitle>SEO - Pagina Principal</SectionTitle>
        <div className="flex flex-col gap-3">
          <div>
            <FieldLabel>Titulo (title)</FieldLabel>
            <input type="text" value={config.seo_home_title || ''} onChange={e => updateConfig({ seo_home_title: e.target.value })}
              className="admin-input mt-1" placeholder="Mi Restaurante - Delivery de Comida" />
          </div>
          <div>
            <FieldLabel>Descripcion (meta description)</FieldLabel>
            <textarea value={config.seo_home_description || ''} onChange={e => updateConfig({ seo_home_description: e.target.value })}
              className="admin-input mt-1" rows={3} placeholder="Pide tu comida favorita con delivery express..." style={{ resize: 'none' }} />
          </div>
          <div>
            <FieldLabel>Palabras clave (keywords)</FieldLabel>
            <input type="text" value={config.seo_home_keywords || ''} onChange={e => updateConfig({ seo_home_keywords: e.target.value })}
              className="admin-input mt-1" placeholder="restaurante, delivery, comida, hamburguesas" />
          </div>
        </div>
      </div>

      <div className="admin-card p-4">
        <SectionTitle>SEO - Catalogo</SectionTitle>
        <div className="flex flex-col gap-3">
          <div>
            <FieldLabel>Titulo</FieldLabel>
            <input type="text" value={config.seo_catalog_title || ''} onChange={e => updateConfig({ seo_catalog_title: e.target.value })}
              className="admin-input mt-1" placeholder="Menu y Precios | Mi Restaurante" />
          </div>
          <div>
            <FieldLabel>Descripcion</FieldLabel>
            <textarea value={config.seo_catalog_description || ''} onChange={e => updateConfig({ seo_catalog_description: e.target.value })}
              className="admin-input mt-1" rows={2} placeholder="Explora nuestro menu completo..." style={{ resize: 'none' }} />
          </div>
        </div>
      </div>

      <div className="admin-card p-4">
        <SectionTitle>Schema JSON-LD</SectionTitle>
        <div className="flex flex-col gap-3">
          <div>
            <FieldLabel>Tipo</FieldLabel>
            <select value={config.jsonld_type || 'Restaurant'} onChange={e => updateConfig({ jsonld_type: e.target.value })}
              className="admin-input mt-1">
              <option value="Restaurant">Restaurant</option>
              <option value="FoodEstablishment">Food Establishment</option>
              <option value="FastFoodRestaurant">Fast Food Restaurant</option>
            </select>
          </div>
          <div>
            <FieldLabel>Rango de Precios</FieldLabel>
            <input type="text" value={config.jsonld_priceRange || '$$'} onChange={e => updateConfig({ jsonld_priceRange: e.target.value })}
              className="admin-input mt-1" placeholder="$$" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOSection;
