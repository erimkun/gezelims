# 🗺️ Gezelims - AI Coding Instructions

## Proje Özeti
Üsküdar ilçesi için interaktif harita ve mini oyunlar içeren React/TypeScript uygulaması. MapLibre GL ile POI (Point of Interest) görselleştirme, 6 dil desteği ve 13 mini oyun içerir.

## 🏗️ Mimari

### Dizin Yapısı
```
pearl_of_the_istanbul/     # Ana uygulama
├── src/
│   ├── components/        # React bileşenleri
│   │   ├── games/         # 13 mini oyun (MemoryGame, Game2048, UskudarQuizGame vb.)
│   │   └── routes/        # Rota sayfası bileşenleri
│   ├── config/            # Merkezi konfigürasyon (app.config.ts, categories.config.ts)
│   ├── store/             # Zustand state (authStore, routeStore)
│   ├── i18n/              # 6 dil çeviri sistemi
│   ├── hooks/             # Custom hooks (useWalkingNavigation, useDebounce)
│   └── services/          # Firebase servisleri
├── public/data/           # GeoJSON POI verileri (yemek, doga, kultur-sanat, eglence, diger)
```

### Temel Teknolojiler
- **React 19** + **TypeScript** + **Vite**
- **MapLibre GL** - Harita rendering
- **Zustand** - State management (Redux yerine tercih edildi - minimal API, ~2KB)
- **Firebase** - Auth ve Firestore
- **GeoJSON** - POI veri formatı

## 🌐 Dil Desteği - KRİTİK

Her yeni component **6 dil desteği** içermelidir: `tr`, `en`, `de`, `fr`, `es`, `it`

```typescript
// ✅ DOĞRU PATTERN - Tüm oyunlar bu yapıyı kullanır
interface ComponentProps {
  language?: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
}

const translations = {
  tr: { title: "Başlık", start: "Başla" },
  en: { title: "Title", start: "Start" },
  de: { title: "Titel", start: "Starten" },
  fr: { title: "Titre", start: "Commencer" },
  es: { title: "Título", start: "Empezar" },
  it: { title: "Titolo", start: "Inizia" }
};

const t = translations[language];
```

## 🎮 Mini Oyun Ekleme Paterni

Yeni oyun eklerken:
1. `src/components/games/[OyunAdı]Game.tsx` oluştur
2. `Games.css`'e stiller ekle (`.oyun-adi-game` class'ı ile)
3. `MiniGames.tsx`'e import, translations, gameConfigs ve renderGame case ekle

```typescript
// MiniGames.tsx'e eklenmesi gerekenler:
import YeniOyunGame from './games/YeniOyunGame';

// translations objesine her dil için:
yenioyun: { title: 'Oyun Adı', description: 'Açıklama' },

// gameConfigs array'ine:
{ id: 'yenioyun', color: '#HEX', emoji: '🎯', gradient: 'linear-gradient(...)' },

// renderGame switch'ine:
case 'yenioyun': return <YeniOyunGame language={language} />;
```

## ⚙️ Konfigürasyon Yapısı

Config-driven yaklaşım kullanılır. Hardcoded değerler yerine `src/config/` altındaki dosyalar:
- `app.config.ts` - Navigation, sidebar, harita ayarları
- `categories.config.ts` - POI kategorileri ve renkleri
- `subcategories.config.ts` - Alt kategori mapping

## 🔧 Developer Komutları

```bash
cd pearl_of_the_istanbul
npm run dev     # Vite dev server (http://localhost:5173)
npm run build   # TypeScript + Vite production build
npm run lint    # ESLint
```

## 📍 POI Veri Yapısı (GeoJSON)

```json
{
  "type": "Feature",
  "geometry": { "type": "Point", "coordinates": [29.015, 41.026] },
  "properties": {
    "id": "unique-id",
    "name": "Mekan Adı",
    "category": "food|nature|culture|entertainment|other",
    "subcategory": "Restoran",
    "address": "Adres"
  }
}
```

## ⚠️ Dikkat Edilecek Noktalar

1. **Timer/Interval tipleri**: `NodeJS.Timeout` yerine `ReturnType<typeof setTimeout>` kullan
2. **Game loop'larda useRef**: useState closure sorunlarına karşı `useRef` ile state yönet
3. **Collision detection**: Geçilmiş nesneleri `passed` flag ile işaretle
4. **CSS naming**: Her oyun için `.oyun-adi-game` container class'ı kullan

## 📁 Diğer Projeler

- `data-restorer/` - POI veri işleme araçları (Node.js)

---

## 🔄 Kod Değişikliği Sonrası Zorunlu Workflow

Her kod değişikliğinden sonra aşağıdaki adımlar **SIRASI İLE** uygulanmalıdır:

### 1️⃣ Kontrol Aşaması (Otomatik)

```bash
# TypeScript hata kontrolü
npm run build

# ESLint kod kalitesi kontrolü  
npm run lint

# Hata kontrolü (VS Code get_errors tool)
```

**Kontrol edilecekler:**
- ✅ TypeScript compile hataları yok
- ✅ ESLint uyarıları/hataları yok
- ✅ Uygulama çalışıyor (`npm run dev`)
- ✅ Yeni özellik beklendiği gibi çalışıyor

### 2️⃣ Dokümantasyon Güncelleme (Onay Sonrası)

Kontrol aşaması başarılı ise, ilgili README.md dosyaları güncellenir:

| Değişiklik Yeri | Güncellenecek README |
|-----------------|---------------------|
| `src/components/games/` | `src/components/games/README.md` |
| `src/components/` | `src/components/README.md` |
| `src/hooks/` | `src/hooks/README.md` |
| `src/store/` | `src/store/README.md` |
| `src/config/` | `src/config/README.md` |
| `src/services/` | `src/services/README.md` |
| `src/i18n/` | `src/i18n/README.md` |
| `public/data/` | `public/data/README.md` |

**Dokümantasyon formatı:**
```markdown
### [Bileşen/Dosya Adı]
**Açıklama:** Ne işe yarar
**Özellikler:** Bullet list
**Kullanım:** Kod örneği (gerekirse)
```

### 3️⃣ Git Commit & Push

```bash
# Staging
git add .

# Commit (anlamlı mesaj ile)
git commit -m "feat: [değişiklik açıklaması]"

# veya fix/docs/refactor prefix'leri
git commit -m "fix: [hata düzeltme açıklaması]"
git commit -m "docs: [dokümantasyon güncellemesi]"

# Push
git push
```

**Commit mesaj formatı:**
- `feat:` - Yeni özellik
- `fix:` - Hata düzeltme
- `docs:` - Sadece dokümantasyon
- `refactor:` - Kod iyileştirme
- `style:` - CSS/formatting değişiklikleri

---

## 📋 Workflow Özeti (Checklist)

```
[ ] 1. Kod değişikliği yapıldı
[ ] 2. get_errors ile hata kontrolü
[ ] 3. npm run build başarılı
[ ] 4. npm run lint başarılı  
[ ] 5. Uygulama test edildi
[ ] 6. İlgili README.md güncellendi
[ ] 7. git add . && git commit -m "..." && git push
```
