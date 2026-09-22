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

// Hintergrund-Spirale dreht sich mit dem Scroll-Fortschritt der ganzen Seite.
// rAF-gedrosselt, damit der Scroll-Handler selbst leicht bleibt.
const spiralSvg = document.querySelector('#tech-spiral svg');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (spiralSvg && !reduceMotion) {
  let ticking = false;

  const updateSpiral = () => {
    const angle = window.scrollY * 0.12;
    spiralSvg.style.transform = `rotate(${angle}deg)`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateSpiral);
      ticking = true;
    }
  }, { passive: true });

  updateSpiral();
}
