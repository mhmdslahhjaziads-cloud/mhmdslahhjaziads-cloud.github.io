/** Optional image rebuild: install sharp or expose it via NODE_PATH. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require('sharp');
const root = fileURLToPath(new URL('../', import.meta.url));
const portrait = (await sharp(path.join(root, 'assets/mohamed-avatar.webp')).resize(245, 245).png().toBuffer()).toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
<defs><clipPath id="portrait"><rect x="890" y="65" width="245" height="245" rx="34"/></clipPath></defs>
<rect width="1200" height="630" fill="#1f2321"/><rect x="35" y="35" width="1130" height="560" rx="30" fill="#f6f3ec"/>
<rect x="65" y="65" width="270" height="38" rx="19" fill="#c5d6b7"/><text x="86" y="91" font-family="Segoe UI,Arial,sans-serif" font-size="18" font-weight="600" fill="#233029">DATA BEFORE DECISIONS</text>
<text x="65" y="191" font-family="Segoe UI,Arial,sans-serif" font-size="50" font-weight="700" fill="#202723">Mohamed Salah</text><text x="65" y="249" font-family="Segoe UI,Arial,sans-serif" font-size="50" font-weight="700" fill="#202723">Hegazy</text>
<text x="65" y="328" font-family="Segoe UI,Arial,sans-serif" font-size="32" fill="#37443b">Media Buying · Tracking</text>
<text x="65" y="379" font-family="Segoe UI,Arial,sans-serif" font-size="23" fill="#556158">Clear measurement. Better campaign decisions.</text>
<image x="890" y="65" width="245" height="245" clip-path="url(#portrait)" xlink:href="data:image/png;base64,${portrait}"/>
<path d="M95 460h920" fill="none" stroke="#829681" stroke-width="3"/><circle cx="95" cy="460" r="10" fill="#233029"/><circle cx="370" cy="460" r="10" fill="#233029"/><circle cx="670" cy="460" r="10" fill="#233029"/><circle cx="1015" cy="460" r="10" fill="#233029"/>
<g font-family="Segoe UI,Arial,sans-serif" font-size="19" fill="#3f4c42"><text x="65" y="502">Campaigns</text><text x="337" y="502">Tracking</text><text x="626" y="502">Analysis</text><text x="964" y="502">Decisions</text></g>
<text x="65" y="560" font-family="Segoe UI,Arial,sans-serif" font-size="17" fill="#647269">mhmdslahhjaziads-cloud.github.io</text></svg>`;
fs.writeFileSync(path.join(root, 'assets/social-preview.svg'), svg);
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.join(root, 'assets/social-preview.png'));
console.log('Rendered assets/social-preview.png (1200 × 630).');
