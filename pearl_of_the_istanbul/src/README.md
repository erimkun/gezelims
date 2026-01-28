# 📁 src/ - Kaynak Kod Dizini

Bu dizin, uygulamanın tüm kaynak kodlarını içerir.

---

## 📂 Dizin Yapısı

```
src/
├── 📄 App.tsx              # Ana uygulama bileşeni
├── 📄 App.css              # Global stiller
├── 📄 main.tsx             # React entry point
├── 📄 index.css            # Root stiller
├── 📄 vite-env.d.ts        # Vite type tanımları
│
├── 📁 assets/              # Statik dosyalar (resim, font vb.)
├── 📁 components/          # React bileşenleri
├── 📁 config/              # Konfigürasyon dosyaları
├── 📁 data/                # Yerel veri dosyaları
├── 📁 hooks/               # Custom React hooks
├── 📁 i18n/                # Çoklu dil desteği
├── 📁 services/            # API servisleri
├── 📁 store/               # Zustand state yönetimi
├── 📁 types/               # TypeScript tip tanımları
└── 📁 utils/               # Yardımcı fonksiyonlar
```

---

## 📄 Ana Dosyalar

### `main.tsx`
React uygulamasının başlangıç noktası. StrictMode ile App bileşenini render eder.

### `App.tsx`
Ana uygulama bileşeni. Şu işlevleri içerir:
- **Sayfa yönlendirme**: Map, MiniGames, Routes sayfaları arası geçiş
- **Global state**: POI cache, dil seçimi, sidebar durumu
- **Auth initialization**: Firebase auth dinleyicisi
- **Lazy loading**: Ağır bileşenlerin dinamik yüklenmesi

```tsx
// Lazy loaded bileşenler
const Map = lazy(() => import('./components/Map'))
const Sidebar = lazy(() => import('./components/Sidebar'))
const MiniGames = lazy(() => import('./components/MiniGames'))
const RoutesPage = lazy(() => import('./components/routes/RoutesPage'))
```

### `App.css`
Global CSS stilleri:
- CSS değişkenleri (renkler, spacing)
- Sidebar toggle butonu
- Responsive breakpoints
- Animasyonlar

---

## 🧩 Alt Dizin Özeti

| Dizin | Açıklama | Dosya Sayısı |
|-------|----------|--------------|
| `components/` | UI bileşenleri | ~30 |
| `config/` | Uygulama ayarları | 5 |
| `hooks/` | Custom hooks | 6 |
| `i18n/` | Çeviri sistemi | 7 |
| `services/` | API katmanı | 4 |
| `store/` | State yönetimi | 3 |
| `types/` | Tip tanımları | 1 |
| `utils/` | Yardımcı fonksiyonlar | 5 |

---

## 🔗 İlişkili Dokümantasyonlar

- [components/README.md](./components/README.md) - Bileşenler detayı
- [config/README.md](./config/README.md) - Konfigürasyon detayı
- [services/README.md](./services/README.md) - Servisler detayı
- [store/README.md](./store/README.md) - State yönetimi detayı
