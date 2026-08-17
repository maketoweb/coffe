import React from 'react';

const Sk = ({ className = '' }: { className?: string }) => (
  <div className={`skeleton-premium ${className}`} />
);

/* ────────────── HOME SKELETONS ────────────── */

export const SkeletonHeroMobile: React.FC = () => (
  <section className="md:hidden w-full bg-zinc-50">
    <div className="px-4 pt-4 pb-3 flex flex-col gap-2">
      <Sk className="h-6 w-3/4 rounded-lg" />
      <Sk className="h-3 w-full rounded-md" />
      <Sk className="h-3 w-2/3 rounded-md" />
    </div>
    <div className="flex gap-2 px-4 pb-3">
      <Sk className="h-10 flex-1 rounded-xl" />
      <Sk className="h-10 flex-1 rounded-xl" />
    </div>
    <Sk className="w-full h-[240px] rounded-none" />
  </section>
);

export const SkeletonHeroDesktop: React.FC = () => (
  <section className="hidden md:block w-full h-[500px] bg-zinc-100 relative overflow-hidden">
    <Sk className="absolute inset-0" />
    <div className="absolute inset-0 flex flex-col justify-center px-12 lg:px-20 max-w-2xl">
      <Sk className="h-10 w-2/3 rounded-lg mb-3" />
      <Sk className="h-4 w-full rounded-md mb-2" />
      <Sk className="h-4 w-4/5 rounded-md mb-6" />
      <div className="flex gap-3">
        <Sk className="h-11 w-40 rounded-xl" />
        <Sk className="h-11 w-36 rounded-xl" />
      </div>
    </div>
  </section>
);

export const SkeletonHighlights: React.FC = () => (
  <section className="w-full py-6 sm:py-8 md:py-12 bg-zinc-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-2">
          <Sk className="h-6 w-40 rounded-lg" />
          <Sk className="h-3 w-56 rounded-md" />
        </div>
        <Sk className="h-4 w-16 rounded-md" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3].map(i => (
          <div key={i} className="shrink-0 w-[85vw] sm:w-[60vw] md:w-[calc(33.333%-11px)] rounded-2xl overflow-hidden border border-zinc-100 bg-white">
            <Sk className="h-44 md:h-48 w-full rounded-none" />
            <div className="p-4 flex flex-col gap-2">
              <Sk className="h-4 w-3/4 rounded-md" />
              <Sk className="h-3 w-full rounded-md" />
              <Sk className="h-3 w-2/3 rounded-md" />
              <Sk className="h-3 w-20 rounded-md mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const SkeletonCategories: React.FC = () => (
  <section className="w-full py-6 sm:py-8 md:py-12 bg-zinc-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-2">
          <Sk className="h-6 w-48 rounded-lg" />
          <Sk className="h-3 w-64 rounded-md" />
        </div>
        <Sk className="h-4 w-20 rounded-md hidden sm:block" />
      </div>
      <div className="flex gap-4 overflow-hidden md:grid md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="shrink-0 w-[75vw] sm:w-[45vw] md:w-auto rounded-2xl overflow-hidden border border-zinc-100 bg-white">
            <Sk className="h-40 md:h-44 w-full rounded-none" />
            <div className="p-4 flex items-center justify-between">
              <div className="flex flex-col gap-1.5">
                <Sk className="h-4 w-24 rounded-md" />
                <Sk className="h-2.5 w-16 rounded-md" />
              </div>
              <Sk className="h-9 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const SkeletonBestsellers: React.FC = () => (
  <section className="w-full py-6 sm:py-8 md:py-12 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-2">
          <Sk className="h-6 w-44 rounded-lg" />
          <Sk className="h-3 w-52 rounded-md" />
        </div>
        <Sk className="h-4 w-16 rounded-md hidden sm:block" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="shrink-0 w-[180px] sm:w-[220px] rounded-2xl overflow-hidden border border-zinc-100 bg-white">
            <Sk className="h-40 w-full rounded-none" />
            <div className="p-3 flex flex-col gap-2">
              <Sk className="h-3.5 w-4/5 rounded-md" />
              <Sk className="h-2.5 w-3/5 rounded-md" />
              <div className="flex items-center justify-between mt-1">
                <Sk className="h-4 w-14 rounded-md" />
                <Sk className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const SkeletonRewards: React.FC = () => (
  <section className="w-full py-8 sm:py-10 md:py-16 bg-zinc-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="w-full md:w-1/2 flex justify-center">
          <Sk className="w-64 h-64 md:w-80 md:h-80 rounded-3xl" />
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <Sk className="h-8 w-48 rounded-lg" />
          <Sk className="h-4 w-full rounded-md" />
          <Sk className="h-4 w-3/4 rounded-md" />
          <div className="flex flex-col gap-3 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Sk className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <Sk className="h-3.5 w-32 rounded-md" />
                  <Sk className="h-2.5 w-48 rounded-md" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <Sk className="h-11 w-36 rounded-xl" />
            <Sk className="h-11 w-32 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const SkeletonHome: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <SkeletonHeroMobile />
    <SkeletonHeroDesktop />
    <SkeletonHighlights />
    <SkeletonCategories />
    <SkeletonBestsellers />
    <SkeletonRewards />
  </div>
);

/* ────────────── CATALOG SKELETONS ────────────── */

export const SkeletonCatalog: React.FC = () => (
  <div className="flex flex-col gap-4 pb-24 max-w-7xl mx-auto px-4">
    {/* Mobile header */}
    <div className="lg:hidden flex items-center gap-2 pt-1">
      <Sk className="w-8 h-8 rounded-full shrink-0" />
      <Sk className="h-5 w-24 rounded-md flex-1" />
      <Sk className="w-8 h-8 rounded-full shrink-0" />
    </div>
    {/* Desktop header */}
    <div className="hidden lg:flex items-center justify-between">
      <Sk className="h-5 w-24 rounded-md" />
      <Sk className="h-3 w-20 rounded-md" />
    </div>
    {/* Search */}
    <Sk className="h-10 w-full rounded-lg" />
    {/* Category pills */}
    <div className="flex gap-2 overflow-hidden">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <Sk key={i} className="h-8 w-20 rounded-lg shrink-0" />
      ))}
    </div>
    {/* Product grid */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden border border-zinc-100 bg-white flex flex-col">
          <Sk className="h-36 w-full rounded-none" />
          <div className="p-3 flex flex-col gap-2">
            <Sk className="h-3 w-4/5 rounded-md" />
            <Sk className="h-2.5 w-3/5 rounded-md" />
            <div className="flex items-center gap-2">
              <Sk className="h-2.5 w-10 rounded-md" />
              <Sk className="h-2.5 w-14 rounded-md" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
              <Sk className="h-4 w-12 rounded-md" />
              <Sk className="h-7 w-7 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ────────────── PROFILE SKELETONS ────────────── */

export const SkeletonProfile: React.FC = () => (
  <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto w-full">
    {/* Avatar + name */}
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-zinc-100">
      <Sk className="w-16 h-16 rounded-full shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <Sk className="h-5 w-36 rounded-md" />
        <Sk className="h-3 w-48 rounded-md" />
      </div>
    </div>
    {/* Tabs */}
    <div className="flex gap-2 overflow-hidden">
      {[1, 2, 3, 4].map(i => (
        <Sk key={i} className="h-9 w-24 rounded-lg shrink-0" />
      ))}
    </div>
    {/* Content cards */}
    {[1, 2, 3].map(i => (
      <div key={i} className="p-4 bg-white rounded-2xl border border-zinc-100 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Sk className="h-6 w-6 rounded-md shrink-0" />
          <Sk className="h-4 w-32 rounded-md" />
          <Sk className="h-5 w-16 rounded-full ml-auto" />
        </div>
        <Sk className="h-3 w-full rounded-md" />
        <Sk className="h-3 w-4/5 rounded-md" />
        <div className="flex gap-2 pt-2 border-t border-zinc-50">
          <Sk className="h-8 w-24 rounded-lg" />
          <Sk className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

/* ────────────── CHECKOUT SKELETONS ────────────── */

export const SkeletonCheckout: React.FC = () => (
  <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
    {/* Progress bar */}
    <div className="flex items-center gap-2 mb-2">
      {[1, 2, 3].map(i => (
        <React.Fragment key={i}>
          <Sk className="h-8 w-8 rounded-full shrink-0" />
          {i < 3 && <Sk className="h-0.5 flex-1 rounded-full" />}
        </React.Fragment>
      ))}
    </div>
    {/* Cart items */}
    {[1, 2, 3].map(i => (
      <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-zinc-100">
        <Sk className="w-16 h-16 rounded-xl shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Sk className="h-4 w-32 rounded-md" />
          <Sk className="h-3 w-24 rounded-md" />
          <div className="flex items-center gap-2">
            <Sk className="h-7 w-7 rounded-full" />
            <Sk className="h-4 w-8 rounded-md" />
            <Sk className="h-7 w-7 rounded-full" />
          </div>
        </div>
        <Sk className="h-4 w-14 rounded-md" />
      </div>
    ))}
    {/* Summary */}
    <div className="p-4 bg-white rounded-xl border border-zinc-100 flex flex-col gap-3">
      <Sk className="h-4 w-32 rounded-md" />
      {[1, 2, 3].map(i => (
        <div key={i} className="flex justify-between">
          <Sk className="h-3 w-24 rounded-md" />
          <Sk className="h-3 w-16 rounded-md" />
        </div>
      ))}
      <div className="border-t border-zinc-100 pt-3 flex justify-between">
        <Sk className="h-5 w-20 rounded-md" />
        <Sk className="h-5 w-16 rounded-md" />
      </div>
    </div>
    {/* Button */}
    <Sk className="h-12 w-full rounded-xl" />
  </div>
);

/* ────────────── ORDER TRACKER SKELETON ────────────── */

export const SkeletonOrderTracker: React.FC = () => (
  <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
    <Sk className="h-6 w-40 rounded-lg" />
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="flex items-start gap-3">
        <Sk className="w-8 h-8 rounded-full shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1">
          <Sk className="h-3.5 w-28 rounded-md" />
          <Sk className="h-2.5 w-40 rounded-md" />
        </div>
        <Sk className="h-3 w-16 rounded-md" />
      </div>
    ))}
  </div>
);

/* ────────────── GENERIC SECTION SKELETON ────────────── */

export const SkeletonSection: React.FC<{ rows?: number; className?: string }> = ({ rows = 3, className = '' }) => (
  <div className={`flex flex-col gap-3 ${className}`}>
    <Sk className="h-5 w-40 rounded-lg" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-zinc-100">
        <Sk className="w-12 h-12 rounded-xl shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Sk className="h-3.5 w-3/4 rounded-md" />
          <Sk className="h-2.5 w-1/2 rounded-md" />
        </div>
        <Sk className="h-4 w-14 rounded-md" />
      </div>
    ))}
  </div>
);
