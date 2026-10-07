# Maintenance / دليل التحديث

| التعديل | الملف |
| --- | --- |
| النصوص والخدمات والخبرة وروابط التواصل | `index.html` |
| الألوان والخطوط والكروت وحركة الماوس | `assets/css/styles.css` |
| اللغة والقائمة والتنقل والتفاعل | `assets/js/app.js` |
| تهيئة المظهر واللغة | `assets/js/preferences.js` |
| السيرة الذاتية | `assets/cv.pdf` |
| الصورة الشخصية | `assets/mohamed-avatar.png` |
| شعارات المنصات | `assets/brand-icons.svg` |

## Content conventions

- حدّث `data-ar` و`data-en` والنص الظاهر معًا.
- حافظ على IDs الأقسام المستخدمة في التنقل ومؤشر الصفحة.
- شارة النسخة التجريبية هي `hp-beta-status`. حدّث توضيحها بعد اكتمال المحتوى.
- راجع `data-brand` ورمز الشعار عند تعديل منصة.

## Asset paths

HTML references are relative to `index.html`: `assets/css/styles.css`, `assets/js/app.js`, `assets/cv.pdf`.

Font URLs inside the stylesheet are relative to `assets/css/`: use `../fonts/filename.woff2`.

SVG references created by JavaScript are relative to the page document: `assets/brand-icons.svg#brand-name`.

## Before publishing

1. Run `npm run check` (Node.js required; no dependencies to install).
2. Inspect desktop and mobile layouts in a browser.
3. Test Arabic/English, light/dark themes, menus and hover effects.
4. Test CV, WhatsApp, email and LinkedIn links.
5. Check reduced-motion behavior.
6. Commit with a clear message and confirm the Pages deployment under Actions.

## Recovery and privacy

Use a revert commit to restore earlier behavior without rewriting Git history.

Keep credentials, private client data and drafts outside this public repository. Published assets and the CV are available to visitors.
