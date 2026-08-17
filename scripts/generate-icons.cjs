/**
 * Generate PWA icons from icon.svg with transparent backgrounds.
 * Run: node scripts/generate-icons.cjs
 */
const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const SVG_PATH = path.join(__dirname, '..', 'public', 'icon.svg');
const OUT_DIR = path.join(__dirname, '..', 'public');

const svgContent = fs.readFileSync(SVG_PATH, 'utf8');

function renderPNG(svg, size) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: 'rgba(0,0,0,0)',
  });
  const pngData = resvg.render();
  return pngData.asPng();
}

const icons = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'pwa-maskable-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'badge.png', size: 96 },
];

let generated = 0;
for (const icon of icons) {
  try {
    const png = renderPNG(svgContent, icon.size);
    const outPath = path.join(OUT_DIR, icon.name);
    fs.writeFileSync(outPath, png);
    const stats = fs.statSync(outPath);
    console.log(`  ${icon.name} (${icon.size}x${icon.size}) - ${(stats.size / 1024).toFixed(1)}KB`);
    generated++;
  } catch (err) {
    console.error(`  FAILED: ${icon.name} - ${err.message}`);
  }
}

console.log(`\nGenerated ${generated}/${icons.length} icons with transparent backgrounds.`);
