document.getElementById('year').textContent = new Date().getFullYear();

// Theme-Umschalter: Standard ist dunkel, Wahl wird gemerkt.
// (Der Wert wird schon in einem kleinen Inline-Script im <head> vor dem
// ersten Rendern gesetzt, damit es beim Laden nicht kurz hell aufblitzt.)
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;

themeToggle.addEventListener('click', () => {
  const isLight = root.getAttribute('data-theme') === 'light';
  if (isLight) {
    root.removeAttribute('data-theme');
    localStorage.setItem('theme', 'dark');
  } else {
    root.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }
});

// Header bekommt beim Scrollen einen dezenten Schatten
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 20);
});

// Scroll-Reveal: Elemente faden ein, sobald sie in den Viewport kommen.
// Reine IntersectionObserver-Lösung, keine externe Library nötig.
const revealTargets = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

revealTargets.forEach(el => revealObserver.observe(el));

// Scroll-Hinweis im Hero ausblenden, sobald gescrollt wurde
const scrollHint = document.querySelector('.scroll-hint');
if (scrollHint) {
  window.addEventListener('scroll', () => {
    scrollHint.style.opacity = window.scrollY > 80 ? '0' : '';
  }, { passive: true });
}

// DNA-Hintergrund dreht sich permanent leicht vor sich hin (Barberpole-Trick:
// die Helix selbst steht fix im Viewport, nur das SVG-Pattern läuft per
// patternTransform durch — das wirkt fürs Auge wie eine echte Drehung).
// Beim Scrollen bekommt sie zusätzlich einen spürbaren Schub, der danach
// wieder auf die Grundgeschwindigkeit abklingt.
const dnaPattern = document.getElementById('dna-pattern');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (dnaPattern && !reduceMotion) {
  const IDLE_SPEED = 0.4;  // px pro Frame, permanente Grunddrehung
  const SCROLL_BOOST = 0.4; // wie stark jedes Scroll-Delta zusätzlich reinschlägt
  const MAX_BOOST = 26;    // Deckel, damit schnelles/rucklerisches Scrollen nicht explodiert
  const DECAY = 0.94;      // wie schnell der Schub wieder abklingt

  let offset = 0;
  let boost = 0;
  let lastScrollY = window.scrollY;
  let rafId = null;

  window.addEventListener('scroll', () => {
    const delta = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    boost = Math.min(boost + Math.abs(delta) * SCROLL_BOOST, MAX_BOOST);
  }, { passive: true });

  function tick() {
    offset -= IDLE_SPEED + boost;
    boost *= DECAY;
    if (boost < 0.02) boost = 0;

    dnaPattern.setAttribute('patternTransform', `translate(0, ${offset})`);
    rafId = requestAnimationFrame(tick);
  }

  // Pausiert im Hintergrund-Tab, damit nicht unnötig CPU/Akku verbraucht wird.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      rafId = requestAnimationFrame(tick);
    }
  });

  tick();
}
