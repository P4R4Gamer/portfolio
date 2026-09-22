document.getElementById('year').textContent = new Date().getFullYear();

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
