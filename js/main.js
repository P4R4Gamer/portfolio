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

// DNA-Hintergrund: Partikel-Doppelhelix auf Canvas.
//
// Der Dreh-Effekt ist eine "echte" Rotation, kein verschobenes Muster: für
// jeden Partikel wird pro Frame neu berechnet, wie weit er gerade im Twist
// ist (Winkel t). Je näher cos(t) an 1, desto weiter "vorne" — Partikel
// werden dann größer/heller gezeichnet, weiter "hinten" kleiner/blasser.
// Weil sich der globale Rotationswinkel kontinuierlich erhöht, wandert diese
// Tiefe über die Zeit durch alle Partikel gleichzeitig — das liest sich als
// echtes Drehen um die eigene Achse, nicht als Verschieben nach oben/unten.
// Zusätzlich bekommt jeder Partikel einen leicht phasenverschobenen
// Wellen-Versatz, damit sich der Strang wie eine Welle aus Einzelpunkten
// anfühlt statt wie ein starrer Körper.
(() => {
  const canvas = document.getElementById('dna-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TAU = Math.PI * 2;

  const TURN_HEIGHT = 130;        // px pro voller Windung
  const RADIUS = 100;             // horizontaler Radius der Helix
  const STEP = TURN_HEIGHT / 22;  // Partikel-Abstand entlang der y-Achse
  const RUNG_EVERY = 4;           // jeder 4. Schritt bekommt Sprossen-Partikel

  const IDLE_ANGULAR_SPEED = 0.4; // rad/s, permanente Grunddrehung
  const SCROLL_ANGULAR_BOOST = 0.012; // rad/s zusätzlich pro px Scroll-Delta
  const MAX_ANGULAR_BOOST = 7;    // Deckel gegen Ausreißer bei hastigem Scrollen
  const BOOST_DECAY = 0.94;       // pro ~Frame (60fps-normiert)

  const WAVE_AMPLITUDE = 5;
  const WAVE_SPEED = 1.6;
  const WAVE_PHASE_STEP = 0.35;

  let cx = 0;
  let height = 0;
  let rotation = 0;
  let boost = 0;
  let lastScrollY = window.scrollY;
  let lastTime = null;
  let rafId = null;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = rect.width / 2;
    height = rect.height;
  }

  function lerp(a, b, f) { return a + (b - a) * f; }

  function drawParticle(x, y, depth, accentColor, backColor) {
    let size, opacity, color;
    if (depth >= 0) {
      size = lerp(1.8, 4.2, depth);
      opacity = lerp(0.5, 0.95, depth);
      color = accentColor;
    } else {
      size = lerp(1, 1.8, 1 + depth);
      opacity = lerp(0.12, 0.32, 1 + depth);
      color = backColor;
    }
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, TAU);
    ctx.fill();
  }

  function render(time) {
    if (lastTime === null) lastTime = time;
    const dt = Math.min((time - lastTime) / 1000, 0.05); // Sprünge beim Tab-Wechsel kappen
    lastTime = time;
    const elapsed = time / 1000;

    rotation += (IDLE_ANGULAR_SPEED + boost) * dt;
    boost *= Math.pow(BOOST_DECAY, dt * 60);
    if (boost < 0.001) boost = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const styles = getComputedStyle(document.documentElement);
    const accentColor = styles.getPropertyValue('--accent').trim();
    const backColor = styles.getPropertyValue('--ink-soft').trim();

    let i = 0;
    for (let y = -TURN_HEIGHT; y <= height + TURN_HEIGHT; y += STEP, i++) {
      const t = (y / TURN_HEIGHT) * TAU + rotation;
      const wave = Math.sin(elapsed * WAVE_SPEED - i * WAVE_PHASE_STEP) * WAVE_AMPLITUDE;
      const py = y + wave;

      const depthA = Math.cos(t);
      const xA = cx + RADIUS * Math.sin(t);
      const depthB = -depthA;
      const xB = cx - RADIUS * Math.sin(t);

      if (i % RUNG_EVERY === 0) {
        const rungDepth = Math.max(depthA, depthB) * 0.6;
        drawParticle(lerp(xA, xB, 0.33), py, rungDepth, accentColor, backColor);
        drawParticle(lerp(xA, xB, 0.66), py, rungDepth, accentColor, backColor);
      }

      drawParticle(xA, py, depthA, accentColor, backColor);
      drawParticle(xB, py, depthB, accentColor, backColor);
    }

    ctx.globalAlpha = 1;
  }

  function loop(time) {
    render(time);
    rafId = requestAnimationFrame(loop);
  }

  window.addEventListener('scroll', () => {
    const delta = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    boost = Math.min(boost + Math.abs(delta) * SCROLL_ANGULAR_BOOST, MAX_ANGULAR_BOOST);
  }, { passive: true });

  window.addEventListener('resize', resize, { passive: true });

  resize();

  if (reduceMotion) {
    render(0); // ein einziges statisches Bild, keine Animationsschleife
  } else {
    rafId = requestAnimationFrame(loop);

    // Pausiert im Hintergrund-Tab, damit nicht unnötig CPU/Akku verbraucht wird.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        lastTime = null;
        rafId = requestAnimationFrame(loop);
      }
    });
  }
})();
