document.addEventListener('DOMContentLoaded', function () {

  var PHONE = '+12564761402';
  var PAGE_ID = '61576311082795';

  /* ---------- Sticky header on scroll ---------- */
  var header = document.getElementById('site-header');
  function updateHeaderScroll() {
    if (window.scrollY > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  updateHeaderScroll();
  window.addEventListener('scroll', updateHeaderScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById('nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
      header.classList.toggle('is-scrolled', isOpen || window.scrollY > 40);
    });
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', false);
      });
    });
  }

  /* ---------- Services dropdown ---------- */
  var dropdownBtn = document.getElementById('services-dropdown-btn');
  var dropdown = dropdownBtn ? dropdownBtn.closest('.nav-dropdown') : null;
  if (dropdownBtn && dropdown) {
    dropdownBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = dropdown.classList.toggle('is-open');
      dropdownBtn.setAttribute('aria-expanded', isOpen);
    });
    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('is-open');
        dropdownBtn.setAttribute('aria-expanded', false);
      }
    });
    dropdown.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        dropdown.classList.remove('is-open');
        dropdownBtn.setAttribute('aria-expanded', false);
      });
    });
  }

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Hero quote form ---------- */
  /* No backend exists for this static site, so "submitting" compiles the
     entered info into a message and opens the visitor's texting app with
     it pre-filled -- consistent with every other contact path on the site. */
  var heroForm = document.getElementById('hero-quote-form');
  if (heroForm) {
    heroForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('hq-name').value.trim();
      var phone = document.getElementById('hq-phone').value.trim();
      var email = document.getElementById('hq-email').value.trim();
      var service = document.getElementById('hq-service').value;
      var message = document.getElementById('hq-message').value.trim();

      if (!name || !phone) {
        document.getElementById('hq-note').textContent = 'Please enter your name and phone number.';
        return;
      }

      var lines = [
        'Quote request from ' + name + ' (' + phone + ')',
        'Service needed: ' + service + ' Window Cleaning'
      ];
      if (email) lines.push('Email: ' + email);
      if (message) lines.push('Notes: ' + message);
      var text = lines.join('\n');

      window.location.href = 'sms:' + PHONE + '?body=' + encodeURIComponent(text);
    });
  }

  /* ---------- Instant Estimate calculator (CTA band) ---------- */
  var segType = document.getElementById('seg-type');
  var segDiscount = document.getElementById('seg-discount');
  var estWindows = document.getElementById('est-windows');
  var estStories = document.getElementById('est-stories');
  var windowsOut = document.getElementById('windows-out');
  var storiesOut = document.getElementById('stories-out');
  var priceLowEl = document.getElementById('price-low');
  var priceHighEl = document.getElementById('price-high');
  var quickForm = document.getElementById('quick-quote-form');

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

    segType.querySelectorAll('.seg').forEach(function (btn) {
      btn.addEventListener('click', function () {
        segType.querySelectorAll('.seg').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        propertyType = btn.getAttribute('data-type');
        updateEstimate();
      });
    });
    segDiscount.querySelectorAll('.seg').forEach(function (btn) {
      btn.addEventListener('click', function () {
        segDiscount.querySelectorAll('.seg').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
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

    var lastEstimate = { low: 0, high: 0 };

    function updateEstimate() {
      windowsOut.textContent = estWindows.value;
      storiesOut.textContent = storiesLabel(parseInt(estStories.value, 10));

      lastEstimate = calculateEstimate();
      priceLowEl.textContent = '$' + lastEstimate.low;
      priceHighEl.textContent = '$' + lastEstimate.high;
    }

    estWindows.addEventListener('input', updateEstimate);
    estStories.addEventListener('input', updateEstimate);
    updateEstimate();

    quickForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('qq-name').value.trim();
      var phone = document.getElementById('qq-phone').value.trim();
      if (!name || !phone) return;

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

  /* ---------- Photo lightbox (full job gallery) ---------- */
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

  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lightbox-img');
  var lbCaption = document.getElementById('lightbox-caption');
  var lbCounter = document.getElementById('lightbox-counter');
  var lbClose = document.getElementById('lightbox-close');
  var lbPrev = document.getElementById('lightbox-prev');
  var lbNext = document.getElementById('lightbox-next');
  var currentIndex = 0;

  function showPhoto(index) {
    currentIndex = (index + photos.length) % photos.length;
    var photo = photos[currentIndex];
    lbImg.src = photo.src;
    lbImg.alt = photo.caption;
    lbCaption.textContent = photo.caption;
    lbCounter.textContent = (currentIndex + 1) + ' / ' + photos.length;
  }

  function openLightbox(index) {
    showPhoto(index);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.gallery-item[data-index]').forEach(function (item) {
    var open = function () { openLightbox(parseInt(item.getAttribute('data-index'), 10)); };
    item.addEventListener('click', open);
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });

  var viewAllBtn = document.getElementById('gallery-view-all');
  if (viewAllBtn) viewAllBtn.addEventListener('click', function () { openLightbox(0); });

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
  });
});
