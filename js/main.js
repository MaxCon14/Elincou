/* Elincou Design System — interactions */

// ---------- Palette data (from Brand Guidelines v1.0) ----------
const PRIMARY = [
  { name: 'White',          hex: '#FFFFFF', rgb: '255, 255, 255', cmyk: '0, 0, 0, 0',  bordered: true },
  { name: 'Ghost White',    hex: '#F4F4F9', rgb: '244, 244, 249', cmyk: '2, 2, 0, 2',  bordered: true },
  { name: 'Alabaster Grey', hex: '#E8E7E4', rgb: '232, 231, 228', cmyk: '0, 0, 2, 9',  bordered: true },
  { name: 'Grey Olive',     hex: '#999999', rgb: '153, 153, 153', cmyk: '0, 0, 0, 40' },
  { name: 'Onyx',           hex: '#0E0E0E', rgb: '14, 14, 14',    cmyk: '0, 0, 0, 95' },
];
const EXTENDED = [
  { name: 'Crayola Blue', hex: '#3777FF', rgb: '55, 119, 255', cmyk: '78, 53, 0, 90' },
  { name: 'Emerald',      hex: '#57BB78', rgb: '87, 187, 120', cmyk: '53, 0, 36, 27' },
  { name: 'Mustard',      hex: '#FFE156', rgb: '255, 225, 86', cmyk: '0, 12, 66, 0' },
];

function swatchCard(c, i, group) {
  const btn = document.createElement('button');
  btn.className = 'el-swatch';
  btn.type = 'button';
  btn.setAttribute('aria-label', `Copy ${c.name} hex value ${c.hex}`);
  const inset = c.bordered ? 'box-shadow: inset 0 0 0 1px var(--el-line);' : '';
  btn.innerHTML = `
    <span class="el-swatch__chip" style="background:${c.hex};${inset}">
      <span class="el-swatch__copy">COPY HEX</span>
    </span>
    <span class="el-swatch__body">
      <span class="el-swatch__row">
        <span class="el-swatch__name">${c.name}</span>
        <span class="el-swatch__idx">${group}.${String(i + 1).padStart(2, '0')}</span>
      </span>
      <span class="el-swatch__values">HEX ${c.hex}<br>RGB ${c.rgb}<br>CMYK ${c.cmyk}</span>
    </span>`;
  btn.addEventListener('click', () => copyText(c.hex, `${c.name} — ${c.hex} copied`));
  return btn;
}

document.getElementById('palette-primary')
  ?.append(...PRIMARY.map((c, i) => swatchCard(c, i, 'P')));
document.getElementById('palette-extended')
  ?.append(...EXTENDED.map((c, i) => swatchCard(c, i, 'E')));

// ---------- Copy to clipboard + toast ----------
const toast = document.getElementById('toast');
let toastTimer;

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

async function copyText(text, msg) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(msg || 'Copied to clipboard');
  } catch {
    showToast('Copy failed — clipboard unavailable');
  }
}

document.querySelectorAll('.el-copy-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.copyTarget);
    if (target) copyText(target.textContent, 'Tokens copied to clipboard');
  });
});

// ---------- Scroll-spy sidebar nav ----------
const navLinks = [...document.querySelectorAll('.el-nav__link')];
const sections = navLinks
  .map((l) => document.querySelector(l.getAttribute('href')))
  .filter(Boolean);

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((l) =>
        l.classList.toggle('is-active', l.getAttribute('href') === `#${entry.target.id}`)
      );
    });
  },
  { rootMargin: '-20% 0px -70% 0px' }
);
sections.forEach((s) => spy.observe(s));

// ---------- Editorial reveal on scroll ----------
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion) {
  const revealTargets = document.querySelectorAll('.el-section .el-container > *');
  revealTargets.forEach((el) => el.classList.add('el-reveal'));

  const reveal = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          reveal.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.06, rootMargin: '0px 0px -5% 0px' }
  );
  revealTargets.forEach((el) => reveal.observe(el));
}
