// Bu script, SVG dosyalarını PNG formatına dönüştürür
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Dizin yolları
const SVG_DIR = path.join(__dirname, '..', 'assets', 'images', 'onboarding');
const PNG_DIR = path.join(__dirname, '..', 'assets', 'images', 'onboarding');

// PNG dizinini oluştur (varsa hata vermez)
if (!fs.existsSync(PNG_DIR)) {
  fs.mkdirSync(PNG_DIR, { recursive: true });
}

// Tema renkleri (hem açık hem koyu tema için uyumlu)
const themeColors = {
  primary: '#4A90E2',
  primaryLight: '#6BA5E7',
  primaryDark: '#3A7BC9',
  textLight: '#FFFFFF',
  textDark: '#333333',
  bgLight: 'rgba(74, 144, 226, 0.1)',
  bgDark: 'rgba(74, 144, 226, 0.2)',
  accent1: '#FF5252',
  accent2: '#FFD740',
  accent3: '#66BB6A',
  accent4: '#7E57C2',
  lightGray: '#F5F5F5',
  darkGray: '#333333',
  neutral: '#858585'
};

// SVG içerikleri - minimalist tasarımlar, yazısız
const svgContents = {
  welcome: `
  <svg width="500" height="500" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${themeColors.primary};stop-opacity:0.9" />
        <stop offset="100%" style="stop-color:${themeColors.primaryDark};stop-opacity:0.9" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="10" flood-opacity="0.2"/>
      </filter>
    </defs>
    
    <!-- Background Elements -->
    <rect width="500" height="500" fill="none"/>
    
    <!-- Main Logo Circle -->
    <circle cx="250" cy="250" r="150" fill="url(#grad1)" filter="url(#shadow)"/>
    
    <!-- Checkmark -->
    <path d="M180 250L230 300L320 210" stroke="${themeColors.textLight}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  `,
  
  'daily-goals': `
  <svg width="500" height="500" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${themeColors.primary};stop-opacity:0.9" />
        <stop offset="100%" style="stop-color:${themeColors.primaryDark};stop-opacity:0.9" />
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="500" height="500" fill="none"/>
    
    <!-- Main Card -->
    <rect x="150" y="100" width="200" height="300" rx="20" fill="url(#cardGrad)"/>
    
    <!-- Task 1 - Complete -->
    <g transform="translate(180, 150)">
      <rect x="0" y="0" width="30" height="30" rx="15" fill="${themeColors.textLight}"/>
      <path d="M5 15L15 25L35 5" stroke="${themeColors.primary}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="50" y1="15" x2="120" y2="15" stroke="${themeColors.textLight}" stroke-width="4" stroke-linecap="round"/>
    </g>
    
    <!-- Task 2 - Complete -->
    <g transform="translate(180, 230)">
      <rect x="0" y="0" width="30" height="30" rx="15" fill="${themeColors.textLight}"/>
      <path d="M5 15L15 25L35 5" stroke="${themeColors.primary}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="50" y1="15" x2="120" y2="15" stroke="${themeColors.textLight}" stroke-width="4" stroke-linecap="round"/>
    </g>
    
    <!-- Task 3 - Incomplete -->
    <g transform="translate(180, 310)">
      <rect x="0" y="0" width="30" height="30" rx="15" stroke="${themeColors.textLight}" stroke-width="3" fill="none"/>
      <line x1="50" y1="15" x2="120" y2="15" stroke="${themeColors.textLight}" stroke-width="4" stroke-linecap="round"/>
    </g>
  </svg>
  `,
  
  tracking: `
  <svg width="500" height="500" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="barGrad1" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" style="stop-color:${themeColors.primary};stop-opacity:0.9" />
        <stop offset="100%" style="stop-color:${themeColors.primaryLight};stop-opacity:0.9" />
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="500" height="500" fill="none"/>
    
    <!-- Minimal Chart Grid -->
    <rect x="100" y="100" width="300" height="300" fill="none" stroke="${themeColors.neutral}" stroke-width="2" stroke-opacity="0.3"/>
    
    <!-- Chart Bars - Minimalist -->
    <rect x="150" y="300" width="40" height="100" rx="4" fill="url(#barGrad1)"/>
    <rect x="230" y="200" width="40" height="200" rx="4" fill="url(#barGrad1)"/>
    <rect x="310" y="250" width="40" height="150" rx="4" fill="url(#barGrad1)"/>
    
    <!-- Trend Line -->
    <path d="M170 300 L250 200 L330 250" stroke="${themeColors.accent3}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="170" cy="300" r="8" fill="${themeColors.accent3}"/>
    <circle cx="250" cy="200" r="8" fill="${themeColors.accent3}"/>
    <circle cx="330" cy="250" r="8" fill="${themeColors.accent3}"/>
  </svg>
  `,
  
  themes: `
  <svg width="500" height="500" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="circleGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${themeColors.primary};stop-opacity:0.9" />
        <stop offset="100%" style="stop-color:${themeColors.primaryDark};stop-opacity:0.9" />
      </linearGradient>
      <linearGradient id="circleGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${themeColors.accent1};stop-opacity:0.9" />
        <stop offset="100%" style="stop-color:${themeColors.accent2};stop-opacity:0.9" />
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="500" height="500" fill="none"/>
    
    <!-- Minimalist Theme Circles -->
    <circle cx="175" cy="175" r="75" fill="url(#circleGrad1)"/>
    <circle cx="325" cy="175" r="75" fill="${themeColors.accent1}"/>
    <circle cx="175" cy="325" r="75" fill="${themeColors.accent3}"/>
    <circle cx="325" cy="325" r="75" fill="${themeColors.accent4}"/>
    
    <!-- Center Cross -->
    <path d="M250 125V375" stroke="${themeColors.textLight}" stroke-width="6" stroke-opacity="0.6" stroke-linecap="round"/>
    <path d="M125 250H375" stroke="${themeColors.textLight}" stroke-width="6" stroke-opacity="0.6" stroke-linecap="round"/>
  </svg>
  `
};

// SVG içeriklerini dosyalara kaydet ve PNG'ye dönüştür
async function convertAll() {
  try {
    // Her bir SVG için işlem yap
    for (const [name, content] of Object.entries(svgContents)) {
      // SVG dosyasının yolunu belirle
      const svgPath = path.join(SVG_DIR, `${name}.svg`);
      const pngPath = path.join(PNG_DIR, `${name}.png`);
      
      // SVG dosyasını oluştur
      fs.writeFileSync(svgPath, content);
      console.log(`SVG dosyası oluşturuldu: ${svgPath}`);
      
      // SVG'yi PNG'ye dönüştür
      await sharp(Buffer.from(content))
        .resize(1000, 1000) // Daha yüksek çözünürlük için boyutlandırma
        .png()
        .toFile(pngPath);
      
      console.log(`PNG'ye dönüştürüldü: ${pngPath}`);
    }
    
    console.log('Tüm görseller başarıyla oluşturuldu ve dönüştürüldü!');
  } catch (error) {
    console.error('Hata oluştu:', error);
  }
}

// Dönüştürme işlemini başlat
convertAll(); 