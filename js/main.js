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

// DNA-Hintergrund "dreht" sich beim Scrollen. Die Helix selbst steht fix im
// Viewport — der Dreh-Effekt ist ein Barberpole-Trick: das SVG-Pattern läuft
// per patternTransform am Element vorbei, das erzeugt für das Auge denselben
// Eindruck wie eine sich drehende Doppelhelix.
const dnaPattern = document.getElementById('dna-pattern');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (dnaPattern && !reduceMotion) {
  let ticking = false;

  const updateDna = () => {
    const offset = window.scrollY * -0.6;
    dnaPattern.setAttribute('patternTransform', `translate(0, ${offset})`);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateDna);
      ticking = true;
    }
  }, { passive: true });

  updateDna();
}
