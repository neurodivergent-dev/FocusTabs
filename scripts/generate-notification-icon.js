const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SVG_INPUT = path.join(__dirname, '../assets/images/logo.svg');
const OUTPUT_PATH = path.join(__dirname, '../assets/images/notification-icon.png');

async function generatePerfectBoldNotificationIcon() {
  console.log('🕯️ Enhancing "Fo" icon: Trimming whitespace and maximizing size...');

  try {
    if (!fs.existsSync(SVG_INPUT)) {
      console.error('❌ Error: logo.svg not found!');
      return;
    }

    let svgString = fs.readFileSync(SVG_INPUT).toString();

    // 1. Remove background and make everything white (Same as before)
    const cleanedSvg = svgString
      .replace(/<rect[^>]*\/>/g, '') 
      .replace(/<rect[^>]*>.*?<\/rect>/g, '') 
      .replace(/stroke="[^"]*"/g, 'stroke="white"') 
      .replace(/fill="[^"]*"/g, 'fill="white"') 
      .replace(/<svg/, '<svg fill="white" stroke="white"');

    const size = 96;
    const padding = 8; // Small safety margin so it doesn't touch the edges

    // 2. THE MAGIC: Trim -> Resize -> Extend
    // We first render the SVG, then trim all transparent space, 
    // then resize it to be 80x80 (leaving some padding), 
    // and finally put it in the center of a 96x96 canvas.
    
    const svgBuffer = Buffer.from(cleanedSvg);

    await sharp(svgBuffer)
      .trim() // Remove all surrounding transparent pixels
      .resize(size - padding * 2, size - padding * 2, { 
        fit: 'contain', 
        background: { r: 0, g: 0, b: 0, alpha: 0 } 
      })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(OUTPUT_PATH);

    console.log(`✅ Success! Your "Fo" icon is now BOLDER and BIGGER at: ${OUTPUT_PATH}`);
    console.log('💡 Note: This will fill the notification area much better now.');
  } catch (error) {
    console.error('❌ Failed to resize icon:', error);
  }
}

generatePerfectBoldNotificationIcon();
