import React from 'react';
import { Smartphone, MapPin, Instagram, Twitter, Facebook, MessageCircle, ChevronDown, ShieldAlert } from 'lucide-react';
import { StoreConfig } from '../types/store';
import { getWhatsAppPhone, waLink } from '../utils/phone';

interface FooterProps {
  config: StoreConfig;
  onInstallClick?: () => void;
  onAdminClick?: () => void;
  isAdminAuthenticated?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ config, onInstallClick, onAdminClick, isAdminAuthenticated }) => {
  const themeColor = config.theme_color || '#E31837';

  return (
    <footer className="w-full bg-zinc-950 text-white">
      {/* ═══ SECCIÓN 1: Descargar App ═══ */}
      <div className="border-b border-white/10" style={{ background: `linear-gradient(135deg, ${themeColor}dd, ${themeColor}99)` }}>
        <div className="max-w-4xl mx-auto px-4 py-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Smartphone size={28} className="text-white" />
            </div>
          </div>
          <h3 className="text-xl font-black text-white mb-2">
            Descarga la app de {config.site_nombre}
          </h3>
          <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
            Pide tu comida favorita en segundos. Rápido, fácil y desde tu celular.
          </p>
          <button
            onClick={onInstallClick || (() => alert('Abre esta página en Chrome y agrega a la pantalla de inicio.'))}
            className="inline-flex items-center gap-2 bg-white text-zinc-900 font-bold text-sm px-8 py-3.5 rounded-full hover:bg-zinc-100 transition-all cursor-pointer active:scale-95"
          >
            <Smartphone size={16} />
            Descargar Ahora
          </button>
        </div>
      </div>

      {/* ═══ SECCIÓN 2: Quiénes Somos (SEO) ═══ */}
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <h4 className="text-lg font-black text-white mb-4">
            {config.footer_about_title || `Sobre ${config.site_nombre}`}
          </h4>
          <div className="text-sm text-white/60 leading-relaxed space-y-3">
            {config.footer_about_text ? (
              config.footer_about_text.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))
            ) : (
              <>
                <p>
                  Somos un restaurante de comida rápida en Valencia, Carabobo, especializado en
                  hamburguesas artesanales, pizzas, pollo frito y postres. Ofrecemos delivery
                  express a domicilio y servicio de recogida en local.
                </p>
                <p>
                  Nuestra misión es bringarte los mejores ingredientes a tu puerta en minutos.
                  Con {config.site_nombre}, tu pedido favorito está a solo un toque de distancia.
                </p>
              </>
            )}
          </div>

          {/* Links SEO internos */}
          <div className="flex flex-wrap gap-4 mt-6">
            <a href="/" className="text-xs text-white/40 hover:text-white/80 transition-colors font-medium">Inicio</a>
            <a href="/catalog" className="text-xs text-white/40 hover:text-white/80 transition-colors font-medium">Menú</a>
            <a href="/profile" className="text-xs text-white/40 hover:text-white/80 transition-colors font-medium">Mi Cuenta</a>
            {config.tiene_mesas && (
              <a href="/catalog" className="text-xs text-white/40 hover:text-white/80 transition-colors font-medium">Reservar Mesa</a>
            )}
          </div>
        </div>
      </div>

      {/* ═══ SECCIÓN 3: FAQ ═══ */}
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-zinc-900 rounded-2xl p-6">
            <h4 className="text-lg font-black text-white mb-1">Preguntas Frecuentes</h4>
            <p className="text-xs text-white/40 mb-6">Resolvemos tus dudas</p>
            {config.faq_items && config.faq_items.length > 0 ? (
              <div className="space-y-2">
                {config.faq_items.map((item) => (
                  <details key={item.id} className="group bg-zinc-800 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-semibold text-white list-none">
                      {item.question}
                      <ChevronDown size={16} className="text-white/40 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="px-4 pb-4">
                      <p className="text-xs text-white/60 leading-relaxed border-t border-white/10 pt-3">
                        {item.answer}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/40 text-center py-4">
                Las preguntas frecuentes se configuran desde el panel de administración.
              </p>
            )}

            {/* CTA WhatsApp */}
            <div className="mt-4 flex items-center justify-between bg-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <MessageCircle size={14} className="text-green-400" />
                <span className="text-xs text-white/60">¿No encontraste tu respuesta?</span>
              </div>
              <a
                href={waLink(getWhatsAppPhone(config))}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors"
              >
                Escríbenos
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SECCIÓN 4: Redes Sociales + Info ═══ */}
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo + Nombre */}
            <div className="flex items-center gap-3">
              {config.logo_url ? (
                <img src={config.logo_url} alt={config.site_nombre} className="h-10 w-auto max-w-[140px] object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: themeColor }}>
                  {config.site_nombre?.[0] || 'F'}
                </div>
              )}
              <div>
                <span className="font-bold text-sm text-white">{config.site_nombre}</span>
                <p className="text-[10px] text-white/40 flex items-center gap-1">
                  <MapPin size={10} />
                  {config.direccion_fisica || 'Valencia, Carabobo'}
                </p>
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="flex items-center gap-3">
              {config.instagram_url && (
                <a href={config.instagram_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all" aria-label="Instagram">
                  <Instagram size={16} />
                </a>
              )}
              {config.twitter_url && (
                <a href={config.twitter_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all" aria-label="Twitter">
                  <Twitter size={16} />
                </a>
              )}
              {config.facebook_url && (
                <a href={config.facebook_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all" aria-label="Facebook">
                  <Facebook size={16} />
                </a>
              )}
              {config.tiktok_url && (
                <a href={config.tiktok_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all" aria-label="TikTok">
                  <span className="text-sm font-bold">T</span>
                </a>
              )}
              {config.youtube_url && (
                <a href={config.youtube_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all" aria-label="YouTube">
                  <span className="text-sm font-bold">Y</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SECCIÓN 5: Copyright + Admin ═══ */}
      <div className="border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-white/30">
            © {new Date().getFullYear()} {config.footer_copyright || config.site_nombre}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[10px] text-white/30 hover:text-white/60 transition-colors">Privacidad</a>
            <a href="#" className="text-[10px] text-white/30 hover:text-white/60 transition-colors">Términos</a>
            {onAdminClick && (
              <button
                onClick={onAdminClick}
                className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                title="Acceso administrativo"
              >
                <ShieldAlert size={10} />
                {isAdminAuthenticated ? 'Admin ✓' : 'Admin'}
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
