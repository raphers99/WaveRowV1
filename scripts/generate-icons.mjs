/**
 * Uses the EXACT paths from components/navigation/Logo.tsx,
 * properly scaled to 1024×1024 with correct padding.
 */
import { createRequire } from 'module'
import { mkdirSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const sharp = require('sharp')
const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dir, '..')

mkdirSync(join(ROOT, 'public/icons'), { recursive: true })

/**
 * Original Logo paths (viewBox 0 0 40 40):
 *   House:  M20 4L36 16v20H26V26a6 6 0 0 0-12 0v10H4V16L20 4z
 *   Wave:   M4 30 Q10 24 16 30 Q22 36 28 30 Q34 24 40 30
 *
 * The wave runs THROUGH the house door opening — that's the WaveRow concept.
 *
 * Scaling strategy for 1024×1024:
 *   - Content spans x: 4–40, y: 4–36  (house bottom) but wave extends to y=36
 *   - Use transform="translate(28, 72) scale(22)" so:
 *       • Left/right padding:  4×22+28=116px   (11.3%)
 *       • Top/bottom padding:  4×22+72=160px   (15.6%)
 *       • Wave right edge:     40×22+28=908px  → right pad = 1024−908=116px ✓
 *       • House bottom:        36×22+72=864px  → bottom pad = 1024−864=160px ✓
 */
const SCALE = 22
const TX = 28   // x translate so left and right padding match
const TY = 72   // y translate so top and bottom padding match

const HOUSE_D = 'M20 4L36 16v20H26V26a6 6 0 0 0-12 0v10H4V16L20 4z'
const WAVE_D  = 'M4 30 Q10 24 16 30 Q22 36 28 30 Q34 24 40 30'

// stroke-width in the 40-unit space; will be multiplied by SCALE visually
// 2.7 → 59px   "standard"
// 3.4 → 75px   "bold"
const SW_NORMAL = 2.7
const SW_BOLD   = 3.4

function logo(color = 'white', sw = SW_NORMAL) {
  return `<g transform="translate(${TX},${TY}) scale(${SCALE})">
    <path d="${HOUSE_D}" fill="${color}"/>
    <path d="${WAVE_D}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" fill="none"/>
  </g>`
}

function svg(bg, fgColor = 'white', sw = SW_NORMAL, extra = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>${extra}</defs>
  ${bg}
  ${logo(fgColor, sw)}
</svg>`
}

// ─── 6 Variations ────────────────────────────────────────────────────────────

const icons = {

  // 1. Minimal Flat
  flat: svg(
    `<rect width="1024" height="1024" fill="#006747"/>`,
  ),

  // 2. Premium Gradient
  gradient: svg(
    `<rect width="1024" height="1024" fill="url(#grad)"/>`,
    'white', SW_NORMAL,
    `<linearGradient id="grad" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stop-color="#1A8A58"/>
      <stop offset="100%" stop-color="#003D25"/>
    </linearGradient>`,
  ),

  // 3. Glass / iOS
  glass: svg(
    `<rect width="1024" height="1024" fill="url(#gbg)"/>
     <rect width="1024" height="480" fill="url(#shine)"/>`,
    'white', SW_NORMAL,
    `<linearGradient id="gbg" x1="0" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#1E7848"/>
      <stop offset="100%" stop-color="#043C22"/>
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="white" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </linearGradient>`,
  ),

  // 4. Dark Mode
  dark: svg(
    `<rect width="1024" height="1024" fill="#0C1F15"/>`,
    '#DFFFF0',
  ),

  // 5. Inverted / Outline — white bg, green outline only
  inverted: `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#F4FAF6"/>
  <g transform="translate(${TX},${TY}) scale(${SCALE})">
    <path d="${HOUSE_D}" fill="none" stroke="#006747" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="${WAVE_D}"  stroke="#006747" stroke-width="${SW_NORMAL}" stroke-linecap="round" fill="none"/>
  </g>
</svg>`,

  // 6. Bold — thicker wave for small screen legibility
  bold: svg(
    `<rect width="1024" height="1024" fill="#004D34"/>`,
    'white', SW_BOLD,
  ),
}

// ─── Export ──────────────────────────────────────────────────────────────────

const XCODE = join(ROOT, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png')

async function run() {
  for (const [name, svgStr] of Object.entries(icons)) {
    const out = join(ROOT, `public/icons/icon-${name}.png`)
    await sharp(Buffer.from(svgStr)).png().toFile(out)
    console.log(`✓  ${name.padEnd(12)} → public/icons/icon-${name}.png`)
  }

  // Flat → Xcode primary icon
  await sharp(Buffer.from(icons.flat)).png().toFile(XCODE)
  console.log(`✓  Xcode AppIcon updated`)

  // Tiny favicon SVG (keeps the transform, just changes canvas size attribute)
  const favicon = icons.flat
    .replace('width="1024" height="1024"', 'width="32" height="32"')
  writeFileSync(join(ROOT, 'public/icon.svg'), favicon)
  console.log(`✓  public/icon.svg updated`)
}

run().catch(e => { console.error(e); process.exit(1) })
