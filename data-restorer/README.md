# GeoJSON Data Restorer & Categorizer 🗺️

GeoJSON verilerinizi AI kullanarak otomatik olarak kategorize eden ve temizleyen araç.

## 🎯 Özellikler

- **Çoklu AI Sağlayıcı Desteği**: Ollama, OpenAI, Anthropic (Claude), Google (Gemini), OpenRouter, VSCode Copilot
- **Akıllı Kategorilendirme**: 5 ana kategoriye otomatik ayırma
- **POI Analizi**: Point of Interest olmayan yerleri otomatik tespit
- **Batch İşleme**: Büyük veri setleri için optimize edilmiş
- **Detaylı Raporlama**: JSON formatında istatistik raporları
- **Log Sistemi**: Renkli konsol ve dosya logları

## 📁 Proje Yapısı

```
data-restorer/
├── src/
│   ├── index.js          # Ana uygulama
│   ├── aiProvider.js     # AI sağlayıcı adaptörleri
│   ├── categorizer.js    # GeoJSON işleyici
│   └── logger.js         # Log sistemi
├── config/
│   └── config.js         # Konfigürasyon
├── output/               # İşlenmiş dosyalar
├── logs/                 # Log dosyaları
├── .env.example          # Ortam değişkenleri örneği
├── package.json
└── README.md
```

## 🚀 Kurulum

### 1. Projeyi Klonlayın

```bash
cd data-restorer
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarlayın

`.env.example` dosyasını `.env` olarak kopyalayın:

```bash
copy .env.example .env
```

`.env` dosyasını düzenleyin:

```env
# AI Provider Seçimi
AI_PROVIDER=google

# Ollama Ayarları (Yerel AI için)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest

# OpenAI (opsiyonel)
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini

# Anthropic/Claude (opsiyonel)
ANTHROPIC_API_KEY=your_key_here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Google/Gemini (opsiyonel)
GOOGLE_API_KEY=your_key_here
GOOGLE_MODEL=gemini-1.5-flash

# OpenRouter (opsiyonel - tüm modellere tek API)
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free

# VSCode Copilot (opsiyonel)
VSCODE_COPILOT_ENABLED=false
```

## 📖 Kullanım

### Hızlı Başlangıç

```bash
# Google Gemini ile (Önerilen - Ücretsiz API)
npm run gemini

# OpenAI ile
npm run openai

# Claude ile
npm run claude

# Ollama ile (Yerel)
npm run ollama

# OpenRouter ile (Çok sayıda model)
npm run openrouter

# VSCode Copilot ile
npm run copilot
```

### Detaylı Kullanım

#### 1️⃣ Google Gemini ile Kullanım (Önerilen - Ücretsiz) 🆓

Google Gemini ücretsiz API sunar ve oldukça güçlüdür.

```bash
# 1. API Key alın: https://makersuite.google.com/app/apikey
# 2. .env dosyasına ekleyin:
GOOGLE_API_KEY=your_google_api_key_here
AI_PROVIDER=google

# 3. Çalıştırın:
npm run gemini

# veya
node src/index.js --provider google --input ../pearl_of_the_istanbul/public/data/diger.geojson
```

#### 2️⃣ OpenRouter ile Kullanım (Çok Sayıda Model) 🌐

OpenRouter ile tek bir API key ile yüzlerce modele erişebilirsiniz (ücretsiz modeller dahil).

```bash
# 1. API Key alın: https://openrouter.ai/keys
# 2. .env dosyasına ekleyin:
OPENROUTER_API_KEY=your_openrouter_key_here
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
AI_PROVIDER=openrouter

# 3. Çalıştırın:
npm run openrouter
```

**Önerilen Ücretsiz Modeller:**
- `google/gemini-2.0-flash-exp:free` - Google'ın yeni modeli (Hızlı)
- `meta-llama/llama-3.1-8b-instruct:free` - Meta'nın güçlü modeli
- `mistralai/mistral-7b-instruct:free` - Mistral AI

**Ücretli Premium Modeller:**
- `anthropic/claude-3.5-sonnet` - En iyi kalite
- `openai/gpt-4o` - GPT-4 Optimized
- `google/gemini-pro-1.5` - Google'ın en güçlü modeli

#### 3️⃣ VSCode GitHub Copilot ile Kullanım 💻

VSCode'da GitHub Copilot extension'ı varsa, onu da kullanabilirsiniz!

```bash
# 1. VSCode'da GitHub Copilot extension'ı yüklü olmalı
# 2. .env dosyasını düzenleyin:
VSCODE_COPILOT_ENABLED=true
AI_PROVIDER=vscode-copilot

# 3. Çalıştırın:
npm run copilot
```

**Not**: Bu özellik deneyseldir ve VSCode komut satırı desteği gerektirir.

#### 4️⃣ Ollama ile Kullanım (Yerel - Ücretsiz) 🏠

Kendi bilgisayarınızda AI çalıştırın (GPU gerektirir).

```bash
# 1. Ollama'yı indirin: https://ollama.ai/download

# 2. Bir model indirin:
ollama pull llama3.2        # Küçük, hızlı
ollama pull mistral         # Orta boy
ollama pull llama3.1:8b     # Güçlü (8GB+ GPU)

# 3. .env dosyasını düzenleyin:
AI_PROVIDER=ollama
OLLAMA_MODEL=llama3.2:latest

# 4. Çalıştırın:
npm run ollama
```

#### 5️⃣ OpenAI ile Kullanım 💰

```bash
# 1. API Key alın: https://platform.openai.com/api-keys
# 2. .env dosyasına ekleyin:
OPENAI_API_KEY=your_openai_key_here
AI_PROVIDER=openai

# 3. Çalıştırın:
npm run openai
```

#### 6️⃣ Anthropic (Claude) ile Kullanım 💰

```bash
# 1. API Key alın: https://console.anthropic.com/
# 2. .env dosyasına ekleyin:
ANTHROPIC_API_KEY=your_anthropic_key_here
AI_PROVIDER=anthropic

# 3. Çalıştırın:
npm run claude
```

### Komut Satırı Parametreleri

```bash
# Tek dosya işle
node src/index.js --provider google --input path/to/file.geojson

# Klasördeki tüm dosyaları işle
node src/index.js --provider google --input path/to/folder --output ./output

# Özel batch boyutu
node src/index.js --provider google --input file.geojson --batch 20

# Yardım
node src/index.js --help
```

## 🎯 Kategoriler

Sistem şu 5 ana kategoriye ayırır:

1. **kultur-sanat**: Müzeler, tarihi yerler, camiler, kiliseler, anıtlar, sanat galerileri
2. **doga**: Parklar, bahçeler, mesire alanları, plajlar, doğal alanlar
3. **eglence**: Eğlence merkezleri, stadyumlar, tiyatrolar, sinemalar, konser salonları
4. **yemek**: Restoranlar, kafeler, pastaneler, fast food yerleri
5. **diger**: Point of interest olmayan yerler

### POI Olmayan Yerler (Otomatik 'diger' kategorisine gider)

- Hastaneler, klinikler, eczaneler
- Okullar, üniversiteler, kreşler
- Kamu binaları, belediye, muhtarlık
- Otoparklar, taksi durakları, kargo şirketleri
- Oteller, pansiyonlar
- Marketler, bakkallar, berberler

## 📊 Çıktılar

İşlem sonunda şunlar oluşturulur:

1. **Kategorize Edilmiş GeoJSON Dosyaları**:
   - `kultur-sanat_from_diger.geojson`
   - `doga_from_diger.geojson`
   - `eglence_from_diger.geojson`
   - `yemek_from_diger.geojson`
   - `diger_from_diger.geojson`

2. **İstatistik Raporu** (`report_*.json`):
```json
{
  "summary": {
    "total": 1000,
    "processed": 1000,
    "errors": 0,
    "duration_seconds": "120.45"
  },
  "categorization": {
    "kultur-sanat": 250,
    "doga": 150,
    "eglence": 100,
    "yemek": 300,
    "diger": 200
  },
  "poi_analysis": {
    "poi": 800,
    "non_poi": 200,
    "poi_percentage": "80.00"
  }
}
```

3. **Log Dosyası** (`logs/log_*.txt`)

## ⚙️ Yapılandırma

[`config/config.js`](config/config.js) dosyasından ayarları değiştirebilirsiniz:

```javascript
export const CONFIG = {
  BATCH_SIZE: 50,        // Her seferde kaç öğe işlenecek
  DELAY_MS: 1000,        // Batch'ler arası gecikme (ms)
  // ... diğer ayarlar
};
```

## 🆚 Provider Karşılaştırması

| Provider | Maliyet | Hız | Kalite | Kurulum |
|----------|---------|-----|--------|---------|
| **Google Gemini** | 🆓 Ücretsiz | ⚡⚡⚡ Çok Hızlı | ⭐⭐⭐⭐ Mükemmel | ✅ Kolay |
| **OpenRouter** | 🆓 + 💰 Karma | ⚡⚡⚡ Hızlı | ⭐⭐⭐⭐⭐ Seçime Bağlı | ✅ Kolay |
| **VSCode Copilot** | 💰 Abonelik | ⚡⚡ Orta | ⭐⭐⭐⭐ İyi | ⚠️ VSCode Gerekli |
| **Ollama** | 🆓 Ücretsiz | ⚡ Yavaş | ⭐⭐⭐ İyi | ⚠️ GPU Gerekli |
| **OpenAI** | 💰 Ücretli | ⚡⚡⚡ Hızlı | ⭐⭐⭐⭐⭐ Mükemmel | ✅ Kolay |
| **Anthropic** | 💰 Ücretli | ⚡⚡ Orta | ⭐⭐⭐⭐⭐ Mükemmel | ✅ Kolay |

**Önerimiz**: Google Gemini veya OpenRouter ile başlayın (ücretsiz ve kaliteli).

## 🐛 Sorun Giderme

### "Ollama'ya bağlanılamıyor" Hatası

1. Ollama'nın çalıştığından emin olun:
```bash
ollama list
```

2. URL'yi kontrol edin:
```env
OLLAMA_BASE_URL=http://localhost:11434
```

3. GPU belleği yetersizse daha küçük model deneyin:
```bash
ollama pull llama3.2  # Daha küçük
```

### "API Key Geçersiz" Hatası

`.env` dosyasında API anahtarınızı kontrol edin.

### "Out of Memory" Hatası

Batch boyutunu azaltın:
```javascript
BATCH_SIZE: 10
```

### VSCode Copilot Çalışmıyor

1. VSCode'da GitHub Copilot extension yüklü olmalı
2. GitHub hesabınızla giriş yapmış olmalısınız
3. Copilot aboneliğiniz aktif olmalı

## 📝 Örnek İş Akışı

```bash
# 1. Google API Key alın (ücretsiz)
# https://makersuite.google.com/app/apikey

# 2. .env dosyasını oluşturun
copy .env.example .env
# GOOGLE_API_KEY'i ekleyin

# 3. Veriyi işleyin
cd data-restorer
npm install
npm run gemini

# 4. Sonuçları kontrol edin
dir output
```

## 🔧 Gelişmiş Kullanım

### OpenRouter ile Farklı Modeller

```bash
# .env dosyasında model değiştirin:
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
# veya
OPENROUTER_MODEL=openai/gpt-4o
# veya
OPENROUTER_MODEL=meta-llama/llama-3.1-70b-instruct
```

### Batch Boyutunu Ayarlama

Büyük dosyalar için batch boyutunu artırın:

```javascript
// config/config.js
BATCH_SIZE: 100,  // Daha hızlı işlem
DELAY_MS: 500,    // Daha az gecikme
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

MIT License

## 🙏 Teşekkürler

- [Ollama](https://ollama.ai/) - Yerel AI çalıştırma
- [OpenAI](https://openai.com/) - GPT modelleri
- [Anthropic](https://anthropic.com/) - Claude modelleri
- [Google](https://ai.google.dev/) - Gemini modelleri
- [OpenRouter](https://openrouter.ai/) - Birleşik AI API
- [GitHub Copilot](https://github.com/features/copilot) - AI kod asistanı

---

**Not**: Bu araç gezi rotası uygulamaları için optimize edilmiştir. Kategorilendirme mantığını kendi ihtiyaçlarınıza göre [`config/config.js`](config/config.js) dosyasından özelleştirebilirsiniz.