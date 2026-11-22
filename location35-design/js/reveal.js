(() => {
  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  if (!motion.matches || !('IntersectionObserver' in window)) return;

  // Reveal long sections in groups so their lower cards get an entrance of their own.
  const blocks = document.querySelectorAll(`
    main > section:not(.hero-immersive, #rooms, #formats, #extras),
    #rooms > .section-head,
    #room-list > .room,
    #formats > :is(.section-head, .newyear),
    #formats .standard-packages > .standard-package,
    #extras > :is(.section-head, article, .extra-actions),
    .site-footer
  `);
  const lights = document.querySelector('.newyear-lights');
  const observer = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(target);
      if (!motion.matches) continue;
      if (target === lights) {
        lights.classList.add('is-twinkling');
      } else if (!target.matches(':target, :focus-within')) {
        target.classList.add('section-entering');
      }
    }
  }, { rootMargin: '0px 0px -40px' });

  if (lights) observer.observe(lights);

  const viewportBottom = document.documentElement.clientHeight;
  for (const block of blocks) {
    if (block.getBoundingClientRect().top >= viewportBottom) observer.observe(block);
  }
})();
