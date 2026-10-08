const header = document.getElementById('site-header');
const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches && !document.documentElement.classList.contains('force-motion');

const loader = document.getElementById('site-loader');
if (loader) {
  const loaderFill = document.getElementById('site-loader-fill');
  const loaderPercent = document.getElementById('site-loader-percent');
  const loaderTrack = document.getElementById('site-loader-track');
  const startedAt = performance.now();
  let progress = 0;
  let finishing = false;

  function setLoadingProgress(value) {
    progress = value;
    loaderFill.style.width = `${value}%`;
    loaderPercent.textContent = `${value}%`;
    loaderTrack.setAttribute('aria-valuenow', String(value));
  }

  const progressTimer = window.setInterval(() => {
    if (progress < 90) setLoadingProgress(Math.min(90, progress + Math.max(1, Math.ceil((90 - progress) * .12))));
  }, 80);

  function finishLoading() {
    if (finishing) return;
    finishing = true;
    const minimumTime = reducedMotion ? 0 : 1200;
    const remaining = Math.max(0, minimumTime - (performance.now() - startedAt));
    window.setTimeout(() => {
      window.clearInterval(progressTimer);
      setLoadingProgress(100);
      window.setTimeout(() => {
        loader.classList.add('is-finishing');
        window.setTimeout(() => {
          document.documentElement.classList.remove('js-loading');
          loader.remove();
        }, reducedMotion ? 0 : 500);
      }, reducedMotion ? 0 : 220);
    }, remaining);
  }

  window.addEventListener('load', finishLoading, { once: true });
  if (document.readyState === 'complete') finishLoading();
  window.setTimeout(finishLoading, 5500);
}

function updateHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 28);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
  document.documentElement.style.setProperty('--scroll-progress', progress);
}
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

function closeMenu() {
  header.classList.remove('menu-active');
  document.body.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
  menuButton.querySelector('use').setAttribute('href', '#i-menu');
}
menuButton.addEventListener('click', () => {
  const open = !header.classList.contains('menu-active');
  header.classList.toggle('menu-active', open);
  document.body.classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  menuButton.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
window.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
window.addEventListener('resize', () => { if (window.innerWidth > 850) closeMenu(); });

const revealObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  }
}, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

const transitionObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.target.matches('.motion-band')) {
      entry.target.classList.toggle('is-active', entry.isIntersecting);
      continue;
    }
    if (entry.isIntersecting) {
      entry.target.classList.add(entry.target.matches('section') ? 'section-activated' : 'is-active');
      transitionObserver.unobserve(entry.target);
    }
  }
}, { threshold: 0.08 });
document.querySelectorAll('.motion-band,.kinetic-divider,.services,.audiences,.process,.reviews,.area')
  .forEach(element => transitionObserver.observe(element));

const process = document.getElementById('process-steps');
const processObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    process.classList.add('line-visible');
    processObserver.disconnect();
  }
}, { threshold: 0.3 });
processObserver.observe(process);

function animateValue(element, target, duration, formatter) {
  if (reducedMotion) { element.textContent = formatter(target); return; }
  const start = performance.now();
  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = formatter(target * eased);
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
const reviewsScore = document.querySelector('.reviews-score');
const scoreObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    animateValue(reviewsScore.querySelector('.score-number'), 4.7, 1300, value => value.toFixed(1));
    animateValue(reviewsScore.querySelector('.reviews-count'), 40, 1300, value => `+${Math.round(value)} opiniones`);
    scoreObserver.disconnect();
  }
}, { threshold: 0.25 });
scoreObserver.observe(reviewsScore);

const statement = document.querySelector('.statement-frame');
const statementPhoto = document.querySelector('.statement-photo');
let rafPending = false;
function updateParallax() {
  rafPending = false;
  if (reducedMotion || window.innerWidth < 620) return;
  const rect = statement.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > innerHeight) return;
  const progress = (innerHeight - rect.top) / (innerHeight + rect.height);
  statementPhoto.style.transform = `translateY(${(progress - .5) * 34}px) scale(1.07)`;
}
window.addEventListener('scroll', () => {
  if (!rafPending) { rafPending = true; requestAnimationFrame(updateParallax); }
}, { passive: true });
updateParallax();

document.getElementById('year').textContent = new Date().getFullYear();
