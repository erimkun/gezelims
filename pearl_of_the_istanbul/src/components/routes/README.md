# 📁 routes/ - Gezi Rotaları Bileşenleri

Bu dizin, kullanıcıların gezi rotaları oluşturup paylaşabildiği "Routes" sayfasının bileşenlerini içerir.

---

## 📂 Dizin Yapısı

```
routes/
├── 📄 index.ts                  # Barrel export
├── 📄 RoutesPage.tsx            # Ana sayfa bileşeni
├── 📄 RoutesPage.css
├── 📄 RoutesSidebar.tsx         # Rota listesi sidebar
├── 📄 RoutesSidebar.css
├── 📄 RouteCreationPanel.tsx    # Yeni rota oluşturma
├── 📄 RouteCreationPanel.css
├── 📄 RoutePointPopup.tsx       # Rota noktası popup
├── 📄 RoutePointPopup.css
├── 📄 RouteComments.tsx         # Yorum sistemi
├── 📄 RouteComments.css
├── 📄 AuthButton.tsx            # Google giriş butonu
└── 📄 AuthButton.css
```

---

## 🗺️ Sayfa Mimarisi

```
┌─────────────────────────────────────────────────────────────────┐
│                         RoutesPage                               │
├─────────────────┬───────────────────────────────────────────────┤
│                 │                                               │
│  RoutesSidebar  │              MapLibre GL Map                  │
│                 │                                               │
│  ┌───────────┐  │     ┌─────────────────────────────────┐       │
│  │ AuthButton│  │     │                                 │       │
│  └───────────┘  │     │     POI Markers                 │       │
│                 │     │         +                       │       │
│  ┌───────────┐  │     │     Route Lines                 │       │
│  │ Route     │  │     │                                 │       │
│  │ Cards     │  │     │                                 │       │
│  │ (List)    │  │     └─────────────────────────────────┘       │
│  └───────────┘  │                                               │
│                 │     ┌─────────────────────────────────┐       │
│                 │     │ RouteCreationPanel (overlay)    │       │
│                 │     │ RoutePointPopup (modal)         │       │
│                 │     │ RouteComments (modal)           │       │
│                 │     └─────────────────────────────────┘       │
└─────────────────┴───────────────────────────────────────────────┘
```

---

## 📄 Bileşen Detayları

### `RoutesPage.tsx`
Ana Routes sayfası. Harita ve sidebar'ı birleştirir.

**Sorumluluklar:**
- MapLibre GL harita yönetimi
- POI verilerini yükleme
- Rota çizgilerini haritada gösterme
- Viewport'taki rotaları filtreleme
- Sayfa state orchestration

**Props:**
```typescript
interface RoutesPageProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
  onBack: () => void;  // Ana haritaya dön
}
```

---

### `RoutesSidebar.tsx`
Rota listesi ve filtrelerini gösterir.

**Özellikler:**
- Popüler rotalar listesi
- Kullanıcının kendi rotaları
- Rota arama
- Tag bazlı filtreleme
- Sonsuz scroll

**Rota Etiketleri:**
```typescript
const ROUTE_TAGS = [
  { key: 'romantic', emoji: '💕', label: 'Romantik' },
  { key: 'historical', emoji: '🏛️', label: 'Tarihi' },
  { key: 'food', emoji: '🍽️', label: 'Lezzet Turu' },
  { key: 'nature', emoji: '🌳', label: 'Doğa' },
  { key: 'art', emoji: '🎨', label: 'Sanat' },
  { key: 'adventure', emoji: '🎒', label: 'Macera' },
  { key: 'family', emoji: '👨‍👩‍👧‍👦', label: 'Aile' },
  { key: 'night', emoji: '🌙', label: 'Gece Turu' }
];
```

---

### `RouteCreationPanel.tsx`
Yeni rota oluşturma paneli.

**Özellikler:**
- Rota başlığı girişi
- Rota açıklaması
- Tag seçimi (multi-select)
- Seçilen POI noktaları listesi
- Sürükle-bırak sıralama
- Kaydet/İptal butonları

**Rota Noktası:**
```typescript
interface RoutePoint {
  poiId: string;
  poiName: string;
  poiImage?: string;
  commentPhoto?: string;  // Kullanıcı fotoğrafı
  coordinates: [number, number];
  rating: number;         // 1-5 mutluluk skoru
  comment: string;
  order: number;
}
```

---

### `RoutePointPopup.tsx`
Haritada POI'ye tıklandığında açılan popup.

**Özellikler:**
- POI bilgilerini göster
- "Rotaya Ekle" butonu
- Mutluluk skoru seçimi (emoji)
- Yorum girişi
- Fotoğraf yükleme

---

### `RouteComments.tsx`
Rota yorumları modalı.

**Özellikler:**
- Yorum listesi
- Yeni yorum ekleme (giriş yapılmışsa)
- Yorum silme (kendi yorumu)
- Kullanıcı avatarları

---

### `AuthButton.tsx`
Google ile giriş butonu.

**Durumlar:**
- `Logged Out`: Google ile Giriş Yap butonu
- `Loading`: Yükleniyor spinner
- `Logged In`: Kullanıcı profil resmi + Çıkış

---

## 🔄 Veri Akışı

```
1. ROTA OLUŞTURMA
   User → RouteCreationPanel → routeStore.addPoint()
                            → routeStore.saveRoute()
                            → routeService.createRoute()
                            → Firestore 'routes' collection

2. ROTA LİSTELEME
   RoutesPage mount → routeStore.loadRoutes()
                   → routeService.getAllRoutes()
                   → Firestore query
                   → RoutesSidebar (render)

3. OY VERME
   User click → routeStore.voteForRoute()
             → routeService.voteRoute()
             → Firestore increment

4. YORUM EKLEME
   User submit → routeStore.addRouteComment()
              → routeService.addComment()
              → Firestore subcollection
```

---

## 🔐 Yetkilendirme Kuralları

| İşlem | Giriş Gerekli | Sahiplik Gerekli |
|-------|---------------|------------------|
| Rotaları görüntüle | ❌ | ❌ |
| Rota oluştur | ✅ | - |
| Rota düzenle | ✅ | ✅ |
| Rota sil | ✅ | ✅ |
| Oy ver | ✅ | ❌ |
| Yorum ekle | ✅ | - |
| Yorum sil | ✅ | ✅ |

---

## 🎨 Harita Görselleştirme

### Rota Çizgisi
```typescript
// GeoJSON LineString olarak çizilir
map.addLayer({
  id: `route-${routeId}`,
  type: 'line',
  paint: {
    'line-color': categoryColor,
    'line-width': 4,
    'line-opacity': 0.8
  }
});
```

### Rota Noktaları
```typescript
// Sıra numaralı marker'lar
const marker = new maplibregl.Marker({ 
  element: createNumberedMarker(index + 1)
})
.setLngLat(coordinates);
```

---

## 📱 Responsive Davranış

| Ekran | Sidebar | Harita |
|-------|---------|--------|
| Desktop (>768px) | Sol taraf, 400px | Kalan alan |
| Mobil (<768px) | Alt sheet (swipe) | Tam ekran |
