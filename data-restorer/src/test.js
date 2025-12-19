import { createAIProvider } from './aiProvider.js';

/**
 * AI Provider test scripti
 * Bağlantıyı ve temel işlevselliği test eder
 */

async function testProvider(providerName) {
  console.log(`\n🧪 ${providerName.toUpperCase()} Provider Test Ediliyor...`);
  console.log('━'.repeat(50));

  try {
    // Provider oluştur
    const apiKey = process.env[`${providerName.toUpperCase()}_API_KEY`];
    const provider = createAIProvider(providerName, apiKey);
    
    // Test verisi
    const testItem = {
      name: "Topkapı Sarayı Müzesi",
      category: "Kültür",
      subcategory: "Müze",
      description: "Tarihi saray ve müze"
    };

    console.log(`\n📍 Test Verisi:`);
    console.log(`   İsim: ${testItem.name}`);
    console.log(`   Kategori: ${testItem.category}`);
    console.log(`   Alt Kategori: ${testItem.subcategory}`);
    
    // Kategorize et
    console.log(`\n⏳ Kategorize ediliyor...`);
    const result = await provider.categorize(
      testItem.name,
      testItem.category,
      testItem.subcategory,
      testItem.description
    );

    // Sonuç
    console.log(`\n✅ Sonuç:`);
    console.log(`   AI Kategorisi: ${result.kategori}`);
    console.log(`   POI mi?: ${result.isPOI ? 'Evet' : 'Hayır'}`);
    console.log(`   Sebep: ${result.sebep}`);
    console.log(`\n✨ ${providerName} başarıyla test edildi!`);
    
    return true;
  } catch (error) {
    console.error(`\n❌ ${providerName} test hatası:`);
    console.error(`   ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║     GeoJSON Data Restorer - Provider Test         ║');
  console.log('╚════════════════════════════════════════════════════╝');

  const provider = process.env.AI_PROVIDER || 'ollama';
  
  console.log(`\n🎯 Aktif Provider: ${provider}`);
  
  const success = await testProvider(provider);
  
  if (success) {
    console.log('\n' + '═'.repeat(50));
    console.log('🎉 Test başarılı! Sistem kullanıma hazır.');
    console.log('═'.repeat(50));
    console.log('\n📚 Kullanım için:');
    console.log('   node src/index.js --help');
    console.log('');
  } else {
    console.log('\n' + '═'.repeat(50));
    console.log('⚠️  Test başarısız. Lütfen ayarları kontrol edin.');
    console.log('═'.repeat(50));
    console.log('\n💡 Yardım:');
    console.log('   - Ollama kullanıyorsanız: ollama serve');
    console.log('   - API key kullanıyorsanız: .env dosyasını kontrol edin');
    console.log('   - Detaylar için: cat README.md');
    console.log('');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n💥 Beklenmeyen hata:', error.message);
  process.exit(1);
});