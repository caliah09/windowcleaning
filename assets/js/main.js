(function () {
  'use strict';

  var PHONE = '+12564761402';

  var root = document.documentElement;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  var MOTION = hasGSAP && !reduceMotion;

  if (MOTION) {
    gsap.registerPlugin(ScrollTrigger);
    root.classList.add('motion-ready');
  } else {
    root.classList.remove('motion');
  }

  /* =========================================================
     Anchor links (native scrolling)
     ========================================================= */
  var header = $('#site-header');

  function scrollToTarget(target) {
    if (target === 'top') {
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
  window.addEventListener('scroll', function () { onScroll(window.scrollY); }, { passive: true });

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
    document.body.style.overflow = open ? 'hidden' : '';
  }

  /* On phones the floating Call / Quote bar waits until the hero form scrolls away */
  var heroQuote = $('#quote');
  if (mobileCta && heroQuote && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      mobileCta.classList.toggle('is-parked', entries[0].isIntersecting);
    }).observe(heroQuote);
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
     Lead delivery (Formspree)
     Both forms post to Formspree, which emails each request to Tucker's.
     On failure the visitor gets a call/text link so no lead is lost.
     ========================================================= */
  var FORM_ENDPOINT = 'https://formspree.io/f/xoeeagkk';
  var FALLBACK_HTML = 'Couldn&rsquo;t send. Please call or text <a href="tel:' + PHONE + '">(256) 476-1402</a>.';

  function sendLead(form, fields, ui) {
    var honeypot = form.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value) return; // bot filled the hidden field
    var data = new FormData();
    Object.keys(fields).forEach(function (k) { data.append(k, fields[k]); });

    ui.button.setAttribute('aria-busy', 'true');
    ui.note.classList.remove('is-error', 'is-success');
    ui.note.textContent = 'Sending…';

    fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('Formspree ' + res.status);
        form.reset();
        ui.note.textContent = ui.success;
        ui.note.classList.add('is-success');
        if (ui.onReset) ui.onReset();
      })
      .catch(function () {
        ui.note.innerHTML = FALLBACK_HTML;
        ui.note.classList.add('is-error');
      })
      .then(function () { ui.button.removeAttribute('aria-busy'); });
  }

  /* =========================================================
     Hero quote form
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
      var service = $('#hq-service').value;

      nameEl.closest('.field').classList.toggle('is-invalid', !name);
      phoneEl.closest('.field').classList.toggle('is-invalid', !phone);

      if (!name || !phone) {
        hqNote.textContent = 'Please enter your name and phone number.';
        hqNote.classList.remove('is-success');
        hqNote.classList.add('is-error');
        shake($('#hero-quote-form'));
        (!name ? nameEl : phoneEl).focus();
        return;
      }
      hqNote.textContent = hqNoteDefault;
      hqNote.classList.remove('is-error');

      sendLead(heroForm, {
        _subject: 'Quote request: ' + name + ' (' + service + ')',
        form: 'Hero quote form',
        name: name,
        phone: phone,
        service: service + ' Window Cleaning'
      }, {
        button: $('#hq-submit'),
        note: hqNote,
        success: 'Thanks, ' + name + '! Tucker\'s got your request and will reach out soon.'
      });
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
    // Ballpark rates only; Tucker's has not published pricing.
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
    var qqNote = $('#qq-note');
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

      var fields = {
        _subject: 'Estimate request: ' + name + ' (' + propertyType + ')',
        form: 'Instant estimate',
        name: name,
        phone: phone,
        property: propertyType,
        stories: storiesLabel(parseInt(estStories.value, 10)),
        panes: estWindows.value,
        estimate: '$' + lastEstimate.low + ' to $' + lastEstimate.high + ' (industry-standard estimate, to be confirmed)'
      };
      if (discountValue) fields.discount = discountValue;

      sendLead(quickForm, fields, {
        button: $('#qq-submit'),
        note: qqNote,
        success: 'Thanks, ' + name + '! Your estimate is on its way to Tucker\'s. Expect a call or text to confirm.'
      });
    });
  }

  /* =========================================================
     Photo lightbox (full job gallery)
     ========================================================= */
  var photos = [
    { src: 'assets/images/hero-action.jpg', caption: 'Extension-ladder cleaning, second-story window' },
    { src: 'assets/images/action-squeegee.jpg', caption: 'Pole squeegee, streak-free finish' },
    { src: 'assets/images/detail-frame.jpg', caption: 'Every inch, by hand. Frames and tracks included' },
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
    lightbox.removeAttribute('inert');
    document.body.style.overflow = 'hidden';
    lbClose.focus({ preventScroll: true });
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('inert', '');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  $$('[data-index]').forEach(function (item) {
    var open = function () { openLightbox(parseInt(item.getAttribute('data-index'), 10)); };
    item.addEventListener('click', open);
  });

  ['#gallery-view-all'].forEach(function (sel) {
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

  /* Service area: choosing a city moves the map there */
  var mapFrame = $('#area-map');
  var mapBox = mapFrame ? mapFrame.closest('.map-embed') : null;
  var mapPlace = $('#map-place');
  var mapOpen = $('#map-open');
  var cityButtons = $$('.area-city');
  if (mapFrame) mapFrame.addEventListener('load', function () { mapBox.classList.remove('is-loading'); });
  cityButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.classList.contains('is-active')) return;
      var place = btn.getAttribute('data-place');
      var q = encodeURIComponent(place);
      cityButtons.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on);
      });
      mapBox.classList.add('is-loading');
      mapFrame.src = 'https://www.google.com/maps?q=' + q + '&z=' + (/County/.test(place) ? 9 : 12) + '&output=embed';
      mapFrame.title = 'Map showing ' + place;
      mapPlace.textContent = place;
      mapOpen.href = 'https://www.google.com/maps/search/?api=1&query=' + q;
    });
  });

  /* Hero video: pause control; visitors who prefer less motion get a still frame */
  var heroVideo = $('.hero-video');
  var videoToggle = $('#video-toggle');
  if (heroVideo && videoToggle) {
    var setVideoPaused = function (paused) {
      if (paused) heroVideo.pause();
      else { var p = heroVideo.play(); if (p && p.catch) p.catch(function () {}); }
      videoToggle.setAttribute('aria-pressed', paused);
      videoToggle.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
    };
    if (reduceMotion) { heroVideo.removeAttribute('autoplay'); setVideoPaused(true); }
    videoToggle.addEventListener('click', function () { setVideoPaused(videoToggle.getAttribute('aria-pressed') !== 'true'); });
  }

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

  var EASE = 'expo.out';

  /* ---------- Hero intro: a squeegee pass clears the frosted glass ---------- */
  var heroTitle = $('.hero-title');

  var intro = gsap.timeline({ defaults: { ease: EASE } });
  intro
    .add(function () { heroTitle.classList.add('is-in'); }, 0.5)
    .fromTo('.hero-video', { scale: 1.25 }, { scale: 1.04, duration: 2.4 }, 0)
    .set('.hero-blade', { opacity: 1 }, 0.4)
    .fromTo('.hero-frost', { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 100%)', duration: 1.3, ease: 'power2.inOut' }, 0.4)
    .fromTo('.hero-blade', { left: '0%' }, { left: '100%', duration: 1.3, ease: 'power2.inOut' }, 0.4)
    .to('.hero-blade', { opacity: 0, duration: 0.2, ease: 'none' }, 1.55)
    .fromTo('.hero-chip', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.9, clearProps: 'transform' }, 1.3)
    .add(function () {
      $$('.hero-frost, .hero-blade').forEach(function (el) { el.remove(); });
    });

  var mm = gsap.matchMedia();

  /* ---------- Headings fade up once; the highlight underline then draws in ---------- */
  $$('[data-split]').forEach(function (el) {
    gsap.fromTo(el, { autoAlpha: 0, y: 30 }, {
      autoAlpha: 1, y: 0, duration: 1, ease: EASE, clearProps: 'transform',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
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

  /* ---------- Image reveals (once) ---------- */
  var CLIP_FROM = 'inset(100% 0% 0% 0% round 28px)';
  var CLIP_TO = 'inset(0% 0% 0% 0% round 28px)';
  $$('[data-img-reveal]').forEach(function (el) {
    var media = el.querySelector('img, iframe');
    var tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
    tl.fromTo(el, { clipPath: CLIP_FROM }, { clipPath: CLIP_TO, duration: 1.5, ease: 'expo.inOut' });
    if (media) tl.fromTo(media, { scale: 1.35 }, { scale: 1, duration: 1.9, ease: EASE }, 0);
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

  /* Recalculate trigger positions once fonts and images settle */
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
