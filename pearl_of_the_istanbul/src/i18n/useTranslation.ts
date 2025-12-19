import { useMemo } from 'react';
import type { LanguageKey, TranslationNamespace } from './types';
import { translations } from './translations';

/**
 * Hook for accessing translations
 * @param namespace Translation namespace (common, map, sidebar, etc.)
 * @param language Current language
 * @returns Translation function
 */
export const useTranslation = (
  namespace: TranslationNamespace,
  language: LanguageKey
) => {
  const t = useMemo(() => {
    const namespaceTranslations = translations[namespace]?.[language] || {};
    
    return (key: string, params?: Record<string, string | number>): string => {
      let translation = namespaceTranslations[key] || key;
      
      // Parameter replacement {{param}}
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          translation = translation.replace(`{{${param}}}`, String(value));
        });
      }
      
      return translation;
    };
  }, [namespace, language]);
  
  return { t };
};
