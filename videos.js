(function (global) {
  'use strict';

  const CATEGORIES = { all: 'Wszystkie tematy', basics: 'DNA i geny', inheritance: 'Dziedziczenie', diseases: 'Genetyka i zdrowie', research: 'Badania i technologia' };
  const LANGUAGES = { pl: 'Polski', en: 'Angielski' };
  const ICONS = {
    play: '<path d="m9 5 11 7-11 7V5Z"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    external: '<path d="M14 3h7v7M21 3 10 14M10 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-6"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    film: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4"/>'
  };
  const html = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.film}</svg>`;
  const normalize = value => String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l').replace(/[^a-z0-9]+/g, ' ').trim();
  const filmWord = number => number === 1 ? 'film' : number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 12 || number % 100 > 14) ? 'filmy' : 'filmów';
  const byId = id => global.document?.getElementById(id);

  let context = { articles: [], navigate: null };
  let articleMap = new Map();
  let videos = [];
  let ready = false;
  let failed = false;
  let initPromise = null;
  let bound = false;
  let query = '';
  let category = 'all';
  let language = 'all';
  let playingId = null;
  let opener = null;
  const boundDialogs = new WeakSet();

  function validData(source) {
    if (!Array.isArray(source)) throw new Error('Invalid videos');
    const ids = new Set(), youtubeIds = new Set();
    const result = [];
    for (const item of source) {
      if (!item || typeof item.id !== 'string' || !/^[a-z0-9-]{1,100}$/.test(item.id) || ids.has(item.id)) continue;
      if (typeof item.youtubeId !== 'string' || !/^[A-Za-z0-9_-]{11}$/.test(item.youtubeId) || youtubeIds.has(item.youtubeId)) continue;
      if (![item.title, item.originalTitle, item.publisher, item.summary].every(value => typeof value === 'string' && value.trim())) continue;
      if (!Object.hasOwn(LANGUAGES, item.language) || !Object.hasOwn(CATEGORIES, item.category) || item.category === 'all') continue;
      if (typeof item.thumbnail !== 'string') continue;
      const isDiagram = item.thumbnailKind === 'diagram';
      if (isDiagram) {
        if (!/^illustrations\/[a-z0-9-]+\.svg$/.test(item.thumbnail)) continue;
      } else {
        if (!/^media\/videos\/[A-Za-z0-9_-]{11}\.(?:jpg|jpeg|png|webp)$/.test(item.thumbnail)) continue;
        const filename = item.thumbnail.split('/').pop().split('.')[0];
        if (filename !== item.youtubeId) continue;
      }
      const watchUrl = 'https://www.youtube.com/watch?v=' + item.youtubeId;
      if (item.watchUrl !== watchUrl) continue;
      const articleIds = Array.isArray(item.articleIds) ? [...new Set(item.articleIds)].filter(id => articleMap.has(id)) : [];
      const keywords = Array.isArray(item.keywords) ? item.keywords.filter(word => typeof word === 'string') : [];
      result.push({ ...item, articleIds, keywords, watchUrl, thumbnailKind: isDiagram ? 'diagram' : 'thumbnail' });
      ids.add(item.id); youtubeIds.add(item.youtubeId);
    }
    if (!result.length) throw new Error('Empty videos');
    return result;
  }

  function filtered() {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    return videos.filter(video => {
      if (category !== 'all' && video.category !== category) return false;
      if (language !== 'all' && video.language !== language) return false;
      const related = video.articleIds.map(id => articleMap.get(id)).filter(Boolean).map(article => article.title + ' ' + (article.keywords || []).join(' ')).join(' ');
      const haystack = normalize([video.title, video.originalTitle, video.publisher, video.summary, CATEGORIES[video.category], LANGUAGES[video.language], video.keywords.join(' '), related].join(' '));
      return words.every(word => haystack.includes(word));
    });
  }

  function card(video) {
    const related = video.articleIds.map(id => articleMap.get(id)).filter(Boolean).slice(0, 2);
    return `<article class="video-card"><button class="video-thumbnail" type="button" data-play-video="${html(video.id)}" aria-label="Odtwórz film: ${html(video.title)}"><img src="${html(video.thumbnail)}" alt="" width="480" height="270" loading="lazy" decoding="async"><span class="video-play-icon" aria-hidden="true">${icon('play')}</span><span class="video-language-badge">${LANGUAGES[video.language]}</span>${video.thumbnailKind === 'diagram' ? '<span class="video-thumbnail-note">Ilustracja tematu</span>' : ''}</button><div class="video-card-copy"><div class="video-meta"><span class="video-topic">${CATEGORIES[video.category]}</span><span>${html(video.publisher)}</span></div><h2>${html(video.title)}</h2><p>${html(video.summary)}</p><div class="video-card-actions"><button class="primary-button video-watch-button" type="button" data-play-video="${html(video.id)}">${icon('play')} Odtwórz film</button><a class="quiet-link" href="${video.watchUrl}" target="_blank" rel="noopener noreferrer">YouTube ${icon('external')}</a></div>${related.length ? `<div class="video-related"><span>Czytaj też</span>${related.map(article => `<a href="#article/${html(article.id)}">${html(article.title)} ${icon('arrow')}</a>`).join('')}</div>` : ''}</div></article>`;
  }

  function results() {
    const items = filtered();
    return items.length ? `<div class="video-grid">${items.map(card).join('')}</div>` : `<div class="empty-state"><span>${icon('search')}</span><h2>Nie znaleziono filmów</h2><p>Spróbuj krótszego hasła lub zmień temat i język. Możesz pomijać polskie znaki.</p><button class="quiet-link" type="button" data-reset-videos>Wyczyść filtry ${icon('arrow')}</button></div>`;
  }

  function intro() {
    return `<header class="video-intro"><span class="video-kicker">GENETYKA W RUCHU</span><h1>Zobacz, jak działa życie.</h1><p class="video-lead">DNA, dziedziczenie i zdrowie w wybranych materiałach edukacyjnych. Wybierz temat, sprawdź język filmu i odkrywaj dalej.</p></header>`;
  }

  function render() {
    if (!ready) return `<div id="videosPage">${intro()}<div class="empty-state"><span>${icon('film')}</span><h2>${failed ? 'Nie udało się wczytać filmów' : 'Przygotowujemy bibliotekę filmów'}</h2><p>Artykuły i ilustracje są nadal dostępne. Spróbuj wczytać filmy ponownie.</p><button class="primary-button" type="button" data-retry-videos>Wczytaj filmy ${icon('arrow')}</button></div></div>`;
    return `<div id="videosPage">${intro()}<div class="video-toolbar"><label class="video-search"><span>Szukaj filmu</span><span>${icon('search')}<input type="search" data-video-search value="${html(query)}" maxlength="120" placeholder="Np. DNA, dziedziczenie, mutacje…" aria-label="Szukaj filmów" aria-controls="videoResults" autocomplete="off"></span></label><label class="video-language"><span>Język filmu</span><select class="catalogue-select" data-video-language aria-controls="videoResults"><option value="all" ${language === 'all' ? 'selected' : ''}>Wszystkie języki</option>${Object.entries(LANGUAGES).map(([id, title]) => `<option value="${id}" ${language === id ? 'selected' : ''}>${title}</option>`).join('')}</select></label></div><div class="video-filters" role="group" aria-label="Temat filmu">${Object.entries(CATEGORIES).map(([id, title]) => { const count = id === 'all' ? videos.length : videos.filter(video => video.category === id).length; return `<button class="video-filter ${category === id ? 'active' : ''}" type="button" data-video-category="${id}" aria-pressed="${category === id}" ${!count ? 'disabled' : ''}>${title}<span>${count}</span></button>`; }).join('')}</div><div class="video-result-row"><p class="video-result-count" id="videoResultCount" role="status">${filtered().length} ${filmWord(filtered().length)} z biblioteki ${videos.length}</p><button class="quiet-link" type="button" data-reset-videos>Wyczyść filtry ${icon('arrow')}</button></div><div id="videoResults">${results()}</div><p class="video-library-note">Filmy pochodzą z kanałów ich autorów. Język jest podany na każdej karcie. Odtwarzacz YouTube wczytuje się dopiero po kliknięciu „Odtwórz film”.</p></div>`;
  }

  function updateResults() {
    const result = byId('videoResults');
    if (result) result.innerHTML = results();
    const count = byId('videoResultCount');
    if (count) { const total = filtered().length; count.textContent = `${total} ${filmWord(total)} z biblioteki ${videos.length}`; }
    global.document?.querySelectorAll('[data-video-category]').forEach(button => {
      const selected = button.dataset.videoCategory === category;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function stopPlayer() {
    const content = byId('videoContent');
    const frame = content?.querySelector('iframe');
    if (frame) { frame.removeAttribute('src'); frame.remove(); }
    if (content) content.innerHTML = '';
    playingId = null;
  }

  function close() {
    const dialog = byId('videoDialog'), wasOpen = Boolean(dialog?.open || playingId);
    stopPlayer();
    if (dialog?.open) dialog.close();
    const restore = opener; opener = null;
    if (wasOpen && restore?.isConnected !== false) restore?.focus?.({ preventScroll: true });
  }

  function bindDialog(dialog) {
    if (!dialog || boundDialogs.has(dialog)) return;
    boundDialogs.add(dialog);
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.addEventListener('close', stopPlayer);
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
    });
  }

  function play(id, source) {
    const video = videos.find(item => item.id === id), dialog = byId('videoDialog'), content = byId('videoContent');
    if (!video || !dialog || !content) return;
    bindDialog(dialog);
    stopPlayer();
    opener = source || global.document.activeElement;
    playingId = video.id;
    const related = video.articleIds.map(articleId => articleMap.get(articleId)).filter(Boolean).slice(0, 2);
    content.innerHTML = `<header class="video-player-header"><div><span class="video-kicker">BIBLIOTEKA WIDEO</span><h2 id="videoTitle" tabindex="-1">${html(video.title)}</h2><p class="video-meta">${html(video.publisher)} · ${LANGUAGES[video.language]}</p></div><button class="icon-button" type="button" data-close-video aria-label="Zamknij film">${icon('close')}</button></header><div class="video-player-body"><div class="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&amp;rel=0" title="${html(video.title)} — ${html(video.publisher)}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><p class="video-player-note">${html(video.summary)}</p><a class="video-watch-link" href="${video.watchUrl}" target="_blank" rel="noopener noreferrer">Otwórz film na YouTube ${icon('external')}</a><p class="video-player-note">Jeśli odtwarzacz nie działa, skorzystaj z linku do YouTube. Dostępność osadzania może zależeć od ustawień autora filmu.</p>${related.length ? `<nav class="video-related" aria-label="Artykuły do filmu"><span>Przeczytaj i połącz informacje</span>${related.map(article => `<a href="#article/${html(article.id)}">${html(article.title)} ${icon('arrow')}</a>`).join('')}</nav>` : ''}</div>`;
    dialog.setAttribute('aria-labelledby', 'videoTitle');
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    byId('videoTitle')?.focus({ preventScroll: true });
  }

  function reset() {
    query = ''; category = 'all'; language = 'all';
    const search = global.document?.querySelector('[data-video-search]');
    const languageInput = global.document?.querySelector('[data-video-language]');
    if (search) search.value = '';
    if (languageInput) languageInput.value = 'all';
    updateResults();
    search?.focus({ preventScroll: true });
  }

  function bindEvents() {
    if (bound || !global.document) return;
    bound = true;
    bindDialog(byId('videoDialog'));
    global.document.addEventListener('click', event => {
      const target = event.target;
      const playButton = target.closest?.('[data-play-video]');
      if (playButton) { event.preventDefault(); play(playButton.dataset.playVideo, playButton); return; }
      if (target.closest?.('[data-close-video]')) { event.preventDefault(); close(); return; }
      const related = target.closest?.('#videoDialog a[href^="#"]');
      if (related) { event.preventDefault(); const route = related.getAttribute('href').slice(1); close(); if (typeof context.navigate === 'function') context.navigate(route); else global.location.hash = route; return; }
      const filter = target.closest?.('[data-video-category]');
      if (filter && Object.hasOwn(CATEGORIES, filter.dataset.videoCategory)) { event.preventDefault(); category = filter.dataset.videoCategory; updateResults(); return; }
      if (target.closest?.('[data-reset-videos]')) { event.preventDefault(); reset(); return; }
      const retry = target.closest?.('[data-retry-videos]');
      if (retry) { event.preventDefault(); retry.disabled = true; retry.textContent = 'Wczytywanie…'; init(context).then(() => { const page = byId('videosPage'); if (page) page.outerHTML = render(); }); }
    });
    global.document.addEventListener('input', event => {
      if (event.target.matches?.('[data-video-search]')) { query = event.target.value; updateResults(); }
    });
    global.document.addEventListener('change', event => {
      if (event.target.matches?.('[data-video-language]') && (event.target.value === 'all' || Object.hasOwn(LANGUAGES, event.target.value))) { language = event.target.value; updateResults(); }
    });
  }

  function init(options = {}) {
    context = { ...context, ...options };
    context.articles = Array.isArray(context.articles) ? context.articles : [];
    articleMap = new Map(context.articles.map(article => [article.id, article]));
    bindEvents();
    if (ready) return Promise.resolve(true);
    if (initPromise) return initPromise;
    initPromise = global.fetch('videos.json').then(response => { if (!response.ok) throw new Error('Videos unavailable'); return response.json(); }).then(source => { videos = validData(source); ready = true; failed = false; return true; }).catch(() => { videos = []; ready = false; failed = true; return false; }).finally(() => { initPromise = null; });
    return initPromise;
  }

  function stats() { return { ready, failed, total: videos.length, filtered: filtered().length, query, category, language, playingId }; }
  global.GenomVideos = Object.freeze({ init, render, close, stats });
})(window);
