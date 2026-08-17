import React, { useEffect, useRef } from 'react';
import { FoodItem } from '../types/store';
import { useApp } from '../store/AppContext';
import { getOrganizationSchema, getRestaurantSchema, getProductSchema, getFAQSchema, getWebsiteSchema, getBreadcrumbSchema } from '../schemas';
import { escapeJsonForScript } from '../security/security';

interface SEOHeadProps {
  title?: string;
  description?: string;
  type?: 'home' | 'product' | 'catalog' | 'admin';
  product?: FoodItem;
  filters?: {
    category?: string;
  };
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  type = 'home',
  product,
  filters
}) => {
  const { config } = useApp();
  const indexedDBTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const siteName = config.site_nombre || 'FoodApp';
    const defaultTitle = config.seo_home_title || `Restaurante Online Premium | ${siteName}`;
    const defaultDesc = config.seo_home_description || `Pide tu comida favorita con delivery express. Hamburguesas, pastas, postres artesanales y más. Recibe en minutos.`;
    const defaultKeywords = config.seo_home_keywords || `restaurante, foodapp, comida, delivery, hamburguesas, pastas, postres, pizza, delivery express`;
    
    let seoTitle = title;
    let seoDesc = description;
    let seoKeywords = defaultKeywords;

    if (type === 'home') {
      seoTitle = title || defaultTitle;
      seoDesc = description || defaultDesc;
      seoKeywords = defaultKeywords;
    }

    if (type === 'product' && product) {
      seoTitle = `${product.nombre} | ${siteName}`;
      seoDesc = `Pide ${product.nombre} de la mejor calidad. Delivery express en minutos.`;
      seoKeywords = `${product.nombre}, ${product.categoria}, foodapp, restaurante, delivery`;
    }

    if (type === 'catalog') {
      const category = filters?.category || '';
      const filterText = category || 'Menú Completo';
      
      seoTitle = config.seo_catalog_title || `Comprar ${filterText} | Catálogo ${siteName}`;
      seoDesc = config.seo_catalog_description || `Menú de ${filterText}. Hamburguesas, pastas, pizzas, postres y más con delivery express. Pide online en ${siteName}.`;
      
      const kwParts = ['foodapp', 'restaurante', 'delivery', 'comida online'];
      if (category) kwParts.push(category.toLowerCase());
      seoKeywords = kwParts.join(', ');
    }

    document.title = seoTitle ? `${seoTitle} | ${config.site_nombre}` : defaultTitle;
    
    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMeta('description', seoDesc || defaultDesc);
    setMeta('keywords', seoKeywords);
    setMeta('og:title', seoTitle || defaultTitle, 'property');
    setMeta('og:description', seoDesc || defaultDesc, 'property');
    if (type === 'product' && product) {
      setMeta('og:type', 'product', 'property');
      setMeta('og:image', product.imagen_urls[0], 'property');
    } else {
      setMeta('og:type', 'website', 'property');
      setMeta('og:image', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200', 'property');
    }

    // PWA: Guardar config en IndexedDB
    if (indexedDBTimeoutRef.current) {
      clearTimeout(indexedDBTimeoutRef.current);
    }
    indexedDBTimeoutRef.current = setTimeout(() => {
      const DB_NAME = 'foodapp-pwa';
      const DB_VERSION = 1;
      const STORE_NAME = 'config';
      const openReq = indexedDB.open(DB_NAME, DB_VERSION);
      openReq.onupgradeneeded = (e: IDBVersionChangeEvent) => {
        (e.target as IDBOpenDBRequest).result.createObjectStore(STORE_NAME);
      };
      openReq.onsuccess = (e: Event) => {
        const db = (e.target as IDBOpenDBRequest).result;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        
        if (config.logo_url) store.put(config.logo_url, 'logo_url');
        if (config.pwa_icon_url) store.put(config.pwa_icon_url, 'pwa_icon_url');
        if (config.site_nombre) store.put(config.site_nombre, 'site_name');
        if (config.theme_color) store.put(config.theme_color, 'theme_color');
      };
    }, 500);

    // Apple Touch Icon dinámico
    const appleTouchUrl = config.pwa_icon_url || config.logo_url || config.favicon_url || '/pwa-192x192.png';
    let appleLink = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
    if (!appleLink) {
      appleLink = document.createElement('link');
      appleLink.setAttribute('rel', 'apple-touch-icon');
      document.head.appendChild(appleLink);
    }
    appleLink.setAttribute('href', appleTouchUrl);

    if (config.favicon_url || config.pwa_icon_url || config.logo_url) {
      let iconLink = document.querySelector('link[rel="icon"]');
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.setAttribute('rel', 'icon');
        document.head.appendChild(iconLink);
      }
      iconLink.setAttribute('href', config.favicon_url || config.pwa_icon_url || config.logo_url || '/favicon.ico');
    }
    
    let themeMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeMeta) {
      themeMeta = document.createElement('meta');
      themeMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeMeta);
    }
    themeMeta.setAttribute('content', config.theme_color || '#FF6B35');

    let appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (!appleTitleMeta) {
      appleTitleMeta = document.createElement('meta');
      appleTitleMeta.setAttribute('name', 'apple-mobile-web-app-title');
      document.head.appendChild(appleTitleMeta);
    }
    appleTitleMeta.setAttribute('content', config.site_nombre || 'Market Coffee Sweet');

    // JSON-LD Schema — SEO Premium from schemas.js
    const existingScript = document.getElementById('foodapp-jsonld-schema');
    if (existingScript) existingScript.remove();
    const existingOrgScript = document.getElementById('foodapp-jsonld-org');
    const existingWebScript = document.getElementById('foodapp-jsonld-web');
    const existingFaqScript = document.getElementById('foodapp-jsonld-faq');
    if (existingOrgScript) existingOrgScript.remove();
    if (existingWebScript) existingWebScript.remove();
    if (existingFaqScript) existingFaqScript.remove();

    let schemaObj: Record<string, unknown> | null = null;

    if (type === 'home') {
      schemaObj = getRestaurantSchema(config);

      // Organization schema
      const orgScript = document.createElement('script');
      orgScript.id = 'foodapp-jsonld-org';
      orgScript.type = 'application/ld+json';
      orgScript.innerHTML = escapeJsonForScript(getOrganizationSchema(config));
      document.head.appendChild(orgScript);

      // Website schema
      const webScript = document.createElement('script');
      webScript.id = 'foodapp-jsonld-web';
      webScript.type = 'application/ld+json';
      webScript.innerHTML = escapeJsonForScript(getWebsiteSchema(config));
      document.head.appendChild(webScript);

      // FAQ schema
      const faqSchema = getFAQSchema(config.faq_items);
      if (faqSchema) {
        const faqScript = document.createElement('script');
        faqScript.id = 'foodapp-jsonld-faq';
        faqScript.type = 'application/ld+json';
        faqScript.innerHTML = escapeJsonForScript(faqSchema);
        document.head.appendChild(faqScript);
      }

      // Breadcrumb for home
      const bcScript = document.createElement('script');
      bcScript.id = 'foodapp-jsonld-bc';
      bcScript.type = 'application/ld+json';
      bcScript.innerHTML = escapeJsonForScript(getBreadcrumbSchema(config, [{ name: 'Inicio' }]));
      document.head.appendChild(bcScript);
    } else if (type === 'product' && product) {
      schemaObj = getProductSchema(product, config);
    } else if (type === 'catalog') {
      schemaObj = {
        '@context': 'https://schema.org',
        '@type': 'SearchResultsPage',
        'name': `Menú ${config.site_nombre || 'FoodApp'}`,
        'description': config.seo_catalog_description || 'Busca y pide tu plato favorito con delivery express.'
      };
    }

    if (schemaObj) {
      const script = document.createElement('script');
      script.id = 'foodapp-jsonld-schema';
      script.type = 'application/ld+json';
      script.innerHTML = escapeJsonForScript(schemaObj);
      document.head.appendChild(script);
    }

    return () => {
      if (indexedDBTimeoutRef.current) clearTimeout(indexedDBTimeoutRef.current);
    };
  }, [config, title, description, type, product, filters, config.site_nombre, config.theme_color, config.logo_url, config.favicon_url, config.pwa_icon_url]);

  return null;
};
