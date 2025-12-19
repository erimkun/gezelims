/**
 * useClickOutside Hook
 * Detect clicks outside of an element
 */

import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * Hook to detect clicks outside of an element
 * @param ref Ref to the element
 * @param handler Function to call when clicked outside
 * @param enabled Whether the listener is enabled
 */
export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: () => void,
  enabled: boolean = true
): void => {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [ref, handler, enabled]);
};
