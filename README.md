# Mohamed Salah Hegazy · Portfolio

**Media Buying · Tracking · Learning Website Design**

[العربية · Live](https://mhmdslahhjaziads-cloud.github.io/) · [English](https://mhmdslahhjaziads-cloud.github.io/en/) · [LinkedIn](https://www.linkedin.com/in/mhmdslahhjazi/) · [Deployment](docs/DEPLOYMENT.md) · [Maintenance](docs/MAINTENANCE.md)

موقع محمد صلاح حجازي الشخصي، بالعربية والإنجليزية، لعرض الخدمات والأدوات وطريقة العمل والخلفية المهنية والتواصل.

> **Beta / نسخة تجريبية:** الموقع في مرحلة الاختبار والتطوير؛ بيانات وأعمال إضافية ستُنشر لاحقًا.

## Features

- Arabic at `/` and a generated, independently indexable English page at `/en/`, with RTL / LTR layouts and reciprocal `hreflang`.
- Light and charcoal dark themes with saved browser preferences.
- Responsive navigation, three work and learning cards and a downloadable CV.
- Soft neon hover on toolkit logos and subtle hover scaling on other cards.
- All 19 toolkit items stay visible on phones; there is no toolkit accordion.
- 24 tracking brands, 17 small SVG scenes, and a floating menu with three groups and five phone rows.
- Always-visible contact composer: request type, optional project link and required details; prepare a WhatsApp or email draft without sending automatically. LinkedIn stays beside the two buttons as a compact icon.
- Compact phone workflow cards, centered wrapping platform chips, and contextual hover illustrations.
- Availability and markets below the portrait.
- Reduced-motion support and locally hosted fonts and icons.
- A 1200 × 630 social preview image, `robots.txt` and a two-language sitemap.
- Production-only GA4 (`G-5E9BPGNJJH`), Clarity (`yvk9p3430s`) and Meta Pixel loading.

## Project structure

```text
.
├── index.html                 # Page content, navigation and SEO
├── assets/
│   ├── css/                   # Theme, details, composer, critical source and hashed bundle
│   ├── js/
│   │   ├── app.js             # Navigation, language and motion
│   │   ├── contact-composer.js # Validated draft preparation
│   │   ├── tracking-schedule.js# First-paint tracking scheduler
│   │   └── preferences.js     # Preference helper; initial setup is inline
│   ├── fonts/                 # Local IBM Plex Sans Arabic + license
│   ├── brand-icons.svg        # Platform logo sprite
│   ├── brand-icons-LICENSE.txt
│   ├── mohamed-avatar-*.webp   # Responsive portrait variants
│   ├── social-preview.png      # Open Graph / social sharing card
│   ├── favicon.svg
│   └── cv.pdf
├── docs/
│   ├── DEPLOYMENT.md
│   ├── MAINTENANCE.md
│   └── CHANGELOG.md
├── en/index.html              # Generated English entry point; do not edit directly
├── robots.txt
├── sitemap.xml
├── scripts/build-seo.mjs       # Rebuild metadata and English HTML
├── scripts/verify-site.mjs     # Dependency-free validation
├── package.json
├── .editorconfig
├── .gitattributes
├── .gitignore
├── .nojekyll
├── netlify.toml
└── vercel.json
```

## Run locally

From the repository directory:

```sh
python -m http.server 8080
```

Open [localhost:8080](http://localhost:8080) or [localhost:8080/en/](http://localhost:8080/en/). Serving the committed static output needs no installation.

## Check changes

With Node.js installed:

```sh
node scripts/verify-site.mjs
node scripts/test-seo.mjs
node scripts/test-contact-composer.mjs
node scripts/test-tracking-schedule.mjs
node scripts/test-tracking-queues.mjs
node scripts/test-brand-stylesheet.mjs
```

After changing source content or page metadata, regenerate English and search files before checking:

```sh
node scripts/build-seo.mjs
```

Checks cover local assets, section anchors, logo references, structured data and JavaScript syntax. Browser checks remain necessary for layout, interaction and accessibility.

## Performance build

The committed site remains static. Rebuilding CSS requires Python and `scripts/performance-requirements.txt`:

```sh
python -m pip install -r scripts/performance-requirements.txt
python scripts/build-performance-css.py
node scripts/build-seo.mjs
```

Responsive portraits and font subsets retain the existing design. Full CSS loads asynchronously after critical styles; provider queues are created before their libraries load. Asset fingerprints prevent old CSS reuse. GitHub Pages cache headers and third-party library sizes remain provider controlled. See [measured asset sizes](docs/performance-sizes.json).

## Publish and maintain

GitHub Pages publishes `main` from `/ (root)` at [mhmdslahhjaziads-cloud.github.io](https://mhmdslahhjaziads-cloud.github.io/).

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for hosting, [MAINTENANCE.md](docs/MAINTENANCE.md) for edits and [CHANGELOG.md](docs/CHANGELOG.md) for recent changes.

Use [the UTM and measurement guide](docs/UTM-and-measurement.html) for campaign links and contact-intent measurement. GA4 `contact` is configured as the primary key event, with a saved contact-intent/source/campaign report. This measures prepared-contact intent, not a completed sale. Search Console verification and indexing status are recorded separately in the delivery report.

## Credits and ownership

Portfolio content, portrait and CV belong to Mohamed Salah Hegazy. No open-source license is granted for the portfolio itself. Third-party notices are retained in [assets/fonts/OFL.txt](assets/fonts/OFL.txt) and [assets/brand-icons-LICENSE.txt](assets/brand-icons-LICENSE.txt).
