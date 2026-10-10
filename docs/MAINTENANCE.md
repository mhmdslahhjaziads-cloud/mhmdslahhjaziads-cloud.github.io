# Maintenance / دليل التحديث

| التعديل | الملف |
| --- | --- |
| النصوص والخدمات والخبرة وروابط التواصل | `index.html` |
| الألوان والخطوط والكروت وحركة الماوس | `assets/css/styles.css` |
| اللغة والقائمة والتنقل والتفاعل | `assets/js/app.js` |
| تهيئة المظهر واللغة | `assets/js/preferences.js` |
| السيرة الذاتية | `assets/cv.pdf` |
| الصورة الشخصية | `assets/mohamed-avatar.webp` |
| شعارات المنصات | `assets/brand-icons.svg` |
| النسخة الإنجليزية والـSEO | `scripts/build-seo.mjs` ثم `en/index.html` و`robots.txt` و`sitemap.xml` |
| صورة المشاركة | `assets/social-preview.png` و`scripts/render-social-card.mjs` |
| قياس الزيارات والأحداث | `assets/js/google-analytics.js` |
| تسجيل الجلسات | `assets/js/clarity.js` |

## Content conventions

- حدّث `data-ar` و`data-en` والنص الظاهر معًا.
- حافظ على IDs الأقسام المستخدمة في التنقل ومؤشر الصفحة.
- شارة النسخة التجريبية هي `hp-beta-status`. حدّث توضيحها بعد اكتمال المحتوى.
- راجع `data-brand` ورمز الشعار عند تعديل منصة.
- عدد الأدوات الحالي 19، وكلها ظاهرة على الهاتف بدون أكورديون. دليل البراندات 24، والمشاهد المصغّرة 17. القائمة العائمة ثلاث مجموعات وخمسة صفوف على الهاتف.
- لا تعدّل `en/index.html` مباشرة؛ حدّث النص العربي و`data-en` ثم شغّل `node scripts/build-seo.mjs`.
- حافظ على H1 واحد وعناوين H2 للأقسام الرئيسية وH3 للعناصر داخلها؛ لا تستخدم رتبة العنوان لمجرد حجم الخط.

## Asset paths

HTML references are relative to `index.html`: `assets/css/styles.css`, `assets/js/app.js`, `assets/cv.pdf`.

Font URLs inside the stylesheet are relative to `assets/css/`: use `../fonts/filename.woff2`.

The generator rewrites English HTML asset links to `../assets/`; section fragments stay on `/en/`. Do not add a root `base` element: it would move English section anchors to the Arabic page. Dynamically created SVG links must also resolve to the root asset directory on both language URLs.

## Search and measurement

- Arabic canonical: `https://mhmdslahhjaziads-cloud.github.io/`; English canonical: the same origin plus `en/`.
- Both pages advertise Arabic, English and the Arabic default through `hreflang`. `sitemap.xml` includes only these two public entry points.
- Social sharing uses the committed 1200 × 630 PNG. The optional renderer needs the `sharp` package; rebuilding SEO does not need dependencies.
- GA4 measurement ID is `G-5E9BPGNJJH`; Clarity project is `yvk9p3430s`. Both loader scripts only run on the production hostname. Preview visits should not enter production reports.
- Follow [UTM and measurement](UTM-and-measurement.html). The `contact` event measures preparing a WhatsApp/email draft, not a confirmed message, qualified lead or sale. `cv_download_click` is secondary engagement.
- Confirm GA4 key events, dashboard settings and Search Console sitemap submission in their accounts. Code and documentation do not establish account configuration or search indexing.

## Before publishing

1. Run `node scripts/build-seo.mjs`, then `node scripts/verify-site.mjs` (Node.js required; no dependencies to install).
2. Inspect desktop and mobile layouts in a browser.
3. Open `/` and `/en/` directly, then test Arabic/English navigation with a section hash, light/dark themes, menus and hover effects. Check the English content with JavaScript disabled.
4. Test CV, WhatsApp, email and LinkedIn links.
5. Check reduced-motion behavior.
6. Commit with a clear message and confirm the Pages deployment under Actions.

## Recovery and privacy

Use a revert commit to restore earlier behavior without rewriting Git history.

Keep credentials, private client data and drafts outside this public repository. Published assets and the CV are available to visitors.

## Performance and contact composer

- Edit CSS sources, then run `python scripts/build-performance-css.py` (install `scripts/performance-requirements.txt` first). The builder fingerprints the full stylesheet and updates its HTML link. Update `assets/css/critical-source.css` when changing above-the-fold layout or themes; confirm first paint before publishing. Critical CSS is inline; remaining CSS loads with `media=print` and a stylesheet-load handler. No-JavaScript pages use the noscript stylesheet.
- The portrait uses 320/480/640/834 WebP candidates and a 96px navigation image. Keep `srcset` and `sizes` in sync with its display width.
- The eight `*-site.woff2` subsets retain the existing weights, Arabic shaping and advance widths; use original fonts when adding unsupported script characters.
- Early preferences are inline in `index.html`; update that inline copy if changing `preferences.js`. `/en/` selects English directly; `/` selects Arabic.
- The contact form is always visible. Required details, request type, and an optional HTTP(S) project URL are validated before opening a draft. WhatsApp/email buttons do not send it automatically. Details are masked for Clarity and never included in GA/Meta event parameters. Desktop icons enter inside their buttons on hover/focus; phone icons stay visible.
- `tracking-schedule.js` delays library requests until initial paint/idle, interaction, or a 2500ms deadline. Provider queues are created immediately. Validate real PageView and contact events after a loader change; a departing visitor's request can still be canceled by their browser.
- Run `node scripts/test-contact-composer.mjs`, `node scripts/test-tracking-schedule.mjs`, `node scripts/test-tracking-queues.mjs`, `node scripts/test-brand-stylesheet.mjs`, and `node scripts/test-seo.mjs`.
- GitHub Pages controls cache headers. Fingerprinted CSS prevents stale updates, but does not change the platform cache duration or third-party cache rules.

## Current layout and account measurement · 2026-10-11

- Availability and markets belong inside `.hp-hero-profile`, after the portrait. The journey twist card has been removed.
- Contact fields stay visible. The bottom row contains WhatsApp, email and an icon-only LinkedIn link. Draft text stays out of analytics.
- Phone method titles sit beside their numbers; preserve the existing scene classes when editing.
- Service and toolkit chips use centered wrapping rows.
- Career-title stickers use the shared title wrapper; the translated text stays on the heading, outside the SVGs.
- GA4 `contact` is marked as a key event. Saved report: “نية التواصل ومصدرها | Portfolio”; event-count scorecard and session source/medium/campaign table, filtered to contact. A prepared draft is an intent event, not proof of a sent message or customer.
