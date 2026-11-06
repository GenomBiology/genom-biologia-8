(function (global) {
  'use strict';

  const STORAGE_KEY = 'genom-school-progress-v1';
  const UNIT_ORDER = ['genetics', 'evolution', 'ecology', 'environment'];
  const SYMBOLS = {
    dna: '<path d="M7 2c0 9 10 11 10 20M17 2c0 9-10 11-10 20M8 5h8M10 9h4M10 15h4M8 19h8"/>',
    branch: '<path d="M12 3v7M5 21v-8h14v8M12 10v3"/><circle cx="12" cy="3" r="2"/><circle cx="5" cy="21" r="2"/><circle cx="19" cy="21" r="2"/>',
    leaf: '<path d="M20 3C11 1 3 8 5 15c2 7 15 5 15-12ZM4 22 16 8M9 16v-5M9 16h6"/>',
    heart: '<path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 6l-1.1-1.2a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-9.4a5.5 5.5 0 0 0 0-7.8Z"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    book: '<path d="M12 5v16M12 5C8 2 3 3 2 4v16c4-2 8-1 10 1 2-2 6-3 10-1V4c-4-2-8-1-10 1Z"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    zoom: '<circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6M10 7v6M7 10h6"/>'
  };
  const html = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SYMBOLS[name] || SYMBOLS.book}</svg>`;
  const normalize = value => String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l').replace(/[^a-z0-9]+/g, ' ').trim();
  const safeId = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(value);
  const text = value => typeof value === 'string' && value.trim().length > 0;
  const strings = value => Array.isArray(value) ? value.filter(text) : [];
  const node = id => global.document?.getElementById(id);
  const lessonWord = count => count === 1 ? 'lekcja' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? 'lekcje' : 'lekcji';

  let context = { articles: [], visuals: [], navigate: null };
  let data = null;
  let lessonMap = new Map();
  let unitMap = new Map();
  let questionMap = new Map();
  let complete = new Set();
  let lastLessonId = null;
  let ready = false;
  let failed = false;
  let initPromise = null;
  let bound = false;
  let lastRoute = 'school';
  let searchQuery = '';
  let searchUnit = 'all';
  let storageAvailable = true;
  const practice = new Map();

  try {
    const stored = JSON.parse(global.localStorage?.getItem(STORAGE_KEY) || '{}');
    const completed = Array.isArray(stored) ? stored : stored?.completed;
    if (Array.isArray(completed)) complete = new Set(completed.filter(safeId));
    if (safeId(stored?.lastLessonId)) lastLessonId = stored.lastLessonId;
  } catch { storageAvailable = false; }

  function persist() {
    try {
      if (!global.localStorage) { storageAvailable = false; return; }
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: [...complete], lastLessonId }));
    } catch { storageAvailable = false; }
  }
  function isLessonComplete(id) { return complete.has(id); }
  function toggleLessonComplete(id) {
    if (!lessonMap.has(id)) return false;
    if (complete.has(id)) complete.delete(id); else complete.add(id);
    persist();
    return complete.has(id);
  }
  function progressFor(unit) {
    const done = unit.lessonIds.filter(isLessonComplete).length;
    return { id: unit.id, title: unit.title, completed: done, total: unit.lessonIds.length, percent: unit.lessonIds.length ? Math.round(done / unit.lessonIds.length * 100) : 0, nextLessonId: unit.lessonIds.find(id => !complete.has(id)) || null };
  }
  function stats() {
    return {
      ready, failed, unitCount: data?.units.length || 0, lessonCount: data?.lessons.length || 0,
      completed: complete.size, lastLessonId, query: searchQuery, unitFilter: searchUnit,
      units: ready ? data.units.map(progressFor) : [],
      practiceChecked: [...practice.values()].filter(answer => answer.checked).length
    };
  }
  function getData() { return ready ? data : null; }
  function searchLessons(query = '', unitId = 'all') {
    if (!ready) return [];
    const words = normalize(query).split(/\s+/).filter(Boolean);
    return data.lessons.filter(lesson => {
      if (unitId !== 'all' && lesson.unitId !== unitId) return false;
      const haystack = normalize([lesson.title, unitMap.get(lesson.unitId)?.title, ...lesson.objectives, ...lesson.keyTerms.map(term => `${term.term} ${term.definition}`), ...lesson.sections.map(section => section.title)].join(' '));
      return words.every(word => haystack.includes(word));
    });
  }
  function intro(kicker, title, summary) {
    return `<header class="school-intro"><span class="school-kicker">${html(kicker)}</span><h1>${html(title)}</h1><p>${html(summary)}</p></header>`;
  }
  function progress(unit) {
    const state = progressFor(unit);
    return `<div class="school-progress"><progress max="${state.total || 1}" value="${state.completed}" aria-label="Ukończono ${state.completed} z ${state.total} lekcji"></progress><span>${state.completed} / ${state.total} lekcji</span></div>`;
  }
  function tabs(selected) {
    return `<nav class="school-tabs" aria-label="Działy biologii w klasie 8">${data.units.map(unit => `<a class="school-tab ${unit.id === selected ? 'active' : ''}" href="#course/${unit.id}" ${unit.id === selected ? 'aria-current="page"' : ''}>${icon(unit.icon)}<span>${html(unit.title)}</span></a>`).join('')}</nav>`;
  }
  function courseCard(unit, compact = false) {
    const state = progressFor(unit);
    return `<a class="school-card ${compact ? 'school-card-compact' : ''}" href="#course/${unit.id}"><span class="school-card-icon">${icon(unit.icon)}</span><span class="school-card-meta">${unit.lessonIds.length} lekcji · test działowy</span><h2>${html(unit.title)}</h2>${compact ? '' : `<p>${html(unit.summary)}</p>`}${progress(unit)}<span class="school-card-action">${state.completed ? 'Kontynuuj naukę' : 'Otwórz dział'} ${icon('arrow')}</span></a>`;
  }
  function homeCards() {
    if (!ready) return '';
    return `<div class="school-grid school-home-grid">${data.units.map(unit => courseCard(unit, true)).join('')}</div>`;
  }
  function resume() {
    const saved = lessonMap.get(lastLessonId);
    const next = saved && !isLessonComplete(saved.id) ? saved : data.lessons.find(lesson => !isLessonComplete(lesson.id));
    return `<div class="school-resume"><div><span class="school-kicker">${complete.size ? 'TWÓJ POSTĘP' : 'ZACZNIJ OD LEKCJI'}</span><h2>${next ? html(next.title) : 'Wszystkie lekcje ukończone'}</h2><p>${complete.size} z ${data.lessons.length} lekcji oznaczono jako ukończone.</p></div><a class="primary-button" href="${next ? '#lesson/' + next.id : '#tests'}">${next ? complete.size || saved ? 'Kontynuuj' : 'Otwórz lekcję' : 'Przejdź do testów'} ${icon('arrow')}</a></div>`;
  }
  function overview() {
    return intro('BIOLOGIA · KLASA 8', 'Biologia — klasa 8', 'Cztery działy. Krótkie lekcje, samodzielne ćwiczenia i testy z wyjaśnieniami.') + resume() + `<div class="school-grid">${data.units.map(unit => courseCard(unit)).join('')}</div><div class="school-actions"><a class="quiet-link" href="#learn">Wszystkie mini-lekcje ${icon('arrow')}</a><a class="quiet-link" href="#tests">Testy działowe i test przekrojowy ${icon('arrow')}</a></div><p class="school-note">${storageAvailable ? 'Postęp jest zapisywany w tej przeglądarce.' : 'Postęp będzie dostępny do zamknięcia tej strony.'}</p>`;
  }
  function catalogueCard(lesson) {
    const unit = unitMap.get(lesson.unitId);
    return `<a class="school-lesson-card" href="#lesson/${lesson.id}"><span class="school-card-meta">${html(unit?.title)} · ${lesson.minutes} min${isLessonComplete(lesson.id) ? ' · Ukończono' : ''}</span><h2>${html(lesson.title)}</h2><p>${html(lesson.objectives[0] || '')}</p><span class="school-card-action">Ucz się ${icon('arrow')}</span></a>`;
  }
  function catalogueResults() {
    const lessons = searchLessons(searchQuery, searchUnit);
    return lessons.length ? `<div class="school-lesson-grid">${lessons.map(catalogueCard).join('')}</div>` : `<div class="empty-state"><span>${icon('search')}</span><h2>Nie ma lekcji dla tego hasła</h2><p>Zmień hasło lub wybierz inny dział.</p><button class="quiet-link" type="button" data-school-reset-search>Wyczyść filtry ${icon('arrow')}</button></div>`;
  }
  function catalogue() {
    return intro('UCZ SIĘ TEMATAMI', 'Mini-lekcje', 'Wybierz temat. Każda lekcja ma krótkie wyjaśnienie, podsumowanie i dwa zadania do samosprawdzenia.') + `<div class="school-toolbar"><label class="school-search"><span>Szukaj lekcji</span><span>${icon('search')}<input type="search" data-school-search maxlength="120" value="${html(searchQuery)}" placeholder="Np. dobór naturalny, DNA, populacja…" aria-controls="schoolLessonResults" autocomplete="off"></span></label><label class="school-filter"><span>Dział</span><select data-school-unit aria-controls="schoolLessonResults"><option value="all">Wszystkie działy</option>${data.units.map(unit => `<option value="${unit.id}" ${unit.id === searchUnit ? 'selected' : ''}>${html(unit.title)}</option>`).join('')}</select></label></div><div class="school-result-row"><p class="school-count" id="schoolLessonCount" role="status">${searchLessons(searchQuery, searchUnit).length} z ${data.lessons.length} lekcji</p><button class="quiet-link" type="button" data-school-reset-search>Wyczyść filtry ${icon('arrow')}</button></div><div id="schoolLessonResults">${catalogueResults()}</div>`;
  }
  function updateCatalogue() {
    const results = node('schoolLessonResults'), count = node('schoolLessonCount');
    if (results) results.innerHTML = catalogueResults();
    if (count) count.textContent = `${searchLessons(searchQuery, searchUnit).length} z ${data.lessons.length} lekcji`;
  }
  function course(id) {
    const unit = unitMap.get(id);
    if (!unit) return notFound('Nie znaleziono tego działu');
    const state = progressFor(unit);
    return intro('DZIAŁ BIOLOGII', unit.title, unit.summary) + tabs(id) + `<section class="course-header"><div>${progress(unit)}</div><a class="primary-button" href="${state.nextLessonId ? '#lesson/' + state.nextLessonId : '#test/' + unit.id}">${state.nextLessonId ? state.completed ? 'Następna lekcja' : 'Pierwsza lekcja' : 'Sprawdź wiedzę'} ${icon('arrow')}</a><a class="quiet-link" href="#test/${unit.id}">Test z działu ${icon('arrow')}</a></section><ol class="course-lessons">${unit.lessonIds.map((lessonId, index) => { const lesson = lessonMap.get(lessonId); return `<li><a class="course-lesson ${isLessonComplete(lessonId) ? 'is-complete' : ''}" href="#lesson/${lessonId}"><span class="course-number">${String(index + 1).padStart(2, '0')}</span><div class="course-copy"><span class="course-status">${lesson.minutes} min · ${isLessonComplete(lessonId) ? 'Ukończono' : 'Mini-lekcja'}</span><h2>${html(lesson.title)}</h2><p>${html(lesson.objectives[0] || '')}</p></div><span class="course-lesson-arrow">${icon(isLessonComplete(lessonId) ? 'check' : 'arrow')}</span></a></li>`; }).join('')}</ol><p class="school-note">Lekcje możesz powtarzać w dowolnej kolejności. Test obejmuje cały dział.</p>`;
  }
  function lessonFigure(lesson) {
    const figure = (Array.isArray(context.visuals) ? context.visuals : []).find(visual => lesson.visualIds.includes(visual.id));
    if (!figure || !/^illustrations\/[a-z0-9-]+\.svg$/.test(figure.src)) return '';
    return `<figure class="lesson-figure"><button class="lesson-figure-image" type="button" data-enlarge-visual="${html(figure.id)}" aria-label="Powiększ schemat: ${html(figure.title)}"><img src="${html(figure.src)}" alt="${html(figure.alt || figure.title)}" width="800" height="460" loading="lazy" decoding="async"><span>${icon('zoom')} Powiększ schemat</span></button><figcaption>${html(figure.title)}</figcaption></figure>`;
  }
  function answerState(id) {
    if (!practice.has(id)) practice.set(id, { selected: new Set(), checked: false, correct: false });
    return practice.get(id);
  }
  function sameAnswers(selected, correct) {
    const a = [...new Set(selected)].sort((x, y) => x - y), b = [...new Set(correct)].sort((x, y) => x - y);
    return a.length === b.length && a.every((value, index) => value === b[index]);
  }
  function practiceQuestion(question, index) {
    const state = answerState(question.id), multiple = question.type === 'multiple';
    return `<fieldset class="lesson-check" id="schoolCheck-${question.id}"><legend><span>Zadanie ${index + 1}</span>${html(question.prompt)}</legend><p class="lesson-check-hint">${multiple ? 'Wybierz wszystkie poprawne odpowiedzi.' : 'Wybierz jedną poprawną odpowiedź.'}</p><div class="lesson-check-options">${question.options.map((option, optionIndex) => `<label class="lesson-check-option ${state.checked && question.correct.includes(optionIndex) ? 'is-correct' : ''} ${state.checked && state.selected.has(optionIndex) && !question.correct.includes(optionIndex) ? 'is-wrong' : ''}"><input type="${multiple ? 'checkbox' : 'radio'}" name="school-${question.id}" value="${optionIndex}" data-school-choice="${question.id}" ${state.selected.has(optionIndex) ? 'checked' : ''} ${state.checked ? 'disabled' : ''}><span>${html(option)}</span></label>`).join('')}</div><p class="lesson-check-error" id="schoolCheckError-${question.id}" role="alert" hidden>Wybierz odpowiedź, zanim ją sprawdzisz.</p>${state.checked ? `<div class="lesson-check-feedback ${state.correct ? 'is-correct' : 'is-wrong'}" role="status"><h4 id="schoolCheckFeedback-${question.id}" tabindex="-1">${state.correct ? 'Dobrze!' : 'Sprawdź wyjaśnienie'}</h4>${state.correct ? '' : `<p><strong>Poprawna odpowiedź:</strong> ${question.correct.map(value => html(question.options[value])).join(' · ')}</p>`}<p>${html(question.explanation)}</p></div><button class="quiet-link" type="button" data-school-check-reset="${question.id}">Spróbuj ponownie</button>` : `<button class="primary-button" type="button" data-school-check-answer="${question.id}">Sprawdź odpowiedź ${icon('check')}</button>`}</fieldset>`;
  }
  function lessonPage(id) {
    const lesson = lessonMap.get(id);
    if (!lesson) return notFound('Nie znaleziono tej lekcji');
    lastLessonId = id; persist();
    const unit = unitMap.get(lesson.unitId), index = unit.lessonIds.indexOf(id);
    const checks = data.questions.filter(question => question.lessonId === id).slice(0, 2);
    const related = lesson.articleIds.filter(articleId => context.articles.some(article => article.id === articleId));
    return `<a class="quiet-link" href="#course/${unit.id}">← ${html(unit.title)}</a>` + intro(`MINI-LEKCJA ${index + 1} / ${unit.lessonIds.length} · ${lesson.minutes} MIN`, lesson.title, '') + tabs(unit.id) + `<div class="lesson-layout"><article class="lesson-main"><section class="lesson-summary"><h2>Po tej lekcji</h2><ul class="lesson-objectives">${lesson.objectives.map(objective => `<li>${html(objective)}</li>`).join('')}</ul></section>${lessonFigure(lesson)}${lesson.sections.map(section => `<section class="lesson-section"><h2>${html(section.title)}</h2>${section.body.split(/\n\s*\n/).filter(Boolean).map(paragraph => `<p>${html(paragraph)}</p>`).join('')}</section>`).join('')}<section class="lesson-terms"><h2>Najważniejsze pojęcia</h2><dl>${lesson.keyTerms.map(term => `<div><dt>${html(term.term)}</dt><dd>${html(term.definition)}</dd></div>`).join('')}</dl></section><section class="lesson-misconception"><h2>Częsta pomyłka</h2><p><span>Mit:</span> ${html(lesson.misconception.myth)}</p><p><strong>W rzeczywistości:</strong> ${html(lesson.misconception.fact)}</p></section><section class="lesson-takeaways"><h2>Zapamiętaj</h2><ul>${lesson.takeaways.map(point => `<li>${html(point)}</li>`).join('')}</ul></section>${checks.length ? `<section class="lesson-checks"><h2>Sprawdź, czy rozumiesz</h2><p>Te dwa zadania służą nauce. Nie zmieniają wyniku testu działowego.</p>${checks.map(practiceQuestion).join('')}</section>` : ''}<section class="lesson-actions"><button class="primary-button ${isLessonComplete(id) ? 'is-complete' : ''}" type="button" data-school-complete="${id}" aria-pressed="${isLessonComplete(id)}">${icon('check')} ${isLessonComplete(id) ? 'Lekcja ukończona' : 'Oznacz jako ukończoną'}</button><a class="quiet-link" href="#test/${unit.id}">Test z działu ${icon('arrow')}</a></section><nav class="lesson-next-prev" aria-label="Kolejne lekcje">${index > 0 ? `<a href="#lesson/${unit.lessonIds[index - 1]}">← Poprzednia lekcja</a>` : '<span></span>'}${index + 1 < unit.lessonIds.length ? `<a href="#lesson/${unit.lessonIds[index + 1]}">Następna lekcja ${icon('arrow')}</a>` : `<a href="#test/${unit.id}">Przejdź do testu ${icon('arrow')}</a>`}</nav>${related.length ? `<section class="lesson-related"><h2>Czytaj więcej</h2>${related.map(articleId => `<a href="#article/${articleId}">${html(context.articles.find(article => article.id === articleId)?.title)} ${icon('arrow')}</a>`).join('')}</section>` : ''}<section class="lesson-sources"><h2>Źródła</h2>${lesson.sources.map(source => `<a href="${html(source.url)}" target="_blank" rel="noopener noreferrer">${html(source.title)} ↗</a>`).join('')}</section></article></div>`;
  }
  function notFound(title) { return `<div class="empty-state"><span>${icon('book')}</span><h1>${html(title)}</h1><a class="quiet-link" href="#school">Wróć do działów ${icon('arrow')}</a></div>`; }
  function content(raw) {
    if (!ready) return intro('BIOLOGIA · KLASA 8', 'Strefa nauki', 'Lekcje i testy z czterech działów biologii.') + `<div class="empty-state"><span>${icon('book')}</span><h2>${failed ? 'Nie udało się wczytać lekcji' : 'Wczytywanie lekcji…'}</h2><p>Encyklopedia, filmy i schematy są nadal dostępne.</p>${failed ? '<button class="primary-button" type="button" data-school-retry>Spróbuj ponownie</button>' : ''}<a class="quiet-link" href="#library">Otwórz encyklopedię ${icon('arrow')}</a></div>`;
    if (raw === 'learn') return catalogue();
    if (raw.startsWith('course/')) return course(raw.slice(7));
    if (raw.startsWith('lesson/')) return lessonPage(raw.slice(7));
    return overview();
  }
  function render(raw = 'school') {
    lastRoute = String(raw).replace(/^#/, '');
    return `<div id="schoolContent" data-school-route="${html(lastRoute)}">${content(lastRoute)}</div>`;
  }
  function refresh(focusSelector) {
    const target = node('schoolContent');
    if (!target) return;
    target.innerHTML = content(lastRoute);
    if (focusSelector) target.querySelector(focusSelector)?.focus({ preventScroll: true });
  }
  function updatePractice(id, focus) {
    const question = questionMap.get(id), target = node(`schoolCheck-${id}`);
    if (!question || !target) return;
    const lesson = lessonMap.get(question.lessonId), index = data.questions.filter(item => item.lessonId === lesson.id).indexOf(question);
    target.outerHTML = practiceQuestion(question, index);
    if (focus) node(`schoolCheckFeedback-${id}`)?.focus({ preventScroll: true });
  }
  function bindEvents() {
    if (bound || !global.document) return;
    bound = true;
    global.document.addEventListener('click', event => {
      const target = event.target;
      if (!target?.closest) return;
      const completeButton = target.closest('[data-school-complete]');
      if (completeButton) { event.preventDefault(); const id = completeButton.dataset.schoolComplete; toggleLessonComplete(id); refresh(`[data-school-complete="${id}"]`); return; }
      if (target.closest('[data-school-reset-search]')) {
        event.preventDefault(); searchQuery = ''; searchUnit = 'all';
        const input = global.document.querySelector('[data-school-search]'), select = global.document.querySelector('[data-school-unit]');
        if (input) { input.value = ''; input.focus(); } if (select) select.value = 'all'; updateCatalogue(); return;
      }
      const check = target.closest('[data-school-check-answer]');
      if (check) {
        event.preventDefault(); const id = check.dataset.schoolCheckAnswer, answer = answerState(id), question = questionMap.get(id);
        if (!question || answer.checked) return;
        if (!answer.selected.size) { const error = node(`schoolCheckError-${id}`); if (error) error.hidden = false; node(`schoolCheck-${id}`)?.querySelector('input')?.focus(); return; }
        answer.correct = sameAnswers([...answer.selected], question.correct); answer.checked = true; updatePractice(id, true); return;
      }
      const reset = target.closest('[data-school-check-reset]');
      if (reset) { event.preventDefault(); const id = reset.dataset.schoolCheckReset; practice.delete(id); updatePractice(id, false); node(`schoolCheck-${id}`)?.querySelector('input')?.focus({ preventScroll: true }); return; }
      if (target.closest('[data-school-retry]')) {
        event.preventDefault(); const button = target.closest('[data-school-retry]'); button.disabled = true; button.textContent = 'Wczytywanie…';
        init(context).then(() => refresh());
      }
    });
    global.document.addEventListener('input', event => {
      if (!event.target?.matches?.('[data-school-search]')) return;
      searchQuery = event.target.value; updateCatalogue();
    });
    global.document.addEventListener('change', event => {
      const target = event.target;
      if (target?.matches?.('[data-school-unit]')) { searchUnit = target.value === 'all' || unitMap.has(target.value) ? target.value : 'all'; updateCatalogue(); return; }
      if (!target?.matches?.('[data-school-choice]')) return;
      const id = target.dataset.schoolChoice, question = questionMap.get(id);
      if (!question) return;
      const answer = answerState(id), value = Number(target.value);
      if (answer.checked || !Number.isInteger(value) || value < 0 || value >= question.options.length) return;
      if (question.type === 'multiple') { if (target.checked) answer.selected.add(value); else answer.selected.delete(value); }
      else answer.selected = new Set([value]);
      const error = node(`schoolCheckError-${id}`); if (error) error.hidden = true;
    });
  }
  function validate(source) {
    if (!source || !Array.isArray(source.units) || !Array.isArray(source.lessons) || !Array.isArray(source.questions)) throw new Error('Invalid curriculum');
    const articleIds = new Set((context.articles || []).map(article => article.id));
    const ids = new Set();
    const units = source.units.filter(unit => safeId(unit.id) && text(unit.title) && text(unit.summary) && Array.isArray(unit.lessonIds)).map(unit => ({ ...unit, lessonIds: unit.lessonIds.filter(safeId), icon: text(unit.icon) ? unit.icon : 'book' })).filter(unit => { if (ids.has(unit.id)) return false; ids.add(unit.id); return true; }).sort((a, b) => UNIT_ORDER.indexOf(a.id) - UNIT_ORDER.indexOf(b.id));
    const knownUnits = new Set(units.map(unit => unit.id));
    const knownLessons = new Set();
    const lessons = source.lessons.filter(lesson => { const valid = safeId(lesson.id) && !knownLessons.has(lesson.id) && knownUnits.has(lesson.unitId) && units.some(unit => unit.id === lesson.unitId && unit.lessonIds.includes(lesson.id)) && text(lesson.title) && Array.isArray(lesson.sections) && lesson.sections.length && lesson.sections.every(section => text(section.title) && text(section.body)) && Array.isArray(lesson.keyTerms) && lesson.keyTerms.every(term => text(term.term) && text(term.definition)) && text(lesson.misconception?.myth) && text(lesson.misconception?.fact); if (valid) knownLessons.add(lesson.id); return valid; }).map(lesson => { return { ...lesson, minutes: Number.isFinite(lesson.minutes) && lesson.minutes > 0 ? lesson.minutes : 4, objectives: strings(lesson.objectives), takeaways: strings(lesson.takeaways), articleIds: strings(lesson.articleIds).filter(id => articleIds.has(id)), visualIds: strings(lesson.visualIds).filter(safeId), sources: (Array.isArray(lesson.sources) ? lesson.sources : []).filter(item => text(item.title) && typeof item.url === 'string' && /^https:\/\//.test(item.url)) }; });
    const lessonById = new Map(lessons.map(lesson => [lesson.id, lesson]));
    for (const unit of units) unit.lessonIds = [...new Set(unit.lessonIds)].filter(id => lessonById.get(id)?.unitId === unit.id);
    const knownQuestions = new Set();
    const questions = source.questions.filter(question => {
      if (!safeId(question.id) || knownQuestions.has(question.id) || !lessonById.has(question.lessonId) || question.unitId !== lessonById.get(question.lessonId).unitId || !text(question.prompt) || !text(question.explanation) || !['single', 'multiple', 'boolean'].includes(question.type) || !Array.isArray(question.options) || !question.options.every(text) || !Array.isArray(question.correct)) return false;
      if (question.options.length < 2 || question.options.length > 6 || !question.correct.length || question.correct.some(index => !Number.isInteger(index) || index < 0 || index >= question.options.length) || new Set(question.correct).size !== question.correct.length) return false;
      if (question.type !== 'multiple' && question.correct.length !== 1) return false;
      if (question.type === 'multiple' && (question.correct.length < 2 || question.correct.length >= question.options.length)) return false;
      if (question.type === 'boolean' && question.options.length !== 2) return false;
      knownQuestions.add(question.id); return true;
    }).map(question => ({ ...question, points: question.type === 'multiple' ? 2 : 1 }));
    if (!units.length || !lessons.length || !questions.length || units.some(unit => !unit.lessonIds.length)) throw new Error('Empty curriculum');
    return { ...source, units, lessons, questions };
  }
  function init(options = {}) {
    context = { ...context, ...options };
    context.articles = Array.isArray(context.articles) ? context.articles : [];
    context.visuals = Array.isArray(context.visuals) ? context.visuals : [];
    bindEvents();
    if (ready) return Promise.resolve(true);
    if (initPromise) return initPromise;
    if (typeof global.fetch !== 'function') { failed = true; return Promise.resolve(false); }
    initPromise = global.fetch('curriculum.json').then(response => { if (!response.ok) throw new Error('Curriculum unavailable'); return response.json(); }).then(source => {
      data = validate(source); unitMap = new Map(data.units.map(unit => [unit.id, unit])); lessonMap = new Map(data.lessons.map(lesson => [lesson.id, lesson])); questionMap = new Map(data.questions.map(question => [question.id, question]));
      complete = new Set([...complete].filter(id => lessonMap.has(id))); if (!lessonMap.has(lastLessonId)) lastLessonId = null;
      ready = true; failed = false; persist(); return true;
    }).catch(() => { ready = false; failed = true; data = null; return false; }).finally(() => { initPromise = null; });
    return initPromise;
  }

  global.GenomSchool = Object.freeze({ init, getData, render, homeCards, isLessonComplete, toggleLessonComplete, stats, searchLessons });
})(window);
