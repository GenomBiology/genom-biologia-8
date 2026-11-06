(function (global) {
  'use strict';

  const document = global.document;
  const selector = [
    '.hero-upgrade', '.study-resume', '.study-feature-links > a',
    '.article-card', '.topic-tile', '.visual-card', '.study-card',
    '.path-lesson', '.glossary-entry', '.lab-panel', '.quiz-shell',
    '.section-heading', '.study-intro', '.lab-intro', '.page-intro',
    '.video-card', '.video-intro', '.mutation-topic-card',
    '.school-card', '.school-lesson-card', '.course-lesson',
    '.school-intro', '.test-card', '.test-intro'
  ].join(',');
  const rootIds = ['pageContent', 'articleContent', 'visualContent'];
  const supported = Boolean(document && document.body &&
    typeof global.IntersectionObserver === 'function' &&
    typeof global.MutationObserver === 'function' &&
    typeof global.Element?.prototype?.animate === 'function');
  const seen = new WeakSet();
  const pending = new Set();
  const active = new Map();
  const roots = new Set();
  let intersection = null;
  let scheduled = false;
  let enabled = false;
  let preference = null;

  function editing() {
    const element = document?.activeElement;
    return Boolean(element && (/^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName) || element.isContentEditable));
  }

  function allowed() {
    return supported && !document.hidden && document.visibilityState !== 'hidden' &&
      !preference?.matches && !document.body.classList.contains('motion-paused') &&
      !document.body.classList.contains('reduced-motion');
  }

  function candidates(root) {
    const result = [];
    if (root?.matches?.(selector)) result.push(root);
    root?.querySelectorAll?.(selector).forEach(node => result.push(node));
    return result;
  }

  function connected(node) { return node?.isConnected !== false; }
  function containsFocus(node) {
    const focused = document?.activeElement;
    return Boolean(focused && (node === focused || node.contains?.(focused)));
  }
  function unavailable(node) {
    return !connected(node) || Boolean(node.hidden || node.closest?.('[hidden], [inert], dialog'));
  }

  function clearAnimation(animation) {
    active.delete(animation);
  }

  function cancelReveals(consumeExisting = true) {
    intersection?.disconnect();
    pending.forEach(node => seen.add(node));
    pending.clear();
    for (const animation of active.keys()) {
      try { animation.cancel(); } catch {}
    }
    active.clear();
    if (consumeExisting) roots.forEach(root => candidates(root).forEach(node => seen.add(node)));
  }

  function siblingDelay(node) {
    const siblings = node.parentElement?.children;
    if (!siblings) return 0;
    let index = 0;
    for (const sibling of siblings) {
      if (sibling === node) break;
      if (sibling.matches?.(selector)) index++;
    }
    return Math.min(index * 35, 180);
  }

  function reveal(node) {
    if (!connected(node)) return;
    seen.add(node);
    if (!allowed() || editing() || containsFocus(node) || unavailable(node)) return;
    // No inline styles or hiding classes are set: cancelling returns to normal CSS.
    try {
      const animation = node.animate([
        { opacity: 0, transform: 'translate3d(0, 12px, 0)' },
        { opacity: 1, transform: 'translate3d(0, 0, 0)' }
      ], {
        duration: 650,
        delay: siblingDelay(node),
        easing: 'cubic-bezier(.16, 1, .3, 1)',
        fill: 'backwards'
      });
      active.set(animation, node);
      animation.addEventListener?.('finish', () => clearAnimation(animation), { once: true });
      animation.addEventListener?.('cancel', () => clearAnimation(animation), { once: true });
      // Handle cancellation rejection on browsers exposing Animation.finished.
      animation.finished?.then(() => clearAnimation(animation), () => clearAnimation(animation));
    } catch {}
  }

  function scan() {
    scheduled = false;
    if (!supported) return;
    const canReveal = allowed();
    if (!canReveal) {
      enabled = false;
      cancelReveals();
    } else enabled = true;

    for (const node of pending) {
      if (!connected(node)) {
        intersection.unobserve(node);
        pending.delete(node);
      }
    }
    for (const [animation, node] of active) {
      if (!connected(node)) {
        try { animation.cancel(); } catch {}
        active.delete(animation);
      }
    }
    const suppress = !canReveal || editing();
    roots.forEach(root => candidates(root).forEach(node => {
      if (seen.has(node) || pending.has(node)) return;
      if (suppress) { seen.add(node); return; }
      if (unavailable(node)) return;
      pending.add(node);
      intersection.observe(node);
    }));
  }

  function scheduleScan() {
    if (!supported || scheduled) return;
    scheduled = true;
    if (typeof global.queueMicrotask === 'function') global.queueMicrotask(scan);
    else Promise.resolve().then(scan);
  }

  function settingsChanged() {
    if (!allowed()) {
      enabled = false;
      cancelReveals();
    }
    scheduleScan();
  }

  function focusChanged() {
    if (editing()) { cancelReveals(); return; }
    for (const node of pending) {
      if (!containsFocus(node)) continue;
      seen.add(node);
      intersection.unobserve(node);
      pending.delete(node);
    }
    for (const [animation, node] of active) {
      if (!containsFocus(node)) continue;
      try { animation.cancel(); } catch {}
      active.delete(animation);
    }
  }

  global.GenomMotion = Object.freeze({
    refresh: scheduleScan,
    cancel: () => { if (supported) cancelReveals(); }
  });
  if (!supported) return;

  try { preference = global.matchMedia?.('(prefers-reduced-motion: reduce)') || null; } catch {}
  intersection = new global.IntersectionObserver(entries => {
    if (!enabled || !allowed()) { settingsChanged(); return; }
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const node = entry.target;
      intersection.unobserve(node);
      pending.delete(node);
      if (seen.has(node)) continue;
      reveal(node);
    }
  }, { rootMargin: '0px 0px 24px 0px', threshold: 0.05 });

  const contentChanges = new global.MutationObserver(scheduleScan);
  rootIds.forEach(id => {
    const root = document.getElementById(id);
    if (!root) return;
    roots.add(root);
    contentChanges.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
  });
  const bodyChanges = new global.MutationObserver(settingsChanged);
  bodyChanges.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  if (preference?.addEventListener) preference.addEventListener('change', settingsChanged);
  else preference?.addListener?.(settingsChanged);
  document.addEventListener('visibilitychange', settingsChanged);
  document.addEventListener('focusin', focusChanged);
  document.addEventListener('focusout', scheduleScan);
  document.body.classList.add('motion-enhanced');
  scheduleScan();
})(window);
