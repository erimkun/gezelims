# 📁 public/data/ - GeoJSON Veri Dosyaları

Bu dizin, uygulamadaki POI (Point of Interest) verilerini GeoJSON formatında içerir.

---

## 📂 Dizin Yapısı

```
public/data/
├── 📄 yemek.geojson         # Yeme-içme mekanları
├── 📄 doga.geojson          # Doğa ve parklar
├── 📄 kultur-sanat.geojson  # Kültür ve sanat mekanları
├── 📄 eglence.geojson       # Eğlence mekanları
└── 📄 diger.geojson         # Diğer kategoriler
```

---

## 📊 Dosya Detayları

| Dosya | Kategori | İçerik Örnekleri |
|-------|----------|------------------|
| `yemek.geojson` | 🍽️ Yemek | Restoran, Kafe, Pastane, Lokanta |
| `doga.geojson` | 🌿 Doğa | Park, Sahil, Koruluk, Yürüyüş yolu |
| `kultur-sanat.geojson` | 🎭 Kültür-Sanat | Müze, Galeri, Tiyatro, Kültür merkezi |
| `eglence.geojson` | 🎉 Eğlence | Sinema, AVM, Etkinlik mekanları |
| `diger.geojson` | 📍 Diğer | Hastane, Okul, Cami, Otopark |

---

## 📐 GeoJSON Şeması

Her dosya GeoJSON FeatureCollection formatındadır:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [29.015295, 41.026783]  // [longitude, latitude]
      },
      "properties": {
        "id": "poi-unique-id",
        "name": "Mekan Adı",
        "category": "food",
        "subcategory": "Restoran",
        "address": "Adres bilgisi",
        "description": "Açıklama metni",
        "rating": 4.5,
        "reviews_count": 120,
        "phone": "+90 216 123 45 67",
        "website": "https://example.com",
        "workday_timing": "09:00-22:00",
        "closed_on": ["Pazar"],
        "images": [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg"
        ]
      }
    }
  ]
}
```

---

## 📋 Property Açıklamaları

| Property | Tip | Zorunlu | Açıklama |
|----------|-----|---------|----------|
| `id` | string | ✅ | Benzersiz tanımlayıcı |
| `name` | string | ✅ | Mekan adı |
| `category` | string | ✅ | Ana kategori kodu |
| `subcategory` | string | ✅ | Alt kategori |
| `address` | string | ✅ | Adres |
| `description` | string | ❌ | Açıklama |
| `rating` | number | ❌ | Puan (1-5) |
| `reviews_count` | number | ❌ | Yorum sayısı |
| `phone` | string | ❌ | Telefon |
| `website` | string | ❌ | Website URL |
| `workday_timing` | string | ❌ | Çalışma saatleri |
| `closed_on` | string[] | ❌ | Kapalı günler |
| `images` | string[] | ❌ | Resim URL'leri |

---

## 🗺️ Koordinat Sistemi

Dosyalar **WGS84 (EPSG:4326)** koordinat sistemindedir:
- `coordinates[0]` = Longitude (Boylam)
- `coordinates[1]` = Latitude (Enlem)

**Üsküdar Bölgesi Sınırları:**
```
Batı:  28.95° E
Doğu:  29.10° E
Güney: 40.95° N
Kuzey: 41.05° N
```

---

## 📦 Veri Yükleme

Veriler runtime'da fetch edilir ve IndexedDB'de 7 gün cache'lenir:

```typescript
// services/cacheService.ts kullanarak
const loadPOIData = async (category: string) => {
  // 1. Cache kontrol
  const cached = await cacheService.getCachedGeoJSON(category);
  if (cached) return cached;
  
  // 2. Fetch
  const response = await fetch(`/data/${category}.geojson`);
  const data = await response.json();
  
  // 3. Cache'le
  await cacheService.setCachedGeoJSON(category, data);
  
  return data;
};
```

---

## 🔄 Kategori Mapping

```typescript
// config/categories.config.ts ile eşleşme
const CATEGORY_FILES: Record<string, string> = {
  food: 'yemek',           // /data/yemek.geojson
  nature: 'doga',          // /data/doga.geojson
  culture: 'kultur-sanat', // /data/kultur-sanat.geojson
  entertainment: 'eglence', // /data/eglence.geojson
  other: 'diger'           // /data/diger.geojson
};
```

---

## ➕ Yeni Veri Ekleme

### 1. GeoJSON Dosyası Oluştur/Güncelle

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [29.XXXXXX, 41.XXXXXX]
      },
      "properties": {
        "id": "yeni-mekan-id",
        "name": "Yeni Mekan Adı",
        "category": "food",
        "subcategory": "Kafe",
        "address": "Üsküdar, İstanbul"
      }
    }
  ]
}
```

### 2. Koordinat Bulma

Google Maps'ten koordinat almak için:
1. Haritada noktaya sağ tıkla
2. İlk satırdaki koordinatları kopyala
3. **DİKKAT**: Google `[lat, lng]` verir, GeoJSON `[lng, lat]` ister
4. Sırayı ters çevir!

### 3. Validation

```bash
# GeoJSON geçerliliğini kontrol et
npx geojsonhint public/data/yemek.geojson
```

---

## 📊 Veri İstatistikleri

| Kategori | Tahmini POI Sayısı |
|----------|-------------------|
| Yemek | ~400 |
| Doğa | ~100 |
| Kültür-Sanat | ~150 |
| Eğlence | ~80 |
| Diğer | ~270 |
| **Toplam** | **~1000** |

---

## 🛡️ Veri Güvenliği

- Hassas kişisel veri içermez
- Tüm veriler herkese açıktır
- API key gerektirmez
- Rate limit yoktur (static files)

---

## ✅ Best Practices

1. **Koordinat Doğruluğu**: 6 ondalık basamak yeterli (~10cm hassasiyet)
2. **ID Benzersizliği**: Her POI'nin unique ID'si olmalı
3. **UTF-8 Encoding**: Türkçe karakterler için
4. **Validate Before Commit**: GeoJSON syntax kontrolü
5. **Incremental Updates**: Tüm dosyayı değil, sadece değişenleri güncelle
