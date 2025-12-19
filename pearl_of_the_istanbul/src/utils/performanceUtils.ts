/**
 * Debounce function - Delays execution until after wait time has elapsed since last call
 * Useful for: Search input, window resize, etc.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function - Ensures function is called at most once per limit period
 * Useful for: Scroll events, mouse move, map move, etc.
 */
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Performance tracker for measuring execution time
 */
export class PerformanceTracker {
  static mark(name: string): void {
    if ('performance' in window) {
      performance.mark(name);
    }
  }

  static measure(name: string, startMark: string, endMark: string): number {
    if ('performance' in window) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0] as PerformanceMeasure;
        return measure.duration;
      } catch (error) {
        console.warn('Performance measure failed:', error);
        return 0;
      }
    }
    return 0;
  }

  static log(name: string, startMark: string, endMark: string): void {
    const duration = this.measure(name, startMark, endMark);
    if (duration > 0) {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }
  }

  static clear(name?: string): void {
    if ('performance' in window) {
      if (name) {
        performance.clearMarks(name);
        performance.clearMeasures(name);
      } else {
        performance.clearMarks();
        performance.clearMeasures();
      }
    }
  }
}
