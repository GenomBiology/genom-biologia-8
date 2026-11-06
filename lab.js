(function (global) {
  'use strict';

  const BASES = Object.freeze({ A: 'T', T: 'A', G: 'C', C: 'G' });
  const BASE_NAMES = Object.freeze({ A: 'adenina', T: 'tymina', G: 'guanina', C: 'cytozyna' });
  const ORIGINAL = 'ATGCCATGACTA';
  const MODES = ['pairing', 'inheritance', 'mutations'];
  const state = { active: 'pairing', sequence: ORIGINAL, parentA: 'Aa', parentB: 'Aa', position: 4, newBase: 'T' };
  let initialized = false;
  const html = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clean = (value) => String(value ?? '').replace(/\s+/g, '').toUpperCase();

  function complement(sequence) {
    const input = clean(sequence);
    if (input.length > 24) return { valid: false, input, complement: '', length: input.length, gc: null, error: 'Wpisz najwyżej 24 litery DNA.' };
    if (/[^ATGC]/.test(input)) return { valid: false, input, complement: '', length: input.length, gc: null, error: 'Użyj tylko liter A, T, G i C. Spacje są dozwolone.' };
    const gcCount = (input.match(/[GC]/g) || []).length;
    return { valid: true, input, complement: [...input].map((base) => BASES[base]).join(''), length: input.length, gc: input.length ? Math.round(gcCount / input.length * 1000) / 10 : null, error: '' };
  }

  function punnett(parentA, parentB) {
    const normalize = (value) => value === 'aA' ? 'Aa' : String(value ?? '');
    const first = normalize(parentA), second = normalize(parentB);
    if (!['AA', 'Aa', 'aa'].includes(first) || !['AA', 'Aa', 'aa'].includes(second)) return { valid: false, error: 'Wybierz genotyp AA, Aa lub aa dla każdego rodzica.' };
    const gametesA = first.split(''), gametesB = second.split('');
    const cells = gametesA.map((a) => gametesB.map((b) => [a, b].sort().join('')));
    const counts = { AA: 0, Aa: 0, aa: 0 };
    cells.flat().forEach((genotype) => counts[genotype]++);
    const percentages = Object.fromEntries(Object.entries(counts).map(([genotype, count]) => [genotype, count * 25]));
    return { valid: true, parentA: first, parentB: second, gametesA, gametesB, cells, counts, percentages, recessive: percentages.aa };
  }

  function mutate(sequence, position, newBase) {
    const source = complement(sequence), index = Number(position), base = clean(newBase);
    if (!source.valid || !source.length) return { valid: false, error: source.error || 'Sekwencja DNA nie może być pusta.' };
    if (!Number.isInteger(index) || index < 1 || index > source.length) return { valid: false, error: 'Pozycja musi wskazywać istniejącą literę sekwencji.' };
    if (!/^[ATGC]$/.test(base)) return { valid: false, error: 'Nową literą może być A, T, G lub C.' };
    const from = source.input[index - 1], result = source.input.slice(0, index - 1) + base + source.input.slice(index);
    return { valid: true, original: source.input, result, position: index, from, to: base, changed: from !== base, kind: from === base ? 'unchanged' : 'substitution', error: '' };
  }

  function strand(sequence, start = '5′', end = '3′', selected = 0) {
    return `<div class="lab-strand"><span class="lab-direction">${start}</span><div class="lab-bases">${[...sequence].map((base, index) => `<span class="base-chip base-${base.toLowerCase()}${index + 1 === selected ? ' mutation-changed' : ''}" title="Pozycja ${index + 1}: ${base} — ${BASE_NAMES[base]}">${base}</span>`).join('')}</div><span class="lab-direction">${end}</span></div>`;
  }

  function pairingResult() {
    const result = complement(state.sequence);
    if (!result.valid) return '<p class="lab-placeholder">Popraw sekwencję, aby zobaczyć pasującą nić DNA.</p>';
    if (!result.length) return '<p class="lab-placeholder">Wpisz kilka liter DNA — dopasujemy do nich drugą nić.</p>';
    return `<div class="lab-sequence"><p class="lab-strand-label">Twoja nić</p>${strand(result.input)}<div class="lab-pairing-key" aria-hidden="true">A ↔ T <span>·</span> G ↔ C</div><p class="lab-strand-label">Nić komplementarna</p>${strand(result.complement, '3′', '5′')}</div><div class="lab-metrics"><div class="lab-metric"><strong>${result.length}</strong><span>par zasad</span></div><div class="lab-metric"><strong>${String(result.gc).replace('.', ',')}%</strong><span>udział G i C</span></div><div class="lab-metric"><strong>2</strong><span>przeciwne kierunki nici</span></div></div>`;
  }

  function pairingPanel() {
    const result = complement(state.sequence);
    return `<div class="lab-panel-header"><span class="lab-kicker">01 / BUDOWA DNA</span><h2>Znajdź drugą połowę kodu</h2><p>W DNA litery łączą się według prostej zasady: A z T, a G z C. Zmień zapis i zobacz, jak dopasuje się druga nić.</p></div><div class="lab-controls"><label class="lab-field" for="labDnaSequence"><span>Twoja sekwencja DNA</span><input class="lab-input" id="labDnaSequence" data-lab-sequence type="text" maxlength="24" value="${html(state.sequence)}" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-describedby="labPairingHint labPairingError" aria-invalid="${!result.valid}"></label><p id="labPairingHint" class="lab-hint">Do 24 znaków. Wpisuj A, T, G i C; możesz używać spacji.</p><div class="lab-presets" role="group" aria-label="Przykładowe sekwencje"><span>Wypróbuj:</span><button class="lab-preset" type="button" data-lab-preset="ATGCCATGACTA">Przykład 1</button><button class="lab-preset" type="button" data-lab-preset="GGCCGCGCTTAA">Więcej G i C</button><button class="lab-preset" type="button" data-lab-preset="AATTATATGGCC">Więcej A i T</button></div><p id="labPairingError" class="lab-error" role="alert" ${result.valid ? 'hidden' : ''}>${html(result.error)}</p></div><div id="labPairingResult">${pairingResult()}</div><p class="lab-live" id="labPairingStatus" role="status">${pairingStatus(result)}</p><div class="lab-note"><strong>Dwie nici biegną w przeciwnych kierunkach.</strong> Oznaczenia 5′ i 3′ wskazują kierunek nici. Dolny zapis czytany od lewej jest więc ustawiony od 3′ do 5′. To nić DNA — nie RNA.</div><a class="lab-related" href="#article/base-pairing">Poznaj parowanie zasad w artykule <span aria-hidden="true">↗</span></a>`;
  }

  function pairingStatus(result) {
    if (!result.valid) return 'Nie można jeszcze dopasować drugiej nici.';
    return result.length ? `Dopasowano ${result.length} par zasad. Udział G i C: ${String(result.gc).replace('.', ',')}%.` : 'Czekamy na Twoją sekwencję.';
  }

  function genotypeSelect(id, value, label, data) {
    return `<label class="lab-field" for="${id}"><span>${label}</span><select class="lab-select" id="${id}" ${data}>${['AA', 'Aa', 'aa'].map((genotype) => `<option value="${genotype}" ${value === genotype ? 'selected' : ''}>${genotype}</option>`).join('')}</select></label>`;
  }

  function inheritanceResult() {
    const result = punnett(state.parentA, state.parentB);
    if (!result.valid) return `<p class="lab-error">${html(result.error)}</p>`;
    return `<div class="punnett-layout"><table class="punnett-table"><caption>Możliwe połączenia alleli</caption><thead><tr><th scope="col">Rodzic 1 ↓<br>Rodzic 2 →</th>${result.gametesB.map((base) => `<th scope="col">${base}</th>`).join('')}</tr></thead><tbody>${result.cells.map((row, index) => `<tr><th scope="row">${result.gametesA[index]}</th>${row.map((genotype) => `<td data-genotype="${genotype}"><span class="punnett-genotype">${genotype}</span></td>`).join('')}</tr>`).join('')}</tbody></table><div class="punnett-bars">${[['AA', 'Dwie kopie A'], ['Aa', 'Jedna kopia A i jedna a'], ['aa', 'Dwie kopie a']].map(([genotype, label]) => `<div class="punnett-result" data-genotype="${genotype}"><div><strong>${genotype}</strong><span>${label}</span><b>${result.percentages[genotype]}%</b></div><meter class="punnett-bar" min="0" max="100" value="${result.percentages[genotype]}" aria-label="${genotype}: ${result.percentages[genotype]} procent">${result.percentages[genotype]}%</meter></div>`).join('')}</div></div>`;
  }

  function inheritancePanel() {
    const result = punnett(state.parentA, state.parentB);
    return `<div class="lab-panel-header"><span class="lab-kicker">02 / DZIEDZICZENIE</span><h2>Sprawdź, jak spotykają się allele</h2><p>Każdy rodzic przekazuje jedną z dwóch kopii genu. Zmień genotypy i zobacz wszystkie cztery połączenia w prostym modelu dziedziczenia recesywnego.</p></div><div class="lab-controls lab-parent-controls">${genotypeSelect('labParentA', state.parentA, 'Genotyp rodzica 1', 'data-lab-parent-a')}${genotypeSelect('labParentB', state.parentB, 'Genotyp rodzica 2', 'data-lab-parent-b')}</div><div id="labPunnettResult">${inheritanceResult()}</div><p class="lab-live" id="labPunnettStatus" role="status">${punnettStatus(result)}</p><div class="lab-note" id="labPunnettHint"><strong>To model autosomalnego dziedziczenia recesywnego.</strong> A i a oznaczają dwie wersje jednego genu. Przyjmujemy, że cecha zawsze ujawnia się przy aa; osoba Aa jest nosicielem. Procenty odnoszą się do każdej ciąży osobno. Kolejne ciąże są odrębnymi zdarzeniami — wynik wcześniejszej nie zmienia tych szans. To przykład edukacyjny, nie ocena ryzyka konkretnej rodziny.</div><a class="lab-related" href="#article/recessive">Przeczytaj o dziedziczeniu recesywnym <span aria-hidden="true">↗</span></a>`;
  }

  function punnettStatus(result) {
    return result.valid ? `W tym modelu: AA — ${result.percentages.AA}%, Aa — ${result.percentages.Aa}%, aa — ${result.percentages.aa}%.` : result.error;
  }

  function mutationResult() {
    const result = mutate(ORIGINAL, state.position, state.newBase);
    if (!result.valid) return `<p class="lab-error">${html(result.error)}</p>`;
    const selected = result.changed ? state.position : 0;
    return `<div class="mutation-comparison"><div><p class="lab-strand-label">Przed zmianą</p>${strand(result.original, '5′', '3′', selected)}</div><div><p class="lab-strand-label">Po zmianie</p>${strand(result.result, '5′', '3′', selected)}</div></div><div class="lab-metrics"><div class="lab-metric"><strong>${result.position}</strong><span>wybrana pozycja</span></div><div class="lab-metric"><strong>${result.from} → ${result.to}</strong><span>${result.changed ? 'podstawienie jednej zasady' : 'ta sama zasada'}</span></div><div class="lab-metric"><strong>${result.changed ? '1' : '0'}</strong><span>zmienionych liter</span></div></div>`;
  }

  function mutationPanel() {
    const result = mutate(ORIGINAL, state.position, state.newBase);
    return `<div class="lab-panel-header"><span class="lab-kicker">03 / ZMIANY DNA</span><h2>Jedna litera. Co się zmienia?</h2><p>Wybierz miejsce i zastąp jedną zasadę inną. Porównaj dwa zapisy tego samego, przykładowego fragmentu DNA.</p></div><div class="lab-controls lab-mutation-controls"><label class="lab-field" for="labMutationPosition"><span>Pozycja w sekwencji</span><select class="lab-select" id="labMutationPosition" data-lab-mutation-position>${[...ORIGINAL].map((base, index) => `<option value="${index + 1}" ${state.position === index + 1 ? 'selected' : ''}>${index + 1} · ${base}</option>`).join('')}</select></label><label class="lab-field" for="labMutationBase"><span>Nowa litera</span><select class="lab-select" id="labMutationBase" data-lab-mutation-base>${Object.keys(BASES).map((base) => `<option value="${base}" ${state.newBase === base ? 'selected' : ''}>${base} · ${BASE_NAMES[base]}</option>`).join('')}</select></label><button type="button" class="lab-preset" data-lab-mutation-reset>Przywróć przykład</button></div><div id="labMutationResult">${mutationResult()}</div><p class="lab-live" id="labMutationStatus" role="status">${mutationStatus(result)}</p><div class="lab-note"><strong>Zmiana litery nie oznacza automatycznie choroby.</strong> Pokazujemy podstawienie zasady, czyli jeden z rodzajów zmiany DNA. Nie każda taka zmiana wpływa na białko. Jej znaczenie zależy między innymi od miejsca w genomie i funkcji danego fragmentu — ten model nie przewiduje skutków dla zdrowia.</div><a class="lab-related" href="#article/mutations">Poznaj mutacje i warianty genetyczne <span aria-hidden="true">↗</span></a>`;
  }

  function mutationStatus(result) {
    if (!result.valid) return result.error;
    return result.changed ? `Na pozycji ${result.position} litera ${result.from} została zastąpiona literą ${result.to}. Długość sekwencji pozostaje taka sama.` : `Na pozycji ${result.position} nadal znajduje się ${result.from}. Sekwencja się nie zmieniła.`;
  }

  function render(raw = 'lab') {
    const mode = String(raw).replace(/^#/, '').split('/')[1];
    if (MODES.includes(mode)) state.active = mode;
    const labels = { pairing: 'Dopasuj DNA', inheritance: 'Skrzyżuj allele', mutations: 'Zmień sekwencję' };
    const panels = { pairing: pairingPanel, inheritance: inheritancePanel, mutations: mutationPanel };
    return `<div class="lab-page" data-genom-lab><header class="lab-intro"><span class="lab-kicker">LABORATORIUM DNA</span><h1>Genetyka w Twoich rękach</h1><p>Sprawdzaj, zmieniaj i odkrywaj zależności. Trzy proste modele pokazują, jak działa zapis życia.</p></header><div class="lab-tabs" role="tablist" aria-label="Wybierz eksperyment">${MODES.map((id, index) => `<button class="lab-tab ${state.active === id ? 'active' : ''}" type="button" role="tab" id="lab-tab-${id}" data-lab-tab="${id}" aria-controls="lab-panel-${id}" aria-selected="${state.active === id}" tabindex="${state.active === id ? '0' : '-1'}"><span>0${index + 1}</span>${labels[id]}</button>`).join('')}</div>${MODES.map((id) => `<section class="lab-panel" id="lab-panel-${id}" data-lab-panel="${id}" role="tabpanel" aria-labelledby="lab-tab-${id}" tabindex="0" ${state.active === id ? '' : 'hidden'}>${panels[id]()}</section>`).join('')}<div class="lab-footer-note"><strong>Nauka przez eksperyment.</strong> Wszystkie przykłady są uproszczonymi modelami. Nie potrzebujesz żadnych danych o sobie ani o rodzinie.</div></div>`;
  }

  function byId(id) { return document.getElementById(id); }
  function setText(id, value) { const node = byId(id); if (node && node.textContent !== value) node.textContent = value; }
  function updatePairing() {
    const output = byId('labPairingResult');
    if (!output) return;
    const result = complement(state.sequence), input = byId('labDnaSequence'), error = byId('labPairingError');
    output.innerHTML = pairingResult();
    if (input) input.setAttribute('aria-invalid', String(!result.valid));
    if (error) { error.hidden = result.valid; if (error.textContent !== result.error) error.textContent = result.error; }
    setText('labPairingStatus', pairingStatus(result));
  }
  function updateInheritance() {
    const output = byId('labPunnettResult');
    if (!output) return;
    output.innerHTML = inheritanceResult();
    setText('labPunnettStatus', punnettStatus(punnett(state.parentA, state.parentB)));
  }
  function updateMutation() {
    const output = byId('labMutationResult');
    if (!output) return;
    output.innerHTML = mutationResult();
    setText('labMutationStatus', mutationStatus(mutate(ORIGINAL, state.position, state.newBase)));
  }
  function selectTab(id, focus = true) {
    if (!MODES.includes(id)) return;
    state.active = id;
    document.querySelectorAll('[data-lab-tab]').forEach((tab) => {
      const selected = tab.dataset.labTab === id;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.setAttribute('tabindex', selected ? '0' : '-1');
      if (selected && focus) tab.focus({ preventScroll: true });
    });
    document.querySelectorAll('[data-lab-panel]').forEach((panel) => { panel.hidden = panel.dataset.labPanel !== id; });
  }

  function init() {
    if (initialized || typeof document === 'undefined') return true;
    initialized = true;
    document.addEventListener('click', (event) => {
      const target = event.target;
      const tab = target.closest?.('[data-lab-tab]');
      if (tab) { selectTab(tab.dataset.labTab); return; }
      const preset = target.closest?.('[data-lab-preset]');
      if (preset) { state.sequence = preset.dataset.labPreset; const input = byId('labDnaSequence'); if (input) input.value = state.sequence; updatePairing(); return; }
      if (target.closest?.('[data-lab-mutation-reset]')) { state.position = 4; state.newBase = 'T'; const position = byId('labMutationPosition'), base = byId('labMutationBase'); if (position) position.value = '4'; if (base) base.value = 'T'; updateMutation(); }
    });
    document.addEventListener('input', (event) => {
      if (event.target.matches?.('[data-lab-sequence]')) { state.sequence = event.target.value; updatePairing(); }
    });
    document.addEventListener('change', (event) => {
      const input = event.target;
      if (input.matches?.('[data-lab-parent-a]')) { state.parentA = input.value; updateInheritance(); }
      if (input.matches?.('[data-lab-parent-b]')) { state.parentB = input.value; updateInheritance(); }
      if (input.matches?.('[data-lab-mutation-position]')) { state.position = Number(input.value); updateMutation(); }
      if (input.matches?.('[data-lab-mutation-base]')) { state.newBase = input.value; updateMutation(); }
    });
    document.addEventListener('keydown', (event) => {
      const tab = event.target.closest?.('[data-lab-tab]');
      if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const index = MODES.indexOf(tab.dataset.labTab);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? MODES.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + MODES.length) % MODES.length;
      selectTab(MODES[next]);
    });
    return true;
  }

  global.GenomLab = Object.freeze({ init, render, complement, punnett, mutate });
})(window);
