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

  /* -----------------------------------------------------------
     Product Gallery — thumbnail navigation + zoom on hover
  ----------------------------------------------------------- */
  productGallery() {
    const gallery = document.getElementById('gh-gallery');
    if (!gallery) return;

    const slides = gallery.querySelectorAll('.gh-product__gallery-slide');
    const thumbs = gallery.querySelectorAll('.gh-product__thumb');
    if (!slides.length) return;

    // Thumbnail click navigation
    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const index = parseInt(thumb.dataset.index, 10);

        slides.forEach((s) => s.classList.remove('gh-active'));
        thumbs.forEach((t) => {
          t.classList.remove('gh-active');
          t.setAttribute('aria-current', 'false');
        });

        if (slides[index]) slides[index].classList.add('gh-active');
        thumb.classList.add('gh-active');
        thumb.setAttribute('aria-current', 'true');
      });
    });

    // Zoom on hover — track mouse position
    const zoomWraps = gallery.querySelectorAll('.gh-product__zoom-wrap');
    zoomWraps.forEach((wrap) => {
      wrap.addEventListener('mousemove', (e) => {
        const rect = wrap.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        wrap.style.setProperty('--zoom-x', x + '%');
        wrap.style.setProperty('--zoom-y', y + '%');
      });

      wrap.addEventListener('mouseleave', () => {
        wrap.style.removeProperty('--zoom-x');
        wrap.style.removeProperty('--zoom-y');
      });
    });
  },

  /* -----------------------------------------------------------
     Quantity Selector — +/- buttons
  ----------------------------------------------------------- */
  quantitySelector() {
    const qtyBtns = document.querySelectorAll('.gh-product__qty-btn');
    if (!qtyBtns.length) return;

    qtyBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const wrap = btn.closest('.gh-product__quantity-wrap');
        if (!wrap) return;
        const input = wrap.querySelector('.gh-product__qty-input');
        if (!input) return;

        let val = parseInt(input.value, 10) || 1;
        const min = parseInt(input.min, 10) || 1;
        const max = parseInt(input.max, 10) || 99;
        const action = btn.dataset.qtyAction;

        if (action === 'minus' && val > min) {
          val--;
        } else if (action === 'plus' && val < max) {
          val++;
        }

        input.value = val;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  },

  /* -----------------------------------------------------------
     Product Accordion — uses native <details>, enhance a11y
  ----------------------------------------------------------- */
  productAccordion() {
    const accordion = document.getElementById('gh-accordion');
    if (!accordion) return;

    // Optional: close other panels when one opens (exclusive mode)
    const details = accordion.querySelectorAll('details');
    details.forEach((detail) => {
      detail.addEventListener('toggle', () => {
        if (detail.open) {
          details.forEach((other) => {
            if (other !== detail && other.open) {
              other.removeAttribute('open');
            }
          });
        }
      });
    });
  },

  /* -----------------------------------------------------------
     Urgency Counters — animated viewer count fluctuation
  ----------------------------------------------------------- */
  urgencyCounters() {
    const viewingEl = document.getElementById('gh-viewing-count');
    if (!viewingEl) return;
    if (this.prefersReducedMotion) return;

    const baseCount = parseInt(viewingEl.dataset.count, 10) || 127;
    let current = baseCount;

    // Fluctuate the count periodically
    setInterval(() => {
      const change = Math.floor(Math.random() * 7) - 3; // -3 to +3
      current = Math.max(baseCount - 15, Math.min(baseCount + 15, current + change));
      viewingEl.textContent = current;
    }, 3000);
  },

  /* -----------------------------------------------------------
     Shipping Progress Bar — calculate toward free shipping
  ----------------------------------------------------------- */
  shippingProgress() {
    const bar = document.getElementById('gh-shipping-bar');
    if (!bar) return;

    const threshold = parseInt(bar.dataset.threshold, 10) || 3000; // in cents
    const fill = document.getElementById('gh-shipping-fill');
    const text = document.getElementById('gh-shipping-text');
    if (!fill || !text) return;

    const updateBar = () => {
      // Get current cart total from Shopify
      fetch('/cart.js')
        .then((r) => r.json())
        .then((cart) => {
          const total = cart.total_price || 0;
          const pct = Math.min((total / threshold) * 100, 100);
          fill.style.width = pct + '%';

          if (total >= threshold) {
            text.innerHTML = '<strong>You\'ve unlocked FREE shipping!</strong> &#127881;';
          } else {
            const remaining = (threshold - total) / 100;
            text.innerHTML = 'You\'re <strong>$' + remaining.toFixed(2) + '</strong> away from <strong>FREE shipping!</strong>';
          }
        })
        .catch(() => {
          // Silent fail — bar stays as default
        });
    };

    // Run on load
    updateBar();

    // Listen for cart updates (Shopify PubSub or custom event)
    document.addEventListener('cart:updated', updateBar);
  },

  /* -----------------------------------------------------------
     Mobile Sticky Bar — show when add-to-cart scrolls out of view
  ----------------------------------------------------------- */
  productStickyBar() {
    const stickyBar = document.getElementById('gh-sticky-bar');
    const addBtn = document.querySelector('.gh-product__add-btn');
    if (!stickyBar || !addBtn) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            stickyBar.classList.add('gh-visible');
          } else {
            stickyBar.classList.remove('gh-visible');
          }
        });
      },
      { threshold: 0 }
    );

    observer.observe(addBtn);
  },
};

document.addEventListener('DOMContentLoaded', () => {
  GH.init();
  GH.productGallery();
  GH.quantitySelector();
  GH.productAccordion();
  GH.urgencyCounters();
  GH.shippingProgress();
  GH.productStickyBar();
});
