(function () {
  'use strict';

  var PHONE = '+12564761402';
  var FORM_ENDPOINT = 'https://formspree.io/f/xoeeagkk';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Mobile menu ---------- */
  var menuButton = $('#menu-button');
  var mobileNav = $('#mobile-nav');
  if (menuButton && mobileNav) {
    var setMenu = function (open) {
      menuButton.setAttribute('aria-expanded', open);
      mobileNav.hidden = !open;
    };
    menuButton.addEventListener('click', function () {
      setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
    });
    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !mobileNav.hidden) { setMenu(false); menuButton.focus(); }
    });
  }

  /* ---------- Early commercial video ----------
     Nothing downloads until the band is near the screen. It plays only
     while visible, never autoplays for reduced motion, and the button
     always pauses or plays it. */
  var video = $('.early-video');
  var toggle = $('#video-toggle');
  if (video && toggle) {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var loaded = false;
    var visible = false;
    var userPaused = reduceMotion;
    var label = $('.video-toggle-label', toggle);

    var setPressed = function (paused) {
      toggle.setAttribute('aria-pressed', paused);
      label.textContent = paused ? 'Play video' : 'Pause video';
    };
    var load = function () {
      if (loaded) return;
      loaded = true;
      video.poster = video.getAttribute('data-poster');
      JSON.parse(video.getAttribute('data-sources')).forEach(function (src) {
        var el = document.createElement('source');
        el.src = src.src; el.type = src.type;
        if (src.media) el.media = src.media;
        video.appendChild(el);
      });
      video.load();
      toggle.hidden = false;
      setPressed(userPaused);
      if (visible && !userPaused) play();
    };
    var play = function () {
      var p = video.play();
      if (p && p.catch) p.catch(function () { setPressed(true); });
    };

    toggle.addEventListener('click', function () {
      userPaused = !video.paused;
      if (userPaused) video.pause(); else play();
      setPressed(userPaused);
    });

    // Wait for the page itself to finish loading so the video never
    // competes with the hero for bandwidth.
    var whenPageLoaded = function (fn) {
      if (document.readyState === 'complete') fn();
      else window.addEventListener('load', fn, { once: true });
    };

    if ('IntersectionObserver' in window) {
      whenPageLoaded(function () {
        new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) load();
        }, { rootMargin: '200px 0px' }).observe(video);
      });
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (!loaded) return;
        if (visible && !userPaused) play();
        else video.pause();
      }, { threshold: 0.25 }).observe(video);
    } else {
      load();
      if (!userPaused) play();
    }
  }

  /* ---------- Before / after squeegee ----------
     Pointer drag anywhere on the photo (touch scrolls vertically still),
     arrow keys on the handle, and a one-time nudge to show it moves. */
  var stage = $('#wipe-stage');
  var handle = $('#wipe-handle');
  if (stage && handle) {
    var figure = stage.parentNode;
    var pos = 35;
    var dragging = false;

    var setPos = function (value) {
      pos = Math.max(0, Math.min(100, value));
      figure.style.setProperty('--pos', pos + '%');
      var rounded = Math.round(pos);
      handle.setAttribute('aria-valuenow', rounded);
      handle.setAttribute('aria-valuetext', rounded + ' percent cleaned');
    };
    var fromPointer = function (e) {
      var rect = stage.getBoundingClientRect();
      setPos(((e.clientX - rect.left) / rect.width) * 100);
    };

    stage.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true;
      stage.setPointerCapture(e.pointerId);
      fromPointer(e);
    });
    stage.addEventListener('pointermove', function (e) { if (dragging) fromPointer(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (type) {
      stage.addEventListener(type, function () { dragging = false; });
    });

    handle.addEventListener('keydown', function (e) {
      var step = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -20, PageUp: 20 }[e.key];
      if (e.key === 'Home') { setPos(0); e.preventDefault(); }
      else if (e.key === 'End') { setPos(100); e.preventDefault(); }
      else if (step) { setPos(pos + step); e.preventDefault(); }
    });

    var motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (motionOK && 'IntersectionObserver' in window) {
      var hinted = false;
      new IntersectionObserver(function (entries, obs) {
        if (!entries[0].isIntersecting || hinted) return;
        hinted = true; obs.disconnect();
        var start = performance.now();
        var tick = function (now) {
          if (dragging) return;
          var t = Math.min(1, (now - start) / 1400);
          setPos(35 + Math.sin(t * Math.PI) * 20);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, { threshold: 0.6 }).observe(stage);
    }
  }

  /* ---------- Services: Residential / Commercial tabs ---------- */
  var tabs = $$('.tab');
  function panelFor(tab) { return document.getElementById(tab.getAttribute('aria-controls')); }
  function selectTab(tab, moveFocus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      panelFor(t).hidden = !on;
    });
    if (moveFocus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      var next = { ArrowRight: tabs[(i + 1) % tabs.length], ArrowLeft: tabs[(i - 1 + tabs.length) % tabs.length], Home: tabs[0], End: tabs[tabs.length - 1] }[e.key];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });
  function tabForPanelId(id) {
    return tabs.filter(function (t) { return t.getAttribute('aria-controls') === id; })[0];
  }
  // Links straight to a service open its tab and scroll to the tabs.
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#service-"]');
    if (!link) return;
    var tab = tabForPanelId(link.getAttribute('href').slice(1));
    if (!tab) return;
    e.preventDefault();
    selectTab(tab);
    $('.tabs').scrollIntoView({ block: 'start' });
    if (history.replaceState) history.replaceState(null, '', link.getAttribute('href'));
  });
  if (location.hash.indexOf('#service-') === 0) {
    var hashTab = tabForPanelId(location.hash.slice(1));
    if (hashTab) { selectTab(hashTab); $('.tabs').scrollIntoView({ block: 'start' }); }
  }

  /* ---------- Gallery ----------
     Filters, a short list on phones with "Show all", and rows that always
     fill: a wide photo that would overhang a row becomes a single tile, and
     the last photo stretches over any space left in the final row. */
  var mosaic = $('#mosaic');
  if (mosaic) {
    var tiles = $$('.tile', mosaic);
    var filterButtons = $$('.filter');
    var moreButton = $('#gallery-more');
    var phone = window.matchMedia('(max-width: 639px)');
    var PHONE_LIMIT = 6;
    var activeFilter = 'all';
    var expanded = false;

    var matching = function () {
      return tiles.filter(function (t) { return activeFilter === 'all' || t.getAttribute('data-cat') === activeFilter; });
    };
    var layout = function () {
      var list = matching();
      var limit = phone.matches && !expanded ? PHONE_LIMIT : Infinity;
      tiles.forEach(function (t) { t.hidden = true; t.style.gridColumn = ''; });
      var shown = list.slice(0, limit);
      shown.forEach(function (t) { t.hidden = false; });
      moreButton.hidden = list.length <= limit;
      moreButton.textContent = 'Show all ' + list.length + ' photos';

      var cols = getComputedStyle(mosaic).gridTemplateColumns.split(' ').length;
      var filled = 0;
      shown.forEach(function (t) {
        var want = t.classList.contains('tile-wide') ? Math.min(2, cols) : 1;
        var span = Math.min(want, cols - filled);
        t.style.gridColumn = 'span ' + span;
        filled = (filled + span) % cols;
      });
      var last = shown[shown.length - 1];
      if (last && filled) {
        var current = parseInt(last.style.gridColumn.replace('span ', ''), 10);
        last.style.gridColumn = 'span ' + (current + cols - filled);
      }
    };

    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeFilter = btn.getAttribute('data-filter');
        filterButtons.forEach(function (b) { b.setAttribute('aria-pressed', b === btn); });
        layout();
      });
    });
    moreButton.addEventListener('click', function () {
      var firstNew = matching()[PHONE_LIMIT];
      expanded = true; layout();
      if (firstNew) $('.tile-open', firstNew).focus();
    });
    if (phone.addEventListener) phone.addEventListener('change', layout);
    window.addEventListener('resize', layout);
    layout();

    /* Photo viewer: a native dialog, so focus stays inside and Esc closes it. */
    var viewer = $('#viewer');
    var viewerImg = $('#viewer-img');
    var viewerCaption = $('#viewer-caption');
    var viewerCount = $('#viewer-count');
    var set = [];
    var index = 0;
    var opener = null;

    var show = function (i) {
      index = (i + set.length) % set.length;
      var tile = set[index];
      var img = $('img', tile);
      viewerImg.src = img.getAttribute('src');
      viewerImg.alt = img.alt;
      viewerImg.width = img.getAttribute('width');
      viewerImg.height = img.getAttribute('height');
      viewerCaption.textContent = $('.tile-kind', tile).textContent + ': ' + $('.tile-detail', tile).textContent.trim();
      viewerCount.textContent = (index + 1) + ' of ' + set.length;
    };
    var openViewer = function (tile, from) {
      set = matching();
      opener = from;
      show(Math.max(0, set.indexOf(tile)));
      if (viewer.showModal) viewer.showModal(); else viewer.setAttribute('open', '');
      $('#viewer-close').focus();
    };
    tiles.forEach(function (tile) {
      var btn = $('.tile-open', tile);
      btn.addEventListener('click', function () { openViewer(tile, btn); });
    });
    $('#gallery-full').addEventListener('click', function (e) { openViewer(matching()[0], e.currentTarget); });
    $('#viewer-close').addEventListener('click', function () { viewer.close(); });
    $('#viewer-prev').addEventListener('click', function () { show(index - 1); });
    $('#viewer-next').addEventListener('click', function () { show(index + 1); });
    viewer.addEventListener('close', function () { if (opener) opener.focus(); });
    viewer.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
    viewer.addEventListener('click', function (e) { if (e.target === viewer) viewer.close(); });
    // Swipe left or right on the photo to move through the set.
    var startX = null;
    viewerImg.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    viewerImg.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX; startX = null;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    });
  }

  /* Links that ask for a business quote preselect "My business". */
  $$('[data-service]').forEach(function (link) {
    link.addEventListener('click', function () {
      var select = $('#hq-service');
      if (select) select.value = link.getAttribute('data-service');
      setTimeout(function () {
        var name = $('#hq-name');
        if (name) name.focus({ preventScroll: true });
      }, 400);
    });
  });

  /* ---------- Lead delivery (Formspree) ----------
     Both forms post to Formspree, which emails each request to Tucker's.
     On failure the visitor gets a call/text link so no lead is lost. */
  var FALLBACK_HTML = 'Couldn&rsquo;t send. Please call or text <a href="tel:' + PHONE + '">(256) 476-1402</a>.';

  function sendLead(form, fields, ui) {
    var data = new FormData();
    Object.keys(fields).forEach(function (k) { data.append(k, fields[k]); });
    // Hidden from people (and autofill); Formspree discards anything a bot puts here.
    var honeypot = form.querySelector('[name="_gotcha"]');
    if (honeypot) data.append('_gotcha', honeypot.value);

    ui.button.setAttribute('aria-busy', 'true');
    ui.note.classList.remove('is-error', 'is-success');
    ui.note.textContent = 'Sending…';

    var controller = window.AbortController ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 15000) : null;

    fetch(FORM_ENDPOINT, {
      method: 'POST', body: data, headers: { Accept: 'application/json' },
      signal: controller ? controller.signal : undefined
    })
      .then(function (res) {
        if (res.ok) return;
        return res.json().catch(function () { return {}; }).then(function (body) {
          throw new Error('Formspree ' + res.status + ': ' + JSON.stringify(body.errors || body));
        });
      })
      .then(function () {
        form.reset();
        ui.note.textContent = ui.success;
        ui.note.classList.add('is-success');
      })
      .catch(function (err) {
        if (window.console) console.warn('Quote form did not send:', err);
        ui.note.innerHTML = FALLBACK_HTML;
        ui.note.classList.add('is-error');
      })
      .then(function () {
        clearTimeout(timer);
        ui.button.removeAttribute('aria-busy');
      });
  }

  /* ---------- Instant estimate ----------
     Ballpark rates only; Tucker's has not published pricing. Figures
     reflect typical industry ranges for in/out cleaning with frames and
     tracks. The starting price is also written into the HTML, so the
     result is correct before this script runs. */
  var estWindows = $('#est-windows');
  var estStories = $('#est-stories');
  var quickForm = $('#quick-quote-form');
  if (estWindows && estStories && quickForm) {
    var STORY_MULTIPLIER = { 1: 1, 2: 1.25, 3: 1.45, 4: 1.6 };
    var RATE_PER_WINDOW = { Residential: 8, Commercial: 5 };
    var MINIMUM_CHARGE = { Residential: 125, Commercial: 150 };
    var DISCOUNT_FACTOR = 0.9;

    var estimate = { low: 0, high: 0, atMinimum: false };
    var checkedValue = function (name) { return $('input[name="' + name + '"]:checked').value; };
    var roundTo5 = function (n) { return Math.round(n / 5) * 5; };
    var storiesLabel = function (n) { return n >= 4 ? '4+ stories' : n + (n === 1 ? ' story' : ' stories'); };
    var setFill = function (input) {
      var min = +input.min, max = +input.max;
      input.style.setProperty('--fill', ((input.value - min) / (max - min)) * 100 + '%');
    };

    var calculate = function () {
      var type = checkedValue('est-type');
      var discounted = !!checkedValue('est-discount');
      var base = +estWindows.value * RATE_PER_WINDOW[type] * (STORY_MULTIPLIER[+estStories.value] || 1);
      var low = base * 0.85;
      var high = base * 1.15;
      if (discounted) { low *= DISCOUNT_FACTOR; high *= DISCOUNT_FACTOR; }
      var minimum = MINIMUM_CHARGE[type] * (discounted ? DISCOUNT_FACTOR : 1);
      var atMinimum = low < minimum;
      low = Math.max(low, minimum);
      high = Math.max(high, low + 30);
      return { low: roundTo5(low), high: roundTo5(high), atMinimum: atMinimum };
    };

    var update = function () {
      var stories = storiesLabel(+estStories.value);
      $('#windows-out').textContent = estWindows.value;
      $('#stories-out').textContent = stories;
      estStories.setAttribute('aria-valuetext', stories);
      setFill(estWindows); setFill(estStories);
      estimate = calculate();
      $('#price-low').textContent = '$' + estimate.low;
      $('#price-high').textContent = '$' + estimate.high;
      $('#price-min').hidden = !estimate.atMinimum;
    };

    [estWindows, estStories].forEach(function (el) { el.addEventListener('input', update); });
    $$('input[name="est-type"], input[name="est-discount"]').forEach(function (el) { el.addEventListener('change', update); });
    update();

    var qqName = $('#qq-name');
    var qqPhone = $('#qq-phone');
    var qqNote = $('#qq-note');
    var qqNoteDefault = qqNote.textContent;
    [qqName, qqPhone].forEach(function (el) {
      el.addEventListener('input', function () { el.removeAttribute('aria-invalid'); });
    });

    quickForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = qqName.value.trim();
      var phone = qqPhone.value.trim();
      [[qqName, name], [qqPhone, phone]].forEach(function (pair) {
        if (pair[1]) pair[0].removeAttribute('aria-invalid');
        else pair[0].setAttribute('aria-invalid', 'true');
      });
      if (!name || !phone) {
        qqNote.textContent = 'Please enter your name and phone number.';
        qqNote.classList.remove('is-success');
        qqNote.classList.add('is-error');
        (!name ? qqName : qqPhone).focus();
        return;
      }
      qqNote.textContent = qqNoteDefault;
      qqNote.classList.remove('is-error');

      var type = checkedValue('est-type');
      var fields = {
        _subject: 'Estimate request: ' + name + ' (' + type + ')',
        form: 'Instant estimate',
        name: name,
        phone: phone,
        property: type,
        stories: storiesLabel(+estStories.value),
        panes: estWindows.value,
        estimate: '$' + estimate.low + ' to $' + estimate.high + ' (industry-standard estimate, to be confirmed)'
      };
      var discount = checkedValue('est-discount');
      if (discount) fields.discount = discount;

      sendLead(quickForm, fields, {
        button: $('#qq-submit'),
        note: qqNote,
        success: 'Thanks, ' + name + '! Your estimate is on its way. Expect a call or text to confirm.'
      });
    });
  }

  /* ---------- Hero quote form ---------- */
  var heroForm = $('#hero-quote-form');
  if (heroForm) {
    var hqNote = $('#hq-note');
    var hqNoteDefault = hqNote.textContent;

    $$('input', heroForm).forEach(function (input) {
      input.addEventListener('input', function () {
        input.removeAttribute('aria-invalid');
      });
    });

    heroForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var nameEl = $('#hq-name');
      var phoneEl = $('#hq-phone');
      var name = nameEl.value.trim();
      var phone = phoneEl.value.trim();
      var service = $('#hq-service').value;

      [[nameEl, name], [phoneEl, phone]].forEach(function (pair) {
        if (pair[1]) pair[0].removeAttribute('aria-invalid');
        else pair[0].setAttribute('aria-invalid', 'true');
      });

      if (!name || !phone) {
        hqNote.textContent = 'Please enter your name and phone number.';
        hqNote.classList.remove('is-success');
        hqNote.classList.add('is-error');
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
        success: 'Thanks, ' + name + '! We got your request and will reach out soon.'
      });
    });
  }
})();
