/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// REAL Cyberpunk Colors from themes.ts
const PRIMARY = "#5E6AD2";   // Indigo/Blue
const SECONDARY = "#A78BFA"; // Lavender/Purple

// Logo SVG (Simplified from LogoComponent.tsx for 1024x1024 icon)
const svgContent = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${PRIMARY}" stop-opacity="1" />
      <stop offset="100%" stop-color="${SECONDARY}" stop-opacity="1" />
    </linearGradient>
  </defs>
  
  <!-- Rounded Rect Background -->
  <rect x="85" y="85" width="854" height="854" rx="170" fill="url(#logoGrad)" />
  
  <!-- Stylized F -->
  <path d="M341 341 L597 341 M341 341 L341 682 M341 511 L512 511" 
        stroke="white" stroke-width="42.6" fill="none" stroke-linecap="round" stroke-linejoin="round" />
  
  <!-- Target Symbol -->
  <circle cx="640" cy="554" r="128" stroke="white" stroke-width="25.6" fill="none" />
  <circle cx="640" cy="554" r="59.7" stroke="white" stroke-width="17" fill="none" />
  <circle cx="640" cy="554" r="17" fill="white" />
</svg>
`;

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const IMAGES_DIR = path.join(ASSETS_DIR, 'images');

async function generateIcons() {
  try {
    const svgPath = path.join(ASSETS_DIR, 'temp-icon.svg');
    fs.writeFileSync(svgPath, svgContent);
    console.log('SVG taslağı gerçek Cyberpunk renkleriyle oluşturuldu.');

    // 1. icon.png (1024x1024)
    await sharp(svgPath)
      .resize(1024, 1024)
      .png()
      .toFile(path.join(IMAGES_DIR, 'icon.png'));
    console.log('icon.png güncellendi.');

    // 2. adaptive-icon.png (1024x1024)
    await sharp(svgPath)
      .resize(1024, 1024)
      .png()
      .toFile(path.join(IMAGES_DIR, 'adaptive-icon.png'));
    console.log('adaptive-icon.png güncellendi.');

    // 3. splash-icon.png (1024x1024)
    await sharp(svgPath)
      .resize(1024, 1024)
      .png()
      .toFile(path.join(IMAGES_DIR, 'splash-icon.png'));
    console.log('splash-icon.png güncellendi.');

    // 4. favicon.png (48x48)
    await sharp(svgPath)
      .resize(48, 48)
      .png()
      .toFile(path.join(IMAGES_DIR, 'favicon.png'));
    console.log('favicon.png güncellendi.');

    // Cleanup
    fs.unlinkSync(svgPath);
    console.log('Temizlik yapıldı. Tüm ikonlar GERÇEK Cyberpunk gradyanıyla mühürlendi!');
  } catch (error) {
    console.error('Hata oluştu:', error);
  }
}

generateIcons();
