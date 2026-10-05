/* ============================================================
   VISIONARY MINDS — main.js
   Handles: sticky nav, mobile menu, scroll animations,
            contact form, gallery lightbox, back-to-top,
            smooth scroll, active nav link.
   Pattern : IIFE + strict mode; no globals leaked.
   ============================================================ */

'use strict';

(function () {

  /* ── DOM READY ────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    setActiveNav();
    initStickyHeader();
    initMobileNav();
    initSmoothScroll();
    initScrollAnimations();
    initBackToTop();
    initContactForm();
    initGalleryFilters();
    initGalleryLightbox();
    initCounters();
    initHeroEntrance();
    initScrollProgress();
    initHeroParticles();
    initParallax();
    initCardTilt();
    initPageTransition();
  });


  /* ── 1. ACTIVE NAV LINK ──────────────────────────────── */
  function setActiveNav() {
    var page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (href === page || (page === '' && href === 'index.html')) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }


  /* ── 2. STICKY HEADER (shadow on scroll) ─────────────── */
  function initStickyHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }


  /* ── 3. MOBILE NAV ───────────────────────────────────── */
  function initMobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var menu   = document.getElementById('nav-menu');
    if (!toggle || !menu) return;

    // Open / close
    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMobileNav);
    });

    // Close on outside tap
    document.addEventListener('click', function (e) {
      if (menu.classList.contains('open') &&
          !menu.contains(e.target) &&
          !toggle.contains(e.target)) {
        closeMobileNav();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        closeMobileNav();
        toggle.focus();
      }
    });

    function closeMobileNav() {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }


  /* ── 4. SMOOTH SCROLL ────────────────────────────────── */
  function initSmoothScroll() {
    var header = document.getElementById('site-header');

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id === '#') return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var offset = header ? header.offsetHeight + 16 : 0;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - offset,
          behavior: 'smooth'
        });
      });
    });
  }


  /* ── 5. SCROLL FADE-IN ANIMATIONS ───────────────────── */
  function initScrollAnimations() {
    var els = document.querySelectorAll('[data-fade]');
    if (!els.length) return;

    // No IntersectionObserver? Just show everything.
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { observer.observe(el); });
  }


  /* ── 6. BACK TO TOP ──────────────────────────────────── */
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      btn.classList.toggle('visible', window.scrollY > 450);
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ── 7. CONTACT FORM ─────────────────────────────────── */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var SUBMIT_LIMIT = 3;
    var LIMIT_WINDOW = 10 * 60 * 1000;
    var submitKey    = 'vm_submits';
    var emailRe      = /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/;
    var phoneRe      = /^[\d\s+\-() ]{7,20}$/;

    function getSubmits() {
      try { return JSON.parse(sessionStorage.getItem(submitKey) || '[]'); }
      catch (e) { return []; }
    }

    function recordSubmit() {
      try {
        var now   = Date.now();
        var times = getSubmits().filter(function (t) { return now - t < LIMIT_WINDOW; });
        times.push(now);
        sessionStorage.setItem(submitKey, JSON.stringify(times));
      } catch (e) {}
    }

    function isRateLimited() {
      var now = Date.now();
      return getSubmits().filter(function (t) { return now - t < LIMIT_WINDOW; }).length >= SUBMIT_LIMIT;
    }

    function showSuccess() {
      var submitBtn = form.querySelector('[type="submit"]');
      var original  = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.textContent = 'Message Sent!';
        submitBtn.disabled = true;
        submitBtn.classList.add('btn-success');
      }
      form.reset();
      setTimeout(function () {
        if (submitBtn) {
          submitBtn.textContent = original;
          submitBtn.disabled = false;
          submitBtn.classList.remove('btn-success');
        }
      }, 4000);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot — silently succeed so bots think it worked
      var hp = form.querySelector('#hp-website');
      if (hp && hp.value.trim() !== '') { showSuccess(); return; }

      // Rate limiting
      if (isRateLimited()) {
        var btn = form.querySelector('[type="submit"]');
        if (btn) {
          btn.textContent = 'Too many attempts. Please wait.';
          btn.disabled = true;
          setTimeout(function () {
            btn.textContent = 'Send Message';
            btn.disabled = false;
          }, 30000);
        }
        return;
      }

      var valid = true;

      form.querySelectorAll('[required]').forEach(function (field) {
        var group = field.closest('.form-group');
        if (!field.value.trim()) {
          if (group) group.classList.add('error');
          valid = false;
        } else {
          if (group) group.classList.remove('error');
        }
      });

      var emailField = form.querySelector('#email');
      if (emailField && emailField.value.trim()) {
        var emailGroup = emailField.closest('.form-group');
        if (!emailRe.test(emailField.value.trim())) {
          if (emailGroup) emailGroup.classList.add('error');
          valid = false;
        }
      }

      var phoneField = form.querySelector('#phone');
      if (phoneField && phoneField.value.trim()) {
        var phoneGroup = phoneField.closest('.form-group');
        if (!phoneRe.test(phoneField.value.trim())) {
          if (phoneGroup) phoneGroup.classList.add('error');
          valid = false;
        }
      }

      var msgField = form.querySelector('#message');
      if (msgField && msgField.value.trim().length < 20) {
        var msgGroup = msgField.closest('.form-group');
        if (msgGroup) msgGroup.classList.add('error');
        valid = false;
      }

      if (!valid) return;

      recordSubmit();
      showSuccess();
    });

    form.querySelectorAll('input, textarea, select').forEach(function (field) {
      field.addEventListener('input', function () {
        var group = field.closest('.form-group');
        if (group) group.classList.remove('error');
      });
    });
  }


  /* ── 8. GALLERY FILTERS ─────────────────────────────── */
  function initGalleryFilters() {
    var filterBtns = document.querySelectorAll('.gal-filter-btn');
    var items      = document.querySelectorAll('.gal-item[data-category]');
    if (!filterBtns.length || !items.length) return;

    filterBtns.forEach(function (btn) {
      var isActive = btn.classList.contains('active');
      btn.setAttribute('aria-pressed', String(isActive));

      btn.addEventListener('click', function () {
        var filter = btn.dataset.filter || 'all';

        filterBtns.forEach(function (b) {
          var isSelected = b === btn;
          b.classList.toggle('active', isSelected);
          b.setAttribute('aria-pressed', String(isSelected));
        });

        items.forEach(function (item) {
          var matches = filter === 'all' || item.dataset.category === filter;
          item.style.display = matches ? '' : 'none';
        });
      });
    });
  }


  /* ── 9. GALLERY LIGHTBOX ─────────────────────────────── */
  function initGalleryLightbox() {
    var lb       = document.getElementById('lightbox');
    var lbImg    = document.getElementById('lb-img');
    var lbClose  = document.getElementById('lb-close');
    var lbPrev   = document.getElementById('lb-prev');
    var lbNext   = document.getElementById('lb-next');
    var items    = document.querySelectorAll('.gal-item[data-src]');
    if (!lb || !items.length) return;

    var current = 0;
    var srcs    = Array.prototype.map.call(items, function (el) {
      return el.dataset.src;
    });
    var alts = Array.prototype.map.call(items, function (el) {
      return el.dataset.alt || 'Gallery image';
    });

    function openLb(index) {
      current = index;
      lbImg.src = srcs[current];
      lbImg.alt = alts[current];
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }

    function closeLb() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
      if (items[current]) items[current].focus();
    }

    function showNext() {
      current = (current + 1) % srcs.length;
      lbImg.src = srcs[current];
      lbImg.alt = alts[current];
    }

    function showPrev() {
      current = (current - 1 + srcs.length) % srcs.length;
      lbImg.src = srcs[current];
      lbImg.alt = alts[current];
    }

    items.forEach(function (item, i) {
      item.addEventListener('click', function () { openLb(i); });
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(i); }
      });
    });

    lbClose.addEventListener('click', closeLb);
    if (lbPrev) lbPrev.addEventListener('click', showPrev);
    if (lbNext) lbNext.addEventListener('click', showNext);

    // Close on backdrop click
    lb.addEventListener('click', function (e) {
      if (e.target === lb) closeLb();
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape')     closeLb();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft')  showPrev();
    });

    // Touch swipe support for mobile
    var touchStartX = 0;
    lb.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) showNext(); else showPrev();
      }
    }, { passive: true });
  }


  /* ── 9. ANIMATED COUNTERS ────────────────────────────── */
  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    if (!('IntersectionObserver' in window)) {
      counters.forEach(function (el) {
        el.textContent = el.dataset.count;
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el     = entry.target;
        var target = parseInt(el.dataset.count, 10);
        var suffix = el.dataset.suffix || '';
        var start  = 0;
        var dur    = 1800;
        var step   = 16;
        var inc    = target / (dur / step);

        observer.unobserve(el);

        var timer = setInterval(function () {
          start += inc;
          if (start >= target) {
            start = target;
            clearInterval(timer);
          }
          el.textContent = Math.floor(start) + suffix;
        }, step);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { observer.observe(el); });
  }


  /* ── 10. HERO ENTRANCE ANIMATION ───────────────────────── */
  function initHeroEntrance() {
    if (!document.querySelector('.hero')) return;
    // A double-rAF lets the browser paint the initial opacity:0 state first
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.add('hero-ready');
      });
    });
  }


  /* ── 11. SCROLL PROGRESS BAR ────────────────────────────── */
  function initScrollProgress() {
    var bar = document.createElement('div');
    bar.id = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.prepend(bar);

    function update() {
      var scrolled = window.scrollY;
      var total    = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }


  /* ── 12. HERO FLOATING PARTICLES ─────────────────────────── */
  function initHeroParticles() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var wrap = document.createElement('div');
    wrap.className = 'hero-particles';
    wrap.setAttribute('aria-hidden', 'true');

    for (var i = 0; i < 12; i++) {
      var dot  = document.createElement('span');
      var size = (Math.random() * 7 + 4).toFixed(1);        // 4–11 px
      var left = (Math.random() * 94 + 3).toFixed(1);       // 3–97 %
      var top  = (Math.random() * 90 + 5).toFixed(1);       // 5–95 %
      var del  = (Math.random() * 8).toFixed(2);            // 0–8 s delay
      var dur  = (Math.random() * 12 + 14).toFixed(1);      // 14–26 s duration
      var gold = i % 3 === 0;                                // every 3rd = faint white

      dot.style.cssText =
        'position:absolute;border-radius:50%;will-change:transform;' +
        'width:'  + size + 'px;height:' + size + 'px;' +
        'left:'   + left + '%;top:' + top + '%;' +
        'background:' + (gold ? 'rgba(212,160,23,0.22)' : 'rgba(255,255,255,0.10)') + ';' +
        'animation:particleFloat ' + dur + 's ' + del + 's infinite ease-in-out;';

      wrap.appendChild(dot);
    }

    hero.appendChild(wrap);
  }


  /* ── 13. HERO PARALLAX ───────────────────────────────────── */
  function initParallax() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var vh = window.innerHeight;

    function update() {
      var y = window.scrollY;
      if (y < vh) {
        hero.style.backgroundPositionY = 'calc(50% + ' + (y * 0.32).toFixed(1) + 'px)';
      }
    }

    window.addEventListener('scroll', update, { passive: true });
  }


  /* ── 14. CARD 3-D TILT ───────────────────────────────────── */
  function initCardTilt() {
    var cards = document.querySelectorAll('.impact-card');
    if (!cards.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r   = card.getBoundingClientRect();
        var rx  = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -7;
        var ry  = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  7;
        card.style.transform  = 'perspective(700px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-6px)';
        card.style.transition = 'transform 0.08s ease, box-shadow 0.08s ease';
        card.style.boxShadow  = '0 18px 42px rgba(0,0,0,0.14)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform  = '';
        card.style.boxShadow  = '';
        card.style.transition = 'transform 0.55s cubic-bezier(0.22,1,0.36,1), box-shadow 0.55s ease';
      });
    });
  }


  /* ── 15. PAGE FADE TRANSITIONS ───────────────────────────── */
  function initPageTransition() {
    // Fade in on arrival
    document.body.classList.add('page-entering');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.remove('page-entering');
      });
    });

    // Fade out on departure (internal links only)
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' ||
          href.indexOf('http') === 0 ||
          href.indexOf('mailto') === 0 ||
          href.indexOf('tel') === 0) return;

      a.addEventListener('click', function (e) {
        e.preventDefault();
        var dest = href;
        document.body.classList.add('page-exiting');
        setTimeout(function () {
          window.location.href = dest;
        }, 300);
      });
    });
  }

}());
