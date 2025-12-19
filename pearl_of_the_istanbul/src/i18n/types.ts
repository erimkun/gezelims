export type LanguageKey = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';

export type TranslationNamespace = 
  | 'common'
  | 'map'
  | 'sidebar'
  | 'navigation'
  | 'poi'
  | 'errors';

export interface Translation {
  [key: string]: string | Translation;
}

export interface TranslationFile {
  [key: string]: Translation;
}

export interface I18nContextValue {
  language: LanguageKey;
  setLanguage: (lang: LanguageKey) => void;
  isLoading: boolean;
}
