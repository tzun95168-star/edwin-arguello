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

  // 4. Lightbox Gallery
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  const galleryItems = Array.from(document.querySelectorAll('[data-lightbox]')).map((el) => ({
    src: el.dataset.lightbox,
    caption: el.dataset.caption || ''
  }));

  let currentIndex = 0;

  function openLightbox(src, caption) {
    const found = galleryItems.findIndex((item) => item.src === src);
    currentIndex = found >= 0 ? found : 0;
    lightboxImg.src = src;
    lightboxCaption.textContent = caption;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function stepLightbox(delta) {
    if (!galleryItems.length) return;
    currentIndex = (currentIndex + delta + galleryItems.length) % galleryItems.length;
    lightboxImg.src = galleryItems[currentIndex].src;
    lightboxCaption.textContent = galleryItems[currentIndex].caption;
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
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });

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
