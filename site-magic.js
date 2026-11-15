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

// Store-aware install links (design audit fix 1, 15 Nov 2026).
// iPhone, iPad and touch Macs go to the App Store, Android goes to Google Play, other desktops go to /app.
// Applies to the header "Download" button (a.nav-cta) and any link marked data-ob-store.
(() => {
  const APP = 'https://apps.apple.com/app/obubba-baby-sleep-tracker/id6760968757';
  const PLAY = 'https://play.google.com/store/apps/details?id=com.obubba.app';
  const device = () => {
    let ua = '', platform = '', touch = 0;
    try { ua = navigator.userAgent || ''; } catch (e) {}
    try { platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || ''; } catch (e) {}
    try { touch = navigator.maxTouchPoints || 0; } catch (e) {}
    if (/android/i.test(ua) || /android/i.test(platform)) return 'android';
    if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
    if (/mac/i.test(platform) && touch > 1) return 'ios';
    return 'desktop';
  };
  const campaign = (href) => {
    try { return new URL(href, location.href).searchParams.get('ct') || 'web_site'; } catch (e) { return 'web_site'; }
  };
  const storeUrl = (ct, where) => {
    const d = device();
    const c = /^[A-Za-z0-9_-]{1,60}$/.test(ct || '') ? ct : 'web_site';
    if (d === 'ios') return `${APP}?pt=128670067&ct=${c}&mt=8`;
    if (d === 'android') {
      // Same referrer scheme as the render's tagStoreLinks and /app's allow-list.
      const ref = new URLSearchParams({ utm_source: 'homepage', utm_medium: 'owned_navigation', utm_campaign: 'from_bump_to_baby_auto', utm_content: `auto_${c}_${where || 'link'}` });
      return `${PLAY}&referrer=${encodeURIComponent(ref.toString())}`;
    }
    return `/app?from=${encodeURIComponent(c)}`;
  };
  window.obubbaStoreUrl = storeUrl;
  window.obubbaDevice = device;
  const apply = () => {
    document.querySelectorAll('a.nav-cta, a[data-ob-store]').forEach((a) => {
      if (a.dataset.obStoreDone) return;
      a.dataset.obStoreDone = '1';
      const ct = a.dataset.obStore || campaign(a.getAttribute('href') || '');
      const where = a.classList.contains('nav-cta') ? 'nav_cta' : (a.dataset.obStoreWhere || 'link');
      a.href = storeUrl(ct, where);
      if (device() === 'desktop') { a.removeAttribute('target'); a.removeAttribute('rel'); }
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
})();

// Phone install bar (design audit fix 3, 15 Nov 2026). Phones only, after the first screen,
// hidden near the bottom of the page, dismissible for 14 days, never on gift, redeem, /app or /go.
(() => {
  if (!window.obubbaStoreUrl || !window.obubbaDevice) return;
  const d = window.obubbaDevice();
  if (d === 'desktop') return;
  if (/^\/(gift|redeem|app|go|start|referral)(\/|\.html|$)/.test(location.pathname)) return;
  const KEY = 'obInstallBarHiddenUntil';
  try { if (Number(localStorage.getItem(KEY) || 0) > Date.now()) return; } catch (e) {}
  const page = (location.pathname.split('/').filter(Boolean)[0] || 'home').replace(/\.html$/, '').replace(/^index$/, 'home').replace(/[^a-z0-9_-]/gi, '').slice(0, 30) || 'home';
  const bar = document.createElement('div');
  bar.className = 'ob-install-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Get the OBubba app');
  bar.innerHTML = '<img src="/icon-192.webp" width="40" height="40" alt=""><a class="ob-install-go">Get OBubba free</a><button type="button" class="ob-install-x" aria-label="Hide">×</button>';
  bar.querySelector('a').setAttribute('aria-label', d === 'android' ? 'Get OBubba free on Google Play' : 'Get OBubba free on the App Store');
  const go = bar.querySelector('a');
  go.href = window.obubbaStoreUrl(`web_bar_${page}`, 'install_bar');
  go.addEventListener('click', () => { try { window.gtag && window.gtag('event', 'install_bar_click', { store: d, page }); } catch (e) {} });
  bar.querySelector('button').addEventListener('click', () => {
    bar.remove();
    try { localStorage.setItem(KEY, String(Date.now() + 14 * 864e5)); } catch (e) {}
  });
  document.body.appendChild(bar);
  const update = () => {
    if (!window.matchMedia('(max-width: 760px)').matches) { bar.classList.remove('is-on'); return; }
    const y = window.scrollY, h = window.innerHeight, max = document.documentElement.scrollHeight;
    const consentOpen = !!document.querySelector('.ob-consent');
    bar.classList.toggle('is-on', !consentOpen && y > h * 0.9 && y + h < max - 500);
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  document.addEventListener('click', (e) => { if (e.target.closest('[data-ob-accept],[data-ob-decline]')) setTimeout(update, 50); });
  update();
})();

// UK visitors see their own store's rating without the "UK" label (owner, 15 Nov 2026: "4.9 is uk rating keep it").
(() => {
  let tz = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
  if (!/^Europe\/(London|Belfast|Jersey|Guernsey|Isle_of_Man)$/.test(tz)) return;
  document.querySelectorAll('[data-ob-uk-text]').forEach((el) => {
    const star = el.querySelector('b');
    el.textContent = ` ${el.dataset.obUkText}`;
    if (star) el.prepend(star);
  });
})();
