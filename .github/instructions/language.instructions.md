---
applyTo: '**'
---
## 🌐 Çok Dilli Destek Sistemi

Uygulama şu anda 6 dilde çalışmaktadır: Türkçe, İngilizce, Almanca, Fransızca, İspanyolca ve İtalyanca.

### Yeni Bileşenlerde Dil Desteği Eklemek İçin:

1. **Props olarak `language` alın:**
```typescript
interface ComponentProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
}
Çeviri objesi oluşturun:
const translations = {
  tr: { key: "Türkçe metin" },
  en: { key: "English text" },
  de: { key: "Deutscher Text" },
  fr: { key: "Texte français" },
  es: { key: "Texto español" },
  it: { key: "Testo italiano" }
};
Kullanımı:
<h1>{translations[language].key}</h1>