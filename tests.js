(function (global) {
  'use strict';

  const SESSION_KEY = 'genom-school-test-session-v1';
  const HISTORY_KEY = 'genom-school-test-history-v1';
  const TYPES = ['single', 'multiple', 'boolean'];
  const html = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({ arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>', check: '<path d="m5 12 4 4L19 6"/>', flag: '<path d="M5 22V3m0 0c5-4 9 4 14 0v10c-5 4-9-4-14 0"/>', book: '<path d="M12 5v16M12 5C8 2 3 3 2 4v16c4-2 8-1 10 1 2-2 6-3 10-1V4c-4-2-8-1-10 1Z"/>' })[name] || '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'}</svg>`;
  const node = id => global.document?.getElementById(id);
  let context = { curriculum: null, navigate: null };
  let ready = false, bound = false, bankVersion = '', initializedBank = '';
  let units = [], questions = [], unitMap = new Map(), questionMap = new Map();
  let session = null, history = [], lastRoute = 'tests', selectedMode = 'exam';
  let sessionShown = false, pendingStart = null, confirmFinish = false, discardConfirm = false, notice = '';
  let paletteOpen = false;
  function defaultPaletteOpen() { try { return Boolean(global.matchMedia?.('(min-width: 1100px)').matches); } catch { return false; } }

  function indices(value, question) {
    if (!Array.isArray(value)) return null;
    if (value.some(index => !Number.isInteger(index) || index < 0 || index >= question.options.length)) return null;
    if (new Set(value).size !== value.length || (question.type !== 'multiple' && value.length > 1)) return null;
    return [...value].sort((a, b) => a - b);
  }

  function validQuestion(question) {
    if (!question || typeof question.id !== 'string' || !TYPES.includes(question.type) || !Array.isArray(question.options) || question.options.length < 2 || !question.options.every(option => typeof option === 'string')) return false;
    const correct = indices(question.correct, question);
    return Boolean(correct?.length && (question.type === 'multiple' || correct.length === 1));
  }

  function grade(input = {}) {
    const list = Array.isArray(input.questions) ? input.questions.filter(validQuestion) : [];
    const answers = input.answers && typeof input.answers === 'object' ? input.answers : {};
    const byUnit = new Map();
    const items = list.map((question, index) => {
      const raw = Array.isArray(answers) ? answers[index] : Object.hasOwn(answers, question.id) ? answers[question.id] : [];
      const selected = indices(raw ?? [], question), correct = indices(question.correct, question);
      const answered = Boolean(selected?.length);
      const isCorrect = answered && selected.length === correct.length && selected.every((value, i) => value === correct[i]);
      const maxPoints = Number.isInteger(question.points) && question.points >= 1 && question.points <= 2 ? question.points : question.type === 'multiple' ? 2 : 1;
      const points = isCorrect ? maxPoints : 0;
      const unitId = String(question.unitId || 'other');
      if (!byUnit.has(unitId)) byUnit.set(unitId, { unitId, score: 0, max: 0, correct: 0, total: 0 });
      const unit = byUnit.get(unitId); unit.score += points; unit.max += maxPoints; unit.correct += Number(isCorrect); unit.total++;
      return { id: question.id, unitId, lessonId: question.lessonId, type: question.type, prompt: question.prompt || '', options: [...question.options], selected: selected || [], correctAnswers: correct, answered, invalid: selected === null, isCorrect, points, maxPoints, explanation: question.explanation || '' };
    });
    const score = items.reduce((sum, item) => sum + item.points, 0), max = items.reduce((sum, item) => sum + item.maxPoints, 0);
    const answered = items.filter(item => item.answered).length;
    return { score, max, percent: max ? Math.round(score / max * 100) : 0, correct: items.filter(item => item.isCorrect).length, total: items.length, answered, unanswered: items.length - answered, byUnit: [...byUnit.values()], items };
  }

  function fingerprint(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index++) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
    return (hash >>> 0).toString(36);
  }
  function readStorage(key, fallback) { try { return JSON.parse(global.localStorage?.getItem(key) || 'null') ?? fallback; } catch { return fallback; } }
  function writeStorage(key, value) { try { global.localStorage?.setItem(key, JSON.stringify(value)); } catch {} }
  function removeStorage(key) { try { global.localStorage?.removeItem(key); } catch {} }
  function saveSession() { if (session) writeStorage(SESSION_KEY, session); else removeStorage(SESSION_KEY); }
  function sessionQuestions() { return session ? session.questionIds.map(id => questionMap.get(id)).filter(Boolean) : []; }
  function sessionResult() { return grade({ questions: sessionQuestions(), answers: session?.answers || {} }); }
  function answeredCount() { return sessionQuestions().filter(question => indices(session.answers[question.id] || [], question)?.length).length; }
  function titleFor(id) { return id === 'all' ? 'Cała biologia — klasa 8' : unitMap.get(id)?.title || 'Test'; }
  function modeLabel(mode) { return mode === 'practice' ? 'Ćwiczenie' : 'Sprawdzian'; }
  function targetOf(raw) { const target = String(raw).replace(/^#/, '').split('/')[1]; return target === 'all' || unitMap.has(target) ? target : null; }
  function navigate(raw) { if (typeof context.navigate === 'function') context.navigate(raw); else if (global.location) global.location.hash = raw; }

  function restoreSession(stored) {
    if (!stored || stored.schema !== 1 || stored.bankVersion !== bankVersion || !['exam', 'practice'].includes(stored.mode) || !['full', 'retry'].includes(stored.kind) || typeof stored.complete !== 'boolean') return null;
    if (stored.unitId !== 'all' && !unitMap.has(stored.unitId)) return null;
    const ids = stored.questionIds;
    if (!Array.isArray(ids) || !ids.length || ids.length > testLength(stored.unitId) || new Set(ids).size !== ids.length || ids.some(id => !questionMap.has(id))) return null;
    if (stored.unitId !== 'all' && ids.some(id => questionMap.get(id).unitId !== stored.unitId)) return null;
    if (stored.kind === 'full') {
      if (stored.unitId === 'all') {
        if (units.some(unit => ids.filter(id => questionMap.get(id).unitId === unit.id).length !== Math.min(10, questions.filter(question => question.unitId === unit.id).length))) return null;
      } else if (ids.length !== questions.filter(question => question.unitId === stored.unitId).length) return null;
    }
    if (!Number.isInteger(stored.index) || stored.index < 0 || stored.index >= ids.length || !stored.answers || typeof stored.answers !== 'object' || Array.isArray(stored.answers)) return null;
    const answers = {};
    for (const [id, answer] of Object.entries(stored.answers)) {
      if (!ids.includes(id)) return null;
      const normalized = indices(answer, questionMap.get(id)); if (normalized === null) return null;
      answers[id] = normalized;
    }
    if (!Array.isArray(stored.flags) || !Array.isArray(stored.checked)) return null;
    const flags = [...new Set(stored.flags)], checked = [...new Set(stored.checked)];
    if (flags.some(id => !ids.includes(id)) || checked.some(id => !ids.includes(id) || !answers[id]?.length)) return null;
    if (typeof stored.id !== 'string' || stored.id.length > 100 || typeof stored.startedAt !== 'string' || !Number.isFinite(Date.parse(stored.startedAt))) return null;
    if (stored.complete && (typeof stored.finishedAt !== 'string' || !Number.isFinite(Date.parse(stored.finishedAt)))) return null;
    return { schema: 1, bankVersion, id: stored.id, unitId: stored.unitId, mode: stored.mode, kind: stored.kind, questionIds: [...ids], answers, checked: stored.mode === 'practice' ? checked : [], flags, index: stored.index, startedAt: stored.startedAt, finishedAt: stored.complete ? stored.finishedAt : null, complete: stored.complete };
  }

  function restoreHistory(stored) {
    return (Array.isArray(stored) ? stored : []).filter(item => item && typeof item.id === 'string' && (item.unitId === 'all' || unitMap.has(item.unitId)) && ['exam', 'practice'].includes(item.mode) && ['full', 'retry'].includes(item.kind) && Number.isInteger(item.score) && Number.isInteger(item.max) && item.max > 0 && item.score >= 0 && item.score <= item.max && Number.isFinite(Date.parse(item.finishedAt))).slice(0, 10).map(item => ({ id: item.id, unitId: item.unitId, mode: item.mode, kind: item.kind, score: item.score, max: item.max, percent: Math.round(item.score / item.max * 100), finishedAt: item.finishedAt }));
  }

  function init(options = {}) {
    context = { ...context, ...options };
    try {
      const data = context.curriculum;
      if (!data || !Array.isArray(data.units) || !Array.isArray(data.questions)) throw new Error('Missing curriculum');
      const allowedUnits = [], allowedIds = new Set();
      for (const unit of data.units) {
        if (!unit || typeof unit.id !== 'string' || !/^[a-z0-9-]+$/.test(unit.id) || typeof unit.title !== 'string' || allowedIds.has(unit.id)) continue;
        allowedIds.add(unit.id); allowedUnits.push(unit);
      }
      const used = new Set(), allowedQuestions = [];
      for (const question of data.questions) {
        if (!validQuestion(question) || !/^[a-z0-9-]+$/.test(question.id) || used.has(question.id) || !allowedIds.has(question.unitId) || typeof question.lessonId !== 'string' || !/^[a-z0-9-]+$/.test(question.lessonId) || typeof question.prompt !== 'string' || typeof question.explanation !== 'string' || question.options.length !== (question.type === 'boolean' ? 2 : 4) || question.points !== (question.type === 'multiple' ? 2 : 1) || (question.type === 'multiple' && question.correct.length < 2)) continue;
        used.add(question.id); allowedQuestions.push({ ...question, options: [...question.options], correct: [...question.correct] });
      }
      units = allowedUnits.filter(unit => allowedQuestions.some(question => question.unitId === unit.id));
      if (!units.length || !allowedQuestions.length) throw new Error('Empty tests');
      questions = allowedQuestions; unitMap = new Map(units.map(unit => [unit.id, unit])); questionMap = new Map(questions.map(question => [question.id, question]));
      bankVersion = String(data.version ?? 1) + ':' + fingerprint(JSON.stringify(questions.map(question => [question.id, question.unitId, question.lessonId, question.type, question.prompt, question.options, question.correct, question.points])));
      if (initializedBank !== bankVersion) {
        session = restoreSession(readStorage(SESSION_KEY, null));
        history = restoreHistory(readStorage(HISTORY_KEY, []));
        if (!session) removeStorage(SESSION_KEY);
        initializedBank = bankVersion; sessionShown = false; pendingStart = null; confirmFinish = false;
      }
      ready = true; bindEvents(); return true;
    } catch { ready = false; bindEvents(); return false; }
  }

  function shuffle(list) { const copy = [...list]; for (let index = copy.length - 1; index > 0; index--) { const other = Math.floor(Math.random() * (index + 1)); [copy[index], copy[other]] = [copy[other], copy[index]]; } return copy; }
  function questionPool(target) { return target === 'all' ? units.flatMap(unit => shuffle(questions.filter(question => question.unitId === unit.id)).slice(0, 10)) : questions.filter(question => question.unitId === target); }
  function testLength(target) { return target === 'all' ? units.reduce((sum, unit) => sum + Math.min(10, questions.filter(question => question.unitId === unit.id).length), 0) : questions.filter(question => question.unitId === target).length; }
  function begin(target, ids = null, mode = selectedMode) {
    const picked = ids ? ids.map(id => questionMap.get(id)).filter(Boolean) : questionPool(target);
    if (!picked.length || (target !== 'all' && !unitMap.has(target))) return;
    session = { schema: 1, bankVersion, id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9), unitId: target, mode, kind: ids ? 'retry' : 'full', questionIds: shuffle(picked).map(question => question.id), answers: {}, checked: [], flags: [], index: 0, startedAt: new Date().toISOString(), finishedAt: null, complete: false };
    sessionShown = true; pendingStart = null; confirmFinish = false; discardConfirm = false; notice = ''; selectedMode = mode; paletteOpen = defaultPaletteOpen(); saveSession();
    if (lastRoute !== 'test/' + target) navigate('test/' + target); else refresh('#examQuestion', true);
  }
  function requestStart(target, ids = null, mode = selectedMode) {
    discardConfirm = false;
    if (session && !session.complete) { pendingStart = { target, ids, mode }; refresh('#examReplaceTitle', true); return; }
    begin(target, ids, mode);
  }
  function finish() {
    if (!session || session.complete) return;
    session.complete = true; session.finishedAt = new Date().toISOString(); confirmFinish = false; notice = '';
    const result = sessionResult();
    const record = { id: session.id, unitId: session.unitId, mode: session.mode, kind: session.kind, score: result.score, max: result.max, percent: result.percent, finishedAt: session.finishedAt };
    history = [record, ...history.filter(item => item.id !== record.id)].slice(0, 10);
    writeStorage(HISTORY_KEY, history); saveSession(); refresh('#examResultTitle', true);
  }
  function jump(index) { if (!session || session.complete || !Number.isInteger(index) || index < 0 || index >= session.questionIds.length) return; session.index = index; confirmFinish = false; notice = ''; saveSession(); refresh('#examQuestion', true); }
  function formatDate(value) { try { return new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); } catch { return String(value).slice(0, 10); } }

  function intro(title, description) { return `<header class="test-intro"><span class="test-kicker">BIOLOGIA · KLASA 8</span><h1 id="testHeading" tabindex="-1">${html(title)}</h1><p>${html(description)}</p></header>`; }
  function savedCard() {
    if (!session) return '';
    return `<section class="test-resume"><div><strong>${session.complete ? 'Twój ostatni wynik' : 'Masz rozpoczęty test'}</strong><p>${html(titleFor(session.unitId))} · ${modeLabel(session.mode)}${session.kind === 'retry' ? ' · powtórka błędów' : ''} · ${session.complete ? sessionResult().percent + '%' : answeredCount() + ' z ' + session.questionIds.length + ' odpowiedzi'}</p></div><div class="test-resume-actions"><button class="primary-button" type="button" data-exam-resume>${session.complete ? 'Zobacz wynik' : 'Kontynuuj'} ${icon('arrow')}</button><button class="quiet-link" type="button" data-exam-discard>Usuń zapis</button></div></section>`;
  }
  function catalogue() {
    const cards = [...units.map(unit => ({ id: unit.id, title: unit.title, description: 'Test po dziale. Pytania jednokrotnego i wielokrotnego wyboru oraz prawda–fałsz.' })), { id: 'all', title: 'Test przekrojowy', description: 'Po 10 pytań z każdego działu: genetyki, ewolucji, ekologii i środowiska.' }];
    return intro('Testy z biologii', 'Wybierz dział i tryb pracy. Sprawdzian podaje wynik na końcu, a ćwiczenie wyjaśnia odpowiedzi na bieżąco.') + savedCard() + discardPanel() + `<div class="test-grid">${cards.map(card => `<article class="test-card"><span class="test-card-icon">${icon(card.id === 'all' ? 'check' : 'book')}</span><p class="test-meta">${testLength(card.id)} pytań</p><h2><a href="#test/${card.id}">${html(card.title)}</a></h2><p>${html(card.description)}</p><a class="quiet-link" href="#test/${card.id}">Wybierz test ${icon('arrow')}</a></article>`).join('')}</div><p class="exam-note">Odpowiedzi i wyniki są zapisywane w tej przeglądarce. To testy do nauki, bez oficjalnej oceny szkolnej.</p>${history.length ? `<section class="test-history"><h2>Ostatnie wyniki</h2><ul>${history.map(item => `<li><span>${html(titleFor(item.unitId))}${item.kind === 'retry' ? ' — powtórka' : ''}<small>${modeLabel(item.mode)} · ${html(formatDate(item.finishedAt))}</small></span><strong>${item.score}/${item.max} pkt · ${item.percent}%</strong></li>`).join('')}</ul></section>` : ''}`;
  }
  function discardPanel() {
    return discardConfirm && session ? `<section class="exam-confirm" role="region" aria-labelledby="examDiscardTitle"><h2 id="examDiscardTitle" tabindex="-1">Usunąć zapis tego testu?</h2><p>Zapis odpowiedzi testu „${html(titleFor(session.unitId))}” zostanie usunięty. Zakończone wyniki pozostaną w historii.</p><div class="exam-actions"><button type="button" class="primary-button" data-exam-confirm-discard>Usuń zapis</button><button type="button" class="quiet-link" data-exam-cancel-discard>Zachowaj zapis</button></div></section>` : '';
  }
  function replacementPanel() {
    return pendingStart ? `<section class="exam-confirm" role="region" aria-labelledby="examReplaceTitle"><h2 id="examReplaceTitle" tabindex="-1">Zastąpić rozpoczęty test?</h2><p>Zapis testu „${html(titleFor(session?.unitId))}” zostanie usunięty. Zakończone wyniki pozostaną w historii.</p><div class="exam-actions"><button type="button" class="primary-button" data-exam-confirm-start>Rozpocznij nowy test</button><button type="button" class="quiet-link" data-exam-cancel-start>Wróć</button></div></section>` : '';
  }
  function setup(target) {
    return `<a class="quiet-link" href="#tests">← Wszystkie testy</a>` + intro(titleFor(target), `${testLength(target)} pytań. Możesz wracać do odpowiedzi, zaznaczać pytania do powtórki i wznowić pracę po ponownym otwarciu strony.`) + (session && session.unitId === target ? savedCard() + discardPanel() : '') + replacementPanel() + `<section class="exam-shell exam-setup"><h2>Jak chcesz pracować?</h2><div class="test-mode-options" role="group" aria-label="Tryb testu">${[['exam', 'Sprawdzian', 'Punkty, poprawne odpowiedzi i wyjaśnienia po zakończeniu.'], ['practice', 'Ćwiczenie', 'Sprawdzasz każde pytanie i od razu widzisz wyjaśnienie.']].map(([id, title, description]) => `<button type="button" class="test-mode ${selectedMode === id ? 'active' : ''}" data-exam-mode="${id}" aria-pressed="${selectedMode === id}"><strong>${title}</strong><span>${description}</span></button>`).join('')}</div><div class="exam-note">Jedna poprawna odpowiedź lub prawda–fałsz: 1 punkt. Wybór wielu odpowiedzi: 2 punkty wyłącznie za cały poprawny zestaw. Brak odpowiedzi: 0 punktów. Nie ma punktów ujemnych.</div><button type="button" class="primary-button" data-exam-start="${target}">Rozpocznij ${selectedMode === 'exam' ? 'sprawdzian' : 'ćwiczenie'} ${icon('arrow')}</button></section>`;
  }
  function paletteLabel(index, question) { return `Pytanie ${index + 1}${session.answers[question.id]?.length ? ', uzupełnione' : ', bez odpowiedzi'}${session.flags.includes(question.id) ? ', do powrotu' : ''}`; }
  function practiceFeedback(question) {
    const item = grade({ questions: [question], answers: session.answers }).items[0];
    return `<section class="exam-feedback ${item.isCorrect ? 'is-correct' : 'is-wrong'}" role="status"><h3 id="examFeedback" tabindex="-1">${item.isCorrect ? 'Poprawna odpowiedź' : 'Sprawdź wyjaśnienie'}</h3>${item.isCorrect ? '' : `<p><strong>Poprawnie:</strong> ${item.correctAnswers.map(index => html(item.options[index])).join('; ')}</p>`}<p>${html(question.explanation)}</p><a class="quiet-link" href="#lesson/${html(question.lessonId)}">Wróć do mini-lekcji ${icon('arrow')}</a></section>`;
  }
  function finishPanel() { const remaining = session.questionIds.length - answeredCount(); return `<section class="exam-confirm" data-exam-confirm-panel role="region" aria-labelledby="examFinishTitle"><h3 id="examFinishTitle" tabindex="-1">Zakończyć test bez wszystkich odpowiedzi?</h3><p>Pozostało ${remaining} pytań bez odpowiedzi. Otrzymają po 0 punktów.</p><div class="exam-actions"><button type="button" class="primary-button" data-exam-confirm-finish>Zakończ i pokaż wynik</button><button type="button" class="quiet-link" data-exam-back>Wróć do pytań</button></div></section>`; }
  function examPage() {
    const list = sessionQuestions(), question = list[session.index], selected = session.answers[question.id] || [], checked = session.mode === 'practice' && session.checked.includes(question.id), answered = answeredCount();
    const typeLabel = question.type === 'multiple' ? 'Zaznacz wszystkie poprawne odpowiedzi' : question.type === 'boolean' ? 'Wybierz prawda lub fałsz' : 'Wybierz jedną odpowiedź';
    return intro(session.kind === 'retry' ? 'Powtórka błędów' : titleFor(session.unitId), `${modeLabel(session.mode)} · ${session.mode === 'exam' ? 'Rozwiązania pojawią się po zakończeniu testu.' : 'Sprawdź odpowiedź, aby poznać wyjaśnienie.'}`) + `<section class="exam-shell"><header class="exam-header"><div class="exam-progress"><span id="examAnswered">Odpowiedzi: ${answered}/${list.length}</span><progress id="examProgress" value="${answered}" max="${list.length}" aria-label="Udzielone odpowiedzi"></progress><span id="examUnanswered">Bez odpowiedzi: ${list.length - answered}</span></div><div class="exam-actions"><button class="exam-flag ${session.flags.includes(question.id) ? 'active' : ''}" type="button" data-exam-flag aria-pressed="${session.flags.includes(question.id)}">${icon('flag')} Do powrotu</button><button type="button" class="quiet-link" data-exam-end>Zakończ test</button></div></header><div class="exam-layout"><nav class="exam-palette" aria-label="Pytania testu"><button type="button" class="exam-palette-toggle" data-exam-toggle-palette aria-expanded="${paletteOpen}" aria-controls="examPaletteOptions">Pytania ${icon('arrow')}</button><div id="examPaletteOptions" ${paletteOpen ? '' : 'hidden'}><div>${list.map((item, index) => `<button type="button" class="exam-number ${index === session.index ? 'is-current' : ''} ${session.answers[item.id]?.length ? 'is-answered' : ''} ${session.flags.includes(item.id) ? 'is-flagged' : ''}" data-exam-jump="${index}" ${index === session.index ? 'aria-current="step"' : ''} aria-label="${paletteLabel(index, item)}">${index + 1}</button>`).join('')}</div><p class="exam-note">Wypełnione: jest odpowiedź.<br>Znacznik: pytanie do powrotu.</p><a class="quiet-link" href="#tests">Lista testów</a></div></nav><div class="exam-question-area"><p class="test-meta">Pytanie ${session.index + 1} z ${list.length} · ${question.points} ${question.points === 1 ? 'punkt' : 'punkty'}</p><h2 id="examQuestion" class="exam-question" tabindex="-1">${html(question.prompt)}</h2><p class="exam-note">${typeLabel}${question.type === 'multiple' ? '. Punkty za cały poprawny zestaw.' : '.'}</p><fieldset class="exam-options" aria-labelledby="examQuestion"><legend>Twoja odpowiedź</legend>${question.options.map((option, index) => `<label class="exam-option ${selected.includes(index) ? 'is-selected' : ''} ${checked && question.correct.includes(index) ? 'is-correct' : ''}"><input type="${question.type === 'multiple' ? 'checkbox' : 'radio'}" name="examAnswer" value="${index}" data-exam-answer="${index}" ${selected.includes(index) ? 'checked' : ''} ${checked ? 'disabled' : ''}><span class="exam-option-letter" aria-hidden="true">${String.fromCharCode(65 + index)}</span><span class="exam-option-text">${html(option)}</span>${checked && question.correct.includes(index) ? icon('check') : ''}</label>`).join('')}</fieldset>${notice ? `<p class="exam-note" role="status">${html(notice)}</p>` : ''}${session.mode === 'practice' ? checked ? practiceFeedback(question) : `<div class="exam-actions"><button id="examCheck" type="button" class="primary-button" data-exam-check ${selected.length ? '' : 'disabled'}>Sprawdź odpowiedź ${icon('check')}</button></div>` : ''}<div class="exam-actions exam-navigation"><button type="button" class="quiet-link" data-exam-prev ${session.index === 0 ? 'disabled' : ''}>← Poprzednie</button>${session.index < list.length - 1 ? `<button type="button" class="primary-button" data-exam-next>Następne ${icon('arrow')}</button>` : '<button type="button" class="primary-button" data-exam-end>Zakończ test</button>'}</div>${confirmFinish ? finishPanel() : ''}</div></div></section>`;
  }

  function resultPage() {
    const result = sessionResult(), wrong = result.items.filter(item => !item.isCorrect);
    return intro('Wynik i omówienie', titleFor(session.unitId)) + `<section class="exam-shell exam-result"><div class="exam-score"><strong>${result.percent}%</strong><span>${result.score} z ${result.max} punktów</span></div><h2 id="examResultTitle" tabindex="-1">${result.percent >= 80 ? 'Dobra robota. Sprawdź, co już umiesz.' : 'Zobacz, co warto jeszcze powtórzyć.'}</h2><p>Poprawnie: ${result.correct} z ${result.total} pytań. Bez odpowiedzi: ${result.unanswered}.</p><div class="exam-breakdown">${result.byUnit.map(unit => `<div><span>${html(titleFor(unit.unitId))}</span><strong>${unit.score}/${unit.max} pkt</strong></div>`).join('')}</div><div class="exam-actions"><button type="button" class="primary-button" data-exam-retake>Rozwiąż cały test ponownie ${icon('arrow')}</button>${wrong.length ? `<button type="button" class="quiet-link" data-exam-retry-wrong>Przećwicz błędy (${wrong.length})</button>` : ''}<a class="quiet-link" href="#tests">Wszystkie testy</a></div><p class="exam-note">Wynik służy powtórce materiału. Nie jest oficjalną oceną szkolną.</p></section><section class="exam-review"><h2>Omówienie wszystkich pytań</h2>${result.items.map((item, index) => `<article class="exam-review-item ${item.isCorrect ? 'is-correct' : 'is-wrong'}"><div class="test-meta">${index + 1}. ${item.points}/${item.maxPoints} pkt · ${item.isCorrect ? 'Poprawnie' : item.answered ? 'Do powtórki' : 'Brak odpowiedzi'}</div><h3>${html(item.prompt)}</h3><div class="exam-answer-list"><p><strong>Twoja odpowiedź:</strong> ${item.selected.length ? item.selected.map(answer => html(item.options[answer])).join('; ') : 'Nie udzielono odpowiedzi.'}</p><p><strong>Poprawna odpowiedź:</strong> ${item.correctAnswers.map(answer => html(item.options[answer])).join('; ')}</p></div><p>${html(item.explanation)}</p><a class="quiet-link" href="#lesson/${html(item.lessonId)}">Powtórz mini-lekcję ${icon('arrow')}</a></article>`).join('')}</section>`;
  }

  function content(raw) {
    if (!ready) return intro('Testy z biologii', 'Ta część nie jest teraz dostępna.') + '<div class="empty-state"><h2>Nie udało się wczytać testów</h2><p>Mini-lekcje i encyklopedia są dostępne z menu. Odśwież stronę i spróbuj ponownie.</p><a class="quiet-link" href="#school">Przejdź do biologii 8</a></div>';
    if (raw === 'tests') return catalogue();
    const target = targetOf(raw);
    if (!target) return intro('Nie znaleziono testu', 'Wybierz dział z listy.') + '<a class="primary-button" href="#tests">Wszystkie testy</a>';
    if (sessionShown && session && session.unitId === target) return session.complete ? resultPage() : replacementPanel() + examPage();
    return setup(target);
  }
  function render(raw = 'tests') {
    if (!ready) { try { const data = global.GenomSchool?.getData?.(); if (data) init({ ...context, curriculum: data }); } catch {} }
    const nextRoute = String(raw).replace(/^#/, '');
    if (nextRoute !== lastRoute) { discardConfirm = false; pendingStart = null; confirmFinish = false; }
    lastRoute = nextRoute;
    return `<div id="testsContent" data-tests-route="${html(lastRoute)}">${content(lastRoute)}</div>`;
  }
  function refresh(selector, scroll = false) {
    const root = node('testsContent'); if (!root) return;
    root.innerHTML = content(lastRoute); if (selector) root.querySelector(selector)?.focus({ preventScroll: !scroll });
  }
  function updateStatus() {
    if (!session || session.complete) return;
    const count = answeredCount(), total = session.questionIds.length;
    if (node('examAnswered')) node('examAnswered').textContent = `Odpowiedzi: ${count}/${total}`;
    if (node('examUnanswered')) node('examUnanswered').textContent = `Bez odpowiedzi: ${total - count}`;
    if (node('examProgress')) node('examProgress').value = count;
    const current = questionMap.get(session.questionIds[session.index]);
    if (node('examCheck')) node('examCheck').disabled = !session.answers[current.id]?.length;
    global.document?.querySelectorAll('[data-exam-jump]').forEach(button => { const index = Number(button.dataset.examJump), question = questionMap.get(session.questionIds[index]); if (!question) return; button.classList.toggle('is-answered', Boolean(session.answers[question.id]?.length)); button.setAttribute('aria-label', paletteLabel(index, question)); });
    global.document?.querySelectorAll('[data-exam-answer]').forEach(input => { input.closest('.exam-option')?.classList.toggle('is-selected', Boolean(input.checked)); });
    const panel = global.document?.querySelector('[data-exam-confirm-panel]'); if (panel) panel.hidden = true;
  }
  function changeAnswer(input) {
    if (!session || session.complete) return;
    const question = questionMap.get(session.questionIds[session.index]);
    if (!question || (session.mode === 'practice' && session.checked.includes(question.id))) return;
    const value = Number(input.dataset.examAnswer);
    if (!Number.isInteger(value) || value < 0 || value >= question.options.length) return;
    if (question.type === 'multiple') { const selected = new Set(session.answers[question.id] || []); input.checked ? selected.add(value) : selected.delete(value); session.answers[question.id] = [...selected].sort((a, b) => a - b); }
    else if (input.checked) session.answers[question.id] = [value];
    confirmFinish = false; notice = ''; saveSession(); updateStatus();
  }

  function bindEvents() {
    if (bound || !global.document?.addEventListener) return; bound = true;
    global.document.addEventListener('change', event => { if (event.target?.matches?.('[data-exam-answer]')) changeAnswer(event.target); });
    global.document.addEventListener('click', event => {
      const target = event.target; if (!target?.closest) return;
      const mode = target.closest('[data-exam-mode]'); if (mode) { event.preventDefault(); if (['exam', 'practice'].includes(mode.dataset.examMode)) { selectedMode = mode.dataset.examMode; refresh(`[data-exam-mode="${selectedMode}"]`); } return; }
      const start = target.closest('[data-exam-start]'); if (start) { event.preventDefault(); if (start.dataset.examStart === 'all' || unitMap.has(start.dataset.examStart)) requestStart(start.dataset.examStart); return; }
      if (target.closest('[data-exam-confirm-start]')) { event.preventDefault(); if (pendingStart) { const pending = pendingStart; begin(pending.target, pending.ids, pending.mode); } return; }
      if (target.closest('[data-exam-cancel-start]')) { event.preventDefault(); pendingStart = null; refresh('[data-exam-start]'); return; }
      if (target.closest('[data-exam-resume]')) { event.preventDefault(); if (session) { sessionShown = true; pendingStart = null; navigate('test/' + session.unitId); } return; }
      if (target.closest('[data-exam-discard]')) { event.preventDefault(); if (session) { discardConfirm = true; pendingStart = null; refresh('#examDiscardTitle', true); } return; }
      if (target.closest('[data-exam-confirm-discard]')) { event.preventDefault(); session = null; sessionShown = false; discardConfirm = false; pendingStart = null; confirmFinish = false; notice = ''; saveSession(); refresh('#testHeading', true); return; }
      if (target.closest('[data-exam-cancel-discard]')) { event.preventDefault(); discardConfirm = false; refresh('[data-exam-discard]'); return; }
      if (!session || session.complete) {
        if (session?.complete && target.closest('[data-exam-retake]')) { event.preventDefault(); begin(session.unitId, null, session.mode); }
        else if (session?.complete && target.closest('[data-exam-retry-wrong]')) { event.preventDefault(); const wrong = sessionResult().items.filter(item => !item.isCorrect).map(item => item.id); if (wrong.length) begin(session.unitId, wrong, 'practice'); }
        return;
      }
      const palette = target.closest('[data-exam-toggle-palette]'); if (palette) { event.preventDefault(); paletteOpen = !paletteOpen; palette.setAttribute('aria-expanded', String(paletteOpen)); if (node('examPaletteOptions')) node('examPaletteOptions').hidden = !paletteOpen; return; }
      if (target.closest('[data-exam-next]')) { event.preventDefault(); jump(session.index + 1); return; }
      if (target.closest('[data-exam-prev]')) { event.preventDefault(); jump(session.index - 1); return; }
      const jumpButton = target.closest('[data-exam-jump]'); if (jumpButton) { event.preventDefault(); jump(Number(jumpButton.dataset.examJump)); return; }
      if (target.closest('[data-exam-flag]')) { event.preventDefault(); const id = session.questionIds[session.index]; session.flags = session.flags.includes(id) ? session.flags.filter(value => value !== id) : [...session.flags, id]; saveSession(); refresh('[data-exam-flag]'); return; }
      if (target.closest('[data-exam-check]')) { event.preventDefault(); const id = session.questionIds[session.index]; if (session.mode === 'practice' && session.answers[id]?.length && !session.checked.includes(id)) { session.checked.push(id); saveSession(); refresh('#examFeedback', true); } return; }
      if (target.closest('[data-exam-end]')) { event.preventDefault(); if (answeredCount() < session.questionIds.length) { confirmFinish = true; refresh('#examFinishTitle', true); } else finish(); return; }
      if (target.closest('[data-exam-confirm-finish]')) { event.preventDefault(); finish(); return; }
      if (target.closest('[data-exam-back]')) { event.preventDefault(); confirmFinish = false; refresh('#examQuestion', true); }
    });
  }
  function stats() {
    return { ready, bankVersion, paletteOpen, unitCount: units.length, questionCount: questions.length, history: history.map(item => ({ ...item })), session: session ? { ...session, questionIds: [...session.questionIds], answers: Object.fromEntries(Object.entries(session.answers).map(([id, answer]) => [id, [...answer]])), checked: [...session.checked], flags: [...session.flags], currentQuestionId: session.questionIds[session.index], answered: answeredCount(), result: session.complete ? sessionResult() : null } : null };
  }
  global.GenomTests = Object.freeze({ init, render, stats, grade });
})(window);
