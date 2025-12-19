/**
 * DOM Utilities
 * DOM manipulation and browser interaction utilities
 */

/**
 * Create marker element for POI
 * @param icon Icon emoji
 * @param color Category color
 * @returns HTMLElement
 */
export const createMarkerElement = (icon: string, color: string): HTMLElement => {
  const container = document.createElement('div');
  container.className = 'poi-marker';

  container.style.cssText = `
    background: ${color};
    width: 40px;
    height: 40px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  `;

  const iconSpan = document.createElement('span');
  iconSpan.textContent = icon;
  iconSpan.style.cssText = `
    transform: rotate(45deg);
    font-size: 20px;
  `;

  container.appendChild(iconSpan);

  return container;
};

/**
 * Scroll element into view smoothly
 * @param element Element to scroll to
 * @param block Scroll alignment
 */
export const scrollToElement = (
  element: HTMLElement,
  block: ScrollLogicalPosition = 'center'
): void => {
  element.scrollIntoView({ behavior: 'smooth', block });
};

/**
 * Copy text to clipboard
 * @param text Text to copy
 * @returns Promise<boolean> Success status
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError);
      return false;
    }
  }
};

/**
 * Check if element is visible in viewport
 * @param element Element to check
 * @returns true if visible
 */
export const isElementInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Get element offset from top of page
 * @param element Element to measure
 * @returns Offset in pixels
 */
export const getElementOffset = (element: HTMLElement): number => {
  let offsetTop = 0;
  let currentElement: HTMLElement | null = element;

  while (currentElement) {
    offsetTop += currentElement.offsetTop;
    currentElement = currentElement.offsetParent as HTMLElement | null;
  }

  return offsetTop;
};

/**
 * Prevent body scroll (for modals)
 */
export const disableBodyScroll = (): void => {
  document.body.style.overflow = 'hidden';
};

/**
 * Enable body scroll
 */
export const enableBodyScroll = (): void => {
  document.body.style.overflow = '';
};
