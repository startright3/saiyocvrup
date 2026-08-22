(() => {
  const GROWTH_URL = 'https://effvvtmhxxeggepardwe.supabase.co/functions/v1/growth-intake';
  const ANON_KEY = 'ezogo_growth_anonymous_id';
  const SESSION_KEY = 'ezogo_growth_session_id';

  const id = (storage, key) => {
    try {
      const existing = storage.getItem(key);
      if (existing) return existing;
      const next = crypto.randomUUID();
      storage.setItem(key, next);
      return next;
    } catch (_) {
      return crypto.randomUUID();
    }
  };

  const attribution = () => {
    const params = new URLSearchParams(location.search);
    if (params.get('utm_source')) {
      return {
        source: params.get('utm_source'),
        medium: params.get('utm_medium'),
        campaign: params.get('utm_campaign'),
        content: params.get('utm_content'),
        keyword: params.get('utm_term'),
      };
    }
    if (params.get('gclid')) return { source: 'google', medium: 'cpc', campaign: null, content: null, keyword: null };
    if (params.get('fbclid')) return { source: 'meta', medium: 'paid_social', campaign: null, content: null, keyword: null };
    try {
      const ref = document.referrer ? new URL(document.referrer) : null;
      if (ref && ref.hostname !== location.hostname) return { source: ref.hostname, medium: 'referral', campaign: null, content: null, keyword: null };
    } catch (_) {}
    return { source: 'direct', medium: null, campaign: null, content: null, keyword: null };
  };

  const identity = () => ({ anonymousId: id(localStorage, ANON_KEY), sessionId: id(sessionStorage, SESSION_KEY) });
  const sendGrowth = (eventName, step, properties = {}) => {
    const ids = identity();
    const touch = attribution();
    const payload = {
      type: 'event',
      eventId: crypto.randomUUID(),
      anonymousId: ids.anonymousId,
      sessionId: ids.sessionId,
      occurredAt: new Date().toISOString(),
      eventName,
      funnel: 'recruiting',
      step,
      page: `${location.pathname}${location.search}`,
      referrer: document.referrer || null,
      firstTouch: touch,
      lastTouch: touch,
      properties: { ...properties, product: 'EZOGO', surface: 'careers_lp' },
      schemaVersion: 2,
    };
    try {
      fetch(GROWTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
        mode: 'cors',
      }).catch(() => {});
    } catch (_) {}
  };

  const applyPayTransparency = () => {
    const faqItems = Array.from(document.querySelectorAll('.faq-item'));
    const rewardFaq = faqItems.find((item) => item.querySelector('.faq-question')?.textContent?.includes('報酬はどのくらい'));
    const rewardAnswer = rewardFaq?.querySelector('.faq-answer p');

    if (rewardAnswer) {
      rewardAnswer.textContent = '地域、案件、時間、配送件数、車両などで異なります。案件を受ける前に、報酬額・支払期日・経費負担を確認できます。合わない案件は辞退できます。';
    }

    if (rewardFaq && !document.querySelector('[data-payday-faq]')) {
      const paydayFaq = document.createElement('article');
      paydayFaq.className = 'faq-item reveal visible';
      paydayFaq.setAttribute('data-payday-faq', '');
      paydayFaq.innerHTML = `
        <button class="faq-question" aria-expanded="false">
          <span><b>Q.</b> 報酬はいつ支払われますか？</span><i aria-hidden="true"></i>
        </button>
        <div class="faq-answer"><p>案件ごとに支払日が異なります。主要案件では月末締／翌月末が中心です。AMAZONは月末締／翌月15日前後、建築スポット配送・陸送お迎えは毎月20日締／翌々末です。最終的な支払期日は案件オファー時に明示します。</p></div>
      `;
      rewardFaq.insertAdjacentElement('afterend', paydayFaq);
    }

    const flowItems = document.querySelectorAll('#flow .flow-list li');
    const conditionStep = flowItems[2];
    const conditionCopy = conditionStep?.querySelector('p');
    if (conditionCopy) {
      conditionCopy.textContent = '地域・時間・車両に加え、報酬額・支払日・経費負担まで確認します。';
    }
  };

  const header = document.querySelector('[data-header]');
  const sticky = document.querySelector('[data-mobile-sticky]');
  const year = document.querySelector('[data-year]');

  if (year) year.textContent = String(new Date().getFullYear());
  applyPayTransparency();
  sendGrowth('page_view', 'landing_viewed', { title: document.title.slice(0, 200) });

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
      if (!isOpen) sendGrowth('faq_opened', 'condition_research', { faq: button.textContent?.trim().slice(0, 120) || 'unknown' });
    });
  });

  document.querySelectorAll('[data-track]').forEach((link) => {
    link.addEventListener('click', () => {
      const placement = link.getAttribute('data-track') || 'unknown';
      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'line_cta_click', placement });
      } catch (_) {}
      sendGrowth('cta_clicked', 'consultation_clicked', { placement, destination: 'line' });
    });
  });
})();
