# 🚀 Geliştirici Rehberi

Pearl of Istanbul projesine katkıda bulunmak veya lokal geliştirme yapmak için bu rehberi takip edin.

---

## 📋 Gereksinimler

| Araç | Minimum Versiyon | Önerilen |
|------|------------------|----------|
| Node.js | 18.x | 20.x |
| npm | 9.x | 10.x |
| Git | 2.x | En son |
| VS Code | 1.85+ | En son |

---

## 🔧 Kurulum

### 1. Repository'yi Klonla

```bash
git clone https://github.com/your-username/gezelims.git
cd gezelims/pearl_of_the_istanbul
```

### 2. Bağımlılıkları Yükle

```bash
npm install
```

### 3. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

Uygulama `http://localhost:5173` adresinde çalışacaktır.

---

## 📜 NPM Scripts

| Script | Açıklama |
|--------|----------|
| `npm run dev` | Geliştirme sunucusunu başlat |
| `npm run build` | Production build oluştur |
| `npm run preview` | Build'i önizle |
| `npm run lint` | ESLint ile kod kontrolü |

---

## 📁 Proje Yapısı

```
pearl_of_the_istanbul/
├── 📁 docs/                    # Ekstra dokümantasyon
├── 📁 public/
│   └── 📁 data/               # GeoJSON POI verileri
├── 📁 src/
│   ├── 📄 App.tsx             # Ana uygulama
│   ├── 📄 main.tsx            # Entry point
│   ├── 📁 components/         # React bileşenleri
│   │   ├── 📁 games/         # Mini oyunlar
│   │   └── 📁 routes/        # Rota sayfası
│   ├── 📁 config/            # Konfigürasyonlar
│   ├── 📁 hooks/             # Custom hooks
│   ├── 📁 i18n/              # Çoklu dil
│   ├── 📁 services/          # API servisleri
│   ├── 📁 store/             # Zustand state
│   ├── 📁 types/             # TypeScript tipleri
│   └── 📁 utils/             # Yardımcı fonksiyonlar
├── 📄 index.html
├── 📄 package.json
├── 📄 tsconfig.json
└── 📄 vite.config.ts
```

---

## 🎯 Geliştirme Akışı

### 1. Branch Stratejisi

```
main          ← Production-ready kod
  └── develop    ← Aktif geliştirme
       ├── feature/xyz    ← Yeni özellik
       ├── bugfix/abc     ← Bug düzeltmesi
       └── hotfix/123     ← Acil düzeltme
```

### 2. Commit Conventions

```bash
# Format: <type>(<scope>): <description>

feat(map): add zoom controls
fix(sidebar): fix scroll issue on mobile
docs(readme): update installation guide
style(ui): improve button hover states
refactor(services): extract API logic
test(utils): add unit tests for geoUtils
chore(deps): update dependencies
```

### 3. Pull Request Süreci

1. Feature branch oluştur
2. Değişikliklerini commit et
3. `npm run lint` ile kod kontrolü
4. `npm run build` ile build kontrolü
5. Pull request aç
6. Code review bekle
7. Merge

---

## 🧩 Yeni Bileşen Ekleme

### 1. Dosya Oluştur

```
src/components/
├── MyComponent.tsx
└── MyComponent.css
```

### 2. Bileşen Template

```tsx
// MyComponent.tsx
import { useState } from 'react';
import './MyComponent.css';

type LanguageKey = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';

interface MyComponentProps {
  language: LanguageKey;
  onAction?: () => void;
}

const translations = {
  tr: { title: 'Başlık', button: 'Tıkla' },
  en: { title: 'Title', button: 'Click' },
  de: { title: 'Titel', button: 'Klicken' },
  fr: { title: 'Titre', button: 'Cliquer' },
  es: { title: 'Título', button: 'Clic' },
  it: { title: 'Titolo', button: 'Clicca' },
};

const MyComponent = ({ language, onAction }: MyComponentProps) => {
  const t = translations[language];
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="my-component">
      <h2 className="my-component__title">{t.title}</h2>
      <button 
        className="my-component__button"
        onClick={() => {
          setIsActive(!isActive);
          onAction?.();
        }}
      >
        {t.button}
      </button>
    </div>
  );
};

export default MyComponent;
```

### 3. CSS Template

```css
/* MyComponent.css */
.my-component {
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 8px;
}

.my-component__title {
  margin: 0 0 1rem;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.my-component__button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: var(--accent-color);
  color: white;
  cursor: pointer;
  transition: opacity 0.2s;
}

.my-component__button:hover {
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 768px) {
  .my-component {
    padding: 0.75rem;
  }
}
```

---

## 🎮 Yeni Oyun Ekleme

1. `src/components/games/` altında dosya oluştur
2. Template'i kullan (games/README.md'ye bak)
3. `MiniGames.tsx`'e import et
4. Oyun kartı ekle

---

## 🌐 Çeviri Ekleme

### Mevcut Namespace'e Ekleme

```typescript
// src/i18n/translations.ts
export const translations = {
  common: {
    tr: {
      // Mevcut...
      newKey: 'Yeni metin',
    },
    en: {
      // Mevcut...
      newKey: 'New text',
    },
    // Diğer diller...
  },
};
```

### Bileşende Kullanım

```tsx
const { t } = useTranslation('common', language);
<span>{t('newKey')}</span>
```

---

## 🔌 Firebase Kurulumu

### Firebase Console

1. [Firebase Console](https://console.firebase.google.com) aç
2. "gezelim-b492b" projesi
3. Authentication → Sign-in methods → Google'ı etkinleştir
4. Firestore → Rules'ı güncelle

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Routes
    match /routes/{routeId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // Comments
    match /routes/{routeId}/comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 🐛 Debug İpuçları

### Console Logları

Uygulama detaylı console log'ları üretir:

```
📍 Konum: POI yükleme
🗺️ Harita: Harita işlemleri
✅ Başarı: Başarılı işlemler
❌ Hata: Hatalar
🔄 Yenileme: State güncellemeleri
```

### React DevTools

1. React DevTools extension yükle
2. Components tab'ından state/props incele

### Network Tab

1. DevTools → Network
2. `geojson` filtrele → POI yüklemelerini gör
3. `firestore` filtrele → Database işlemlerini gör

---

## 📊 Performans Analizi

### Lighthouse

```bash
# Production build ile test et
npm run build
npm run preview
# Chrome DevTools → Lighthouse → Generate report
```

### React Profiler

1. React DevTools → Profiler tab
2. Record → Interaksiyon yap → Stop
3. Flame graph analiz et

---

## 🧪 Test Yazma (Önerilen)

### Unit Test Template

```typescript
// __tests__/utils/geoUtils.test.ts
import { calculateDistance, formatDistance } from '../utils/geoUtils';

describe('geoUtils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance correctly', () => {
      const distance = calculateDistance(
        [29.015, 41.026],
        [29.025, 41.030]
      );
      expect(distance).toBeCloseTo(1.0, 1);
    });
  });

  describe('formatDistance', () => {
    it('should format meters correctly', () => {
      expect(formatDistance(0.5)).toBe('500m');
    });

    it('should format kilometers correctly', () => {
      expect(formatDistance(2.5)).toBe('2.5km');
    });
  });
});
```

---

## 📝 VS Code Önerilen Eklentiler

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "formulahendry.auto-rename-tag",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

---

## 🚀 Production Deploy

### Vercel (Önerilen)

```bash
# Vercel CLI
npm i -g vercel
vercel login
vercel --prod
```

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy --only hosting
```

---

## 💡 Yardım & Destek

- **Bug Report**: GitHub Issues
- **Feature Request**: GitHub Issues
- **Sorular**: GitHub Discussions

---

<div align="center">

**Happy Coding! 🎉**

</div>
