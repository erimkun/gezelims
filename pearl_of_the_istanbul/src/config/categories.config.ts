/**
 * Category Configuration
 * Centralized category definitions for consistency across the app
 */

export const CATEGORIES = {
  all: {
    key: 'all' as const,
    icon: '🏠',
    color: '#6366F1',
    i18nKey: 'all',
  },
  food: {
    key: 'food' as const,
    icon: '🍽️',
    color: '#EF4444',
    i18nKey: 'food',
  },
  nature: {
    key: 'nature' as const,
    icon: '🌿',
    color: '#10B981',
    i18nKey: 'nature',
  },
  culture: {
    key: 'culture' as const,
    icon: '🎭',
    color: '#8B5CF6',
    i18nKey: 'culture',
  },
  entertainment: {
    key: 'entertainment' as const,
    icon: '🎉',
    color: '#F59E0B',
    i18nKey: 'entertainment',
  },
  other: {
    key: 'other' as const,
    icon: '📍',
    color: '#6B7280',
    i18nKey: 'other',
  },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

/**
 * Get category color by key
 * @param key Category key
 * @returns Color hex code
 */
export const getCategoryColor = (key: string): string => {
  const categoryKey = key as CategoryKey;
  return CATEGORIES[categoryKey]?.color || CATEGORIES.all.color;
};

/**
 * Get category icon by key
 * @param key Category key
 * @returns Icon emoji
 */
export const getCategoryIcon = (key: string): string => {
  const categoryKey = key as CategoryKey;
  return CATEGORIES[categoryKey]?.icon || CATEGORIES.all.icon;
};

/**
 * Get full category configuration
 * @param key Category key
 * @returns Category config object
 */
export const getCategoryConfig = (key: string) => {
  const categoryKey = key as CategoryKey;
  return CATEGORIES[categoryKey] || CATEGORIES.all;
};

/**
 * Get all categories as array
 * @returns Array of category configs
 */
export const getAllCategories = () => {
  return Object.values(CATEGORIES);
};

/**
 * Check if key is valid category
 * @param key Key to check
 * @returns true if valid
 */
export const isValidCategory = (key: string): key is CategoryKey => {
  return key in CATEGORIES;
};
