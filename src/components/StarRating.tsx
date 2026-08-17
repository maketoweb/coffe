import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  themeColor?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 14,
  interactive = false,
  onChange,
  showValue = false
}) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= Math.floor(rating);
        const partial = !filled && starValue <= Math.ceil(rating) && rating % 1 > 0;
        const fillPercent = partial ? Math.round((rating % 1) * 100) : 0;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(starValue)}
            className={`relative ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            style={{ width: size, height: size }}
          >
            {/* Background empty star */}
            <Star
              size={size}
              className="absolute inset-0 text-zinc-200"
              fill="currentColor"
              strokeWidth={0}
            />
            {/* Filled star */}
            {(filled || partial) && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? '100%' : `${fillPercent}%` }}
              >
                <Star
                  size={size}
                  className="text-amber-400"
                  fill="currentColor"
                  strokeWidth={0}
                />
              </div>
            )}
          </button>
        );
      })}
      {showValue && rating > 0 && (
        <span className="text-xs font-bold text-zinc-600 ml-0.5">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
