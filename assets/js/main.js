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

  /* ---------- Theme toggle ---------- */
  var themeToggle = document.getElementById('theme-toggle');
  var root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeToggle) themeToggle.setAttribute('aria-pressed', theme === 'dark');
  }

  var storedTheme = localStorage.getItem('theme');
  var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(storedTheme || (systemDark ? 'dark' : 'light'));

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('theme', next);
    });
  }

  /* ---------- Services tabs ---------- */
  var tabRes = document.getElementById('tab-res');
  var tabCom = document.getElementById('tab-com');
  var panelRes = document.getElementById('panel-res');
  var panelCom = document.getElementById('panel-com');

  function activateTab(which) {
    var resActive = which === 'res';
    tabRes.classList.toggle('is-active', resActive);
    tabCom.classList.toggle('is-active', !resActive);
    tabRes.setAttribute('aria-selected', resActive);
    tabCom.setAttribute('aria-selected', !resActive);
    panelRes.hidden = !resActive;
    panelCom.hidden = resActive;
  }
  if (tabRes && tabCom) {
    tabRes.addEventListener('click', function () { activateTab('res'); });
    tabCom.addEventListener('click', function () { activateTab('com'); });
  }

  /* ---------- Testimonial carousel ---------- */
  var testimonials = [
    {
      quote: "My windows have never been so clean! It's almost like they're not even there! I almost feel like I need to smear some fingerprints so my children don't try to run through them!",
      name: 'Stephanie Bratcher',
      role: 'Homeowner',
      initials: 'SB'
    },
    {
      quote: "Tucker's has cleaned our windows at Eggs Up Grill and he does a fantastic job. He also comes to do the job before 6:00am so our guests are not bothered by work going on around them. Wonderful to work with!",
      name: 'Kris McCauley McLellan',
      role: 'Eggs Up Grill',
      initials: 'KM'
    },
    {
      quote: 'We have used Tucker’s Window Cleaning for a few months now, and each visit has left us with sparkling clean windows! I highly recommend them to friends, family, and colleagues!',
      name: 'Lisa Smith',
      role: 'Verified Customer',
      initials: 'LS'
    },
    {
      quote: 'Tuckers Window cleaning is the best in the business. My windows at Handel’s Ice cream are so clean I thought they were removed to clean them. Thanks Tuckers Window for the professionalism and attention to detail on every inch of our windows.',
      name: 'Brian F. Vaughn',
      role: "Handel's Ice Cream",
      initials: 'BV'
    }
  ];

  var testimonialEl = document.getElementById('testimonial');
  if (testimonialEl) {
    var tQuote = document.getElementById('testimonial-quote');
    var tName = document.getElementById('testimonial-name');
    var tRole = document.getElementById('testimonial-role');
    var tAvatar = document.getElementById('testimonial-avatar');
    var tPrev = document.getElementById('testimonial-prev');
    var tNext = document.getElementById('testimonial-next');
    var tIndex = 0;

    function showTestimonial(i) {
      tIndex = (i + testimonials.length) % testimonials.length;
      var t = testimonials[tIndex];
      tQuote.textContent = t.quote;
      tName.textContent = t.name;
      tRole.textContent = t.role;
      tAvatar.textContent = t.initials;
    }
    if (tPrev) tPrev.addEventListener('click', function () { showTestimonial(tIndex - 1); });
    if (tNext) tNext.addEventListener('click', function () { showTestimonial(tIndex + 1); });
  }

  /* ---------- FAQ two-column ---------- */
  var faqGrid = document.getElementById('faq-grid');
  if (faqGrid) {
    var faqQuestions = faqGrid.querySelectorAll('.faq-q');
    var faqAnswerQ = document.getElementById('faq-answer-q');
    var faqAnswerText = document.getElementById('faq-answer-text');

    faqQuestions.forEach(function (btn) {
      btn.addEventListener('click', function () {
        faqQuestions.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var label = btn.childNodes[0].textContent.trim();
        faqAnswerQ.textContent = label;
        faqAnswerText.textContent = btn.getAttribute('data-answer');
      });
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

  /* ---------- Instant Quote calculator ---------- */
  var quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    var nameEl = document.getElementById('q-name');
    var phoneEl = document.getElementById('q-phone');
    var cityEl = document.getElementById('q-city');
    var windowsEl = document.getElementById('q-windows');
    var windowsOut = document.getElementById('windows-out');
    var storiesEl = document.getElementById('q-stories');
    var storiesOut = document.getElementById('stories-out');
    var notesEl = document.getElementById('q-notes');
    var segType = document.getElementById('seg-type');
    var segDiscount = document.getElementById('seg-discount');
    var priceLowEl = document.getElementById('price-low');
    var priceHighEl = document.getElementById('price-high');
    var previewEl = document.getElementById('quote-preview-text');
    var textBtn = document.getElementById('quote-text');
    var messengerBtn = document.getElementById('quote-messenger');
    var PHONE = '+12564761402';
    var PAGE_ID = '61576311082795';

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
        updatePreview();
      });
    });
    segDiscount.querySelectorAll('.seg').forEach(function (btn) {
      btn.addEventListener('click', function () {
        segDiscount.querySelectorAll('.seg').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        discountValue = btn.getAttribute('data-discount');
        updatePreview();
      });
    });

    function roundTo5(n) { return Math.round(n / 5) * 5; }

    function storiesLabel(n) {
      if (n >= 4) return '4+ stories';
      return n + (n === 1 ? ' story' : ' stories');
    }

    function calculateEstimate() {
      var count = parseInt(windowsEl.value, 10);
      var stories = parseInt(storiesEl.value, 10);
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

    function buildMessage(estimate) {
      var name = nameEl.value.trim() || '[your name]';
      var phone = phoneEl.value.trim() || '[your phone]';
      var lines = [
        'Quote request from ' + name + ' (' + phone + ')',
        'Property: ' + propertyType + ' in ' + cityEl.value,
        'Stories: ' + storiesLabel(parseInt(storiesEl.value, 10)),
        'Approx. panes: ' + windowsEl.value,
        'Ballpark estimate: $' + estimate.low + '–$' + estimate.high + ' (industry-standard estimate, to be confirmed)'
      ];
      if (discountValue) lines.push('Discount: ' + discountValue);
      if (notesEl.value.trim()) lines.push('Notes: ' + notesEl.value.trim());
      return lines.join('\n');
    }

    function updatePreview() {
      windowsOut.textContent = windowsEl.value;
      storiesOut.textContent = storiesLabel(parseInt(storiesEl.value, 10));

      var estimate = calculateEstimate();
      priceLowEl.textContent = '$' + estimate.low;
      priceHighEl.textContent = '$' + estimate.high;

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

  /* ---------- Drag-to-compare ---------- */
  var compare = document.getElementById('compare');
  if (compare) {
    var compareBefore = document.getElementById('compare-before');
    var compareHandle = document.getElementById('compare-handle');
    var compareDirtyImg = compare.querySelector('.compare-img-dirty');
    var comparing = false;

    function sizeCompare() {
      compareDirtyImg.style.width = compare.offsetWidth + 'px';
    }

    function setComparePosition(percent) {
      percent = Math.max(2, Math.min(98, percent));
      compareBefore.style.width = percent + '%';
      compareHandle.style.left = percent + '%';
      compareHandle.setAttribute('aria-valuenow', Math.round(percent));
    }

    function percentFromEvent(clientX) {
      var rect = compare.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    compareHandle.addEventListener('pointerdown', function (e) {
      comparing = true;
      compareHandle.setPointerCapture(e.pointerId);
    });
    compareHandle.addEventListener('pointermove', function (e) {
      if (!comparing) return;
      setComparePosition(percentFromEvent(e.clientX));
    });
    compareHandle.addEventListener('pointerup', function () { comparing = false; });
    compareHandle.addEventListener('pointercancel', function () { comparing = false; });
    compareHandle.addEventListener('keydown', function (e) {
      var current = parseFloat(compareHandle.style.left) || 50;
      if (e.key === 'ArrowLeft') { setComparePosition(current - 5); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setComparePosition(current + 5); e.preventDefault(); }
    });

    compare.addEventListener('click', function (e) {
      if (e.target === compareHandle || compareHandle.contains(e.target)) return;
      setComparePosition(percentFromEvent(e.clientX));
    });

    window.addEventListener('resize', sizeCompare);
    sizeCompare();
    setComparePosition(50);
  }

  /* ---------- Hero grime wipe ---------- */
  var stage = document.getElementById('hero-stage');
  var canvas = document.getElementById('grime');
  if (stage && canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var hint = document.getElementById('hero-hint');
    var meterFill = document.getElementById('clean-fill');
    var meterLabel = document.getElementById('clean-label');
    var resetBtn = document.getElementById('reset-grime');
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var dragging = false;
    var lastX = null, lastY = null;
    var lastCheck = 0;

    function resizeCanvas() {
      var w = stage.clientWidth;
      var h = stage.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawGrime(w, h);
      updateMeter(0);
    }

    function drawGrime(w, h) {
      ctx.clearRect(0, 0, w, h);

      // Hazy frosted-glass base coat
      ctx.fillStyle = 'rgba(196,188,170,0.62)';
      ctx.fillRect(0, 0, w, h);

      // Denser dust/grime blotches
      for (var i = 0; i < 160; i++) {
        var x = Math.random() * w;
        var y = Math.random() * h;
        var r = 30 + Math.random() * 110;
        var grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        var alpha = 0.22 + Math.random() * 0.3;
        grad.addColorStop(0, 'rgba(96,82,58,' + alpha + ')');
        grad.addColorStop(1, 'rgba(96,82,58,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Rain streak marks
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = 1.4;
      for (var j = 0; j < 50; j++) {
        var sx = Math.random() * w;
        var sy = Math.random() * h;
        var len = 40 + Math.random() * 120;
        var angle = (Math.random() * 40 - 20) * (Math.PI / 180) + Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
        ctx.stroke();
      }

      // Fine speckled dust for texture
      ctx.fillStyle = 'rgba(120,108,84,0.35)';
      for (var k = 0; k < 900; k++) {
        var px = Math.random() * w;
        var py = Math.random() * h;
        ctx.fillRect(px, py, 1.6, 1.6);
      }
    }

    function updateMeter(percent) {
      percent = Math.max(0, Math.min(100, Math.round(percent)));
      meterFill.style.width = percent + '%';
      meterLabel.textContent = percent + '% clean';
    }

    function computeCleanPercent() {
      var w = canvas.width, h = canvas.height;
      if (!w || !h) return 0;
      var data;
      try {
        data = ctx.getImageData(0, 0, w, h).data;
      } catch (e) {
        return 0;
      }
      var total = 0, cleared = 0;
      var stride = 4 * 8;
      for (var i = 3; i < data.length; i += stride) {
        total++;
        if (data[i] < 50) cleared++;
      }
      return total ? (cleared / total) * 100 : 0;
    }

    function eraseAt(x, y) {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      var r = 52;
      var grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(0.7, 'rgba(0,0,0,0.9)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function eraseLine(x0, y0, x1, y1) {
      var dist = Math.hypot(x1 - x0, y1 - y0);
      var steps = Math.max(1, Math.ceil(dist / 14));
      for (var i = 0; i <= steps; i++) {
        var t = i / steps;
        eraseAt(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t);
      }
    }

    function pointerPos(e) {
      var rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function maybeCheckPercent() {
      var now = performance.now();
      if (now - lastCheck < 140) return;
      lastCheck = now;
      updateMeter(computeCleanPercent());
    }

    canvas.addEventListener('pointerdown', function (e) {
      dragging = true;
      canvas.setPointerCapture(e.pointerId);
      var p = pointerPos(e);
      eraseAt(p.x, p.y);
      lastX = p.x; lastY = p.y;
      if (hint) hint.classList.add('is-hidden');
      maybeCheckPercent();
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var p = pointerPos(e);
      eraseLine(lastX, lastY, p.x, p.y);
      lastX = p.x; lastY = p.y;
      maybeCheckPercent();
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      updateMeter(computeCleanPercent());
    }
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('pointerleave', endDrag);

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        drawGrime(stage.clientWidth, stage.clientHeight);
        updateMeter(0);
        if (hint) hint.classList.remove('is-hidden');
      });
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
  }
});
