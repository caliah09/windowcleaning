(function () {
  'use strict';

  var PHONE = '+12564761402';

  var root = document.documentElement;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  var MOTION = hasGSAP && !reduceMotion;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (MOTION) {
    gsap.registerPlugin(ScrollTrigger);
    root.classList.add('motion-ready');
  } else {
    root.classList.remove('motion');
  }

  /* =========================================================
     Smooth scroll (Lenis) + anchor links
     ========================================================= */
  var lenis = null;
  if (MOTION && window.Lenis) {
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  var header = $('#site-header');

  function scrollToTarget(target) {
    if (lenis) {
      // Lenis already honours html { scroll-padding-top } for the fixed header.
      lenis.scrollTo(target === 'top' ? 0 : target);
    } else if (target === 'top') {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    } else {
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var hash = link.getAttribute('href');
    if (hash === '#' || hash === '#main') return;
    var target = hash === '#top' ? 'top' : document.getElementById(hash.slice(1));
    if (!target) return;
    e.preventDefault();
    scrollToTarget(target);
    if (history.replaceState) history.replaceState(null, '', hash);
  });

  /* =========================================================
     Header: solid on scroll, hide on scroll down, show on up
     ========================================================= */
  var menuOpen = false;
  var dropdownOpen = false;
  var lastY = window.scrollY;

  function onScroll(y) {
    header.classList.toggle('is-scrolled', y > 40 || menuOpen);
    if (!menuOpen && !dropdownOpen) {
      if (y > lastY + 6 && y > 480) header.classList.add('is-hidden');
      else if (y < lastY - 6 || y <= 480) header.classList.remove('is-hidden');
    }
    lastY = y;
  }
  onScroll(window.scrollY);
  if (lenis) lenis.on('scroll', function (e) { onScroll(e.scroll); });
  else window.addEventListener('scroll', function () { onScroll(window.scrollY); }, { passive: true });

  header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });

  /* Active nav link for the section in view */
  if ('IntersectionObserver' in window) {
    var navLinks = $$('.site-nav .nav-link[href^="#"]');
    var linkFor = {};
    navLinks.forEach(function (a) { linkFor[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var a = linkFor[entry.target.id];
        if (a) a.classList.toggle('is-active', entry.isIntersecting);
      });
    }, { rootMargin: '-45% 0px -54% 0px' });
    Object.keys(linkFor).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) spy.observe(sec);
    });
  }

  /* =========================================================
     Mobile menu
     ========================================================= */
  var navToggle = $('#nav-toggle');
  var mobileNav = $('#mobile-nav');
  var mobileCta = $('#mobile-cta-bar');

  function setMenu(open) {
    menuOpen = open;
    mobileNav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', open);
    header.classList.toggle('menu-open', open);
    header.classList.remove('is-hidden');
    header.classList.toggle('is-scrolled', open || window.scrollY > 40);
    if (mobileCta) mobileCta.classList.toggle('is-hidden', open);
    if (lenis) { if (open) lenis.stop(); else lenis.start(); }
    else document.body.style.overflow = open ? 'hidden' : '';
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () { setMenu(!menuOpen); });
    $$('a', mobileNav).forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
  }

  /* =========================================================
     Services dropdown
     ========================================================= */
  var dropdownBtn = $('#services-dropdown-btn');
  var dropdown = dropdownBtn ? dropdownBtn.closest('.nav-dropdown') : null;

  function setDropdown(open) {
    dropdownOpen = open;
    dropdown.classList.toggle('is-open', open);
    dropdownBtn.setAttribute('aria-expanded', open);
  }

  if (dropdownBtn && dropdown) {
    dropdownBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setDropdown(!dropdownOpen);
    });
    document.addEventListener('click', function (e) {
      if (dropdownOpen && !dropdown.contains(e.target)) setDropdown(false);
    });
    $$('a', dropdown).forEach(function (link) {
      link.addEventListener('click', function () { setDropdown(false); });
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (menuOpen) { setMenu(false); navToggle.focus(); }
    if (dropdownOpen) { setDropdown(false); dropdownBtn.focus(); }
  });

  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  function shake(el) {
    if (!el || reduceMotion) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  }

  /* =========================================================
     Hero quote form
     No backend exists for this static site, so "submitting" compiles the
     entered info into a message and opens the visitor's texting app with
     it pre-filled -- consistent with every other contact path on the site.
     ========================================================= */
  var heroForm = $('#hero-quote-form');
  if (heroForm) {
    var hqNote = $('#hq-note');
    var hqNoteDefault = hqNote.textContent;

    $$('input, textarea', heroForm).forEach(function (input) {
      input.addEventListener('input', function () {
        var field = input.closest('.field');
        if (field) field.classList.remove('is-invalid');
      });
    });

    heroForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var nameEl = $('#hq-name');
      var phoneEl = $('#hq-phone');
      var name = nameEl.value.trim();
      var phone = phoneEl.value.trim();
      var email = $('#hq-email').value.trim();
      var service = $('#hq-service').value;
      var message = $('#hq-message').value.trim();

      nameEl.closest('.field').classList.toggle('is-invalid', !name);
      phoneEl.closest('.field').classList.toggle('is-invalid', !phone);

      if (!name || !phone) {
        hqNote.textContent = 'Please enter your name and phone number.';
        hqNote.classList.add('is-error');
        shake($('#quote'));
        (!name ? nameEl : phoneEl).focus();
        return;
      }
      hqNote.textContent = hqNoteDefault;
      hqNote.classList.remove('is-error');

      var lines = [
        'Quote request from ' + name + ' (' + phone + ')',
        'Service needed: ' + service + ' Window Cleaning'
      ];
      if (email) lines.push('Email: ' + email);
      if (message) lines.push('Notes: ' + message);

      window.location.href = 'sms:' + PHONE + '?body=' + encodeURIComponent(lines.join('\n'));
    });
  }

  /* =========================================================
     Instant Estimate calculator
     ========================================================= */
  var segType = $('#seg-type');
  var segDiscount = $('#seg-discount');
  var estWindows = $('#est-windows');
  var estStories = $('#est-stories');
  var windowsOut = $('#windows-out');
  var storiesOut = $('#stories-out');
  var priceLowEl = $('#price-low');
  var priceHighEl = $('#price-high');
  var resultEl = $('#estimate-result');
  var quickForm = $('#quick-quote-form');

  if (segType && estWindows && estStories && quickForm) {
    // Ballpark rates only -- Tucker's has not published pricing.
    // Figures reflect typical published industry ranges for
    // professional window cleaning (in/out, frames & tracks included).
    var STORY_MULTIPLIER = { 1: 1, 2: 1.25, 3: 1.45, 4: 1.6 };
    var RATE_PER_WINDOW = { Residential: 8, Commercial: 5 };
    var MINIMUM_CHARGE = { Residential: 125, Commercial: 150 };
    var DISCOUNT_FACTOR = 0.9;

    var propertyType = 'Residential';
    var discountValue = '';

    function selectIn(group, btn) {
      $$('.seg', group).forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on);
      });
    }

    $$('.seg', segType).forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        selectIn(segType, btn);
        segType.setAttribute('data-active', i);
        propertyType = btn.getAttribute('data-type');
        updateEstimate();
      });
    });
    $$('.seg', segDiscount).forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectIn(segDiscount, btn);
        discountValue = btn.getAttribute('data-discount');
        updateEstimate();
      });
    });

    function roundTo5(n) { return Math.round(n / 5) * 5; }

    function storiesLabel(n) {
      if (n >= 4) return '4+ stories';
      return n + (n === 1 ? ' story' : ' stories');
    }

    function calculateEstimate() {
      var count = parseInt(estWindows.value, 10);
      var stories = parseInt(estStories.value, 10);
      var storyMult = STORY_MULTIPLIER[stories] || 1;
      var rate = RATE_PER_WINDOW[propertyType];
      var base = count * rate * storyMult;

      var low = base * 0.85;
      var high = base * 1.15;

      if (discountValue) {
        low *= DISCOUNT_FACTOR;
        high *= DISCOUNT_FACTOR;
      }

      var minimum = MINIMUM_CHARGE[propertyType] * (discountValue ? DISCOUNT_FACTOR : 1);
      low = Math.max(low, minimum);
      high = Math.max(high, low + 30);

      return { low: roundTo5(low), high: roundTo5(high) };
    }

    function setFill(input) {
      var min = parseFloat(input.min), max = parseFloat(input.max);
      input.style.setProperty('--fill', ((input.value - min) / (max - min)) * 100 + '%');
    }

    var lastEstimate = { low: 0, high: 0 };
    var shown = { low: 0, high: 0 };
    var estimateReady = false;

    function renderPrice() {
      priceLowEl.textContent = '$' + Math.round(shown.low);
      priceHighEl.textContent = '$' + Math.round(shown.high);
    }

    function updateEstimate() {
      windowsOut.textContent = estWindows.value;
      storiesOut.textContent = storiesLabel(parseInt(estStories.value, 10));
      setFill(estWindows);
      setFill(estStories);

      var next = calculateEstimate();
      var changed = next.low !== lastEstimate.low || next.high !== lastEstimate.high;
      lastEstimate = next;

      if (MOTION && estimateReady) {
        gsap.to(shown, { low: next.low, high: next.high, duration: 0.7, ease: 'power3.out', overwrite: true, onUpdate: renderPrice });
        if (changed && resultEl) {
          resultEl.classList.remove('is-bump');
          void resultEl.offsetWidth;
          resultEl.classList.add('is-bump');
        }
      } else {
        shown.low = next.low;
        shown.high = next.high;
        renderPrice();
      }
    }

    estWindows.addEventListener('input', updateEstimate);
    estStories.addEventListener('input', updateEstimate);
    updateEstimate();
    estimateReady = true;

    var qqName = $('#qq-name');
    var qqPhone = $('#qq-phone');
    [qqName, qqPhone].forEach(function (el) {
      el.addEventListener('input', function () { el.classList.remove('is-invalid'); });
    });

    quickForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = qqName.value.trim();
      var phone = qqPhone.value.trim();
      qqName.classList.toggle('is-invalid', !name);
      qqPhone.classList.toggle('is-invalid', !phone);
      if (!name || !phone) {
        shake(quickForm);
        (!name ? qqName : qqPhone).focus();
        return;
      }

      var lines = [
        'Quote request from ' + name + ' (' + phone + ')',
        'Property: ' + propertyType,
        'Stories: ' + storiesLabel(parseInt(estStories.value, 10)),
        'Approx. panes: ' + estWindows.value,
        'Ballpark estimate: $' + lastEstimate.low + '–$' + lastEstimate.high + ' (industry-standard estimate, to be confirmed)'
      ];
      if (discountValue) lines.push('Discount: ' + discountValue);

      window.location.href = 'sms:' + PHONE + '?body=' + encodeURIComponent(lines.join('\n'));
    });
  }

  /* =========================================================
     Photo lightbox (full job gallery)
     ========================================================= */
  var photos = [
    { src: 'assets/images/hero-action.jpg', caption: 'Extension-ladder cleaning — second-story window' },
    { src: 'assets/images/action-squeegee.jpg', caption: 'Pole squeegee, streak-free finish' },
    { src: 'assets/images/detail-frame.jpg', caption: 'Every inch, by hand — frames and tracks included' },
    { src: 'assets/images/residential-brick.jpg', caption: 'Residential · Athens, AL' },
    { src: 'assets/images/residential-stone-wide.jpg', caption: 'Residential · North Alabama' },
    { src: 'assets/images/residential-stone-close.jpg', caption: 'Residential · North Alabama' },
    { src: 'assets/images/commercial-handels.jpg', caption: 'Commercial · Handel’s Ice Cream' },
    { src: 'assets/images/commercial-handels-close.jpg', caption: 'Commercial · Handel’s Ice Cream' },
    { src: 'assets/images/commercial-bluedolphin.jpg', caption: 'Commercial · Blue Dolphin Pools & Spas' },
    { src: 'assets/images/commercial-toyota.jpg', caption: 'Commercial facility · floor-to-ceiling glass' },
    { src: 'assets/images/commercial-toyota-interior.jpg', caption: 'Commercial facility · interior glass' }
  ];

  var lightbox = $('#lightbox');
  var lbImg = $('#lightbox-img');
  var lbCaption = $('#lightbox-caption');
  var lbCounter = $('#lightbox-counter');
  var lbClose = $('#lightbox-close');
  var lbPrev = $('#lightbox-prev');
  var lbNext = $('#lightbox-next');
  var currentIndex = 0;
  var lastFocus = null;
  var swapTimer = null;

  function showPhoto(index) {
    currentIndex = (index + photos.length) % photos.length;
    var photo = photos[currentIndex];
    lbCaption.textContent = photo.caption;
    lbCounter.textContent = (currentIndex + 1) + ' / ' + photos.length;

    var isOpen = lightbox.classList.contains('open');
    clearTimeout(swapTimer);
    if (!isOpen || reduceMotion) {
      lbImg.src = photo.src;
      lbImg.alt = photo.caption;
      lbImg.classList.remove('is-swapping');
      return;
    }
    lbImg.classList.add('is-swapping');
    swapTimer = setTimeout(function () {
      lbImg.src = photo.src;
      lbImg.alt = photo.caption;
      var reveal = function () { lbImg.classList.remove('is-swapping'); };
      if (lbImg.complete) requestAnimationFrame(reveal);
      else lbImg.addEventListener('load', reveal, { once: true });
    }, 180);
  }

  function openLightbox(index) {
    lastFocus = document.activeElement;
    showPhoto(index);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    if (lenis) lenis.stop();
    document.body.style.overflow = 'hidden';
    lbClose.focus({ preventScroll: true });
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start();
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  $$('[data-index]').forEach(function (item) {
    var open = function () { openLightbox(parseInt(item.getAttribute('data-index'), 10)); };
    item.addEventListener('click', open);
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });

  ['#gallery-view-all', '#gallery-view-all-end'].forEach(function (sel) {
    var btn = $(sel);
    if (btn) btn.addEventListener('click', function () { openLightbox(0); });
  });

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', function () { showPhoto(currentIndex - 1); });
  if (lbNext) lbNext.addEventListener('click', function () { showPhoto(currentIndex + 1); });

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPhoto(currentIndex - 1);
    if (e.key === 'ArrowRight') showPhoto(currentIndex + 1);
    if (e.key === 'Tab') {
      var focusables = [lbClose, lbPrev, lbNext];
      var i = focusables.indexOf(document.activeElement);
      e.preventDefault();
      var next = e.shiftKey ? (i <= 0 ? focusables.length - 1 : i - 1) : (i + 1) % focusables.length;
      focusables[next].focus();
    }
  });

  /* Spotlight that follows the pointer on review cards */
  $$('.review-card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  if (!MOTION) return;

  /* =========================================================
     Everything below is motion-only (GSAP + ScrollTrigger)
     ========================================================= */

  function splitWords(el) {
    var inners = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement('span');
            w.className = 'w';
            var wi = document.createElement('span');
            wi.className = 'wi';
            wi.textContent = part;
            w.appendChild(wi);
            frag.appendChild(w);
            inners.push(wi);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    })(el);
    return inners;
  }

  var EASE = 'expo.out';

  /* ---------- Hero intro: a squeegee pass clears the frosted glass ---------- */
  var heroTitle = $('.hero-title');
  var heroWords = splitWords(heroTitle);
  gsap.set(heroTitle, { autoAlpha: 1 });

  var intro = gsap.timeline({ defaults: { ease: EASE } });
  intro
    .fromTo('.hero-img', { scale: 1.28 }, { scale: 1.08, duration: 2.4 }, 0)
    .set('.hero-blade', { opacity: 1 }, 0.1)
    .fromTo('.hero-frost', { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 100%)', duration: 1.5, ease: 'power2.inOut' }, 0.1)
    .fromTo('.hero-blade', { x: 0 }, { x: function () { return window.innerWidth; }, duration: 1.5, ease: 'power2.inOut' }, 0.1)
    .to('.hero-blade', { opacity: 0, duration: 0.25, ease: 'none' }, 1.35)
    .fromTo('.header-inner', { y: -30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.2, clearProps: 'transform,opacity,visibility' }, 0.3)
    .fromTo(heroWords, { yPercent: 115, rotate: 3 }, { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.07, transformOrigin: '0% 100%' }, 0.45)
    .add(function () { heroTitle.classList.add('is-in'); }, 0.9)
    .fromTo('.hero-anim', { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.1, clearProps: 'transform' }, 0.75)
    .fromTo('.quote-card', { autoAlpha: 0, y: 70, rotate: 1.5 }, { autoAlpha: 1, y: 0, rotate: 0, duration: 1.4, clearProps: 'transform' }, 0.7)
    .fromTo('.scroll-cue', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 1.4)
    .add(function () {
      $$('.hero-frost, .hero-blade').forEach(function (el) { el.remove(); });
    });

  /* Hero parallax as it scrolls away */
  gsap.to('.hero-img', {
    yPercent: 14, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  var mm = gsap.matchMedia();

  mm.add('(min-width: 981px)', function () {
    gsap.to('.hero-copy', {
      y: -80, opacity: 0.25, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  });

  /* ---------- Scroll progress ---------- */
  gsap.to('.scroll-progress span', {
    scaleX: 1, ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
  });

  /* ---------- Marquee: speeds up with scroll velocity ---------- */
  var marquee = $('.marquee');
  if (marquee) {
    marquee.classList.add('is-js');
    var loop = gsap.to('.marquee-track', { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) {
        var boost = 1 + Math.min(Math.abs(self.getVelocity()) / 250, 6);
        gsap.to(loop, {
          timeScale: boost, duration: 0.25, overwrite: true,
          onComplete: function () { gsap.to(loop, { timeScale: 1, duration: 1.2, ease: 'power2.out' }); }
        });
      }
    });
    gsap.fromTo(marquee, { rotate: -3.5 }, {
      rotate: -0.5, ease: 'none',
      scrollTrigger: { trigger: marquee, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  /* ---------- Horizontal gallery (desktop): pinned, scroll-driven ---------- */
  var work = $('#work');
  var track = $('.work-track');
  mm.add('(min-width: 981px)', function () {
    work.classList.add('work--horizontal');
    var distance = function () { return Math.max(0, track.scrollWidth - document.documentElement.clientWidth); };

    var slide = gsap.to(track, {
      x: function () { return -distance(); },
      ease: 'none',
      scrollTrigger: {
        trigger: work,
        pin: '.work-pin',
        start: 'top top',
        end: function () { return '+=' + distance(); },
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        refreshPriority: 1
      }
    });

    gsap.to('.work-progress-bar', {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: work, start: 'top top', end: function () { return '+=' + distance(); }, scrub: true, invalidateOnRefresh: true }
    });

    $$('.work-card-img', track).forEach(function (wrap) {
      gsap.fromTo(wrap, { xPercent: -5 }, {
        xPercent: 5, ease: 'none',
        scrollTrigger: { trigger: wrap.parentNode, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true }
      });
    });

    /* Keep keyboard focus visible: scroll the page so a focused card is on screen */
    var onFocus = function (e) {
      var card = e.target.closest('.work-card');
      if (!card) return;
      var st = slide.scrollTrigger;
      var d = distance();
      if (!d) return;
      var progress = Math.min(1, Math.max(0, (card.offsetLeft - window.innerWidth * 0.3) / d));
      var y = st.start + progress * (st.end - st.start);
      if (lenis) lenis.scrollTo(y, { immediate: true }); else window.scrollTo(0, y);
    };
    track.addEventListener('focusin', onFocus);

    return function () {
      track.removeEventListener('focusin', onFocus);
      work.classList.remove('work--horizontal');
    };
  });

  /* ---------- Split-word headings ---------- */
  $$('[data-split]').forEach(function (el) {
    if (el === heroTitle) return;
    var words = splitWords(el);
    gsap.set(el, { autoAlpha: 1 });
    gsap.fromTo(words, { yPercent: 115, rotate: 3 }, {
      yPercent: 0, rotate: 0, duration: 1.2, ease: EASE, stagger: 0.06, transformOrigin: '0% 100%',
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
      onStart: function () { el.classList.add('is-in'); }
    });
  });

  /* ---------- Generic reveals ---------- */
  $$('[data-reveal]').forEach(function (el) {
    gsap.fromTo(el, { autoAlpha: 0, y: 40 }, {
      autoAlpha: 1, y: 0, duration: 1.2, ease: EASE, clearProps: 'transform',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });

  $$('[data-stagger]').forEach(function (group) {
    gsap.fromTo(group.children, { autoAlpha: 0, y: 36 }, {
      autoAlpha: 1, y: 0, duration: 1.1, ease: EASE, stagger: 0.08, clearProps: 'transform',
      scrollTrigger: { trigger: group, start: 'top 88%', once: true }
    });
  });

  /* ---------- About statement: words light up as you read ---------- */
  $$('[data-scrub-text]').forEach(function (el) {
    var words = splitWords(el);
    $$('.w', el).forEach(function (w) { w.style.overflow = 'visible'; });
    gsap.fromTo(words, { opacity: 0.14 }, {
      opacity: 1, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 48%', scrub: true }
    });
  });

  /* ---------- Image reveals + parallax ---------- */
  var CLIP_FROM = 'inset(100% 0% 0% 0% round 28px)';
  var CLIP_TO = 'inset(0% 0% 0% 0% round 28px)';
  $$('[data-img-reveal]').forEach(function (el) {
    var media = el.querySelector('img, iframe');
    var tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
    tl.fromTo(el, { clipPath: CLIP_FROM }, { clipPath: CLIP_TO, duration: 1.5, ease: 'expo.inOut' });
    if (media) tl.fromTo(media, { scale: 1.35 }, { scale: 1, duration: 1.9, ease: EASE }, 0);
  });

  $$('[data-parallax]').forEach(function (img) {
    gsap.fromTo(img, { yPercent: -14 }, {
      yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  $$('.service-num').forEach(function (num) {
    gsap.fromTo(num, { yPercent: 40 }, {
      yPercent: -20, ease: 'none',
      scrollTrigger: { trigger: num.closest('.service'), start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* ---------- Count-up stats ---------- */
  $$('[data-count]').forEach(function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var counter = { v: 0 };
    el.textContent = '0';
    gsap.to(counter, {
      v: target, duration: 1.8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: function () { el.textContent = Math.round(counter.v); }
    });
  });

  /* ---------- Process: line draws, steps light up ---------- */
  var steps = $('.steps');
  if (steps) {
    mm.add({ wide: '(min-width: 901px)', narrow: '(max-width: 900px)' }, function (ctx) {
      var wide = ctx.conditions.wide;
      gsap.fromTo('.steps-line-fill', wide ? { scaleX: 0, scaleY: 1 } : { scaleY: 0, scaleX: 1 }, {
        scaleX: 1, scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: steps, start: wide ? 'top 70%' : 'top 65%', end: wide ? 'top 25%' : 'bottom 55%', scrub: 0.6 }
      });
      $$('.step', steps).forEach(function (step, i) {
        ScrollTrigger.create({
          trigger: wide ? steps : step,
          start: wide ? 'top ' + (72 - i * 22) + '%' : 'top 68%',
          onEnter: function () { step.classList.add('is-active'); },
          onLeaveBack: function () { step.classList.remove('is-active'); }
        });
      });
    });
    gsap.fromTo($$('.step', steps), { autoAlpha: 0, y: 40 }, {
      autoAlpha: 1, y: 0, duration: 1.1, ease: EASE, stagger: 0.12, clearProps: 'transform',
      scrollTrigger: { trigger: steps, start: 'top 85%', once: true }
    });
  }

  /* ---------- Footer wordmark rises into place ---------- */
  gsap.fromTo('.footer-wordmark span', { yPercent: 60 }, {
    yPercent: 0, ease: 'none',
    scrollTrigger: { trigger: '.footer-wordmark', start: 'top bottom', end: 'bottom bottom', scrub: true }
  });

  /* =========================================================
     Pointer-only flourishes: magnetic buttons + custom cursor
     ========================================================= */
  if (finePointer) {
    $$('[data-magnetic]').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
      });
      el.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });

    var cursor = $('.cursor');
    var follow = $('.cursor-follow');
    var dot = $('.cursor-dot');
    var label = $('.cursor-label');
    root.classList.add('has-cursor');
    cursor.classList.add('is-hidden');

    var fx = gsap.quickTo(follow, 'x', { duration: 0.5, ease: 'power3.out' });
    var fy = gsap.quickTo(follow, 'y', { duration: 0.5, ease: 'power3.out' });
    var dx = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'none' });
    var dy = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'none' });

    window.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      fx(e.clientX); fy(e.clientY); dx(e.clientX); dy(e.clientY);
    }, { passive: true });

    var DARK = '.hero, .work, .estimate-copy, .estimate, .site-footer, .site-header, .mobile-nav, .lightbox';
    document.addEventListener('pointerover', function (e) {
      var t = e.target;
      if (!(t instanceof Element)) return;
      var labelled = t.closest('[data-cursor]');
      var textInput = t.closest('input:not([type="range"]):not([type="checkbox"]), textarea, select, iframe');
      var interactive = t.closest('a, button, [role="button"], input[type="range"], input[type="checkbox"], label.consent');
      var onCard = t.closest('.estimate-card, .quote-card, .nav-dropdown-menu');

      cursor.classList.toggle('is-hidden', !!textInput);
      cursor.classList.toggle('is-label', !!labelled && !textInput);
      cursor.classList.toggle('is-hover', !labelled && !!interactive && !textInput);
      cursor.classList.toggle('on-dark', !!t.closest(DARK) && !onCard);
      label.textContent = labelled ? labelled.getAttribute('data-cursor') : '';
    });
    document.addEventListener('pointerleave', function () { cursor.classList.add('is-hidden'); });
    document.documentElement.addEventListener('mouseleave', function () { cursor.classList.add('is-hidden'); });
  }

  /* Recalculate trigger positions once fonts and images settle */
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
