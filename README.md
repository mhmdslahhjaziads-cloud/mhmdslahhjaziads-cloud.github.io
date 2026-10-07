# Mohamed Salah Hegazy · Portfolio

**Media Buying · Tracking · Learning Website Design**

[Live portfolio](https://mhmdslahhjaziads-cloud.github.io/) · [LinkedIn](https://www.linkedin.com/in/mhmdslahhjazi/) · [Deployment](docs/DEPLOYMENT.md) · [Maintenance](docs/MAINTENANCE.md)

موقع محمد صلاح حجازي الشخصي، بالعربية والإنجليزية، لعرض الخدمات والأدوات وطريقة العمل والخلفية المهنية والتواصل.

> **Beta / نسخة تجريبية:** الموقع في مرحلة الاختبار والتطوير؛ بيانات وأعمال إضافية ستُنشر لاحقًا.

## Features

- Arabic / English with RTL / LTR layouts.
- Light and charcoal dark themes with saved browser preferences.
- Responsive navigation, three work and learning cards and a downloadable CV.
- Soft neon hover on toolkit logos and subtle hover scaling on other cards.
- Phone-only toolkit accordions and scroll entrances for the lower sections.
- Reduced-motion support and locally hosted fonts and icons.

## Project structure

```text
.
├── index.html                 # Page content, navigation and SEO
├── assets/
│   ├── css/styles.css         # Theme, layout and interactions
│   ├── js/
│   │   ├── app.js             # Navigation, language and motion
│   │   └── preferences.js     # Initial browser preferences
│   ├── fonts/                 # Local IBM Plex Sans Arabic + license
│   ├── brand-icons.svg        # Platform logo sprite
│   ├── brand-icons-LICENSE.txt
│   ├── mohamed-avatar.png
│   ├── favicon.svg
│   └── cv.pdf
├── docs/
│   ├── DEPLOYMENT.md
│   ├── MAINTENANCE.md
│   └── CHANGELOG.md
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

Open [localhost:8080](http://localhost:8080). Serving this static HTML/CSS/JavaScript site needs no installation or build.

## Check changes

With Node.js installed:

```sh
npm run check
```

Checks cover local assets, section anchors, logo references, structured data and JavaScript syntax. Browser checks remain necessary for layout, interaction and accessibility.

## Publish and maintain

GitHub Pages publishes `main` from `/ (root)` at [mhmdslahhjaziads-cloud.github.io](https://mhmdslahhjaziads-cloud.github.io/).

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for hosting, [MAINTENANCE.md](docs/MAINTENANCE.md) for edits and [CHANGELOG.md](docs/CHANGELOG.md) for recent changes.

## Credits and ownership

Portfolio content, portrait and CV belong to Mohamed Salah Hegazy. No open-source license is granted for the portfolio itself. Third-party notices are retained in [assets/fonts/OFL.txt](assets/fonts/OFL.txt) and [assets/brand-icons-LICENSE.txt](assets/brand-icons-LICENSE.txt).
