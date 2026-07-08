/* Elincou — Home page interactions */
(() => {
  'use strict';

  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DESKTOP = () => window.innerWidth > 960;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ---------- Preloader ---------- */
  const loader = document.getElementById('loader');
  const countEl = document.getElementById('loader-count');
  const barEl = document.getElementById('loader-bar');

  function finishLoad() {
    document.body.classList.add('is-loaded');
    if (loader) {
      loader.classList.add('is-done');
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }
  }

  if (RM || !loader) {
    if (loader) loader.remove();
    document.body.classList.add('is-loaded');
  } else {
    const seen = sessionStorage.getItem('el-loaded');
    const DURATION = seen ? 700 : 1900;
    const t0 = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    let loadDone = false;
    function completeLoad() {
      if (loadDone) return;
      loadDone = true;
      if (countEl) countEl.textContent = '100%';
      if (barEl) barEl.style.width = '100%';
      sessionStorage.setItem('el-loaded', '1');
      setTimeout(finishLoad, 180);
    }

    (function tick(now) {
      if (loadDone) return;
      const p = clamp((now - t0) / DURATION, 0, 1);
      const v = Math.round(easeOut(p) * 100);
      if (countEl) countEl.textContent = String(v).padStart(3, '0') + '%';
      if (barEl) barEl.style.width = v + '%';
      if (p < 1) requestAnimationFrame(tick);
      else completeLoad();
    })(t0);

    /* rAF is throttled in background tabs — guarantee completion regardless */
    setTimeout(completeLoad, DURATION + 400);
  }

  /* ---------- Header hide/show + scroll progress ---------- */
  const head = document.getElementById('site-head');
  const progress = document.getElementById('scroll-progress');
  let lastY = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (head) {
      head.classList.toggle('is-scrolled', y > 24);
      if (y > 400 && y > lastY) head.classList.add('is-hidden');
      else head.classList.remove('is-hidden');
    }
    lastY = y;
  }, { passive: true });

  /* ---------- Generic reveals ---------- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        revealObs.unobserve(en.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el) => revealObs.observe(el));

  /* ---------- Horizontal pinned scroll ---------- */
  const hs = document.querySelector('.hs');
  const track = document.getElementById('hs-track');
  const hsProgress = document.getElementById('hs-progress');
  const hsCurrent = document.getElementById('hs-current');
  let hsX = 0;

  if (hs && track && !RM) {
    (function hsLoop() {
      if (DESKTOP()) {
        const vh = window.innerHeight;
        const total = hs.offsetHeight - vh;
        const p = clamp((window.scrollY - hs.offsetTop) / total, 0, 1);
        const maxX = Math.max(0, track.scrollWidth - window.innerWidth + 40);
        hsX = lerp(hsX, -p * maxX, 0.09);
        track.style.transform = `translate3d(${hsX}px, 0, 0)`;
        if (hsProgress) hsProgress.style.width = p * 100 + '%';
        if (hsCurrent) {
          const n = clamp(Math.floor(p * 4) + 1, 1, 4);
          hsCurrent.textContent = '0' + n;
        }
      } else {
        track.style.transform = '';
      }
      requestAnimationFrame(hsLoop);
    })();
  }

  /* ---------- Product card deck — recede as the next card covers ---------- */
  const pcards = [...document.querySelectorAll('.pcard')];

  if (pcards.length && !RM) {
    window.addEventListener('scroll', () => {
      if (!DESKTOP()) return;
      for (let i = 0; i < pcards.length - 1; i++) {
        const card = pcards[i].getBoundingClientRect();
        const next = pcards[i + 1].getBoundingClientRect();
        /* 0 → next card far below; 1 → next card fully covering */
        const p = clamp(1 - (next.top - card.top) / card.height, 0, 1);
        pcards[i].style.transform = p > 0
          ? `scale(${1 - p * 0.05}) translateY(${p * -14}px)`
          : '';
        pcards[i].style.filter = p > 0 ? `brightness(${1 - p * 0.12})` : '';
      }
    }, { passive: true });
  }

  /* ---------- Product turntable videos ---------- */
  const pvideos = [...document.querySelectorAll('.pcard__video')];

  pvideos.forEach((v) => {
    const src = v.querySelector('source');
    const drop = () => v.remove(); /* missing file → still image / placeholder shows */
    v.addEventListener('error', drop);
    if (src) src.addEventListener('error', drop);

    v.addEventListener('loadeddata', () => v.classList.add('is-ready'));
  });

  if (pvideos.length) {
    const inView = new Set();
    const vidObs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const v = en.target;
        if (!v.isConnected) return;
        if (en.isIntersecting && !RM) {
          inView.add(v);
          v.play().catch(() => {});
        } else {
          inView.delete(v);
          v.pause();
        }
      });
    }, { threshold: 0.25 });
    pvideos.forEach((v) => vidObs.observe(v));

    /* Browsers pause media in hidden tabs — resume visible videos on return */
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !RM) {
        inView.forEach((v) => { if (v.isConnected) v.play().catch(() => {}); });
      }
    });
  }

  /* ---------- Count-up stats ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      countObs.unobserve(en.target);
      const el = en.target;
      const target = parseInt(el.dataset.count, 10);
      if (RM) { el.textContent = target.toLocaleString('en-US'); return; }
      const t0 = performance.now();
      const D = 1400;
      const ease = (t) => 1 - Math.pow(1 - t, 4);
      (function step(now) {
        const p = clamp((now - t0) / D, 0, 1);
        el.textContent = Math.round(ease(p) * target).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: 0.4 });
  counters.forEach((el) => countObs.observe(el));

  /* ---------- Vision quote — word fill on scroll ---------- */
  const fillText = document.getElementById('fill-text');
  const fillSection = document.querySelector('.fill');
  const fillBar = document.getElementById('fill-bar');

  if (fillText && fillSection) {
    const HL = new Set(['trusted', 'scientific', 'partner', 'progress.']);
    const words = fillText.textContent.trim().split(/\s+/);
    fillText.innerHTML = words
      .map((w) => `<span class="fw${HL.has(w.toLowerCase()) ? ' fw--hl' : ''}">${w}</span>`)
      .join(' ');
    const spans = fillText.querySelectorAll('.fw');

    if (!RM) {
      window.addEventListener('scroll', () => {
        const vh = window.innerHeight;
        const total = fillSection.offsetHeight - vh;
        const p = clamp((window.scrollY - fillSection.offsetTop) / (total * 0.82), 0, 1);
        const onCount = Math.round(p * spans.length);
        spans.forEach((s, i) => s.classList.toggle('on', i < onCount));
        if (fillBar) fillBar.style.transform = `scaleX(${p})`;
      }, { passive: true });
    } else {
      spans.forEach((s) => s.classList.add('on'));
      if (fillBar) fillBar.style.transform = 'scaleX(1)';
    }
  }

  /* ---------- Footer wordmark letters ---------- */
  const wordmark = document.getElementById('foot-wordmark');
  if (wordmark) {
    wordmark.querySelectorAll('span').forEach((s, i) => s.style.setProperty('--i', i));
    const wmObs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          wordmark.classList.add('in');
          wmObs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    wmObs.observe(wordmark);
  }

  /* ---------- FAQ accordion + rolling index ---------- */
  const faqList = document.getElementById('faq-list');
  const faqBigNum = document.getElementById('faq-big-num');

  if (faqList) {
    const faqs = [...faqList.querySelectorAll('.faq')];

    function rollBigNum(text) {
      if (!faqBigNum || faqBigNum.textContent === text) return;
      if (RM) { faqBigNum.textContent = text; return; }
      faqBigNum.classList.remove('is-entering', 'is-settled');
      faqBigNum.classList.add('is-rolling');
      setTimeout(() => {
        faqBigNum.textContent = text;
        faqBigNum.classList.remove('is-rolling');
        faqBigNum.classList.add('is-entering');
        requestAnimationFrame(() => requestAnimationFrame(() => {
          faqBigNum.classList.remove('is-entering');
          faqBigNum.classList.add('is-settled');
        }));
      }, 220);
    }

    faqs.forEach((item, i) => {
      const btn = item.querySelector('.faq__q');
      btn.addEventListener('click', () => {
        const wasOpen = item.classList.contains('is-open');
        faqs.forEach((f) => {
          f.classList.remove('is-open');
          f.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          rollBigNum(String(i + 1).padStart(2, '0'));
        }
      });
    });
  }

  /* ---------- Smooth anchor offset for fixed header ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
    });
  });
})();
