import { useEffect, useRef, useState } from 'react';

export function useStaggerAnimation(options?: { threshold?: number; rootMargin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: options?.threshold ?? 0.1, rootMargin: options?.rootMargin ?? '0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options?.threshold, options?.rootMargin]);

  return { ref, isVisible };
}

export function getStaggerDelay(index: number, baseDelay = 80): string {
  return `${index * baseDelay}ms`;
}

export const staggerItemStyle = (isVisible: boolean, index: number, baseDelay = 80) => ({
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
  transition: `opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${index * baseDelay}ms, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${index * baseDelay}ms`,
});
