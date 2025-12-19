/**
 * Format Utilities
 * String formatting and transformation utilities
 */

/**
 * Format duration to human-readable string
 * @param seconds Duration in seconds
 * @param language Language for formatting ('tr' | 'en')
 * @returns Formatted string (e.g., "5 dakika" or "2 saat 30 dakika")
 */
export const formatDuration = (seconds: number, language: 'tr' | 'en' = 'tr'): string => {
  const minutes = Math.round(seconds / 60);

  const labels = {
    tr: { hour: 'saat', minute: 'dakika' },
    en: { hour: 'hour', minute: 'minute' }
  };

  const { hour: hourLabel, minute: minuteLabel } = labels[language];

  if (minutes < 60) {
    return `${minutes} ${minuteLabel}`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins > 0) {
    return `${hours} ${hourLabel} ${mins} ${minuteLabel}`;
  }

  return `${hours} ${hourLabel}`;
};

/**
 * Format timestamp to date string
 * @param timestamp Unix timestamp or Date object
 * @param format Format type ('short' | 'long')
 * @param locale Locale string (default: 'tr-TR')
 * @returns Formatted date string
 */
export const formatTimestamp = (
  timestamp: number | Date,
  format: 'short' | 'long' = 'short',
  locale: string = 'tr-TR'
): string => {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;

  if (format === 'short') {
    return date.toLocaleDateString(locale);
  }

  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Truncate text with ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
};

/**
 * Capitalize first letter of string
 * @param text Text to capitalize
 * @returns Capitalized text
 */
export const capitalizeFirst = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Convert kebab-case to Title Case
 * @param text Kebab-case text
 * @returns Title case text
 */
export const kebabToTitle = (text: string): string => {
  return text
    .split('-')
    .map(word => capitalizeFirst(word))
    .join(' ');
};
