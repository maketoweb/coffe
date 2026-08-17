import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Order } from '../types/store';
import { X, ShoppingBag, Smartphone, Landmark, DollarSign, CheckCircle, Trash2, Minus, Plus, ChevronRight } from 'lucide-react';
import { OrderTracker } from './OrderTracker';

interface CheckoutModalProps {
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose }) => {
  const { cart, config, removeFromCart, updateCartQuantity, clearCart, createOrder } = useApp();

  const [tipoEntrega, setTipoEntrega] = useState<'delivery' | 'mesa'>('delivery');
  const [selectedMesa, setSelectedMesa] = useState<number | null>(null);
  const [step, setStep] = useState<'choice' | 'details' | 'payment' | 'confirm'>('choice');

  // Form fields
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<'Pago Móvil' | 'Zelle' | 'Efectivo' | 'Transferencia'>('Pago Móvil');
  const [orderNotes, setOrderNotes] = useState('');
  const [processedOrder, setProcessedOrder] = useState<Order | null>(null);

  const subtotalUsd = cart.reduce((acc, ci) => {
    const extrasTotal = ci.selected_options?.reduce((e, opt) => e + opt.precio_usd, 0) || 0;
    return acc + ((ci.item.precio_usd + extrasTotal) * ci.quantity);
  }, 0);
  const totalUsd = subtotalUsd;
  const totalBs = totalUsd * config.tasa_cambio;

  const handlePlaceOrder = async () => {
    if (!clientName.trim() || !clientPhone.trim()) return;
    if (tipoEntrega === 'delivery' && !direccion.trim()) return;
    if (tipoEntrega === 'mesa' && !selectedMesa) return;

    const orderItems = cart.map(ci => ({
      food_id: ci.item.id,
      nombre: ci.item.nombre,
      precio_usd: ci.item.precio_usd,
      cantidad: ci.quantity,
      selected_options: ci.selected_options,
      options_total_usd: ci.options_total_usd || 0,
      ingredientes_removidos: ci.ingredientes_removidos || [],
    }));

    const order = await createOrder({
      cliente_nombre: clientName.trim(),
      cliente_telefono: clientPhone.trim(),
      cliente_email: clientEmail.trim() || undefined,
      items: orderItems,
      costo_envio_usd: 0,
      metodo_pago: selectedPayment,
      tipo_entrega: tipoEntrega,
      numero_mesa: tipoEntrega === 'mesa' ? selectedMesa! : undefined,
      lat: 0,
      lng: 0,
      direccion_envio: tipoEntrega === 'delivery' ? direccion.trim() : '',
      distancia_km: 0,
    });

    if (order) {
      setProcessedOrder(order);
      clearCart();
      localStorage.setItem('trv_active_order_id', order.id);
    }
  };

  if (processedOrder) {
    return (
      <OrderTracker
        order={processedOrder}
        onClose={() => {
          localStorage.removeItem('trv_active_order_id');
          onClose();
        }}
        onContinueShopping={() => {
          localStorage.removeItem('trv_active_order_id');
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-t-3xl lg:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-zinc-100 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-pop-pink" />
            <h2 className="text-lg font-display font-bold text-zinc-900">Tu Pedido</h2>
            <span className="bg-pop-pink/10 text-pop-pink text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((a, c) => a + c.quantity, 0)}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer">
            <X size={18} className="text-zinc-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Step 1: Delivery or Table Choice */}
          {step === 'choice' && (
            <>
              {/* Cart Items */}
              <div className="space-y-3">
                {cart.map(ci => (
                  <div key={ci.item.id} className="flex gap-3 bg-zinc-50 rounded-xl p-3">
                    <img src={ci.item.imagen_urls[0]} alt={ci.item.nombre}
                      className="w-16 h-16 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-zinc-900 truncate">{ci.item.nombre}</p>
                      <p className="text-xs text-zinc-500">
                        ${ci.item.precio_usd.toFixed(2)} x {ci.quantity}
                      </p>
                      {ci.ingredientes_removidos && ci.ingredientes_removidos.length > 0 && (
                        <p className="text-[10px] text-red-500 mt-0.5">
                          Sin: {ci.ingredientes_removidos.join(', ')}
                        </p>
                      )}
                      {ci.selected_options && ci.selected_options.length > 0 && (
                        <p className="text-[10px] text-pop-purple mt-0.5">
                          + {ci.selected_options.map(o => o.option_name).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateCartQuantity(ci.item.id, ci.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors cursor-pointer">
                        <Minus size={12} />
                      </button>
                      <span className="w-7 text-center text-sm font-bold">{ci.quantity}</span>
                      <button onClick={() => updateCartQuantity(ci.item.id, ci.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors cursor-pointer">
                        <Plus size={12} />
                      </button>
                      <button onClick={() => removeFromCart(ci.item.id)}
                        className="w-7 h-7 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors cursor-pointer ml-1">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="bg-zinc-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 text-sm">Subtotal</span>
                  <span className="font-bold text-lg">${totalUsd.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-zinc-400 mt-1">
                  <span>Bs {totalBs.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Type */}
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">¿Cómo quieres recibir tu pedido?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { setTipoEntrega('delivery'); setStep('details'); }}
                    className="p-4 rounded-xl border-2 border-zinc-200 hover:border-pop-pink hover:bg-pop-pink-50 transition-all text-center group cursor-pointer">
                    <Smartphone size={24} className="mx-auto text-zinc-400 group-hover:text-pop-pink mb-2" />
                    <p className="font-bold text-sm text-zinc-700 group-hover:text-pop-pink">Delivery</p>
                    <p className="text-[10px] text-zinc-400">Recibe en casa</p>
                  </button>
                  <button onClick={() => { setTipoEntrega('mesa'); setStep('details'); }}
                    className="p-4 rounded-xl border-2 border-zinc-200 hover:border-pop-orange hover:bg-pop-orange-50 transition-all text-center group cursor-pointer">
                    <Landmark size={24} className="mx-auto text-zinc-400 group-hover:text-pop-orange mb-2" />
                    <p className="font-bold text-sm text-zinc-700 group-hover:text-pop-orange">Mesa</p>
                    <p className="text-[10px] text-zinc-400">Come en el local</p>
                  </button>
                </div>
              </div>

              <button onClick={() => { if (cart.length === 0) return; setStep('choice'); }}
                className="w-full border border-zinc-200 text-zinc-600 font-bold py-3 rounded-xl hover:bg-zinc-50 transition-all cursor-pointer text-sm"
              >
                Seguir Comprando
              </button>
            </>
          )}

          {/* Step 2: Details */}
          {step === 'details' && (
            <>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600 mb-1 block">Nombre *</label>
                  <input value={clientName} onChange={e => setClientName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pop-pink focus:ring-1 focus:ring-pop-pink/20"
                    placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 mb-1 block">Teléfono *</label>
                  <input value={clientPhone} onChange={e => setClientPhone(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pop-pink focus:ring-1 focus:ring-pop-pink/20"
                    placeholder="+584120000000" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 mb-1 block">Email (opcional)</label>
                  <input value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pop-pink focus:ring-1 focus:ring-pop-pink/20"
                    placeholder="email@ejemplo.com" />
                </div>

                {tipoEntrega === 'delivery' && (
                  <div>
                    <label className="text-xs font-bold text-zinc-600 mb-1 block">Dirección de entrega *</label>
                    <textarea value={direccion} onChange={e => setDireccion(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pop-pink focus:ring-1 focus:ring-pop-pink/20 resize-none"
                      placeholder="Av. Principal, Casa #123, referencia..."
                      rows={2}
                    />
                  </div>
                )}

                {tipoEntrega === 'mesa' && config.tiene_mesas && (
                  <div>
                    <label className="text-xs font-bold text-zinc-600 mb-2 block">Selecciona tu mesa *</label>
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: config.total_mesas || 20 }, (_, i) => i + 1).map(n => (
                        <button key={n} onClick={() => setSelectedMesa(n)}
                          className={`p-3 rounded-xl text-center font-bold text-sm border-2 transition-all cursor-pointer ${
                            selectedMesa === n
                              ? 'border-pop-pink bg-pop-pink-50 text-pop-pink'
                              : 'border-zinc-200 text-zinc-600 hover:border-pop-pink'
                          }`}
                        >
                          <span className="text-lg block">🪑</span>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-zinc-600 mb-1 block">Notas (opcional)</label>
                  <textarea value={orderNotes} onChange={e => setOrderNotes(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pop-pink focus:ring-1 focus:ring-pop-pink/20 resize-none"
                    placeholder="Ej: Sin cebolla, extra salsa..."
                    rows={2}
                  />
                </div>
              </div>

              <button onClick={() => setStep('payment')}
                className="w-full bg-pop-pink hover:bg-pink-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95 cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                Continuar al Pago <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Step 3: Payment */}
          {step === 'payment' && (
            <>
              <div className="space-y-3">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Método de Pago</p>
                {[
                  { id: 'Pago Móvil' as const, icon: Smartphone, label: 'Pago Móvil', desc: 'Banesco, Mercantil, Provincial' },
                  { id: 'Zelle' as const, icon: DollarSign, label: 'Zelle', desc: 'Envío desde USA' },
                  { id: 'Efectivo' as const, icon: DollarSign, label: 'Efectivo', desc: 'USD o Bs al recibir' },
                  { id: 'Transferencia' as const, icon: Landmark, label: 'Transferencia', desc: 'Bancos nacionales' },
                ].map(method => (
                  <button key={method.id} onClick={() => setSelectedPayment(method.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedPayment === method.id
                        ? 'border-pop-pink bg-pop-pink-50'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <method.icon size={20} className={selectedPayment === method.id ? 'text-pop-pink' : 'text-zinc-400'} />
                    <div className="text-left flex-1">
                      <p className="font-bold text-sm text-zinc-800">{method.label}</p>
                      <p className="text-xs text-zinc-500">{method.desc}</p>
                    </div>
                    {selectedPayment === method.id && (
                      <CheckCircle size={18} className="text-pop-pink" />
                    )}
                  </button>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-zinc-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Resumen</p>
                {cart.map(ci => {
                  const extrasTotal = ci.selected_options?.reduce((e, opt) => e + opt.precio_usd, 0) || 0;
                  return (
                    <div key={ci.item.id} className="flex justify-between text-sm">
                      <span className="text-zinc-600 truncate">{ci.quantity}x {ci.item.nombre}</span>
                      <span className="font-bold">${((ci.item.precio_usd + extrasTotal) * ci.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="border-t border-zinc-200 pt-2 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg text-pop-pink">${totalUsd.toFixed(2)}</span>
                </div>
                <div className="text-right text-xs text-zinc-400">
                  Bs {totalBs.toFixed(2)}
                </div>
              </div>

              <button onClick={handlePlaceOrder}
                disabled={!clientName.trim() || !clientPhone.trim() || (tipoEntrega === 'delivery' && !direccion.trim()) || (tipoEntrega === 'mesa' && !selectedMesa)}
                className="w-full bg-pop-pink hover:bg-pink-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all active:scale-95 cursor-pointer text-sm"
              >
                Confirmar Pedido · ${totalUsd.toFixed(2)}
              </button>

              <button onClick={() => setStep('details')}
                className="w-full text-zinc-500 text-sm font-medium hover:text-zinc-700 transition-colors cursor-pointer text-center py-2"
              >
                ← Volver
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
