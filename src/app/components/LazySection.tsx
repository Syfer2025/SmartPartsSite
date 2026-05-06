import { useState, useEffect, useRef, Suspense, ReactNode, memo } from 'react';

interface LazySectionProps {
  children: ReactNode;
  /** Fallback skeleton while loading */
  fallback?: ReactNode;
  /** How far from viewport to start loading (px). Default: 200 */
  rootMargin?: string;
  /** Minimum height for the placeholder to prevent layout shift */
  minHeight?: string;
  /** CSS class for the wrapper */
  className?: string;
}

/**
 * LazySection: Delays rendering of children until the section enters
 * (or is near) the viewport. Uses IntersectionObserver for efficiency.
 *
 * This is ideal for below-the-fold content like AboutUs, Footer, etc.
 * Combined with React.lazy() imports, this creates true on-demand
 * code splitting + render deferral.
 *
 * Performance impact:
 * - Reduces initial JS parsing/execution time
 * - Reduces initial DOM node count
 * - Defers motion/animation library initialization
 */
export const LazySection = memo(function LazySection({
  children,
  fallback,
  rootMargin = '300px',
  minHeight = '200px',
  className = '',
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    // If IntersectionObserver is not supported, render immediately
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only need to trigger once
        }
      },
      {
        rootMargin, // Start loading before it's in view
        threshold: 0,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  if (!isVisible) {
    return (
      <div ref={sentinelRef} className={className} style={{ minHeight }} aria-hidden="true">
        {fallback || null}
      </div>
    );
  }

  return <Suspense fallback={fallback || <div style={{ minHeight }} />}>{children}</Suspense>;
});
