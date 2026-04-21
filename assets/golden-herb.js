/* =============================================================
   Golden Herb Co. — Premium Interactive Features
   ============================================================= */

const GH = {
  prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,

  init() {
    this.loadingScreen();
    this.cursor();
    this.backToTop();
    this.scrollAnimations();
    this.parallax();
    this.reviewsDots();
    this.pageTransitions();
  },

  /* -----------------------------------------------------------
     Loading Screen — shows once per session
  ----------------------------------------------------------- */
  loadingScreen() {
    const screen = document.getElementById('gh-loading-screen');
    if (!screen) return;

    if (sessionStorage.getItem('gh-loaded')) {
      screen.remove();
      return;
    }

    if (this.prefersReducedMotion) {
      screen.remove();
      return;
    }

    const dismiss = () => {
      screen.classList.add('gh-loaded');
      sessionStorage.setItem('gh-loaded', '1');
      setTimeout(() => screen.remove(), 600);
    };

    // Dismiss after 1.2s max
    setTimeout(dismiss, 1200);
    window.addEventListener('load', () => setTimeout(dismiss, 200), { once: true });
  },

  /* -----------------------------------------------------------
     Custom Cursor Trail
  ----------------------------------------------------------- */
  cursor() {
    if (this.prefersReducedMotion) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const cursor = document.getElementById('gh-cursor');
    if (!cursor) return;

    let targetX = -100, targetY = -100;
    let currentX = -100, currentY = -100;
    let rafId = null;

    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!rafId) tick();
    }, { passive: true });

    function tick() {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      cursor.style.left = currentX + 'px';
      cursor.style.top = currentY + 'px';

      const dist = Math.abs(targetX - currentX) + Math.abs(targetY - currentY);
      if (dist < 0.5) {
        rafId = null;
      } else {
        rafId = requestAnimationFrame(tick);
      }
    }

    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '0.7';
    });
  },

  /* -----------------------------------------------------------
     Back to Top
  ----------------------------------------------------------- */
  backToTop() {
    const btn = document.getElementById('gh-back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        btn.classList.add('gh-visible');
      } else {
        btn.classList.remove('gh-visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: this.prefersReducedMotion ? 'auto' : 'smooth' });
    });
  },

  /* -----------------------------------------------------------
     Scroll Animations (Intersection Observer)
     Handles .gh-fade-up, .gh-fade-scale, .gh-ingredient-card
  ----------------------------------------------------------- */
  scrollAnimations() {
    const selectors = '.gh-fade-up, .gh-fade-scale, .gh-ingredient-card';
    const targets = document.querySelectorAll(selectors);
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('gh-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));

    // Counter animation
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length) {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(el => counterObserver.observe(el));
    }
  },

  /* -----------------------------------------------------------
     Counter Animation
  ----------------------------------------------------------- */
  animateCounter(el) {
    if (this.prefersReducedMotion) {
      el.textContent = el.dataset.count;
      return;
    }
    const target = parseInt(el.dataset.count, 10);
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(tick);
  },

  /* -----------------------------------------------------------
     Parallax on CTA Banner
  ----------------------------------------------------------- */
  parallax() {
    if (this.prefersReducedMotion) return;
    const bg = document.querySelector('.gh-cta-banner__bg');
    if (!bg) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const section = bg.closest('.gh-cta-banner');
          const rect = section.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) {
            ticking = false;
            return;
          }
          const offset = (rect.top / window.innerHeight) * 30;
          bg.style.transform = `translateY(${offset}px)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  },

  /* -----------------------------------------------------------
     Reviews Carousel Dots
  ----------------------------------------------------------- */
  reviewsDots() {
    const track = document.querySelector('.gh-reviews__track');
    const dots = document.querySelectorAll('.gh-reviews__dot');
    if (!track || !dots.length) return;

    const cards = track.querySelectorAll('.gh-review-card');
    if (!cards.length) return;

    const updateDots = () => {
      const scrollLeft = track.scrollLeft;
      const cardWidth = cards[0].offsetWidth + parseInt(getComputedStyle(track).gap || 24);
      const activeIndex = Math.round(scrollLeft / cardWidth);
      dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
    };

    track.addEventListener('scroll', updateDots, { passive: true });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        const cardWidth = cards[0].offsetWidth + parseInt(getComputedStyle(track).gap || 24);
        track.scrollTo({ left: i * cardWidth, behavior: 'smooth' });
      });
    });

    updateDots();
  },

  /* -----------------------------------------------------------
     Page Transitions (View Transitions API)
  ----------------------------------------------------------- */
  pageTransitions() {
    if (this.prefersReducedMotion) return;
    if (!document.startViewTransition) return;

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (link.target === '_blank') return;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
      } catch { return; }

      e.preventDefault();
      document.startViewTransition(() => {
        window.location.href = href;
      });
    });
  },
};

document.addEventListener('DOMContentLoaded', () => GH.init());
