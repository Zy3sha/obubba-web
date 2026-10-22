(() => {
  if (document.documentElement.dataset.obubbaMagic) return;
  document.documentElement.dataset.obubbaMagic = 'true';
  document.documentElement.classList.add('ob-magic-ready');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const progress = document.createElement('div');
  progress.className = 'ob-magic-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  let ticking = false;
  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.setProperty('--ob-progress', String(max > 0 ? Math.min(window.scrollY / max, 1) : 0));
    document.body.classList.toggle('ob-magic-travelled', window.scrollY > 42);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) requestAnimationFrame(updateScroll);
    ticking = true;
  }, { passive: true });
  updateScroll();

  const candidates = document.querySelectorAll([
    '.article-header', '.post-header', '.blog-hero', '.topic-hero',
    '.rich-text > h2', '.rich-text > figure', '.rich-text > blockquote',
    '.article-card', '.post-card', '.topic-card', '.guide-card',
    '.cta-band', '.related-guides', '.comparison-card',
    '.g-daybook-scene', '.g-rhythm-world', '.g-tool-garden', '.g-final-invite'
  ].join(','));
  candidates.forEach((item) => item.classList.add('ob-magic-scene'));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-ob-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8%', threshold: .06 });
    candidates.forEach((item, index) => {
      item.style.setProperty('--ob-delay', `${Math.min(index % 4, 3) * 55}ms`);
      observer.observe(item);
    });
  } else {
    candidates.forEach((item) => item.classList.add('is-ob-visible'));
  }

  if (!reduced) {
    document.addEventListener('click', (event) => {
      if (event.target.closest('a,button,input,select,textarea,summary')) return;
      const sparks = document.createElement('span');
      sparks.className = 'ob-magic-sparks';
      sparks.style.left = `${event.clientX}px`;
      sparks.style.top = `${event.clientY}px`;
      sparks.innerHTML = '<i></i><i></i><i></i><i></i><i></i>';
      document.body.appendChild(sparks);
      window.setTimeout(() => sparks.remove(), 1200);
    });
  }
})();
