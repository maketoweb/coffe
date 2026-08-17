import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { ProductReview } from '../types/store';
import { MessageSquare, Send } from 'lucide-react';

interface ProductReviewsProps {
  reviews: ProductReview[];
  averageRating: number;
  totalReviews: number;
  productId: string;
  productName: string;
  themeColor?: string;
  canReview?: boolean;
  onSubmitReview?: (rating: number, comment: string) => Promise<void>;
  userReview?: ProductReview | null;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  reviews,
  averageRating,
  totalReviews,
  themeColor = '#f59e0b',
  canReview = false,
  onSubmitReview,
  userReview
}) => {
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newRating === 0 || !onSubmitReview) return;
    setSubmitting(true);
    try {
      await onSubmitReview(newRating, comment);
      setNewRating(0);
      setComment('');
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-t border-zinc-100 pt-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
          <MessageSquare size={15} className="text-zinc-400" />
          Reseñas {totalReviews > 0 && `(${totalReviews})`}
        </h3>
        {canReview && !userReview && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            style={{ color: themeColor, backgroundColor: `${themeColor}15` }}
          >
            {showForm ? 'Cancelar' : 'Escribir reseña'}
          </button>
        )}
      </div>

      {/* Average Rating Summary */}
      {totalReviews > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-zinc-50 rounded-xl">
          <div className="text-center">
            <p className="text-3xl font-black text-zinc-900">{averageRating.toFixed(1)}</p>
            <StarRating rating={averageRating} size={12} themeColor={themeColor} />
            <p className="text-[10px] text-zinc-400 mt-0.5">{totalReviews} reseña{totalReviews !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = reviews.filter(r => Math.round(r.rating) === stars).length;
              const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-2 text-[10px]">
                  <span className="w-3 text-zinc-500 font-bold">{stars}</span>
                  <div className="flex-1 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%`, backgroundColor: themeColor }}
                    />
                  </div>
                  <span className="w-6 text-right text-zinc-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
          <div className="mb-3">
            <p className="text-xs font-bold text-zinc-600 mb-2">Tu calificación</p>
            <StarRating
              rating={newRating}
              interactive
              size={24}
              onChange={setNewRating}
              themeColor={themeColor}
            />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cuéntanos tu experiencia (opcional)"
            className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none resize-none bg-white focus:border-zinc-400"
            rows={3}
          />
          <button
            type="submit"
            disabled={newRating === 0 || submitting}
            className="mt-2 w-full text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: themeColor }}
          >
            <Send size={12} />
            {submitting ? 'Enviando...' : 'Enviar reseña'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 && !showForm && (
          <p className="text-xs text-zinc-400 text-center py-4">
            Aún no hay reseñas. Sé el primero en calificar.
          </p>
        )}
        {reviews.slice(0, 10).map(review => (
          <div key={review.id} className="p-3 bg-zinc-50 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-600">
                  {review.user_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-800">{review.user_name}</p>
                  <StarRating rating={review.rating} size={10} themeColor={themeColor} />
                </div>
              </div>
              <span className="text-[10px] text-zinc-400">
                {new Date(review.created_at).toLocaleDateString('es-VE', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            {review.comment && (
              <p className="text-xs text-zinc-600 leading-relaxed ml-9">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
