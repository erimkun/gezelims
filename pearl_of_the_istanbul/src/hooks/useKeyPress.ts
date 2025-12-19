/**
 * useKeyPress Hook
 * Listen for specific keyboard key presses
 */

import { useEffect } from 'react';

/**
 * Hook to listen for keyboard key presses
 * @param key Key to listen for (e.g., 'Escape', 'Enter')
 * @param callback Function to call when key is pressed
 * @param enabled Whether the listener is enabled
 */
export const useKeyPress = (
  key: string,
  callback: () => void,
  enabled: boolean = true
): void => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === key) {
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [key, callback, enabled]);
};
