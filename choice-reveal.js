(function (global) {
  'use strict';
  const doc = global.document;
  const root = doc?.getElementById('pageContent');
  if (!root || !doc.body || typeof global.MutationObserver !== 'function' ||
      typeof global.requestAnimationFrame !== 'function') return;
  const reduced = global.matchMedia?.('(prefers-reduced-motion: reduce)');
  const revealed = new WeakSet();
  let button = null;
  let lastY = scrollY();
  let scrolledDown = false;
  let scheduled = false;

  function scrollY() { return global.scrollY || doc.documentElement?.scrollTop || 0; }
  function motionAllowed() {
    return !reduced?.matches && !doc.body.classList.contains('motion-paused') &&
      !doc.body.classList.contains('reduced-motion');
  }
  function reveal(instant = false) {
    if (!button) return;
    if (instant) button.classList.add('is-reveal-instant');
    button.classList.add('is-scroll-revealed');
    revealed.add(button);
  }
  function check() {
    scheduled = false;
    if (!button || revealed.has(button) || !scrolledDown || !motionAllowed() || doc.hidden) return;
    const box = button.getBoundingClientRect();
    const height = global.innerHeight || doc.documentElement?.clientHeight || 0;
    const pageHeight = Math.max(doc.documentElement?.scrollHeight || 0, doc.body.scrollHeight || 0);
    const atEnd = pageHeight > height && scrollY() + height >= pageHeight - 2;
    if (height > 0 && box.bottom > 0 && (box.top <= height * .8 || (atEnd && box.top < height))) reveal();
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    global.requestAnimationFrame(check);
  }
  function sync() {
    const next = root.querySelector('[data-home-choose]');
    if (next !== button) {
      button = next;
      lastY = scrollY();
      scrolledDown = false;
    }
    const allowed = motionAllowed();
    if (!allowed || (button && button.contains(doc.activeElement))) reveal(true);
    if (doc.body.classList.contains('home-choice-reveal-enabled') !== allowed) {
      doc.body.classList.toggle('home-choice-reveal-enabled', allowed);
    }
    schedule();
  }
  global.addEventListener('scroll', () => {
    const position = scrollY();
    if (position > lastY) scrolledDown = true;
    lastY = position;
    schedule();
  }, { passive: true });
  global.addEventListener('resize', schedule, { passive: true });
  doc.addEventListener('visibilitychange', schedule);
  doc.addEventListener('focusin', event => {
    if (button && button.contains(event.target)) reveal(true);
  });
  const contents = new global.MutationObserver(sync);
  contents.observe(root, { childList: true, subtree: true });
  const settings = new global.MutationObserver(sync);
  settings.observe(doc.body, { attributes: true, attributeFilter: ['class'] });
  if (reduced?.addEventListener) reduced.addEventListener('change', sync);
  else reduced?.addListener?.(sync);
  sync();
})(window);
