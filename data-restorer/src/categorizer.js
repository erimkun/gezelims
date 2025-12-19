import fs from 'fs/promises';
import path from 'path';
import { createAIProvider } from './aiProvider.js';
import { CONFIG } from '../config/config.js';
import { Logger } from './logger.js';

export class GeoCategorizer {
  constructor(providerName, apiKey = null) {
    this.provider = createAIProvider(providerName, apiKey);
    this.logger = new Logger();
    this.stats = {
      total: 0,
      processed: 0,
      categorized: {},
      poi: 0,
      nonPoi: 0,
      errors: 0
    };
  }

  /**
   * GeoJSON dosyasını okur
   */
  async readGeoJSON(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      this.logger.error(`Dosya okuma hatası: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * GeoJSON dosyasına yazar
   */
  async writeGeoJSON(filePath, data) {
    try {
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      this.logger.info(`Dosya yazıldı: ${filePath}`);
    } catch (error) {
      this.logger.error(`Dosya yazma hatası: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Tek bir öğeyi kategorize eder
   */
  async categorizeItem(feature) {
    const props = feature.properties;
    const name = props.name || 'İsimsiz';
    const category = props.category || '';
    const subcategory = props.subcategory || '';
    const description = props.description || '';

    try {
      const result = await this.provider.categorize(name, category, subcategory, description);
      
      // İstatistikleri güncelle
      if (!this.stats.categorized[result.kategori]) {
        this.stats.categorized[result.kategori] = 0;
      }
      this.stats.categorized[result.kategori]++;
      
      if (result.isPOI) {
        this.stats.poi++;
      } else {
        this.stats.nonPoi++;
      }

      return {
        ...feature,
        properties: {
          ...props,
          ai_category: result.kategori,
          is_poi: result.isPOI,
          ai_reason: result.sebep,
          original_category: category,
          original_subcategory: subcategory,
          processed_at: new Date().toISOString()
        }
      };
    } catch (error) {
      this.logger.error(`Kategorize hatası: ${name}`, error);
      this.stats.errors++;
      return feature;
    }
  }

  /**
   * Batch işleme - gecikme ile
   */
  async processBatch(features, startIndex, batchSize) {
    const batch = features.slice(startIndex, startIndex + batchSize);
    const promises = batch.map(feature => this.categorizeItem(feature));
    return await Promise.all(promises);
  }

  /**
   * Ana işleme fonksiyonu
   */
  async processGeoJSON(inputPath, outputDir) {
    this.logger.info(`İşlem başlıyor: ${inputPath}`);
    const startTime = Date.now();

    // GeoJSON'u oku
    const geojson = await this.readGeoJSON(inputPath);
    const features = geojson.features || [];
    this.stats.total = features.length;

    this.logger.info(`Toplam ${features.length} öğe bulundu`);

    // Sonuç kategorileri için yapılar
    const categorizedData = {
      'kultur-sanat': { type: 'FeatureCollection', features: [] },
      'doga': { type: 'FeatureCollection', features: [] },
      'eglence': { type: 'FeatureCollection', features: [] },
      'yemek': { type: 'FeatureCollection', features: [] },
      'diger': { type: 'FeatureCollection', features: [] }
    };

    // Batch işleme
    const batchSize = CONFIG.BATCH_SIZE || 50;
    const delayMs = CONFIG.DELAY_MS || 1000;

    for (let i = 0; i < features.length; i += batchSize) {
      const processedBatch = await this.processBatch(features, i, batchSize);
      
      // Kategorilere ayır
      for (const feature of processedBatch) {
        const category = feature.properties.ai_category || 'diger';
        if (categorizedData[category]) {
          categorizedData[category].features.push(feature);
        }
      }

      this.stats.processed = Math.min(i + batchSize, features.length);
      const progress = ((this.stats.processed / this.stats.total) * 100).toFixed(2);
      this.logger.info(`İlerleme: ${this.stats.processed}/${this.stats.total} (${progress}%)`);

      // Batch'ler arası gecikme (rate limiting için)
      if (i + batchSize < features.length) {
        await this.delay(delayMs);
      }
    }

    // Sonuçları kaydet
    const inputFileName = path.basename(inputPath, '.geojson');
    
    for (const [category, data] of Object.entries(categorizedData)) {
      if (data.features.length > 0) {
        const outputPath = path.join(outputDir, `${category}_from_${inputFileName}.geojson`);
        await this.writeGeoJSON(outputPath, data);
      }
    }

    // İstatistik raporu oluştur
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const report = this.generateReport(duration);
    
    // Raporu kaydet
    const reportPath = path.join(outputDir, `report_${inputFileName}_${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    
    this.logger.info('İşlem tamamlandı!');
    this.logger.info(`Rapor: ${reportPath}`);
    
    return report;
  }

  /**
   * İstatistik raporu oluşturur
   */
  generateReport(duration) {
    return {
      summary: {
        total: this.stats.total,
        processed: this.stats.processed,
        errors: this.stats.errors,
        duration_seconds: duration
      },
      categorization: this.stats.categorized,
      poi_analysis: {
        poi: this.stats.poi,
        non_poi: this.stats.nonPoi,
        poi_percentage: ((this.stats.poi / this.stats.processed) * 100).toFixed(2)
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Gecikme yardımcı fonksiyonu
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * İstatistikleri döndürür
   */
  getStats() {
    return this.stats;
  }
}