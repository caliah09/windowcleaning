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

  /* ---------- Quick quote form (CTA band) ---------- */
  var quickForm = document.getElementById('quick-quote-form');
  if (quickForm) {
    quickForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var city = document.getElementById('qq-city').value.trim();
      var name = document.getElementById('qq-name').value.trim();
      var phone = document.getElementById('qq-phone').value.trim();

      if (!name || !phone) return;

      var text = 'Quote request from ' + name + ' (' + phone + ') in ' + (city || '[city not given]');
      window.location.href = 'sms:' + PHONE + '?body=' + encodeURIComponent(text);
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
