import { useState, useEffect, useSyncExternalStore } from 'react';

// Shared resize detection - single listener for all components
const MOBILE_BREAKPOINT = 768;

let mobileState = typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false;
const listeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  let resizeTimeout: ReturnType<typeof setTimeout>;
  window.addEventListener(
    'resize',
    () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newState = window.innerWidth < MOBILE_BREAKPOINT;
        if (newState !== mobileState) {
          mobileState = newState;
          listeners.forEach((listener) => listener());
        }
      }, 150); // Debounce 150ms
    },
    { passive: true }
  );
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return mobileState;
}

function getServerSnapshot() {
  return false;
}

/**
 * Shared hook for mobile detection.
 * Uses a single debounced resize listener for ALL components.
 * Replaces individual useEffect + addEventListener patterns.
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
