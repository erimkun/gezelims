import { Ollama } from 'ollama';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from '../config/config.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * AI Provider soyut sınıfı
 */
class AIProvider {
  async categorize(itemName, category, subcategory, description) {
    throw new Error('categorize() metodu implement edilmeli');
  }

  buildPrompt(itemName, category, subcategory, description) {
    return `Sen bir gezi rotası uzmanısın. Aşağıdaki yerin kategorizasyonunu yap.

Yer Bilgileri:
- İsim: ${itemName}
- Mevcut Kategori: ${category}
- Mevcut Alt Kategori: ${subcategory}
- Açıklama: ${description || 'Yok'}

Ana Kategoriler:
1. kultur-sanat: Müzeler, tarihi yerler, camiler, kiliseler, anıtlar, sanat galerileri
2. doga: Parklar, bahçeler, mesire alanları, plajlar, doğal alanlar
3. eglence: Eğlence merkezleri, stadyumlar, tiyatrolar, sinemalar, konser salonları
4. yemek: Restoranlar, kafeler, pastaneler, fast food yerleri
5. diger: Point of interest olmayan veya diğer kategorilere uymayan yerler

Point of Interest OLMAYAN yerler (bunlar 'diger' kategorisine girmeli):
- Hastaneler, klinikler, eczaneler
- Okullar, üniversiteler, kreşler
- Kamu binaları, belediye, muhtarlık
- Otoparklar, taksi durakları, kargo şirketleri
- Oteller, pansiyonlar (konaklama)
- Marketler, bakkallar, berberleri

SADECE şu formatta yanıt ver (başka açıklama ekleme):
kategori: [kultur-sanat|doga|eglence|yemek|diger]
poi: [evet|hayir]
sebep: [kısa açıklama]`;
  }

  parseResponse(response) {
    const lines = response.split('\n');
    let kategori = 'diger';
    let poi = 'hayir';
    let sebep = '';

    for (const line of lines) {
      if (line.startsWith('kategori:')) {
        kategori = line.split(':')[1].trim().toLowerCase();
      } else if (line.startsWith('poi:')) {
        poi = line.split(':')[1].trim().toLowerCase();
      } else if (line.startsWith('sebep:')) {
        sebep = line.split(':')[1].trim();
      }
    }

    // Geçerli kategori kontrolü
    const validCategories = ['kultur-sanat', 'doga', 'eglence', 'yemek', 'diger'];
    if (!validCategories.includes(kategori)) {
      kategori = 'diger';
    }

    return {
      kategori,
      isPOI: poi === 'evet',
      sebep
    };
  }
}

/**
 * Ollama Provider
 */
class OllamaProvider extends AIProvider {
  constructor() {
    super();
    const config = CONFIG.AI_PROVIDERS.ollama;
    this.ollama = new Ollama({ host: config.baseUrl });
    this.model = config.model;
    this.options = config.options;
  }

  async categorize(itemName, category, subcategory, description) {
    const prompt = this.buildPrompt(itemName, category, subcategory, description);
    
    try {
      const response = await this.ollama.generate({
        model: this.model,
        prompt: prompt,
        stream: false,
        options: this.options
      });

      return this.parseResponse(response.response);
    } catch (error) {
      const errorMsg = `Ollama hatası: ${error.message}`;
      console.error(errorMsg);
      console.error(`Model: ${this.model}, BaseUrl: ${this.ollama.config?.host}`);
      console.error('Çözüm: Daha küçük bir model deneyin (mistral, phi3) veya başka provider kullanın.');
      throw new Error(errorMsg);
    }
  }
}

/**
 * OpenAI Provider
 */
class OpenAIProvider extends AIProvider {
  constructor(apiKey) {
    super();
    const config = CONFIG.AI_PROVIDERS.openai;
    this.client = new OpenAI({ apiKey });
    this.model = config.model;
    this.temperature = config.temperature;
    this.maxTokens = config.max_tokens;
  }

  async categorize(itemName, category, subcategory, description) {
    const prompt = this.buildPrompt(itemName, category, subcategory, description);
    
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.temperature,
        max_tokens: this.maxTokens
      });

      return this.parseResponse(response.choices[0].message.content);
    } catch (error) {
      console.error(`OpenAI hatası: ${error.message}`);
      throw new Error(`OpenAI hatası: ${error.message}`);
    }
  }
}

/**
 * Anthropic (Claude) Provider
 */
class AnthropicProvider extends AIProvider {
  constructor(apiKey) {
    super();
    const config = CONFIG.AI_PROVIDERS.anthropic;
    this.client = new Anthropic({ apiKey });
    this.model = config.model;
    this.maxTokens = config.max_tokens;
    this.temperature = config.temperature;
  }

  async categorize(itemName, category, subcategory, description) {
    const prompt = this.buildPrompt(itemName, category, subcategory, description);
    
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: [{ role: 'user', content: prompt }]
      });

      return this.parseResponse(response.content[0].text);
    } catch (error) {
      console.error(`Anthropic hatası: ${error.message}`);
      throw new Error(`Anthropic hatası: ${error.message}`);
    }
  }
}

/**
 * Google (Gemini) Provider
 */
class GoogleProvider extends AIProvider {
  constructor(apiKey) {
    super();
    const config = CONFIG.AI_PROVIDERS.google;
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ 
      model: config.model,
      generationConfig: {
        temperature: config.temperature
      }
    });
  }

  async categorize(itemName, category, subcategory, description) {
    const prompt = this.buildPrompt(itemName, category, subcategory, description);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return this.parseResponse(response.text());
    } catch (error) {
      console.error(`Google AI hatası: ${error.message}`);
      throw new Error(`Google AI hatası: ${error.message}`);
    }
  }
}

/**
 * OpenRouter Provider (Tüm modellere tek API ile erişim)
 */
class OpenRouterProvider extends AIProvider {
  constructor(apiKey) {
    super();
    const config = CONFIG.AI_PROVIDERS.openrouter;
    this.client = new OpenAI({
      baseURL: config.baseUrl,
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'https://github.com',
        'X-Title': 'GeoJSON Data Restorer'
      }
    });
    this.model = config.model;
    this.temperature = config.temperature;
    this.maxTokens = config.max_tokens;
  }

  async categorize(itemName, category, subcategory, description) {
    const prompt = this.buildPrompt(itemName, category, subcategory, description);
    
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.temperature,
        max_tokens: this.maxTokens
      });

      return this.parseResponse(response.choices[0].message.content);
    } catch (error) {
      console.error(`OpenRouter hatası: ${error.message}`);
      throw new Error(`OpenRouter hatası: ${error.message}`);
    }
  }
}

/**
 * VSCode GitHub Copilot Provider
 * VSCode'un GitHub Copilot extension'ını kullanır
 */
class VSCodeCopilotProvider extends AIProvider {
  constructor() {
    super();
    const config = CONFIG.AI_PROVIDERS['vscode-copilot'];
    if (!config.enabled) {
      throw new Error('VSCode Copilot disabled. Set VSCODE_COPILOT_ENABLED=true in .env');
    }
    this.model = config.model;
  }

  async categorize(itemName, category, subcategory, description) {
    const prompt = this.buildPrompt(itemName, category, subcategory, description);
    
    try {
      // VSCode Copilot CLI komutunu çalıştır
      // Not: Bu özellik deneyseldir ve VSCode'un yüklü olması gerekir
      const command = `code --command "github.copilot.chat.completions" --prompt "${prompt.replace(/"/g, '\\"')}"`;
      
      const { stdout } = await execAsync(command, {
        timeout: 30000,
        maxBuffer: 1024 * 1024
      });

      return this.parseResponse(stdout);
    } catch (error) {
      console.error(`VSCode Copilot hatası: ${error.message}`);
      console.error('Not: VSCode Copilot extension yüklü olmalı ve giriş yapmış olmalısınız.');
      throw new Error(`VSCode Copilot hatası: ${error.message}`);
    }
  }
}

/**
 * Factory fonksiyonu - Provider seçimi
 */
export function createAIProvider(providerName, apiKey = null) {
  switch (providerName.toLowerCase()) {
    case 'ollama':
      return new OllamaProvider();
    case 'openai':
      if (!apiKey) throw new Error('OpenAI için API key gerekli');
      return new OpenAIProvider(apiKey);
    case 'anthropic':
    case 'claude':
      if (!apiKey) throw new Error('Anthropic için API key gerekli');
      return new AnthropicProvider(apiKey);
    case 'google':
    case 'gemini':
      if (!apiKey) throw new Error('Google için API key gerekli');
      return new GoogleProvider(apiKey);
    case 'openrouter':
      if (!apiKey) throw new Error('OpenRouter için API key gerekli');
      return new OpenRouterProvider(apiKey);
    case 'vscode-copilot':
    case 'copilot':
      return new VSCodeCopilotProvider();
    default:
      throw new Error(`Bilinmeyen provider: ${providerName}`);
  }
}