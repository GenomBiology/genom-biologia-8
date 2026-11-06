(function (global) {
  'use strict';
  const doc = global.document;
  const video = doc?.getElementById('sidebarEarthVideo');
  const sidebar = doc?.getElementById('sidebar');
  if (!video || !sidebar) return;
  const reduced = global.matchMedia?.('(prefers-reduced-motion: reduce)');
  const mobile = global.matchMedia?.('(max-width: 760px)');
  let failed = false;
  video.muted = true;
  video.defaultMuted = true;

  function allowed() {
    return !failed && !doc.hidden && doc.visibilityState !== 'hidden' &&
      !reduced?.matches && !doc.body.classList.contains('motion-paused') &&
      !doc.body.classList.contains('reduced-motion') &&
      (!mobile?.matches || sidebar.classList.contains('open'));
  }
  function show(visible) { video.classList.toggle('is-playing', visible); }
  function stop() { video.pause(); show(false); }
  function sync() {
    if (!allowed()) { stop(); return; }
    if (!video.paused && !video.ended) return;
    video.muted = true;
    try {
      const playback = video.play();
      playback?.then?.(() => { if (!allowed()) stop(); }, () => {
        if (video.paused) show(false);
      });
    } catch { show(false); }
  }
  video.addEventListener('playing', () => {
    if (allowed()) show(true);
    else stop();
  });
  video.addEventListener('pause', () => { if (video.paused) show(false); });
  video.addEventListener('error', () => { failed = true; stop(); });
  doc.addEventListener('visibilitychange', sync);
  doc.addEventListener('pointerdown', sync, { passive: true });
  for (const query of [reduced, mobile]) {
    if (query?.addEventListener) query.addEventListener('change', sync);
    else query?.addListener?.(sync);
  }
  if (typeof global.MutationObserver === 'function') {
    const changes = new global.MutationObserver(sync);
    changes.observe(doc.body, { attributes: true, attributeFilter: ['class'] });
    changes.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
  } else {
    doc.addEventListener('click', sync);
    doc.addEventListener('keydown', sync);
  }
  sync();
})(window);
