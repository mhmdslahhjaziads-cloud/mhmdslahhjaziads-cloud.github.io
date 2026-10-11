# Release verification — 12 October 2026

Production: https://mhmdslahhjaziads-cloud.github.io/

Approved interface: [merged pull request #7](https://github.com/mhmdslahhjaziads-cloud/mhmdslahhjaziads-cloud.github.io/pull/7). Pages build/deployment run 133 completed successfully.

## Release integrity

- Twenty-three uploaded files matched the reviewed source, including both entry points, CSS sources/current bundle, motion scripts, logos, flags and build-size metadata.
- Production Arabic/English HTML, the current stylesheet and new assets returned HTTP 200 and matched the release after newline normalization.
- The initial approved release retained five CSS source files and one bundle (`site.05c173edfc0d.css`). Superseded bundles and `platform-disclosure.js` were removed through versioned commits.
- Asset/anchor/JavaScript, English SEO and CSS-scope checks passed. Sixteen contact/ruler/letter tests passed with zero failures. Tracking scheduling, early queues/privacy/deduplication and asynchronous brand-stylesheet checks passed.

## Browser review

- Phone checks at 320, 375 and 430 CSS pixels and a normal desktop viewport.
- Equal toolkit panels with two icon rows, centered final DOKKAN card and hidden phone beta badge.
- Dark-mode contact contrast: `#252c26` text on `#a6c8df` fill.
- Production libraries reported `loaded` for GA4, Clarity and Meta Pixel; no broken rendered images.

## PageSpeed Insights

[Report captured 12 October 2026 at 00:49 Cairo time](https://pagespeed.web.dev/analysis/https-mhmdslahhjaziads-cloud-github-io/dye8p8a0rj?form_factor=mobile).

| Metric | Mobile | Desktop |
| --- | --- | --- |
| Performance | 87 | 90 |
| Accessibility | 97 | 100 |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |
| First Contentful Paint | 2.1 s | 0.4 s |
| Largest Contentful Paint | 3.3 s | 0.7 s |
| Total Blocking Time | 130 ms | 240 ms |
| Cumulative Layout Shift | 0 | 0.087 |
| Speed Index | 4.3 s | 0.7 s |

Mobile used an emulated Moto G Power and slow 4G; desktop used its standard lab profile. Lighthouse version 13.5.0. These are one-run lab results and can vary. No real-user field data was available; this does not establish a real-user Core Web Vitals pass.

Remaining opportunities include third-party cache/JavaScript overhead, unused styles, image delivery and mobile accessibility. Mobile LCP exceeded Google's 2.5-second good threshold in this lab run. See [Web Vitals guidance](https://web.dev/articles/vitals).

## Tracking limits

The live browser loaded the three provider libraries. Automated checks confirmed initial queueing, early-contact handling and duplicate prevention. Analytics-dashboard receipt, attribution, key-event settings and session availability were not re-confirmed in provider accounts during this release check. No real contact message was sent.

## Final follow-up corrections

- Move the beta badge into the portrait column layout, leaving 40px at rest and positive clearance during portrait hover. Keep it hidden below 701px.
- Keep the freelance role text dark on its pale card in both themes.
- Move the single work label to the former brands destination in the ruler and phone navigation.
- Animate visible brand cards with direct 3D transforms; cache button/link references instead of querying all 72 cards per animation frame. The regression test reproduces 72 per-frame lookups before the fix and zero afterward, while keeping wrapping, opposite directions, independent hover/focus/drag and hidden/offscreen pause.
- Current follow-up CSS bundle: `site.df3bab2049f6.css`. Initial PageSpeed results above precede these follow-up corrections.
