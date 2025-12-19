# 🚀 Hızlı Başlangıç Rehberi

## En Hızlı Yol (Google Gemini - Ücretsiz) ⚡

### 1. API Key Alın (2 dakika)
1. [Google AI Studio](https://makersuite.google.com/app/apikey) adresine gidin
2. Google hesabınızla giriş yapın
3. "Create API Key" butonuna tıklayın
4. API anahtarınızı kopyalayın

### 2. Kurulum (2 dakika)
```bash
cd data-restorer
npm install
```

### 3. Ayarları Yapın (1 dakika)
`.env` dosyasını açın ve şunları değiştirin:
```env
AI_PROVIDER=google
GOOGLE_API_KEY=buraya-api-keyinizi-yapistirin
```

### 4. Çalıştırın! (Anında) 🎉
```bash
npm run gemini
```

İşte bu kadar! Sonuçlarınız `output/` klasöründe.

---

## Alternatif Yöntemler

### OpenRouter (100+ Model, Bazıları Ücretsiz) 🌐

```bash
# 1. API Key: https://openrouter.ai/keys
# 2. .env dosyasında:
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your-key-here
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free

# 3. Çalıştır:
npm run openrouter
```

**Ücretsiz Modeller:**
- `google/gemini-2.0-flash-exp:free`
- `meta-llama/llama-3.1-8b-instruct:free`
- `mistralai/mistral-7b-instruct:free`

### VSCode Copilot (Eğer Aboneliğiniz Varsa) 💻

```bash
# 1. VSCode'da GitHub Copilot extension yüklü olmalı
# 2. .env dosyasında:
AI_PROVIDER=vscode-copilot
VSCODE_COPILOT_ENABLED=true

# 3. Çalıştır:
npm run copilot
```

### Ollama (Yerel - GPU Gerekir) 🏠

```bash
# 1. Ollama indirin: https://ollama.ai/download
# 2. Model indirin:
ollama pull llama3.2

# 3. .env dosyasında:
AI_PROVIDER=ollama
OLLAMA_MODEL=llama3.2:latest

# 4. Çalıştır:
npm run ollama
```

---

## Komutlar Özeti

```bash
npm run gemini      # Google Gemini (Önerilen)
npm run openrouter  # OpenRouter (Çok seçenek)
npm run copilot     # VSCode Copilot
npm run ollama      # Yerel model
npm run openai      # OpenAI GPT
npm run claude      # Anthropic Claude
```

---

## Sorun mu Yaşıyorsunuz?

### "API Key geçersiz"
- API anahtarınızı `.env` dosyasında kontrol edin
- Tırnak işareti kullanmayın: `GOOGLE_API_KEY=abc123`

### "Module bulunamadı"
```bash
npm install
```

### "Ollama bağlanamıyor"
```bash
# Ollama çalışıyor mu?
ollama list

# Çalışmıyorsa başlatın
ollama serve
```

### Hala sorun mu var?
README.md dosyasındaki detaylı [Sorun Giderme](README.md#-sorun-giderme) bölümüne bakın.

---

## Sonuçları Kontrol Etme

```bash
# Output klasörünü listeleyin
dir output

# Raporu okuyun
type output\report_*.json

# Logları inceleyin
type logs\log_*.txt
```

---

## Sonraki Adımlar

1. ✅ İlk çalıştırmayı tamamladınız
2. 📊 `output/report_*.json` dosyasındaki istatistikleri inceleyin
3. 🗂️ Kategorize edilmiş GeoJSON dosyalarını kontrol edin
4. ⚙️ [`config/config.js`](config/config.js) dosyasından ayarları özelleştirin
5. 📖 Detaylı kullanım için [README.md](README.md) dosyasına bakın

---

**İyi çalışmalar! 🎉**