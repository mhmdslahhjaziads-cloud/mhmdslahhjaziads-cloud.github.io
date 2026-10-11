/* Section labels and the slider share the same page-scroll coordinate system. */
(() => {
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  function layout({ documentHeight, viewportHeight, scrollY, railHeight, sectionTops }) {
    const range = Math.max(0, documentHeight - viewportHeight);
    const progress = range ? clamp(scrollY / range, 0, 1) : 0;
    const bandSize = documentHeight > 0 ? Math.min(1, viewportHeight / documentHeight) : 1;
    const probe = scrollY + viewportHeight * .3;
    let activeIndex = 0;
    sectionTops.forEach((top, index) => { if (top <= probe) activeIndex = index; });
    if (range && progress >= .995) activeIndex = sectionTops.length - 1;
    const end = Math.max(0, railHeight - 20);
    const gap = Math.min(28, end / Math.max(1, sectionTops.length - 1));
    const positions = sectionTops.map((top, index) => {
      const destination = range ? clamp((top - viewportHeight * .3) / range, 0, 1) : 0;
      return clamp(destination * railHeight - 10, index * gap, end - (sectionTops.length - index - 1) * gap);
    });
    for (let i = 1; i < positions.length; i++) positions[i] = Math.max(positions[i], positions[i - 1] + gap);
    return { progress, bandSize, bandStart: progress * (1 - bandSize), activeIndex, positions };
  }
  window.HegazyRuler = { layout };
})();
