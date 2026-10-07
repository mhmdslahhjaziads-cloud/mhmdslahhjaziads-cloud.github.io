# النشر وربط الدومين

## الحالة الحالية

هذا مستودع مستقل يحتوي ملفات الموقع الجاهزة. عنوان GitHub Pages المستهدف هو `https://mhmdslahhjaziads-cloud.github.io`، ومصدر النشر فرع `main` ومجلد الجذر. بيانات SEO مضبوطة عليه. لم يتم شراء/ربط دومين مستقل. النسخة الحالية على ChatGPT Sites تظل متاحة كما هي.

## Netlify

1. سجّل الدخول إلى Netlify واختر استيراد مشروع من GitHub.
2. اسمح للتكامل بالوصول لهذا المستودع الخاص واختره.
3. فرع الإنتاج: `main`. لا تضع Build command. مجلد النشر: `.`.
4. ملف `netlify.toml` يحدد مجلد النشر بالفعل.
5. بعد النشر، اختبر الرابط المؤقت والـCV وتبديل اللغة والمظهر.

مرجع رسمي: [إعدادات البناء والنشر](https://docs.netlify.com/build/configure-builds/overview/).

## Vercel

1. استورد المستودع من GitHub داخل Vercel.
2. Framework Preset: `Other`. لا توجد عملية build أو install مطلوبة. Output Directory: `.`.
3. ملف `vercel.json` يحتوي الإعدادات الأساسية.
4. انشر المشروع واختبر الرابط الناتج.

مرجع رسمي: [نشر موقع ثابت بدون build](https://vercel.com/docs/builds#skipping-the-build-step).

## استضافة تقليدية / cPanel

ارفع `index.html` وملفات CSS/JS ومجلد `assets` إلى `public_html` أو جذر الموقع المحدد عند شركة الاستضافة. حافظ على هيكل `assets/fonts`. لا تحتاج رفع دليل المشروع أو ملفات إعدادات Netlify/Vercel إلى `public_html`.

## بعد شراء الدومين

1. أضف الدومين داخل إعدادات المشروع عند الاستضافة المختارة.
2. افتح DNS عند بائع الدومين وأدخل **القيم التي تعطيها لك الاستضافة نفسها** لسجلات A/CNAME/TXT؛ لا توجد قيم DNS محددة مسبقًا لهذا المشروع.
3. أضف الدومين الرئيسي ونسخة `www` إن أردت، واختر واحدًا منهما أساسيًا مع إعادة توجيه الآخر.
4. انتظر التحقق من DNS ثم تأكد من تفعيل HTTPS.
5. في `index.html` حدّث رابط `canonical` و`og:url` و`url` داخل JSON-LD إلى `https://` مع الدومين النهائي.
6. اختبر الموبايل والكمبيوتر، اللغة والمظهر، تحميل CV وروابط WhatsApp/LinkedIn/البريد.

لا تضف ملف CNAME بدومين وهمي. لا تغيّر سجلات MX للبريد عند ربط الموقع.

## GitHub Pages (بديل)

عند استخدام فرع للنشر اختر Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
GitHub Pages مع GitHub Free يتطلب مستودعًا عامًا. اسم هذا المستودع هو `mhmdslahhjaziads-cloud.github.io` ليعمل الموقع على العنوان نفسه. نشر الموقع سيجعل محتواه وروابط الـCV متاحة للزوار.

مرجع رسمي: [إعداد مصدر GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)، [ربط دومين](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
