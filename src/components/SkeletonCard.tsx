import React from 'react';

interface SkeletonCardProps {
  width?: string;
  height?: string;
  variant?: 'default' | 'premium';
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  width = '100%',
  height = '200px',
  variant = 'default',
}) => {
  return (
    <div
      className={`bg-white overflow-hidden border border-zinc-100 ${
        variant === 'premium' ? 'rounded-2xl' : 'rounded-xl'
      }`}
      style={{ width, height }}
    >
      <div className="flex flex-col h-full">
        {/* Image skeleton with shimmer */}
        <div className="relative h-[60%] w-full overflow-hidden">
          <div className="absolute inset-0 skeleton-premium" />
          {/* Fake badge skeleton */}
          <div className="absolute top-2 left-2 w-12 h-4 bg-zinc-200/60 rounded-md skeleton-premium" />
          {/* Fake button skeleton */}
          <div className="absolute bottom-2 right-2 w-8 h-8 bg-zinc-200/60 rounded-full skeleton-premium" />
        </div>

        {/* Content skeleton */}
        <div className="p-3 flex flex-col gap-2 flex-1">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <div className="bg-zinc-200 h-3 w-4/5 rounded skeleton-premium" />
            <div className="bg-zinc-200 h-3 w-3/5 rounded skeleton-premium" />
          </div>

          {/* Rating row */}
          <div className="flex items-center gap-2">
            <div className="bg-zinc-200 h-2.5 w-12 rounded skeleton-premium" />
            <div className="bg-zinc-100 h-2.5 w-16 rounded skeleton-premium" />
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-100 pt-2 mt-auto">
            <div className="flex items-center justify-between">
              <div className="bg-zinc-200 h-4 w-14 rounded skeleton-premium" />
              <div className="bg-zinc-100 h-3 w-12 rounded skeleton-premium" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonGrid: React.FC<{ count?: number; variant?: 'default' | 'premium' }> = ({
  count = 8,
  variant = 'default',
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </div>
  );
};
