/* Top it off Smoothie Cafe — Vivere Framework generic brain (no client secrets) */
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
})();
