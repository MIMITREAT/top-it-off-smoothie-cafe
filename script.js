/* Top it off Smoothie Cafe — Vivere Framework v4 (no client secrets) */
(function () {
  'use strict';
  document.documentElement.classList.add('js-loaded');

  /* Footer year */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* Navbar scroll state + scroll progress */
  var navbar = document.querySelector('.navbar');
  var progress = document.querySelector('.scroll-progress');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (navbar) navbar.classList.toggle('is-scrolled', y > 8);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile nav toggle */
  var toggle = document.querySelector('.navbar-toggle');
  var mobile = document.querySelector('.navbar-mobile');
  function closeNav() {
    if (!toggle || !mobile) return;
    toggle.setAttribute('aria-expanded', 'false');
    mobile.classList.remove('is-open');
  }
  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      mobile.classList.toggle('is-open', !open);
    });
    mobile.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('click', function (e) {
      if (mobile.classList.contains('is-open') && !mobile.contains(e.target) && !toggle.contains(e.target)) closeNav();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll('.scroll-fade-up');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* Contact form (mock — replace with EmailJS when credentials are ready) */
  var form = document.getElementById('contact-form');
  var msg = document.getElementById('form-msg');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('[name="name"]');
      var email = form.querySelector('[name="email"]');
      var message = form.querySelector('[name="message"]');
      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        setMsg('Please fill out all fields.', 'err'); return;
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
        setMsg('Please enter a valid email.', 'err'); return;
      }
      setMsg('Sending…', '');
      setTimeout(function () {
        setMsg('Thanks! We’ll be in touch soon. 🍓', 'ok');
        form.reset();
      }, 700);
    });
  }
  function setMsg(text, cls) {
    if (!msg) return;
    msg.textContent = text;
    msg.className = 'form-msg' + (cls ? ' ' + cls : '');
  }

  /* ── Custom cursor (desktop only) ── */
  var cursor = document.querySelector('.cursor');
  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    var tx = cx, ty = cy, raf;
    document.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });
    document.addEventListener('mouseleave', function () { cursor.classList.add('is-hidden'); });
    document.addEventListener('mouseenter', function () { cursor.classList.remove('is-hidden'); });
    var hoverEls = 'a, button, .btn, .board-chip, .card, input, textarea, select, label';
    document.querySelectorAll(hoverEls).forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-hovering'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hovering'); });
    });
    function animateCursor() {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      cursor.style.left = cx + 'px';
      cursor.style.top  = cy + 'px';
      raf = requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }

  /* ── Card tilt on mousemove ── */
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width  - 0.5;
      var y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = 'perspective(800px) rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 8) + 'deg) translateY(-6px)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

  /* ── Magnetic buttons ── */
  document.querySelectorAll('.btn--primary, .btn--green').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var r = btn.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width  / 2)) * 0.35;
      var dy = (e.clientY - (r.top  + r.height / 2)) * 0.35;
      btn.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = '';
    });
  });

  /* ── View Transitions for same-origin navigation ── */
  if ('startViewTransition' in document) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || a.target === '_blank') return;
      e.preventDefault();
      document.startViewTransition(function () {
        window.location.href = href;
      });
    });
  }

  /* Live board — fetch today's ice cream flavors from /api/flavors-get */
  var boardItems = document.getElementById('board-items');
  var boardDate = document.getElementById('board-date');
  if (boardItems) {
    var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); };
    var moreLink = '<a href="menu.html" class="board-chip board-chip--more">Full menu →</a>';
    var fallback = '<span class="board-empty">Ask about today’s Mimi’s flavors in store.</span>' + moreLink;
    fetch('/api/flavors-get', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || !data.ok || !Array.isArray(data.items) || data.items.length === 0) {
          boardItems.innerHTML = fallback;
          return;
        }
        var html = data.items.map(function (it) {
          var tag = it.tag ? '<span class="chip-tag">' + esc(it.tag) + '</span>' : '';
          return '<span class="board-chip' + (it.tag ? ' board-chip--tag' : '') + '">' + esc(it.name) + tag + '</span>';
        }).join('');
        boardItems.innerHTML = html + moreLink;
        if (boardDate && data.updatedAt) boardDate.textContent = 'Updated ' + data.updatedAt;
      })
      .catch(function () {
        boardItems.innerHTML = fallback;
      });
  }
})();
