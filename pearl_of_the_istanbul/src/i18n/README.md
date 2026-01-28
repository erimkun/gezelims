# 📁 i18n/ - Internationalization (Çoklu Dil Desteği)

Bu dizin, uygulamanın 6 dil desteğini yöneten modülleri içerir.

---

## 📂 Dizin Yapısı

```
i18n/
├── 📄 index.ts           # Barrel export
├── 📄 types.ts           # Tip tanımları
├── 📄 translations.ts    # Çeviri verileri
├── 📄 context.ts         # Context tanımı
├── 📄 I18nContext.tsx    # Provider bileşeni
├── 📄 useI18n.ts         # i18n hook
└── 📄 useTranslation.ts  # Translation hook
```

---

## 🌍 Desteklenen Diller

| Kod | Dil | Bayrak |
|-----|-----|--------|
| `tr` | Türkçe | 🇹🇷 |
| `en` | English | 🇺🇸 |
| `de` | Deutsch | 🇩🇪 |
| `fr` | Français | 🇫🇷 |
| `es` | Español | 🇪🇸 |
| `it` | Italiano | 🇮🇹 |

---

## 📄 types.ts
Tip tanımları.

```typescript
// Dil kodları
export type LanguageKey = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';

// Çeviri namespace'leri
export type TranslationNamespace = 
  | 'common'      // Ortak metinler
  | 'map'         // Harita
  | 'sidebar'     // Kenar çubuğu
  | 'navigation'  // Navigasyon
  | 'games'       // Oyunlar
  | 'routes';     // Rotalar

// Çeviri yapısı
export type Translations = Record<
  TranslationNamespace,
  Record<LanguageKey, Record<string, string>>
>;
```

---

## 📄 translations.ts
Tüm çeviriler merkezi olarak burada tanımlıdır.

```typescript
export const translations = {
  common: {
    tr: {
      close: 'Kapat',
      loading: 'Yükleniyor...',
      error: 'Hata',
      success: 'Başarılı',
      cancel: 'İptal',
      confirm: 'Onayla',
      save: 'Kaydet',
      delete: 'Sil',
      edit: 'Düzenle',
      back: 'Geri',
      next: 'İleri',
      done: 'Tamam',
    },
    en: {
      close: 'Close',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      // ...
    },
    de: { /* ... */ },
    fr: { /* ... */ },
    es: { /* ... */ },
    it: { /* ... */ },
  },
  
  map: {
    tr: {
      mapStyle: 'Harita Altlığı',
      voyager: 'Voyager',
      dark: 'Karanlık',
      osmBright: 'OSM Bright',
      myLocation: 'Konumum',
      zoomIn: 'Yakınlaştır',
      zoomOut: 'Uzaklaştır',
    },
    // diğer diller...
  },
  
  sidebar: {
    tr: {
      search: 'Ara...',
      allCategories: 'Tümü',
      food: 'Yemek',
      nature: 'Doğa',
      culture: 'Kültür-Sanat',
      entertainment: 'Eğlence',
      other: 'Diğer',
      noResults: 'Sonuç bulunamadı',
      nearby: 'Yakınımda',
    },
    // diğer diller...
  },
  
  navigation: {
    tr: {
      startNavigation: 'Navigasyonu Başlat',
      stopNavigation: 'Durdur',
      arrived: 'Hedefe vardınız!',
      turnLeft: 'Sola dön',
      turnRight: 'Sağa dön',
      goStraight: 'Düz devam et',
      // ...
    },
    // diğer diller...
  },
  
  games: { /* ... */ },
  routes: { /* ... */ },
};
```

---

## 📄 useTranslation.ts
Ana çeviri hook'u.

```typescript
interface UseTranslationReturn {
  t: (key: string, params?: Record<string, string>) => string;
  language: LanguageKey;
}

export function useTranslation(
  namespace: TranslationNamespace,
  language: LanguageKey
): UseTranslationReturn
```

**Kullanım:**
```tsx
import { useTranslation } from '../i18n';

function MyComponent({ language }: { language: LanguageKey }) {
  const { t } = useTranslation('sidebar', language);
  
  return (
    <div>
      <h1>{t('search')}</h1>
      <p>{t('noResults')}</p>
    </div>
  );
}
```

**Parametre Desteği:**
```tsx
// translations.ts
{
  greeting: 'Merhaba, {name}!'
}

// Kullanım
t('greeting', { name: 'Ahmet' }) // "Merhaba, Ahmet!"
```

---

## 📄 I18nContext.tsx
Context Provider (opsiyonel, şu an props ile geçiliyor).

```tsx
import { I18nProvider } from '../i18n';

function App() {
  return (
    <I18nProvider defaultLanguage="tr">
      <MyApp />
    </I18nProvider>
  );
}

// Child component'te
function Child() {
  const { language, setLanguage, t } = useI18n();
  
  return (
    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
      <option value="tr">Türkçe</option>
      <option value="en">English</option>
    </select>
  );
}
```

---

## 🎨 Bileşenlerde Dil Desteği Pattern

### Pattern 1: Props ile (Mevcut Kullanım)

```tsx
interface MyComponentProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
}

const MyComponent = ({ language }: MyComponentProps) => {
  const { t } = useTranslation('common', language);
  
  return <button>{t('save')}</button>;
};
```

### Pattern 2: Inline Translations Object

```tsx
const translations = {
  tr: { title: 'Başlık', button: 'Tıkla' },
  en: { title: 'Title', button: 'Click' },
  de: { title: 'Titel', button: 'Klicken' },
  fr: { title: 'Titre', button: 'Cliquer' },
  es: { title: 'Título', button: 'Clic' },
  it: { title: 'Titolo', button: 'Clicca' },
};

const MyComponent = ({ language }) => {
  const t = translations[language];
  
  return (
    <div>
      <h1>{t.title}</h1>
      <button>{t.button}</button>
    </div>
  );
};
```

---

## ➕ Yeni Dil Ekleme Rehberi

1. **types.ts** güncelle:
```typescript
export type LanguageKey = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ja'; // Japonca eklendi
```

2. **translations.ts** güncelle:
```typescript
common: {
  // mevcut diller...
  ja: {
    close: '閉じる',
    loading: '読み込み中...',
    // ...
  }
},
```

3. **Dil seçici** güncelle (Map.tsx):
```typescript
const LANGUAGES = {
  // mevcut...
  ja: { name: '日本語', code: 'JP' }
};
```

---

## 📊 Çeviri Kapsamı

| Namespace | Anahtar Sayısı | Tamamlanma |
|-----------|----------------|------------|
| common | 12 | ✅ 100% |
| map | 8 | ✅ 100% |
| sidebar | 15 | ✅ 100% |
| navigation | 12 | ✅ 100% |
| games | 40+ | ✅ 100% |
| routes | 20+ | ✅ 100% |

---

## ✅ Best Practices

1. **Merkezi Yönetim**: Tüm çeviriler `translations.ts`'te
2. **Type Safety**: LanguageKey ve namespace tiplemeleri
3. **Fallback**: Çeviri bulunamazsa key döner
4. **Parametre Desteği**: Dinamik değerler için `{param}` syntax
5. **Lazy Loading**: Büyük çeviri dosyaları için (gelecekte)
