import dotenv from 'dotenv';

// .env dosyasını yükle
dotenv.config();

export const CONFIG = {
  // Ana kategoriler - Gezi rotası uygulaması için uygun
  MAIN_CATEGORIES: {
    'kultur-sanat': ['Kültür', 'Sanat', 'Müze', 'Tarih', 'Dini', 'Anıt'],
    'doga': ['Doğa', 'Park', 'Bahçe', 'Mesire', 'Plaj', 'Orman'],
    'eglence': ['Eğlence', 'Spor', 'Gösteri', 'Sinema', 'Tiyatro', 'Konser'],
    'yemek': ['Yemek', 'Restoran', 'Kafe', 'Lokanta', 'Pastane', 'Fast Food'],
    'diger': ['Diğer']
  },

  // Point of Interest olmayan kategoriler
  NON_POI_CATEGORIES: [
    'Sağlık', 'Hastane', 'Poliklinik', 'Eczane', 'Veteriner',
    'Eğitim', 'Okul', 'Üniversite', 'Kreş', 'Kuran Kursu',
    'Kamu', 'Belediye', 'Muhtarlık', 'Polis', 'Jandarma', 'Postane',
    'Ulaşım', 'Otopark', 'Taksi', 'Dolmuş', 'Kargo', 'Depo',
    'Konaklama', 'Otel', 'Pansiyon', 'Apart',
    'Sosyal', 'Market', 'Bakkal', 'Manav', 'Berber', 'Kuaför'
  ],

  // AI Sağlayıcı ayarları
  AI_PROVIDERS: {
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'llama3.2:latest',
      options: {
        temperature: 0.3,
        num_predict: 150
      }
    },
    openai: {
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      temperature: 0.3,
      max_tokens: 150
    },
    anthropic: {
      model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
      max_tokens: 150,
      temperature: 0.3
    },
    google: {
      model: process.env.GOOGLE_MODEL || 'gemini-pro',
      temperature: 0.3
    },
    openrouter: {
      baseUrl: 'https://openrouter.ai/api/v1',
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku',
      temperature: 0.3,
      max_tokens: 150
    },
    'vscode-copilot': {
      model: process.env.VSCODE_COPILOT_MODEL || 'gpt-4',
      temperature: 0.3,
      max_tokens: 150,
      enabled: process.env.VSCODE_COPILOT_ENABLED === 'true'
    }
  },

  // Batch işleme ayarları
  BATCH_SIZE: parseInt(process.env.BATCH_SIZE) || 50,
  DELAY_MS: parseInt(process.env.DELAY_MS) || 1000,
  
  // Dosya yolları
  PATHS: {
    input: '../pearl_of_the_istanbul/public/data',
    output: './output',
    logs: './logs'
  }
};

export default CONFIG;