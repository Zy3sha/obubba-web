/* Gift pages: buy form, scratch card, redeem.
   Every sentence a visitor reads is in the HTML, not here: this file only
   shows, hides and fills. No key, no secret and no code is ever stored. */
(function () {
  'use strict';

  var cfg = window.OBUBBA_GIFT || {};
  var local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

  // The one address every call goes to. On a local address only, ?fn= points
  // the page at an emulator.
  function functionsBase() {
    if (local) {
      var fn = new URLSearchParams(location.search).get('fn');
      if (fn && /^http:\/\/(localhost|127\.0\.0\.1):\d+(\/[\w\-./]*)?$/.test(fn)) return fn.replace(/\/$/, '');
    }
    return String(cfg.functionsBase || '').replace(/\/$/, '');
  }

  function $(id) { return document.getElementById(id); }
  function show(el, on) { if (el) el.hidden = !on; }
  // Is today inside the Christmas window written on [el] (month, first and
  // last day)? By this visitor's own calendar.
  function inXmasWindow(el, now) {
    var d = now || new Date();
    var m = parseInt(el.getAttribute('data-xmas-month'), 10);
    var from = parseInt(el.getAttribute('data-xmas-from'), 10);
    var to = parseInt(el.getAttribute('data-xmas-to'), 10);
    return !!m && d.getMonth() + 1 === m && d.getDate() >= from && d.getDate() <= to;
  }
  function text(el, value) { if (el) el.textContent = value; }

  function call(path, options) {
    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 15000) : null;
    var init = options || {};
    if (controller) init.signal = controller.signal;
    return fetch(functionsBase() + path, init)
      .then(function (r) { return r.json(); })
      .finally(function () { if (timer) clearTimeout(timer); });
  }

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function monthYear(ym) {
    var m = /^(\d{4})-(\d{2})$/.exec(String(ym || ''));
    if (!m || +m[2] < 1 || +m[2] > 12) return '';
    return MONTHS[+m[2] - 1] + ' ' + m[1];
  }
  function longDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
  }

  /* ---------- /gift/ : the buy form ---------- */
  function initBuy() {
    var form = $('gift-buy-form');
    if (!form) return;
    // The buyer pays in pounds or US dollars. A visitor whose browser says
    // United States starts on dollars; everyone else on pounds. The price
    // shown, and whether the gift can be bought, follow the currency chosen:
    // a currency with no price set shows no price and leaves the button off.
    var prices = cfg.prices || {};
    var gbp = $('gift-currency-gbp'), usd = $('gift-currency-usd');
    function region() {
      var langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || '']);
      var m = /[-_]([A-Za-z]{2})\b/.exec(String(langs[0] || ''));
      return m ? m[1].toUpperCase() : '';
    }
    // A currency can be chosen only when it has a price. While dollars have
    // none (the owner has not set one), everyone starts on pounds and the
    // "Pay in" choice is hidden, so nobody is shown "not on sale" for a
    // currency that is simply not offered yet (Manager, 19 Nov 2026).
    function priced(c) { var p = prices[c]; return !!(p && p.display); }
    var bothPriced = priced('GBP') && priced('USD');
    if (usd && gbp) {
      if (bothPriced) { if (region() === 'US') usd.checked = true; }
      else if (priced('USD') && !priced('GBP')) usd.checked = true;
      else gbp.checked = true;
      var choice = $('gift-currency');
      if (choice) choice.hidden = !bothPriced;
    }
    function currency() { return usd && usd.checked ? 'USD' : 'GBP'; }
    function priceNow() {
      var p = prices[currency()];
      if (p && p.display) return p.display;
      // The single price from before two currencies, which was in pounds.
      return currency() === 'GBP' && cfg.price && cfg.price.display ? cfg.price.display : '';
    }
    var button = $('gift-buy-button');
    var onSale = false;
    function showPrice() {
      var price = priceNow();
      Array.prototype.forEach.call(document.querySelectorAll('[data-gift-price]'), function (el) {
        el.textContent = price; el.hidden = !price;
      });
      onSale = !!(price && cfg.checkoutEnabled);
      show($('gift-not-on-sale'), !onSale);
      if (button) button.disabled = !onSale;
    }
    if (gbp) gbp.addEventListener('change', showPrice);
    if (usd) usd.addEventListener('change', showPrice);
    showPrice();

    var toThem = $('gift-send-them');
    var toMe = $('gift-send-me');
    function sync() {
      var them = !toMe || !toMe.checked;
      show($('gift-recipient-fields'), them);
      var email = $('gift-recipient-email');
      if (email) email.required = them;
    }
    if (toThem) toThem.addEventListener('change', sync);
    if (toMe) toMe.addEventListener('change', sync);
    sync();

    var message = $('gift-message');
    var count = $('gift-message-count');
    function countLeft() {
      if (message && count) text(count, String((cfg.messageMax || 400) - message.value.length));
    }
    if (message) { message.addEventListener('input', countLeft); countLeft(); }

    var date = $('gift-send-on');
    if (date) {
      var today = new Date();
      date.min = today.toISOString().slice(0, 10);
      date.max = new Date(today.getTime() + (cfg.sendAheadDays || 180) * 86400000).toISOString().slice(0, 10);
    }

    // The Christmas front is offered, and chosen to begin with, only in its
    // window (by the buyer's own calendar).
    var designSet = $('gift-design');
    if (designSet && inXmasWindow(designSet)) {
      show(designSet, true);
      var pick = $('gift-design-xmas');
      if (pick) pick.checked = true;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      // Until there is a price and a payment provider nothing is sent anywhere.
      if (!onSale) { show($('gift-not-on-sale'), true); $('gift-not-on-sale').focus(); return; }
      // Her own email, for the receipt: required, and checked by the browser
      // (which says what is wrong in its own words and her own language).
      var buyer = $('gift-buyer-email');
      if (buyer && !buyer.checkValidity()) { buyer.reportValidity(); buyer.focus(); return; }
      var them = !toMe || !toMe.checked;
      var design = $('gift-design');
      var xmasPick = $('gift-design-xmas');
      var body = {
        // The buyer's choice of card front. Only offered in the Christmas
        // window; outside it every gift is the everyday design.
        cardDesign: design && !design.hidden && xmasPick && xmasPick.checked ? 'christmas' : 'everyday',
        currency: currency(),
        buyerEmail: (($('gift-buyer-email') || {}).value || '').trim(),
        months: cfg.months || 12,
        recipientName: ($('gift-recipient-name') || {}).value || '',
        message: message ? message.value : '',
        sendOn: date && date.value ? date.value : ''
      };
      if (them) body.recipientEmail = ($('gift-recipient-email') || {}).value || ''; else body.sendToMe = true;
      button.disabled = true;
      show($('gift-buy-failed'), false);
      call('/createGiftCheckout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) {
          // Only ever leave for a secure address the function handed back.
          var url = r && r.ok ? String(r.url || '') : '';
          if (url && (/^https:\/\//.test(url) || local)) { location.href = url; return; }
          button.disabled = false;
          show($('gift-buy-failed'), true);
        })
        .catch(function () { button.disabled = false; show($('gift-buy-failed'), true); });
    });
  }

  /* ---------- /gift/reveal : the scratch card ---------- */
  function initReveal() {
    var root = $('gift-reveal');
    if (!root) return;
    var token = new URLSearchParams(location.search).get('t') || '';
    var panels = { loading: $('reveal-loading'), card: $('reveal-card'), used: $('reveal-used'), failed: $('reveal-failed') };
    function only(name) {
      Object.keys(panels).forEach(function (k) { show(panels[k], k === name); });
      var shown = panels[name];
      var heading = shown && shown.querySelector('h1');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
    }
    if (!/^[A-Za-z0-9_\-]{16,200}$/.test(token)) { only('failed'); return; }
    only('loading');
    call('/revealGiftCode?t=' + encodeURIComponent(token), { method: 'GET' })
      .then(function (r) {
        if (r && r.ok && r.used) { only('used'); return; }
        if (!r || !r.ok || !r.code) { only('failed'); return; }
        text($('scratch-code'), r.code);
        if (r.recipientName) text($('reveal-name'), r.recipientName);
        show($('reveal-name-line'), !!r.recipientName);
        if (r.message) { text($('reveal-message'), r.message); show($('reveal-from'), true); }
        if (r.buyerName) { text($('reveal-buyer'), r.buyerName); show($('reveal-buyer-line'), true); }
        var redeem = $('reveal-redeem-link');
        // The code travels in the fragment: it is never sent to a server or
        // written to a log by following the link.
        if (redeem) redeem.href = '/redeem#code=' + encodeURIComponent(r.code);
        Array.prototype.forEach.call(document.querySelectorAll('[data-card-link]'), function (a) {
          // The name the buyer gave travels with the code, in the part of the
          // address that is never sent to a server, so the card can print it.
          // The fold sheets have no Christmas front, so the design only
          // travels to the two card sizes.
          a.href = a.getAttribute('data-card-link') + '#code=' + encodeURIComponent(r.code) +
            (r.recipientName ? '&for=' + encodeURIComponent(r.recipientName) : '') +
            (r.cardDesign === 'christmas' || r.cardDesign === 'everyday' ? '&design=' + r.cardDesign : '');
        });
        only('card');
        scratch();
      })
      .catch(function () { only('failed'); });
  }

  function scratch() {
    var box = $('scratch');
    var canvas = $('scratch-surface');
    var open = $('scratch-open');
    var announce = $('scratch-announce');
    var code = $('scratch-code');
    if (!box || !canvas) return;
    var done = false;
    function reveal() {
      if (done) return;
      done = true;
      box.classList.add('is-open');
      code.removeAttribute('aria-hidden');
      canvas.setAttribute('aria-hidden', 'true');
      canvas.removeAttribute('tabindex');
      show(open, false);
      show($('scratch-hint'), false);
      show($('reveal-after'), true);
      text(announce, announce.getAttribute('data-revealed') + ' ' + code.textContent.split('').join(' '));
    }
    if (open) open.addEventListener('click', reveal);
    canvas.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveal(); }
    });

    var ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) { reveal(); return; }
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    function paint() {
      var w = box.clientWidth, h = box.clientHeight;
      canvas.width = Math.round(w * ratio);
      canvas.height = Math.round(h * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      var g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#cdbdf3'); g.addColorStop(0.5, '#e9defc'); g.addColorStop(1, '#b9a6e6');
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(75,58,120,.9)';
      ctx.font = '800 ' + Math.max(15, Math.round(w / 19)) + 'px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(canvas.getAttribute('data-foil') || '', w / 2, h / 2);
    }
    paint();
    var last = null, strokes = 0;
    function point(e) {
      var r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    function rub(e) {
      var p = point(e);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(last ? last.x : p.x, last ? last.y : p.y);
      ctx.lineTo(p.x + 0.01, p.y + 0.01);
      ctx.stroke();
      last = p;
      if (++strokes % 8 === 0) measure();
    }
    function measure() {
      try {
        var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        var clear = 0, total = 0;
        for (var i = 3; i < data.length; i += 4 * 16) { total++; if (data[i] < 32) clear++; }
        if (total && clear / total > 0.45) reveal();
      } catch (err) { /* a canvas that cannot be read still scratches; the button reveals */ }
    }
    canvas.addEventListener('pointerdown', function (e) {
      if (done) return;
      e.preventDefault();
      if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ } }
      last = null; rub(e);
    });
    canvas.addEventListener('pointermove', function (e) {
      if (done || last === null) return;
      if (e.pointerType === 'mouse' && e.buttons === 0) { last = null; return; }
      e.preventDefault();
      rub(e);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (name) {
      canvas.addEventListener(name, function () { if (last !== null) { last = null; measure(); } });
    });
    window.addEventListener('resize', function () { if (!done) { paint(); strokes = 0; } });
  }

  /* ---------- /redeem ---------- */
  function initRedeem() {
    var form = $('redeem-form');
    // A code a partner handed out is not from a gift card. The partner's link
    // is /redeem?from=partner, and the page then says "the code you were given".
    // Nothing else reads the address, and the code itself is never put in it.
    try {
      if (new URLSearchParams(location.search).get('from') === 'partner') {
        show($('redeem-intro-gift'), false);
        show($('redeem-intro-partner'), true);
      }
    } catch (e) { /* an old browser: the gift sentence stays */ }
    if (!form) return;
    var codeInput = $('redeem-code');
    var userInput = $('redeem-username');
    var status = $('redeem-status');
    var panels = { ask: $('redeem-ask'), confirm: $('redeem-confirm'), done: $('redeem-done'), lifetime: $('redeem-lifetime') };
    var pending = null;
    function only(name) {
      Object.keys(panels).forEach(function (k) { show(panels[k], k === name); });
      var heading = panels[name] && panels[name].querySelector('h1:not([hidden]), h2:not([hidden])');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
    }
    function say(id) {
      ['redeem-msg-nomatch', 'redeem-msg-toomany', 'redeem-msg-offline', 'redeem-msg-working'].forEach(function (m) { show($(m), m === id); });
      show(status, !!id);
    }
    function busy(on) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-redeem-busy]'), function (b) { b.disabled = on; });
    }
    // A code handed over by the reveal page arrives in the fragment.
    function takeCodeFromAddress() {
      var frag = /(?:^#|&)code=([^&]+)/.exec(location.hash || '');
      if (!frag || !codeInput) return;
      try { codeInput.value = decodeURIComponent(frag[1]).toUpperCase().slice(0, 24); } catch (err) { /* leave it empty */ }
      if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    }
    takeCodeFromAddress();
    window.addEventListener('hashchange', takeCodeFromAddress);
    function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
    // A plain day from the server (YYYY-MM-DD), or '' when there is none.
    function day(ymd) { return ymd ? longDate(String(ymd).slice(0, 10) + 'T00:00:00Z') : ''; }
    function storeName(store) {
      var name = store === 'ios' ? 'the App Store' : store === 'android' ? 'Google Play' : 'the App Store or Google Play';
      each('[data-store-name]', function (el) { text(el, name); });
    }
    function fail(r) {
      busy(false);
      var message = r && r.message ? String(r.message) : '';
      say(/too many/i.test(message) ? 'redeem-msg-toomany' : 'redeem-msg-nomatch');
      only('ask');
    }
    function post(body) {
      return call('/redeemGiftCode', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    // The words follow the code: how long it is for, and whether it was a gift
    // someone bought or a code a partner shared. A code is 3, 6 or 12 months.
    // "year" and the gift thank-you are the page's own words, so a reply that
    // says nothing leaves them as they are.
    function giftWords(r) {
      var m = Number(r && r.months);
      if (m > 0) {
        var year = m === 12;
        each('[data-gift-length]', function (el) { text(el, year ? 'year' : (m === 1 ? 'month' : m + ' months')); });
        each('[data-gift-verb]', function (el) { text(el, year || m === 1 ? 'is' : 'are'); });
      } else {
        // 3am Club pass-on codes reply with days (e.g. 7) and months: null.
        // (Marketing's fix on main, 88984bd88; carried here because the
        // generator writes gift/gift.js from this file.)
        var d = Number(r && r.days);
        if (d > 0) {
          each('[data-gift-length]', function (el) { text(el, d === 1 ? 'day' : d + ' days'); });
          each('[data-gift-verb]', function (el) { text(el, d === 1 ? 'is' : 'are'); });
        }
      }
      if (r && r.from) {
        var partner = r.from === 'partner';
        show($('done-thanks-gift'), !partner);
        show($('done-thanks-partner'), partner);
      }
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var code = codeInput.value.trim();
      var username = userInput.value.trim();
      if (!code || !username) { say('redeem-msg-nomatch'); return; }
      busy(true); say('redeem-msg-working');
      post({ code: code, username: username }).then(function (r) {
        if (!r || !r.ok) return fail(r);
        busy(false); say('');
        if (r.step !== 'confirm' || !r.confirmToken) return fail(null);
        // An account with Premium for life: say so now. The code stays unused.
        if (r.willBe === 'lifetime') { only('lifetime'); return; }
        pending = { code: code, username: username, confirmToken: r.confirmToken };
        giftWords(r);
        var hint = r.hint || {};
        var since = monthYear(hint.accountSince);
        text($('confirm-username'), username);
        text($('confirm-initial'), hint.babyInitial || '');
        show($('confirm-baby'), !!hint.babyInitial);
        show($('confirm-nobaby'), !hint.babyInitial);
        text($('confirm-since'), since);
        show($('confirm-since-line'), !!since);
        show($('confirm-store'), r.willBe === 'after_store');
        show($('confirm-extends'), r.willBe === 'extends_grant');
        // Held with no date at all: say nothing about dates, a baby or a birth.
        var held = r.willBe === 'held';
        var starts = held ? '' : day(r.startsOn);
        show($('confirm-free'), r.willBe === 'after_free_weeks' && !!starts);
        show($('confirm-birth'), r.willBe === 'held_until_birth');
        show($('confirm-held'), held);
        if (held) show($('confirm-nobaby'), false);
        show($('confirm-meta'), !held);
        show($('confirm-meta-held'), held);
        each('[data-starts-on]', function (el) { text(el, starts); });
        each('[data-starts-line]', function (el) { show(el, !!starts); });
        each('[data-until]', function (el) { text(el, held ? '' : day(r.until)); });
        each('[data-until-line]', function (el) { show(el, !held && !!day(r.until)); });
        each('[data-backstop]', function (el) { text(el, held ? '' : day(r.backstopOn)); });
        each('[data-backstop-line]', function (el) { show(el, !held && !!day(r.backstopOn)); });
        storeName(r.store);
        only('confirm');
      }).catch(function () { busy(false); say('redeem-msg-offline'); });
    });
    var yes = $('confirm-yes');
    if (yes) yes.addEventListener('click', function () {
      if (!pending) return;
      busy(true);
      post(pending).then(function (r) {
        busy(false);
        if (!r || !r.ok) { pending = null; return fail(r); }
        if (r.case === 'lifetime' || r.used === false) { only('lifetime'); return; }
        var held = r.case === 'held';
        var waits = held || r.case === 'held_until_birth' || r.case === 'after_free_weeks';
        var until = held ? '' : longDate(r.premiumUntil);
        var starts = held ? '' : day(r.startsOn);
        text($('done-until'), until);
        show($('done-until-line'), !waits && !!until);
        giftWords(r);
        show($('done-title-year'), !held);
        show($('done-title-held'), held);
        show($('done-free'), r.case === 'after_free_weeks' && !!starts);
        show($('done-birth'), r.case === 'held_until_birth');
        show($('done-held'), held);
        show($('done-open-app'), !waits);
        show($('done-nothing-changes'), waits && !held);
        each('[data-done-starts]', function (el) { text(el, starts); });
        each('[data-done-starts-line]', function (el) { show(el, !!starts); });
        each('[data-done-until]', function (el) { text(el, until); });
        each('[data-done-until-line]', function (el) { show(el, !!until); });
        each('[data-done-backstop]', function (el) { text(el, held ? '' : day(r.backstopOn)); });
        each('[data-done-backstop-line]', function (el) { show(el, !held && !!day(r.backstopOn)); });
        show($('done-store'), r.case === 'after_store');
        storeName(r.store);
        pending = null;
        codeInput.value = '';
        only('done');
      }).catch(function () { busy(false); say('redeem-msg-offline'); only('ask'); });
    });
    var no = $('confirm-no');
    if (no) no.addEventListener('click', function () { pending = null; say(''); only('ask'); userInput.focus(); });
  }

  /* ---------- the printable card ---------- */
  function initCard() {
    var slot = $('card-code');
    if (!slot) return;
    function part(name) {
      var m = new RegExp('(?:^#|&)' + name + '=([^&]*)').exec(location.hash || '');
      if (!m) return '';
      try { return decodeURIComponent(m[1]); } catch (err) { return ''; }
    }
    // Text printed on the artwork never runs past its space: it is made
    // smaller until it fits (a long name, a long code).
    function fit(el) {
      var max = parseFloat(el.getAttribute('data-max'));
      if (!max || !el.getComputedTextLength) return;
      var size = parseFloat(el.getAttribute('font-size'));
      var w = el.getComputedTextLength();
      if (w > max) el.setAttribute('font-size', String(Math.floor(size * max / w)));
    }
    var code = part('code').toUpperCase().slice(0, 24);
    var name = part('for').replace(/\s+/g, ' ').trim().slice(0, 40);
    if (code) { text(slot, code); text($('card-code-words'), code); }
    var nameSlot = $('card-name');
    var card = document.querySelector('.print-card');
    var art = $('card-front-art');
    if (name && nameSlot) text(nameSlot, name);
    // Which front. What the buyer chose comes first; with no choice handed
    // over, Christmas inside its window and the everyday front outside it.
    // The two card sizes have a Christmas front; the fold sheets do not.
    var hasXmas = !!(card && card.getAttribute('data-xmas-front'));
    var asked = part('design');
    var xmas = hasXmas && (asked === 'christmas' || (asked !== 'everyday' && inXmasWindow(card)));
    var nameSize = nameSlot ? nameSlot.getAttribute('font-size') : '';
    function draw() {
      if (!card || !art) return;
      // With a name, the front without the handwriting line; without one, the
      // line stays so a name can be written in by hand.
      var key = (xmas ? 'data-xmas-front' : 'data-front') + (name ? '-named' : '');
      var src = card.getAttribute(key);
      if (src && art.getAttribute('src') !== src) art.setAttribute('src', src);
      if (nameSlot) {
        // The name sits higher on the Christmas front.
        var y = nameSlot.getAttribute(xmas ? 'data-xmas-y' : 'data-y');
        if (y) nameSlot.setAttribute('y', y);
        nameSlot.setAttribute('font-size', nameSize);
        fit(nameSlot);
      }
      fit(slot);
    }
    draw();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    // The choice is shown where there is one to make: in the window, or when
    // a Christmas card was chosen for this gift.
    var choice = $('card-design');
    if (choice && hasXmas && (xmas || inXmasWindow(card))) {
      show(choice, true);
      var rx = $('card-design-xmas'), re = $('card-design-everyday');
      if (rx) { rx.checked = xmas; rx.addEventListener('change', function () { xmas = true; draw(); }); }
      if (re) { re.checked = !xmas; re.addEventListener('change', function () { xmas = false; draw(); }); }
    }
    if ((code || name || asked) && history.replaceState) history.replaceState(null, '', location.pathname);
    var print = $('card-print');
    if (print) print.addEventListener('click', function () { window.print(); });
  }

  function start() { initBuy(); initReveal(); initRedeem(); initCard(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
