document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', false);
      });
    });
  }

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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

  /* ---------- Instant Quote request builder ---------- */
  var quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    var nameEl = document.getElementById('q-name');
    var phoneEl = document.getElementById('q-phone');
    var cityEl = document.getElementById('q-city');
    var storiesEl = document.getElementById('q-stories');
    var windowsEl = document.getElementById('q-windows');
    var discountEl = document.getElementById('q-discount');
    var notesEl = document.getElementById('q-notes');
    var previewEl = document.getElementById('quote-preview-text');
    var estimateEl = document.getElementById('quote-estimate-value');
    var textBtn = document.getElementById('quote-text');
    var messengerBtn = document.getElementById('quote-messenger');
    var PHONE = '+12564761402';
    var PAGE_ID = '61576311082795';

    // Ballpark rates only -- Tucker's has not published pricing.
    // Figures reflect typical published industry ranges for
    // professional window cleaning (in/out, frames & tracks included).
    var WINDOW_COUNT = { '1–10': 6, '11–20': 15, '21–30': 25, '31–40': 35, '41+': 45 };
    var STORY_MULTIPLIER = { '1 story': 1, '2 stories': 1.25, '3+ stories': 1.5 };
    var RATE_PER_WINDOW = { Residential: 8, Commercial: 5 };
    var MINIMUM_CHARGE = { Residential: 125, Commercial: 150 };
    var DISCOUNT_FACTOR = 0.9;

    function propertyType() {
      var checked = quoteForm.querySelector('input[name="propertyType"]:checked');
      return checked ? checked.value : 'Residential';
    }

    function roundTo5(n) {
      return Math.round(n / 5) * 5;
    }

    function calculateEstimate() {
      var type = propertyType();
      var count = WINDOW_COUNT[windowsEl.value] || 6;
      var storyMult = STORY_MULTIPLIER[storiesEl.value] || 1;
      var rate = RATE_PER_WINDOW[type];
      var base = count * rate * storyMult;

      var low = base * 0.85;
      var high = base * 1.15;

      if (discountEl.value) {
        low *= DISCOUNT_FACTOR;
        high *= DISCOUNT_FACTOR;
      }

      var minimum = MINIMUM_CHARGE[type] * (discountEl.value ? DISCOUNT_FACTOR : 1);
      low = Math.max(low, minimum);
      high = Math.max(high, low + 30);

      return { low: roundTo5(low), high: roundTo5(high) };
    }

    function buildMessage(estimate) {
      var name = nameEl.value.trim() || '[your name]';
      var phone = phoneEl.value.trim() || '[your phone]';
      var lines = [
        'Quote request from ' + name + ' (' + phone + ')',
        'Property: ' + propertyType() + ' in ' + cityEl.value,
        'Stories: ' + storiesEl.value,
        'Approx. windows: ' + windowsEl.value,
        'Ballpark estimate: $' + estimate.low + '–$' + estimate.high + ' (industry-standard estimate, to be confirmed)'
      ];
      if (discountEl.value) lines.push('Discount: ' + discountEl.value);
      if (notesEl.value.trim()) lines.push('Notes: ' + notesEl.value.trim());
      return lines.join('\n');
    }

    function updatePreview() {
      var estimate = calculateEstimate();
      estimateEl.textContent = '$' + estimate.low + ' – $' + estimate.high;

      var message = buildMessage(estimate);
      previewEl.textContent = message;

      var ready = nameEl.value.trim().length > 0 && phoneEl.value.trim().length > 0;
      textBtn.setAttribute('aria-disabled', ready ? 'false' : 'true');
      messengerBtn.setAttribute('aria-disabled', ready ? 'false' : 'true');

      textBtn.href = 'sms:' + PHONE + '?body=' + encodeURIComponent(message);
      messengerBtn.href = 'https://m.me/' + PAGE_ID + '?text=' + encodeURIComponent(message);
    }

    quoteForm.addEventListener('input', updatePreview);
    quoteForm.addEventListener('change', updatePreview);
    updatePreview();
  }
});
