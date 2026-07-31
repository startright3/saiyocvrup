(() => {
  const header = document.querySelector('[data-header]');
  const sticky = document.querySelector('[data-mobile-sticky]');
  const year = document.querySelector('[data-year]');

  if (year) year.textContent = String(new Date().getFullYear());

  const updateScrollState = () => {
    const y = window.scrollY;
    header?.classList.toggle('scrolled', y > 24);
    sticky?.classList.toggle('visible', y > 520 && y < document.documentElement.scrollHeight - window.innerHeight - 500);
  };

  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });

  const reveals = document.querySelectorAll('.reveal');
  reveals.forEach((node) => {
    const delay = node.getAttribute('data-delay');
    if (delay) node.style.setProperty('--delay', `${delay}ms`);
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

    reveals.forEach((node) => revealObserver.observe(node));
  } else {
    reveals.forEach((node) => node.classList.add('visible'));
  }

  document.querySelectorAll('.faq-question').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      if (!item) return;
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach((openItem) => {
        if (openItem === item) return;
        openItem.classList.remove('open');
        openItem.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      });

      item.classList.toggle('open', !isOpen);
      button.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  document.querySelectorAll('[data-track]').forEach((link) => {
    link.addEventListener('click', () => {
      const placement = link.getAttribute('data-track') || 'unknown';
      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'line_cta_click', placement });
      } catch (_) {
        // Tracking must never block navigation.
      }
    });
  });
})();
