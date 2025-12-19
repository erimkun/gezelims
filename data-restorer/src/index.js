import dotenv from 'dotenv';
import { GeoCategorizer } from './categorizer.js';
import { Logger } from './logger.js';
import { CONFIG } from '../config/config.js';
import fs from 'fs/promises';
import path from 'path';

// .env dosyasını yükle
dotenv.config();

const logger = new Logger();

/**
 * Kullanım bilgisi
 */
function printUsage() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║              GeoJSON Data Restorer & Categorizer               ║
╚════════════════════════════════════════════════════════════════╝

Kullanım:
  node src/index.js [options]

Seçenekler:
  --provider <name>     AI sağlayıcı (ollama, openai, anthropic, google)
  --input <path>        Girdi GeoJSON dosyası veya klasörü
  --output <path>       Çıktı klasörü (varsayılan: ./output)
  --help                Bu yardım mesajını göster

Örnekler:
  # Ollama ile tek dosya işle
  node src/index.js --provider ollama --input ../pearl_of_the_istanbul/public/data/diger.geojson

  # OpenAI ile klasördeki tüm dosyaları işle
  node src/index.js --provider openai --input ../pearl_of_the_istanbul/public/data --output ./sonuclar

Ortam Değişkenleri (.env dosyasında):
  AI_PROVIDER          Varsayılan AI sağlayıcı
  OPENAI_API_KEY       OpenAI API anahtarı
  ANTHROPIC_API_KEY    Anthropic API anahtarı
  GOOGLE_API_KEY       Google API anahtarı
  OLLAMA_BASE_URL      Ollama sunucu adresi
  OLLAMA_MODEL         Ollama model adı
`);
}

/**
 * Komut satırı argümanlarını parse et
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    provider: process.env.AI_PROVIDER || 'ollama',
    input: null,
    output: './output',
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--provider':
        options.provider = args[++i];
        break;
      case '--input':
        options.input = args[++i];
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

/**
 * API anahtarını al
 */
function getApiKey(provider) {
  switch (provider.toLowerCase()) {
    case 'openai':
      return process.env.OPENAI_API_KEY;
    case 'anthropic':
    case 'claude':
      return process.env.ANTHROPIC_API_KEY;
    case 'google':
    case 'gemini':
      return process.env.GOOGLE_API_KEY;
    default:
      return null;
  }
}

/**
 * Klasördeki GeoJSON dosyalarını bul
 */
async function findGeoJSONFiles(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isFile() && entry.name.endsWith('.geojson')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Dosya mı klasör mü kontrol et
 */
async function isDirectory(path) {
  try {
    const stat = await fs.stat(path);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Ana fonksiyon
 */
async function main() {
  const options = parseArgs();

  // Yardım göster
  if (options.help) {
    printUsage();
    return;
  }

  // Input kontrolü
  if (!options.input) {
    logger.error('Girdi dosyası veya klasörü belirtilmedi!');
    logger.info('Yardım için: node src/index.js --help');
    process.exit(1);
  }

  logger.info('═══════════════════════════════════════════════════');
  logger.info('  GeoJSON Data Restorer & Categorizer');
  logger.info('═══════════════════════════════════════════════════');
  logger.info(`AI Sağlayıcı: ${options.provider}`);
  logger.info(`Girdi: ${options.input}`);
  logger.info(`Çıktı: ${options.output}`);
  logger.info('═══════════════════════════════════════════════════\n');

  try {
    // API anahtarını al
    const apiKey = getApiKey(options.provider);
    
    // Categorizer oluştur
    const categorizer = new GeoCategorizer(options.provider, apiKey);

    // Girdi dosyalarını belirle
    let inputFiles = [];
    if (await isDirectory(options.input)) {
      inputFiles = await findGeoJSONFiles(options.input);
      logger.info(`Klasörde ${inputFiles.length} GeoJSON dosyası bulundu`);
    } else {
      inputFiles = [options.input];
    }

    if (inputFiles.length === 0) {
      logger.error('İşlenecek GeoJSON dosyası bulunamadı!');
      process.exit(1);
    }

    // Her dosyayı işle
    const allReports = [];
    for (let i = 0; i < inputFiles.length; i++) {
      const inputFile = inputFiles[i];
      logger.info(`\n[${i + 1}/${inputFiles.length}] İşleniyor: ${path.basename(inputFile)}`);
      
      const report = await categorizer.processGeoJSON(inputFile, options.output);
      allReports.push({
        file: path.basename(inputFile),
        ...report
      });
    }

    // Genel özet
    logger.success('\n═══════════════════════════════════════════════════');
    logger.success('  İŞLEM TAMAMLANDI!');
    logger.success('═══════════════════════════════════════════════════');
    
    const totalProcessed = allReports.reduce((sum, r) => sum + r.summary.processed, 0);
    const totalErrors = allReports.reduce((sum, r) => sum + r.summary.errors, 0);
    const totalDuration = allReports.reduce((sum, r) => sum + parseFloat(r.summary.duration_seconds), 0);
    
    logger.success(`Toplam işlenen: ${totalProcessed}`);
    logger.success(`Toplam hata: ${totalErrors}`);
    logger.success(`Toplam süre: ${totalDuration.toFixed(2)} saniye`);
    logger.success(`Çıktı klasörü: ${options.output}`);
    logger.success('═══════════════════════════════════════════════════\n');

  } catch (error) {
    logger.error('Kritik hata:', error);
    process.exit(1);
  }
}

// Programı başlat
main().catch(error => {
  logger.error('Beklenmeyen hata:', error);
  process.exit(1);
});