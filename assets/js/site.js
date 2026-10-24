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
