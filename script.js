(() => {
  const EMAIL = 'edwindavidarguellomartinez@gmail.com';

  // 1. Theme Toggle
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const iconSun = document.getElementById('iconSun');
  const iconMoon = document.getElementById('iconMoon');

  function applyTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      iconSun.style.display = 'none';
      iconMoon.style.display = 'block';
    } else {
      root.removeAttribute('data-theme');
      iconSun.style.display = 'block';
      iconMoon.style.display = 'none';
    }
  }

  const savedTheme = localStorage.getItem('edwin-portfolio-theme') || 'dark';
  applyTheme(savedTheme);

  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    localStorage.setItem('edwin-portfolio-theme', next);
    applyTheme(next);
  });

  // 1b. Mobile Navigation Menu
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  const iconMenuOpen = document.getElementById('iconMenuOpen');
  const iconMenuClose = document.getElementById('iconMenuClose');

  function setMobileMenu(open) {
    if (!navLinks || !mobileMenuBtn) return;
    navLinks.classList.toggle('open', open);
    mobileMenuBtn.setAttribute('aria-expanded', String(open));
    if (iconMenuOpen) iconMenuOpen.style.display = open ? 'none' : 'block';
    if (iconMenuClose) iconMenuClose.style.display = open ? 'block' : 'none';
  }

  mobileMenuBtn?.addEventListener('click', () => {
    const isOpen = navLinks?.classList.contains('open');
    setMobileMenu(!isOpen);
  });

  navLinks?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMobileMenu(false));
  });

  document.addEventListener('click', (e) => {
    if (navLinks?.classList.contains('open')) {
      if (!navLinks.contains(e.target) && !mobileMenuBtn?.contains(e.target)) {
        setMobileMenu(false);
      }
    }
  });

  // 2. Project Architecture Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach((b) => b.classList.remove('active'));
      tabPanels.forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${target}`)?.classList.add('active');
    });
  });

  // 3. Skills Category & Experience Filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      skillCards.forEach((card) => {
        const cats = (card.dataset.category || '').split(/\s+/);
        if (filter === 'all' || cats.includes(filter)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // 4. Lightbox Gallery (deduplicated + resilient loader)
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxLoader = document.getElementById('lightboxLoader');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  const seenSrcs = new Set();
  const galleryItems = [];
  document.querySelectorAll('[data-lightbox]').forEach((el) => {
    const src = el.dataset.lightbox;
    if (src && !seenSrcs.has(src)) {
      seenSrcs.add(src);
      galleryItems.push({
        src,
        caption: el.dataset.caption || ''
      });
    }
  });

  let currentIndex = 0;

  function loadIntoLightbox(src, caption) {
    lightboxCaption.textContent = caption;
    lightboxImg.classList.add('is-loading');
    lightboxLoader?.classList.add('active');

    let retried = false;
    lightboxImg.onload = () => {
      lightboxLoader?.classList.remove('active');
      lightboxImg.classList.remove('is-loading');
    };
    lightboxImg.onerror = () => {
      if (!retried) {
        retried = true;
        const sep = src.includes('?') ? '&' : '?';
        lightboxImg.src = src + sep + 't=' + Date.now();
      } else {
        lightboxLoader.textContent = 'No se pudo cargar la imagen. Recarga la página e intenta de nuevo.';
      }
    };

    // Reset first so Chromium always re-triggers load even if previously interrupted
    lightboxImg.removeAttribute('src');
    lightboxImg.src = src;
  }

  function openLightbox(src, caption) {
    if (lightboxLoader) lightboxLoader.textContent = 'Cargando documento...';
    const found = galleryItems.findIndex((item) => item.src === src);
    currentIndex = found >= 0 ? found : 0;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    loadIntoLightbox(src, caption);
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function stepLightbox(delta) {
    if (!galleryItems.length) return;
    currentIndex = (currentIndex + delta + galleryItems.length) % galleryItems.length;
    loadIntoLightbox(galleryItems[currentIndex].src, galleryItems[currentIndex].caption);
  }

  document.querySelectorAll('[data-lightbox]').forEach((el) => {
    el.addEventListener('click', () => {
      openLightbox(el.dataset.lightbox, el.dataset.caption || '');
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxPrev?.addEventListener('click', () => stepLightbox(-1));
  lightboxNext?.addEventListener('click', () => stepLightbox(1));

  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks?.classList.contains('open')) {
      setMobileMenu(false);
    }
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });

  // Touch swipe left/right inside Lightbox for mobile
  let touchStartX = 0;
  lightbox?.addEventListener('touchstart', (e) => {
    if (e.changedTouches?.length) {
      touchStartX = e.changedTouches[0].clientX;
    }
  }, { passive: true });

  lightbox?.addEventListener('touchend', (e) => {
    if (!lightbox.classList.contains('open') || !e.changedTouches?.length) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 45) {
      stepLightbox(dx < 0 ? 1 : -1);
    }
  }, { passive: true });

  // 5. Copy Email + Toast
  const toast = document.getElementById('toast');
  let toastTimer = null;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      showToast('Correo copiado: ' + EMAIL);
    } catch {
      const tmp = document.createElement('input');
      tmp.value = EMAIL;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      tmp.remove();
      showToast('Correo copiado: ' + EMAIL);
    }
  }

  document.getElementById('copyEmailHero')?.addEventListener('click', copyEmail);
  document.getElementById('copyEmailContact')?.addEventListener('click', copyEmail);
})();
