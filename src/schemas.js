// schemas.js — SEO Premium JSON-LD para White Label
/* global window */

export function getOrganizationSchema(config) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": config.site_nombre,
    "url": config.site_url || (typeof window !== 'undefined' ? window.location.origin : ''),
    "logo": config.logo_url,
    "description": config.seo_home_description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": config.direccion_fisica,
      "addressLocality": "Valencia",
      "addressRegion": "Carabobo",
      "addressCountry": "VE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": config.coordenadas_tienda?.lat,
      "longitude": config.coordenadas_tienda?.lng
    },
    "sameAs": [
      config.instagram_url,
      config.twitter_url,
      config.facebook_url,
      config.tiktok_url,
      config.youtube_url
    ].filter(Boolean),
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": config.telefono_soporte,
      "contactType": "customer service",
      "availableLanguage": "Spanish"
    }
  };
}

export function getRestaurantSchema(config) {
  return {
    "@context": "https://schema.org",
    "@type": config.jsonld_type || "Restaurant",
    "name": config.site_nombre,
    "image": config.banners?.[0] || config.logo_url,
    "url": config.site_url || (typeof window !== 'undefined' ? window.location.origin : ''),
    "description": config.seo_home_description,
    "priceRange": config.jsonld_priceRange || "$$",
    "servesCuisine": config.jsonld_servesCuisine || ["Comida Rápida", "Hamburguesas", "Pizzas"],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": config.direccion_fisica,
      "addressLocality": "Valencia",
      "addressRegion": "Carabobo",
      "addressCountry": "VE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": config.coordenadas_tienda?.lat,
      "longitude": config.coordenadas_tienda?.lng
    },
    "hasMenu": {
      "@type": "Menu",
      "url": `${config.site_url || (typeof window !== 'undefined' ? window.location.origin : '')}/catalog`
    },
    "acceptsReservations": config.tiene_mesas ? "True" : "False",
    "potentialAction": {
      "@type": "OrderAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${config.site_url || (typeof window !== 'undefined' ? window.location.origin : '')}/checkout`,
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      },
      "result": {
        "@type": "Order",
        "orderStatus": "http://schema.org/Orderplaced"
      }
    }
  };
}

export function getLocalBusinessSchema(config) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": config.site_nombre,
    "image": config.banners?.[0] || config.logo_url,
    "url": config.site_url || (typeof window !== 'undefined' ? window.location.origin : ''),
    "telephone": config.telefono_soporte,
    "priceRange": config.jsonld_priceRange || "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": config.direccion_fisica,
      "addressLocality": "Valencia",
      "addressRegion": "Carabobo",
      "addressCountry": "VE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": config.coordenadas_tienda?.lat,
      "longitude": config.coordenadas_tienda?.lng
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "10:00",
        "closes": "22:00"
      }
    ],
    "sameAs": [
      config.instagram_url,
      config.facebook_url,
      config.twitter_url
    ].filter(Boolean)
  };
}

export function getProductSchema(product, config) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.nombre,
    "description": product.descripcion,
    "image": product.imagen_urls?.[0],
    "brand": {
      "@type": "Brand",
      "name": config.site_nombre
    },
    "offers": {
      "@type": "Offer",
      "url": `${config.site_url || (typeof window !== 'undefined' ? window.location.origin : '')}/product/${product.id}`,
      "priceCurrency": "USD",
      "price": product.precio_usd,
      "availability": product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": config.site_nombre
      }
    },
    "aggregateRating": product.averageRating ? {
      "@type": "AggregateRating",
      "ratingValue": product.averageRating,
      "reviewCount": product.reviewCount || 1
    } : undefined
  };
}

export function getFAQSchema(faqItems) {
  if (!faqItems || faqItems.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };
}

export function getBreadcrumbSchema(config, items) {
  const origin = config.site_url || (typeof window !== 'undefined' ? window.location.origin : '');
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url || `${origin}${item.path}`
    }))
  };
}

export function getWebsiteSchema(config) {
  const origin = config.site_url || (typeof window !== 'undefined' ? window.location.origin : '');
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": config.site_nombre,
    "url": origin,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${origin}/catalog?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}
