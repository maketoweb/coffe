import React, { useState, useEffect } from 'react';
import { Clock, Zap } from 'lucide-react';

interface FlashSaleTimerProps {
  endDate: string;
  discountPercent: number;
  productName: string;
  originalPrice: number;
  themeColor?: string;
}

export const FlashSaleTimer: React.FC<FlashSaleTimerProps> = ({
  endDate,
  discountPercent,
  productName,
  originalPrice,
  themeColor = '#ef4444'
}) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, expired: true };
      }
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (timeLeft.expired) return null;

  const discountedPrice = originalPrice * (1 - discountPercent / 100);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      className="relative rounded-2xl overflow-hidden border-2"
      style={{
        borderColor: themeColor,
        background: `linear-gradient(135deg, ${themeColor}08, ${themeColor}15)`
      }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20" style={{ backgroundColor: themeColor }} />

      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: themeColor }}>
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider" style={{ color: themeColor }}>
              Oferta Flash
            </h4>
            <p className="text-[10px] text-zinc-500">{productName}</p>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-black" style={{ color: themeColor }}>
            ${discountedPrice.toFixed(2)}
          </span>
          <span className="text-sm text-zinc-400 line-through font-mono">
            ${originalPrice.toFixed(2)}
          </span>
          <span
            className="text-[10px] font-black text-white px-2 py-0.5 rounded-full"
            style={{ backgroundColor: themeColor }}
          >
            -{discountPercent}%
          </span>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-2">
          <Clock size={12} style={{ color: themeColor }} />
          <span className="text-[10px] text-zinc-500 font-semibold">Termina en:</span>
          <div className="flex items-center gap-1">
            {[
              { value: timeLeft.hours, label: 'h' },
              { value: timeLeft.minutes, label: 'm' },
              { value: timeLeft.seconds, label: 's' }
            ].map((unit, i) => (
              <React.Fragment key={unit.label}>
                <div
                  className="flex items-center justify-center rounded-md px-1.5 py-0.5 min-w-[28px]"
                  style={{ backgroundColor: `${themeColor}15` }}
                >
                  <span className="text-xs font-black font-mono" style={{ color: themeColor }}>
                    {pad(unit.value)}
                  </span>
                  <span className="text-[8px] font-bold text-zinc-400 ml-0.5">{unit.label}</span>
                </div>
                {i < 2 && <span className="text-zinc-300 font-bold text-xs">:</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
