// Bu script, assets/images/onboarding dizinindeki SVG dosyalarını PNG formatına dönüştürür
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Dizin yolları
const ONBOARDING_DIR = path.join(__dirname, '..', 'assets', 'images', 'onboarding');

// SVG'leri PNG'ye dönüştür
async function convertAll() {
  try {
    const files = fs.readdirSync(ONBOARDING_DIR);
    const svgFiles = files.filter(f => f.endsWith('.svg'));
    
    for (const svgFile of svgFiles) {
      const name = path.parse(svgFile).name;
      const svgPath = path.join(ONBOARDING_DIR, svgFile);
      const pngPath = path.join(ONBOARDING_DIR, `${name}.png`);
      
      console.log(`SVG okunuyor: ${svgPath}`);
      
      // SVG'yi PNG'ye dönüştür
      await sharp(svgPath)
        .resize(1000, 1000) // Daha yüksek çözünürlük için boyutlandırma
        .png()
        .toFile(pngPath);
      
      console.log(`PNG oluşturuldu: ${pngPath}`);
    }
    
    console.log('Tüm görseller başarıyla dönüştürüldü!');
  } catch (error) {
    console.error('Hata oluştu:', error);
  }
}

// Dönüştürme işlemini başlat
convertAll();
