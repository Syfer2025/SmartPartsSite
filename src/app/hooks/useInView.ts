import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  /** Threshold (0–1) at which the callback triggers. Default: 0.1 */
  threshold?: number;
  /** Root margin for triggering earlier/later. Default: '0px' */
  rootMargin?: string;
  /** If true, only triggers once and disconnects. Default: true */
  once?: boolean;
}

/**
 * Lightweight IntersectionObserver hook — replaces motion's `whileInView`.
 * Returns a ref to attach to the element and a boolean `inView`.
 *
 * Performance notes:
 * - Uses a single IntersectionObserver per hook instance (browsers batch these efficiently).
 * - `once: true` disconnects after first intersection, freeing memory.
 * - No external dependency (replaces motion/react import in Footer).
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(options: UseInViewOptions = {}) {
  const { threshold = 0.1, rootMargin = '0px', once = true } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}
