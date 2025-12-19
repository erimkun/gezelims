import { useEffect, useRef, type RefObject } from 'react';

/**
 * Focus Trap Hook - Modal ve popup'larda focus'u içeride tutar
 * Tab ile gezinirken focus modal dışına çıkmaz
 * 
 * @param isActive - Hook aktif mi?
 * @param containerRef - Focus'un tutulacağı container ref
 * @param onEscape - ESC tuşuna basıldığında çağrılacak callback
 */
export const useFocusTrap = (
  isActive: boolean,
  containerRef: RefObject<HTMLElement | null>,
  onEscape?: () => void
) => {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Önceki aktif elementi sakla
    previousActiveElement.current = document.activeElement as HTMLElement;

    // İlk focusable elemente odaklan
    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    // Tab ve ESC tuşlarını dinle
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusables = getFocusableElements(containerRef.current!);
      if (focusables.length === 0) return;

      const firstElement = focusables[0] as HTMLElement;
      const lastElement = focusables[focusables.length - 1] as HTMLElement;

      // Shift + Tab: İlk elementteyken son elemente git
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // Tab: Son elementteyken ilk elemente git
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup: Önceki elemente focus'u geri ver
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, containerRef, onEscape]);
};

/**
 * Container içindeki focusable elementleri döndürür
 */
function getFocusableElements(container: HTMLElement): NodeListOf<Element> {
  return container.querySelectorAll(
    'button:not([disabled]), ' +
    '[href], ' +
    'input:not([disabled]), ' +
    'select:not([disabled]), ' +
    'textarea:not([disabled]), ' +
    '[tabindex]:not([tabindex="-1"]), ' +
    '[contenteditable="true"]'
  );
}

export default useFocusTrap;
