'use strict';
const icons = {
  dna:'<path d="M7 2c0 9 10 11 10 20M17 2c0 9-10 11-10 20M8 5h8M10 9h4M10 15h4M8 19h8"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/>',
  orbit:'<ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-40 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(40 12 12)"/><circle cx="12" cy="12" r="1"/>',
  branch:'<rect x="8.5" y="2" width="7" height="5" rx="1"/><rect x="2" y="17" width="7" height="5" rx="1"/><rect x="15" y="17" width="7" height="5" rx="1"/><path d="M12 7v5M5.5 17v-5h13v5"/>',
  heart:'<path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 6l-1.1-1.2a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-9.4a5.5 5.5 0 0 0 0-7.8Z"/><path d="M4 12h4l2-4 3 8 2-4h5"/>',
  microscope:'<path d="m13 3 4 3-5 8-4-3 5-8Z M9 3l2-2 8 5-2 3M7 13l-2 3M14 11a6 6 0 0 1-2 11M4 22h16M5 18h5"/>',
  bookmark:'<path d="M6 3h12v19l-6-4-6 4V3Z"/>',
  shuffle:'<path d="M3 5h3c5 0 7 14 12 14h3M17 15l4 4-4 4M3 19h3c2 0 4-3 5-6M14 7c1-1 2-2 4-2h3M17 1l4 4-4 4"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  leaf:'<path d="M20 3C11 1 3 8 5 15c2 7 15 5 15-12Z M4 22 16 8M9 16v-5M9 16h6"/>',
  menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  book:'<path d="M12 5v16M12 5C8 2 3 3 2 4v16c4-2 8-1 10 1 2-2 6-3 10-1V4c-4-2-8-1-10 1Z"/>',
  cells:'<circle cx="8" cy="9" r="6"/><circle cx="16" cy="16" r="6"/><circle cx="7" cy="8" r="1.5"/><circle cx="17" cy="17" r="1.5"/>',
  share:'<path d="M12 16V3m-5 5 5-5 5 5M5 13v8h14v-8"/>',
  expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M8 8l-5-5m13 5 5-5M8 16l-5 5m13-5 5 5"/>',
  zoom:'<circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6M10 7v6M7 10h6"/>',
  pause:'<path d="M8 5v14M16 5v14"/>',
  play:'<path d="m8 4 12 8-12 8V4Z"/>',
  video:'<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m10 8 6 4-6 4V8Z"/>',
  spark:'<path d="m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7L12 2Z"/>'
};
const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.dna}</svg>`;
document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));
const categories = {
  basics:{title:'Podstawy DNA',short:'Podstawy DNA',icon:'dna',description:'Zacznij od podstaw: czym jest DNA, jak działają geny i w jaki sposób chromosomy przechowują informację genetyczną.'},
  processes:{title:'Jak to działa',short:'Jak to działa',icon:'orbit',description:'Skąd bierze się DNA, jak komórka je kopiuje i jak wykorzystuje informację genetyczną do tworzenia białek. Krok po kroku.'},
  inheritance:{title:'Dziedziczenie',short:'Dziedziczenie',icon:'branch',description:'Dlaczego przypominamy rodziców, skąd biorą się nowe warianty DNA i jak dziedziczymy cechy.'},
  diseases:{title:'Choroby genetyczne',short:'Choroby',icon:'heart',description:'Jak zmiany genów i chromosomów wiążą się ze zdrowiem. Przyczyny, cechy i sposoby dziedziczenia — prostym językiem.'},
  research:{title:'Badania genetyczne',short:'Badania',icon:'microscope',description:'Czego można się dowiedzieć z badania genetycznego, jak odczytuje się DNA i czym badania przesiewowe różnią się od diagnostyki.'}
};
const topics = {
  'dna-structure':{label:'Budowa DNA',group:'dna',icon:'dna',description:'Nukleotydy, pary zasad i sposób upakowania informacji w komórce.'},
  'dna-types':{label:'Rodzaje DNA',group:'dna',icon:'dna',description:'DNA jądrowe, mitochondrialne i plazmidy — różne miejsca przechowywania informacji.'},
  'gene-expression':{label:'Geny i białka',group:'dna',icon:'orbit',description:'Od zapisu genu do RNA i białka. Poznaj transkrypcję, translację i składanie RNA.'},
  'cell-division':{label:'Podziały komórkowe',group:'dna',icon:'cells',description:'Jak komórki dzielą się, kopiują DNA i przekazują chromosomy.'},
  'inheritance-patterns':{label:'Sposoby dziedziczenia',group:'dna',icon:'branch',description:'Różne drogi przekazywania informacji genetycznej i znaczenie rodzinnej historii.'},
  mutations:{label:'Mutacje genetyczne',group:'dna',icon:'spark',description:'Czym są zmiany DNA i jakie mają rodzaje.'},
  'mutation-effects':{label:'Skutki mutacji genetycznych',group:'dna',icon:'spark',description:'Jak zmiany DNA wpływają na białka, cechy i zdrowie.'},
  'chromosomal-effects':{label:'Skutki mutacji chromosomowych',group:'dna',icon:'spark',description:'Co zmienia liczba lub budowa chromosomów.'},
  'mutation-causes':{label:'Przyczyny mutacji',group:'dna',icon:'spark',description:'Błędy kopiowania DNA i działanie mutagenów.'},
  epigenetics:{label:'Epigenetyka',group:'dna',icon:'leaf',description:'Jak komórki regulują aktywność genów oraz jak wiążą się z tym środowisko i rozwój.'},
  testing:{label:'Badania i diagnostyka',group:'dna',icon:'microscope',description:'Możliwości i ograniczenia testów, sekwencjonowania i badań przesiewowych.'},
  biotechnology:{label:'Biotechnologia',group:'dna',icon:'microscope',description:'PCR, CRISPR i terapia genowa — narzędzia współczesnej biologii.'},
  chromosomal:{label:'Choroby chromosomowe',group:'diseases',icon:'cells',description:'Zmiany liczby lub budowy chromosomów i ich różnorodne następstwa.'},
  neurological:{label:'Układ nerwowy i mięśnie',group:'diseases',icon:'branch',description:'Genetyczne choroby wpływające na rozwój, układ nerwowy lub pracę mięśni.'},
  blood:{label:'Choroby krwi',group:'diseases',icon:'heart',description:'Genetyczne zmiany krwinek, hemoglobiny i krzepnięcia.'},
  metabolic:{label:'Choroby metaboliczne',group:'diseases',icon:'orbit',description:'Choroby związane z przemianami substancji i aktywnością enzymów.'},
  connective:{label:'Tkanka łączna i kości',group:'diseases',icon:'branch',description:'Genetyka budowy kości, tkanki łącznej i ich wytrzymałości.'},
  mitochondrial:{label:'Mitochondria',group:'diseases',icon:'orbit',description:'DNA mitochondrialne, jego dziedziczenie i choroby związane z mitochondriami.'},
  sensory:{label:'Wzrok i słuch',group:'diseases',icon:'spark',description:'Dziedziczne choroby wpływające na widzenie, słyszenie lub oba zmysły.'},
  cancer:{label:'Predyspozycje do nowotworów',group:'diseases',icon:'dna',description:'Warianty genetyczne zwiększające ryzyko nowotworów. Predyspozycja nie oznacza pewności zachorowania.'},
  organs:{label:'Nerki i inne narządy',group:'diseases',icon:'heart',description:'Choroby genetyczne wpływające na nerki i funkcjonowanie innych narządów.'}
};
const $ = (id) => document.getElementById(id);
const escapeHTML = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let articles = [], visuals = [], visualLoadError = false, visualQuery = '', saved = new Set(), currentRoute = 'home', previousRoute = 'home', diseaseFilter = 'all', toastTimer, searchTimer;
const viewStates = new Map();
let currentArticleId = null;
const study = () => window.GenomStudy || null;
const laboratory = () => window.GenomLab || null;
const videoLibrary = () => window.GenomVideos || null;
const school = () => window.GenomSchool || null;
const schoolTests = () => window.GenomTests || null;
let initializedTestCurriculum = null;
const hasRead = (id) => Boolean(study()?.isRead?.(id));
const PAGE_SIZE = 24;
function stateFor(key=currentRoute){if(!viewStates.has(key))viewStates.set(key,{topic:'all',category:'all',sort:'default',limit:PAGE_SIZE,disease:'all'});return viewStates.get(key);}
const hasTopic = (article,id) => (article.topics || []).includes(id);
const topicCount = (id,items=articles) => items.filter(a=>hasTopic(a,id)).length;
try { saved = new Set(JSON.parse(localStorage.getItem('genom-saved') || '[]')); } catch {}
try { if(localStorage.getItem('genom-large') === 'true') document.body.classList.add('large-text'); } catch {}
$('textSize').setAttribute('aria-pressed',String(document.body.classList.contains('large-text')));
const articleById = (id) => articles.find(a => a.id === id);
function updateCount(){ $('savedCount').textContent = saved.size; }
updateCount();

const motionQuery = typeof matchMedia==='function' ? matchMedia('(prefers-reduced-motion: reduce)') : {matches:false};
let motionChoice = null;
try { motionChoice = localStorage.getItem('genom-motion'); } catch {}
function applyMotionPreference(){
  const reduced=Boolean(motionQuery.matches),paused=reduced||motionChoice==='paused';
  document.body.classList.toggle('reduced-motion',reduced);
  document.body.classList.toggle('motion-paused',paused);
  const button=$('motionToggle');
  if(button){button.setAttribute('aria-pressed',String(paused));button.disabled=reduced;button.setAttribute('aria-label',reduced?'Animacje wyłączone zgodnie z ustawieniami systemu':paused?'Wznów animacje':'Wstrzymaj animacje');button.title=reduced?'Animacje wyłączone zgodnie z ustawieniami systemu':paused?'Wznów animacje':'Wstrzymaj animacje';button.innerHTML=icon(paused?'play':'pause');}
}
applyMotionPreference();
if(motionQuery.addEventListener)motionQuery.addEventListener('change',applyMotionPreference);
else if(motionQuery.addListener)motionQuery.addListener(applyMotionPreference);
$('motionToggle')?.addEventListener('click',()=>{if(motionQuery.matches)return;motionChoice=document.body.classList.contains('motion-paused')?'playing':'paused';try{localStorage.setItem('genom-motion',motionChoice);}catch{}applyMotionPreference();showToast(motionChoice==='paused'?'Animacje wstrzymane':'Animacje włączone');});
function updateBackToTop(){const button=$('backToTop');if(button)button.hidden=(window.scrollY||document.documentElement?.scrollTop||0)<500;}
$('backToTop')?.addEventListener('click',()=>{$('main').scrollIntoView({behavior:document.body.classList.contains('motion-paused')?'instant':'smooth',block:'start'});$('main').focus({preventScroll:true});});
window.addEventListener('scroll',updateBackToTop,{passive:true});
updateBackToTop();

function helix(){
  const elements = [];
  const point=(t, side)=>{const angle=t*.49+side*Math.PI;return {x:230+t*4.7+73*Math.cos(angle),y:183+t*12+23*Math.sin(angle),z:Math.sin(angle)};};
  for(let i=-13;i<=13;i++){
    const a=point(i,0),b=point(i,1),m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    elements.push({z:0,html:`<path d="M${a.x} ${a.y}L${m.x} ${m.y}" stroke="#c7784b" stroke-width="5.5"/><path d="M${m.x} ${m.y}L${b.x} ${b.y}" stroke="#b6b6a0" stroke-width="5.5"/>`});
    for(let side=0;side<2;side++){
      const p=point(i,side),n=point(i+1,side),orange=side===0;
      if(i<13) elements.push({z:(p.z+n.z)/2,html:`<path d="M${p.x} ${p.y}Q${p.x+(n.x-p.x)*.58} ${p.y+3} ${n.x} ${n.y}" fill="none" stroke="${orange?'#c0633f':'#747e6d'}" stroke-width="7"/>`});
      elements.push({z:p.z,html:`<circle cx="${p.x}" cy="${p.y}" r="${7.6+p.z*1.2}" fill="url(#${orange?'orangeBall':'greenBall'})" filter="url(#sphereShadow)"/>`});
    }
  }
  elements.sort((a,b)=>a.z-b.z);
  return `<svg viewBox="0 0 440 365" aria-hidden="true"><defs><radialGradient id="visualBg"><stop stop-color="#faf7ed"/><stop offset="1" stop-color="#ecebdf"/></radialGradient><radialGradient id="orangeBall" cx="32%" cy="27%"><stop stop-color="#efbb84"/><stop offset=".45" stop-color="#d88b55"/><stop offset="1" stop-color="#a94c2c"/></radialGradient><radialGradient id="greenBall" cx="31%" cy="27%"><stop stop-color="#e8e8cd"/><stop offset=".5" stop-color="#a4ae92"/><stop offset="1" stop-color="#5e6f57"/></radialGradient><filter id="sphereShadow" x="-70%" y="-70%" width="240%" height="240%"><feDropShadow dx="1.7" dy="2" stdDeviation="1.8" flood-color="#4f452e" flood-opacity=".23"/></filter><filter id="blurShadow"><feGaussianBlur stdDeviation="14"/></filter><pattern id="dotPattern" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".6" fill="#91977c" opacity=".15"/></pattern></defs><rect width="440" height="365" fill="url(#visualBg)"/><rect width="440" height="365" fill="url(#dotPattern)"/><circle cx="227" cy="185" r="128" fill="none" stroke="#d3d7c5" stroke-width=".6"/><circle cx="227" cy="185" r="158" fill="none" stroke="#d9dcca" stroke-width=".6" stroke-dasharray="2 5"/><ellipse cx="247" cy="310" rx="80" ry="13" fill="#7f8061" opacity=".15" filter="url(#blurShadow)"/><g transform="rotate(24 225 182)" stroke-linecap="round">${elements.map(x=>x.html).join('')}</g><g fill="none" stroke="#969d84" stroke-width=".7"><path d="M109 103H68v22"/><circle cx="109" cy="103" r="2"/><path d="M319 249h49v-18"/><circle cx="319" cy="249" r="2"/></g><g font-family="monospace" font-size="9" fill="#858d76"><text x="53" y="141">A — T</text><text x="351" y="220">C — G</text><text x="26" y="193" fill="#adb29f" font-size="7">01</text><text x="402" y="193" fill="#adb29f" font-size="7">02</text></g></svg>`;
}

function tabs(selected='all'){
  return `<nav class="tabs" aria-label="Tematy encyklopedii"><a class="tab ${selected==='all'?'active':''}" href="#home" ${selected==='all'?'aria-current="page"':''}>Wszystkie tematy</a>${Object.entries(categories).map(([key,c])=>`<a class="tab ${selected===key?'active':''}" href="#category/${key}" ${selected===key?'aria-current="page"':''}>${c.short}</a>`).join('')}</nav>`;
}
function card(article, index=0){
  return `<article class="article-card"><div class="card-top"><div class="card-drawing">${icon(article.id==='chromosomes'?'cells':categories[article.category].icon)}</div><div class="card-top-meta"><span class="article-read-badge" data-read-badge="${article.id}" ${hasRead(article.id)?'':'hidden'}>${icon('check')} Przeczytane</span><span class="card-number">${String(index+1).padStart(2,'0')}</span></div></div><h3><a href="#article/${article.id}">${escapeHTML(article.title)}</a></h3><p>${escapeHTML(article.summary)}</p><div class="card-footer"><span>${icon('clock')}${article.minutes} min czytania <span>·</span> ${categories[article.category].short}</span><button class="card-bookmark ${saved.has(article.id)?'saved':''}" data-save="${article.id}" aria-label="${saved.has(article.id)?'Usuń z zakładek':'Dodaj do zakładek'}: ${escapeHTML(article.title)}" aria-pressed="${saved.has(article.id)}">${icon('bookmark')}</button></div></article>`;
}
const grid = (items, extra='') => `<div class="article-grid ${extra}">${items.map(card).join('')}</div>`;
function topicExplorer(){
  return `<section class="topic-explorer"><div class="section-heading"><h2>Wybierz swój temat <span>${Object.keys(topics).length} zakładek</span></h2><a href="#topics">Pełny spis tematów ${icon('arrow')}</a></div><div class="topic-groups">${[['dna','DNA i genetyka'],['diseases','Choroby i zdrowie']].map(([group,label])=>`<div class="topic-group"><h3>${label}</h3><div class="topic-links">${Object.entries(topics).filter(([,t])=>t.group===group).map(([id,t])=>`<a class="topic-chip" href="#topic/${id}">${t.label}<span>${topicCount(id)}</span></a>`).join('')}</div></div>`).join('')}</div></section>`;
}
function topicDirectory(){
  return intro('MAPA ENCYKLOPEDII','Tematy od A do Z',`Wybierz jedną z ${Object.keys(topics).length} zakładek. Tematy łączą powiązane artykuły, więc jeden tekst może należeć do kilku grup.`)+[['dna','DNA i genetyka'],['diseases','Choroby i zdrowie']].map(([group,label])=>`<section class="topic-group"><div class="section-heading"><h2>${label}</h2></div><div class="topic-directory">${Object.entries(topics).filter(([,t])=>t.group===group).sort((a,b)=>a[1].label.localeCompare(b[1].label,'pl')).map(([id,t])=>`<a class="topic-tile" href="#topic/${id}"><span>${icon(t.icon)}</span><h3>${t.label}</h3><p>${t.description}</p><span class="directory-count">${topicCount(id)} ${articleWord(topicCount(id))} →</span></a>`).join('')}</div></section>`).join('');
}
function topicChips(items, selected='all'){
  const available=Object.entries(topics).filter(([id])=>topicCount(id,items));
  return `<div class="topic-links" role="group" aria-label="Filtruj według tematu"><button class="topic-chip ${selected==='all'?'active':''}" data-topic-filter="all" aria-pressed="${selected==='all'}">Wszystkie<span>${items.length}</span></button>${available.map(([id,t])=>`<button class="topic-chip ${selected===id?'active':''}" data-topic-filter="${id}" aria-pressed="${selected===id}">${t.label}<span>${topicCount(id,items)}</span></button>`).join('')}</div>`;
}
function sortItems(items,sort){return sort==='az'?[...items].sort((a,b)=>a.title.localeCompare(b.title,'pl')):items;}
function sortControl(state,search=false){return `<label class="control-label">Kolejność<select class="catalogue-select" data-result-sort><option value="default" ${state.sort==='default'?'selected':''}>${search?'Najtrafniejsze':'Polecana'}</option><option value="az" ${state.sort==='az'?'selected':''}>Alfabetycznie A–Z</option></select></label>`;}
function pagedResults(items,key=currentRoute){
  const state=stateFor(key),shown=items.slice(0,state.limit);
  return grid(shown)+`<div class="load-more-wrap"><p class="result-summary" role="status">Wyświetlono ${shown.length} z ${items.length} artykułów</p>${shown.length<items.length?`<button class="primary-button" data-load-more="${escapeHTML(key)}">Pokaż kolejne ${Math.min(PAGE_SIZE,items.length-shown.length)} ${icon('arrow')}</button>`:''}</div>`;
}
function visualById(id){return visuals.find(v=>v.id===id);}
function visualForArticle(article){return visuals.find(v=>v.id===article.id&&v.articleIds.includes(article.id))||visuals.find(v=>v.articleIds.includes(article.id));}
function visualLessons(visual){try{const lessons=school()?.getData?.()?.lessons||[];return (Array.isArray(visual.lessonIds)?visual.lessonIds:[]).map(id=>lessons.find(lesson=>lesson.id===id)).filter(Boolean);}catch{return [];}}
function illustrationWord(n){return n===1?'ilustracja':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'ilustracje':'ilustracji';}
function miniLessonWord(n){return n===1?'mini-lekcja':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'mini-lekcje':'mini-lekcji';}
function visualCard(visual){
  const linked=visual.articleIds.map(articleById).filter(Boolean),lessons=visualLessons(visual);
  const link=linked.length?`<a class="quiet-link" href="#article/${linked[0].id}">Czytaj artykuł ${icon('arrow')}</a>`:lessons.length?`<a class="quiet-link" href="#lesson/${escapeHTML(lessons[0].id)}">Otwórz mini-lekcję ${icon('arrow')}</a>`:`<a class="quiet-link" href="#library">Poznaj temat ${icon('arrow')}</a>`;
  const count=linked.length?`${linked.length} ${articleWord(linked.length)}`:lessons.length?`${lessons.length} ${miniLessonWord(lessons.length)}`:'';
  return `<article class="visual-card"><button class="visual-card-image" type="button" data-enlarge-visual="${escapeHTML(visual.id)}" aria-label="Powiększ ilustrację: ${escapeHTML(visual.title)}"><img src="${escapeHTML(visual.src)}" alt="${escapeHTML(visual.alt)}" width="800" height="460" loading="lazy" decoding="async"><span class="visual-zoom-badge" aria-hidden="true">${icon('zoom')} Powiększ</span></button><div class="visual-card-copy"><p class="visual-term">${escapeHTML(visual.term)}</p><h3>${escapeHTML(visual.title)}</h3><p>${escapeHTML(visual.summary)}</p><div class="visual-card-actions">${link}<span>${count}</span></div></div></article>`;
}
function visualPreview(){
  if(!visuals.length)return '';
  const preferred=['dna-helix','gene-expression','recessive','chromosome'].map(visualById).filter(Boolean);
  const selected=[...preferred,...visuals.filter(v=>!preferred.includes(v))].slice(0,4);
  return `<section class="visual-preview"><div class="section-heading"><h2>Zobacz, zrozum, zapamiętaj <span>${visuals.length} ${illustrationWord(visuals.length)}</span></h2><a href="#visuals">Atlas ilustracji ${icon('arrow')}</a></div><p class="visual-section-description">Duże schematy i krótkie wyjaśnienia. Kliknij ilustrację, aby przyjrzeć się szczegółom.</p><div class="visual-grid visual-preview-grid">${selected.map(visualCard).join('')}</div></section>`;
}
function filteredVisuals(query=visualQuery){const words=normalize(query).split(/\s+/).filter(Boolean);return visuals.filter(v=>{const text=normalize(v.term+' '+v.title+' '+v.summary+' '+v.articleIds.map(articleById).filter(Boolean).map(a=>a.title+' '+a.keywords.join(' ')).join(' ')+' '+visualLessons(v).map(lesson=>lesson.title).join(' '));return words.every(word=>text.includes(word));});}
function visualResults(){
  const items=filteredVisuals();
  return items.length?`<div class="visual-grid">${items.map(visualCard).join('')}</div>`:`<div class="empty-state"><span>${icon('search')}</span><h2>Nie ma ilustracji dla tego hasła</h2><p>Spróbuj słowa „DNA”, „ekosystem”, „ewolucja” lub „mutacje”.</p><button class="quiet-link" type="button" data-clear-visual-search>Wyczyść filtr ${icon('arrow')}</button></div>`;
}
function atlasPage(){
  const introText=intro('NAUKA W OBRAZACH','Atlas ilustracji',`Ilustracje (${visuals.length}) pomagają zrozumieć biologię. Otwórz schemat w powiększeniu lub przejdź do powiązanej lekcji albo artykułu.`);
  if(visualLoadError)return intro('NAUKA W OBRAZACH','Atlas ilustracji','Schematy pomagają zobaczyć to, co trudno opisać samymi słowami.')+`<div class="empty-state"><span>${icon('book')}</span><h2>Nie udało się wczytać ilustracji</h2><p>Artykuły są nadal dostępne. Sprawdź połączenie i spróbuj ponownie.</p><button class="primary-button" type="button" data-retry-visuals>Wczytaj ilustracje ponownie ${icon('arrow')}</button></div>`;
  return introText+`<div class="visual-filter-row"><label class="visual-search"><span>Szukaj ilustracji</span><span class="visual-search-field">${icon('search')}<input type="search" data-visual-search value="${escapeHTML(visualQuery)}" placeholder="Np. DNA, ekosystem, ewolucja…" aria-label="Szukaj w atlasie ilustracji" aria-controls="visualResults" autocomplete="off"></span></label><p class="visual-count" id="visualResultCount" role="status">${filteredVisuals().length} ${illustrationWord(filteredVisuals().length)}</p></div><div id="visualResults">${visualResults()}</div>`;
}
function updateVisualResults(){const results=$('visualResults');if(results)results.innerHTML=visualResults();const count=$('visualResultCount');if(count)count.textContent=`${filteredVisuals().length} ${illustrationWord(filteredVisuals().length)}`;}
function articleVisual(article){
  const visual=visualForArticle(article);
  if(!visual)return '';
  return `<figure class="article-visual" id="readerDiagram"><button class="article-visual-image" type="button" data-enlarge-visual="${escapeHTML(visual.id)}" aria-label="Powiększ ilustrację: ${escapeHTML(visual.title)}"><img src="${escapeHTML(visual.src)}" alt="${escapeHTML(visual.alt)}" width="800" height="460" decoding="async"><span class="visual-zoom-badge" aria-hidden="true">${icon('zoom')} Powiększ</span></button><figcaption class="article-visual-caption"><strong>${escapeHTML(visual.title)}</strong><p>${escapeHTML(visual.summary)}</p></figcaption></figure>`;
}
function openVisual(id){
  const visual=visualById(id),dialog=$('visualDialog'),content=$('visualContent');
  if(!visual||!dialog||!content)return;
  clearTimeout(searchTimer);hideSuggestions();
  const linked=visual.articleIds.map(articleById).filter(Boolean),lessons=visualLessons(visual);
  content.innerHTML=`<header class="visual-lightbox-header"><div><span class="eyebrow">ATLAS ILUSTRACJI</span><h2 id="visualTitle" tabindex="-1">${escapeHTML(visual.title)}</h2></div><div class="visual-zoom-controls"><button class="reader-action" type="button" data-visual-zoom aria-controls="visualImageViewport" aria-pressed="false">${icon('zoom')}<span>Powiększ 2×</span></button><button class="icon-button" type="button" data-close-visual aria-label="Zamknij powiększenie">${icon('close')}</button></div></header><div class="visual-lightbox-body"><div class="visual-image-viewport" id="visualImageViewport" tabindex="0" aria-label="Ilustracja; po powiększeniu przewijaj, aby zobaczyć szczegóły"><img src="${escapeHTML(visual.src)}" alt="${escapeHTML(visual.alt)}" width="800" height="460" decoding="async"></div><div class="visual-lightbox-caption"><p>${escapeHTML(visual.summary)}</p><span>Schemat poglądowy — elementy nie są pokazane w rzeczywistej skali.</span></div>${linked.length||lessons.length?`<nav class="visual-article-links" aria-label="Materiały powiązane z ilustracją"><strong>Dowiedz się więcej</strong>${linked.map(a=>`<a href="#article/${a.id}">${escapeHTML(a.title)} ${icon('arrow')}</a>`).join('')}${lessons.map(lesson=>`<a href="#lesson/${escapeHTML(lesson.id)}">Mini-lekcja: ${escapeHTML(lesson.title)} ${icon('arrow')}</a>`).join('')}</nav>`:''}</div>`;
  dialog.setAttribute('aria-labelledby','visualTitle');
  if(!dialog.open)dialog.showModal();
  dialog.scrollTop=0;$('visualTitle')?.focus({preventScroll:true});
}
function closeVisual(){const dialog=$('visualDialog');if(dialog?.open)dialog.close();}
function loadVisuals(){
  return fetch('visuals.json').then(r=>{if(!r.ok)throw new Error('Illustrations unavailable');return r.json();}).then(data=>{if(!Array.isArray(data)||!data.every(v=>typeof v.id==='string'&&typeof v.src==='string'&&typeof v.title==='string'&&typeof v.term==='string'&&typeof v.summary==='string'&&typeof v.alt==='string'&&Array.isArray(v.articleIds)))throw new Error('Invalid illustrations');visuals=data;visualLoadError=false;return true;}).catch(()=>{visuals=[];visualLoadError=true;return false;});
}
function studyTeaser(){
  try{return study()?.homePanel?.()||'';}catch{return '';}
}
const mutationTopicIds=['mutations','mutation-effects','chromosomal-effects','mutation-causes'];
function mutationTopicCards(){
  return `<div class="mutation-topic-grid">${mutationTopicIds.map((id,index)=>{const topic=topics[id];return `<a class="mutation-topic-card" href="#topic/${id}"><span class="mutation-topic-number" aria-hidden="true">0${index+1}</span><div class="mutation-topic-copy"><h3>${escapeHTML(topic.label)}</h3><p>${escapeHTML(topic.description)}</p></div>${icon('arrow')}</a>`;}).join('')}</div>`;
}
function mutationsPage(){
  return intro('DNA I ZMIANY','Mutacje genetyczne','Poznaj rodzaje mutacji, ich przyczyny i skutki.')+`<section class="mutation-topic-section" aria-label="Tematy o mutacjach">${mutationTopicCards()}</section>`;
}
const schoolUnits = [
  {id:'genetics',title:'DNA i genetyka',icon:'dna',summary:'DNA, dziedziczenie i mutacje.'},
  {id:'evolution',title:'Ewolucja życia',icon:'branch',summary:'Wspólne pochodzenie i dobór naturalny.'},
  {id:'ecology',title:'Ekologia',icon:'leaf',summary:'Organizmy, zależności i ekosystemy.'},
  {id:'environment',title:'Człowiek i środowisko',icon:'heart',summary:'Różnorodność biologiczna i jej ochrona.'}
];
function schoolHomeCards(){
  try{const html=school()?.homeCards?.();if(html)return html;}catch{}
  return `<div class="school-grid school-home-grid">${schoolUnits.map(unit=>`<a class="school-card school-card-link" href="#course/${unit.id}"><span class="school-card-icon">${icon(unit.icon)}</span><h3>${unit.title}</h3><p>${unit.summary}</p><span class="quiet-link">Otwórz dział ${icon('arrow')}</span></a>`).join('')}</div>`;
}
function home(){
  return `<section class="hero hero-upgrade hero-simple hero-school home-welcome"><div class="hero-media hero-gif" aria-hidden="true"></div><div class="hero-shade"></div><div class="hero-copy"><div class="eyebrow"><span class="line"></span>BIOLOGIA · KLASA 8</div><h1>Witaj w świecie<br><em>biologii.</em></h1><p>Zrozum życie, temat po temacie. Odkrywaj genetykę, ewolucję, ekologię i środowisko w swoim tempie.</p><div class="hero-actions"><button class="home-choose-button" type="button" data-home-choose aria-controls="homeTopicOptions" aria-expanded="false">${icon('grid')}<span data-home-choose-label>Wybierz temat</span>${icon('arrow')}</button></div></div><div class="home-scroll-hint" aria-hidden="true"><span>Przewiń w dół</span>${icon('arrow')}</div></section><section id="homeTopics" class="school-home-section home-topic-picker" tabindex="-1" aria-labelledby="homeSchoolTitle"><div class="eyebrow"><span class="line"></span>TWÓJ NASTĘPNY KROK</div><div class="section-heading"><h2 id="homeSchoolTitle" tabindex="-1">Czego chcesz się nauczyć?</h2></div><div id="homeTopicOptions" class="home-topic-options" inert aria-hidden="true"><div class="home-topic-options-inner">${schoolHomeCards()}</div></div></section>`;
}
function dnaPage(){
  return `<section class="hero hero-upgrade hero-simple"><div class="hero-media hero-gif" aria-hidden="true"></div><div class="hero-shade"></div><div class="hero-copy"><div class="eyebrow"><span class="line"></span>DNA I GENETYKA</div><h1>DNA i genetyka.<br><em>W jednym miejscu.</em></h1><p>Lekcje, artykuły i schematy o dziedziczeniu.</p><div class="hero-actions"><a href="#course/genetics" class="primary-button">Ucz się genetyki ${icon('arrow')}</a></div></div></section><section class="mutation-topic-section" aria-labelledby="dnaMutationTitle"><div class="section-heading"><h2 id="dnaMutationTitle">Mutacje genetyczne</h2></div>${mutationTopicCards()}</section><section class="dna-resource-section"><div class="section-heading"><h2>Materiały do nauki</h2></div><div class="dna-resource-links">${[['library','Encyklopedia DNA','book'],['lab','Laboratorium DNA','orbit'],['visuals','Atlas ilustracji','spark'],['videos','Wideo','video']].map(([route,label,name])=>`<a class="dna-resource-link" href="#${route}">${icon(name)}<span>${label}</span>${icon('arrow')}</a>`).join('')}</div></section><section class="dna-basics"><h2>Podstawy DNA</h2><div class="dna-basics-links">${['dna','gene','chromosomes'].map(articleById).filter(Boolean).map(article=>`<a href="#article/${article.id}">${escapeHTML(article.title)} ${icon('arrow')}</a>`).join('')}</div></section>`;
}

function empty(title, description, type='search'){
  return `<div class="empty-state"><span>${icon(type)}</span><h2>${title}</h2><p>${description}</p><a class="quiet-link" href="#library">Zobacz wszystkie artykuły ${icon('arrow')}</a></div>`;
}
function intro(label,title,description){return `<div class="page-intro"><div class="eyebrow"><span class="line"></span>${label}</div><h1>${escapeHTML(title)}</h1><p>${escapeHTML(description)}</p></div>`;}
function catalogue(category,topicId){
  const c=categories[category],topic=topics[topicId],state=stateFor();
  let base=c?articles.filter(a=>a.category===category):articles;
  if(topic)base=base.filter(a=>hasTopic(a,topicId));
  let items=state.topic==='all'||topic?base:base.filter(a=>hasTopic(a,state.topic));
  if(category==='diseases' && diseaseFilter!=='all')items=items.filter(a=>a.diseaseType===diseaseFilter);
  items=sortItems(items,state.sort);
  const heading=topic?.label||c?.title||'Wszystkie artykuły';
  const description=topic?.description||c?.description||'Od budowy cząsteczki do współczesnych badań. Korzystaj z zakładek tematycznych i znajdź interesujący Cię tekst.';
  const relatedTopics=topic?Object.entries(topics).filter(([id,t])=>id!==topicId&&t.group===topic.group).slice(0,4):[];
  return intro(topic?'ZAKŁADKA TEMATYCZNA':'OTWARTA ENCYKLOPEDIA',heading,description)+tabs(category||'all')+(topic?`<a class="quiet-link" href="#topics">← Wszystkie zakładki tematyczne</a>`:topicChips(base,state.topic))+(category==='diseases'?`<div class="filter-chips" aria-label="Rodzaj choroby">${[['all','Wszystkie rodzaje'],['monogenic','Jednogenowe'],['chromosomal','Chromosomowe'],['mitochondrial','Mitochondrialne'],['heterogeneous','Zróżnicowane']].map(([key,text])=>`<button class="filter-chip ${diseaseFilter===key?'active':''}" data-disease-filter="${key}" aria-pressed="${diseaseFilter===key}">${text}</button>`).join('')}</div>`:'')+`<div class="catalogue-controls"><p role="status">${items.length} ${articleWord(items.length)}</p>${sortControl(state)}</div>`+(items.length?pagedResults(items):empty('Brak artykułów dla tych filtrów','Wybierz wszystkie tematy lub inny rodzaj choroby.'))+(relatedTopics.length?`<div class="topic-explorer"><div class="section-heading"><h2>Poznaj też</h2></div><div class="topic-links">${relatedTopics.map(([id,t])=>`<a class="topic-chip" href="#topic/${id}">${t.label}<span>${topicCount(id)}</span></a>`).join('')}</div></div>`:'')+(category==='diseases'?`<div class="medical-note">To przegląd wybranych chorób, a nie pełny poradnik medyczny. Choroba genetyczna może być odziedziczona lub pojawić się po raz pierwszy w rodzinie. Grupy tematyczne mogą się pokrywać. Własne pytania o zdrowie omów z lekarzem.</div>`:'');
}
function articleWord(n){return n===1?'artykuł':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'artykuły':'artykułów';}
function normalize(s){return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').replace(/[^a-z0-9]+/g,' ').trim();}
function searchArticles(q){
  const words=normalize(q).split(/\s+/).filter(Boolean);
  if(!words.length)return [];
  const phrase=normalize(q);
  return articles.map(a=>{const title=normalize(a.title),desc=normalize(a.summary+' '+a.keywords.join(' ')),labels=normalize((a.topics||[]).map(id=>topics[id]?.label||'').join(' ')),body=normalize(a.sections.map(s=>s.title+' '+s.body).join(' '));const score=words.reduce((sum,w)=>sum+(title.includes(w)?9:desc.includes(w)?5:labels.includes(w)?3:body.includes(w)?1:0),title===phrase?20:title.includes(phrase)?10:0);return {article:a,score,matched:words.every(w=>title.includes(w)||desc.includes(w)||labels.includes(w)||body.includes(w))};}).filter(r=>r.matched).sort((a,b)=>b.score-a.score||a.article.title.localeCompare(b.article.title,'pl')).map(r=>r.article);
}
function searchSchoolLessons(q){
  const words=normalize(q).split(/\s+/).filter(Boolean);if(!words.length)return [];
  try{
    const data=school()?.getData?.();
    const units=Array.isArray(data?.units)?data.units:[];
    const lessons=Array.isArray(data?.lessons)?data.lessons:[];
    let matches=school()?.searchLessons?.(q);
    if(!Array.isArray(matches))matches=lessons.filter(lesson=>{
      const unit=units.find(item=>item.id===lesson.unitId);
      const text=normalize([lesson.title,unit?.title||'',...(lesson.objectives||[]),...(lesson.sections||[]).map(section=>section.title+' '+section.body),...(lesson.keyTerms||[]).map(term=>term.term+' '+term.definition)].join(' '));
      return words.every(word=>text.includes(word));
    });
    return matches.filter(lesson=>lesson&&typeof lesson.id==='string'&&typeof lesson.title==='string').map(lesson=>({...lesson,unitTitle:units.find(unit=>unit.id===lesson.unitId)?.title||'Biologia — klasa 8'}));
  }catch{return [];}
}
function schoolSearchSection(matches){
  if(!matches.length)return '';
  return `<section class="school-search-section"><div class="section-heading"><h2>Mini-lekcje <span>${matches.length}</span></h2><a href="#learn">Katalog lekcji ${icon('arrow')}</a></div><ul class="school-search-results">${matches.slice(0,8).map(lesson=>`<li><a href="#lesson/${escapeHTML(lesson.id)}"><strong>${escapeHTML(lesson.title)}</strong><span>${escapeHTML(lesson.unitTitle)} · ${Number(lesson.minutes)||4} min</span>${icon('arrow')}</a></li>`).join('')}</ul></section>`;
}
function searchPage(q){
  const all=searchArticles(q),lessonMatches=searchSchoolLessons(q),state=stateFor();
  let results=state.category==='all'?all:all.filter(a=>a.category===state.category);
  const topicBase=results;
  if(state.topic!=='all')results=results.filter(a=>hasTopic(a,state.topic));
  results=sortItems(results,state.sort);
  const topicOptions=Object.entries(topics).filter(([id])=>topicCount(id,topicBase));
  const articleControls=`<div class="search-filter-tabs" role="group" aria-label="Dział wyszukiwania">${[['all','Wszystko'],...Object.entries(categories).map(([id,c])=>[id,c.short])].map(([id,label])=>{const count=id==='all'?all.length:all.filter(a=>a.category===id).length;return `<button class="filter-chip ${state.category===id?'active':''}" data-search-category="${id}" aria-pressed="${state.category===id}" ${count===0&&state.category!==id?'disabled':''}>${label} <span>${count}</span></button>`;}).join('')}</div><div class="catalogue-controls"><label class="control-label">Temat<select class="catalogue-select" data-search-topic><option value="all">Wszystkie tematy</option>${topicOptions.map(([id,t])=>`<option value="${id}" ${state.topic===id?'selected':''}>${t.label} (${topicCount(id,topicBase)})</option>`).join('')}</select></label>${sortControl(state,true)}<p role="status">${results.length} ${articleWord(results.length)}</p></div>`;
  const articleResults=all.length?articleControls+(results.length?pagedResults(results):empty('Brak artykułów dla tych filtrów',lessonMatches.length?'Zmień filtr lub zobacz mini-lekcje powyżej.':'Zmień filtr, aby zobaczyć artykuły.')):lessonMatches.length?'':empty('Nie znaleziono wyników','Spróbuj krótszego zapytania, np. „DNA”, „ekologia” lub „mutacje”.');
  return intro('WYSZUKIWANIE W SERWISIE',q?`Wyniki: „${q}”`:'Co Cię interesuje?','Artykuły i mini-lekcje. Możesz pomijać polskie znaki.')+schoolSearchSection(lessonMatches)+articleResults+`<a class="quiet-link" href="#topics">Przeglądaj wszystkie tematy ${icon('arrow')}</a>`;
}
function hideSuggestions(){const box=$('searchSuggestions');if(box)box.hidden=true;$('searchInput').setAttribute('aria-expanded','false');}
function showSuggestions(){
  const box=$('searchSuggestions'),q=$('searchInput').value.trim();
  if(!box||!q||!articles.length){hideSuggestions();return;}
  const found=searchArticles(q),lessons=searchSchoolLessons(q),articleLimit=lessons.length?3:5;
  box.innerHTML=found.slice(0,articleLimit).map(a=>`<a class="search-suggestion" href="#article/${a.id}"><span class="suggestion-title">${escapeHTML(a.title)}</span><span class="suggestion-category">${categories[a.category].short}</span></a>`).join('')+lessons.slice(0,5-Math.min(found.length,articleLimit)).map(lesson=>`<a class="search-suggestion" href="#lesson/${escapeHTML(lesson.id)}"><span class="suggestion-title">${escapeHTML(lesson.title)}</span><span class="suggestion-category">Mini-lekcja · ${escapeHTML(lesson.unitTitle)}</span></a>`).join('')+(!found.length&&!lessons.length?'<p class="suggestion-category">Brak podpowiedzi. Spróbuj innego słowa.</p>':'')+`<a class="suggestion-footer" href="#search/${encodeURIComponent(q)}">Pokaż wszystkie wyniki (${found.length+lessons.length}) ${icon('arrow')}</a>`;
  box.hidden=false;$('searchInput').setAttribute('aria-expanded','true');
}
function navigate(raw){if(location.hash.slice(1)===raw)route();else location.hash=raw;}
function savedPage(){const items=articles.filter(a=>saved.has(a.id));return intro('TWOJA KOLEKCJA','Moje zakładki','Zapisuj ciekawe artykuły, by wrócić do nich później. Zakładki są przechowywane w tej przeglądarce.')+(items.length?`<div class="results-toolbar"><p>${items.length} ${articleWord(items.length)}</p></div>`+grid(items):empty('Tutaj zapiszesz swoje odkrycia','Kliknij ikonę zakładki w artykule lub na jego karcie.','bookmark'));}
function about(){return intro('O PROJEKCIE','Biologia w jednym miejscu','Genetyka, ewolucja, ekologia oraz człowiek i środowisko — materiały do nauki w klasie 8.')+`<div class="about-copy"><section><h2>Lekcje i powtórki</h2><p>Wybierz dział, przeczytaj mini-lekcję i rozwiąż zadania. Pełne testy pozwalają sprawdzić cały dział albo przekrojowo powtórzyć materiał. Wynik pomaga w nauce; nie jest oficjalną oceną szkolną.</p><p>W osobnej sekcji DNA znajdziesz ${articles.length} ${articleWord(articles.length)}, ${Object.keys(topics).length} tematów, schematy i filmy. Zakładki, ukończone lekcje, odpowiedzi w rozpoczętym teście i wyniki są przechowywane w tej przeglądarce, bez konta.</p></section><section><h2>Źródła wiedzy</h2><p>Zakres szkolnych działów odnosi się do wymagań biologii dla szkoły podstawowej. Przy lekcjach i artykułach znajdziesz źródła do dalszego czytania.</p><div class="source-list"><a href="https://zpe.gov.pl/podstawa-programowa/szkola-podstawowa/biologia" target="_blank" rel="noopener noreferrer">Zintegrowana Platforma Edukacyjna — podstawa programowa biologii <span>↗</span></a><a href="https://medlineplus.gov/genetics/" target="_blank" rel="noopener noreferrer">MedlinePlus Genetics — podstawy genetyki i choroby <span>↗</span></a><a href="https://www.genome.gov/" target="_blank" rel="noopener noreferrer">NHGRI — badania nad genomem człowieka <span>↗</span></a><a href="https://pl.pinterest.com/pin/286330488799846543/" target="_blank" rel="noopener noreferrer">Tło menu: film z Pinteresta — pin Richard Daniel <span>↗</span></a></div></section><section><h2>Wygodna nauka</h2><p>Przycisk „Aa” powiększa tekst, a przycisk animacji zatrzymuje ruch. Klawisz Tab pozwala poruszać się po stronie, „/” otwiera wyszukiwanie. Materiały o zdrowiu mają charakter edukacyjny i nie zastępują konsultacji lekarskiej.</p></section><a class="primary-button" href="#school">Wybierz dział biologii ${icon('arrow')}</a></div>`;}

function setNav(view){document.querySelectorAll('[data-view]').forEach(el=>{const active=el.dataset.view===view;el.classList.toggle('active',active);if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});if(['library','mutations','diseases','topics','lab','quiz','glossary','saved','about'].includes(view))setMoreMenu(true);}
function safeDecode(s){try{return decodeURIComponent(s);}catch{return s;}}
function route(){
  const raw=location.hash.slice(1)||'home';
  const changedRoute=raw!==currentRoute;
  try{videoLibrary()?.close?.();}catch{}
  closeVisual();
  if(raw.startsWith('article/')){
    clearTimeout(searchTimer);hideSuggestions();
    if(!articles.length)return;
    const article=articleById(safeDecode(raw.slice(8)));
    if(!article){location.hash=previousRoute;showToast('Nie znaleziono artykułu');return;}
    if($('pageContent').querySelector('.loading')){$('pageContent').innerHTML=home();setNav('home');}
    openArticle(article);return;
  }
  const wasReader=$('articleDialog').open;
  if(wasReader)$('articleDialog').close();
  if(wasReader&&raw===currentRoute&&currentRoute!=='saved'&&raw!=='home'&&raw!=='learn'&&!raw.startsWith('learn/')){document.title=`${$('breadcrumb').textContent} — Genom`;return;}
  previousRoute=raw;currentRoute=raw;
  let html='', title='Strona główna',view='home';
  const q=raw.startsWith('search/')?safeDecode(raw.slice(7)):'';
  if($('searchInput').value!==q)$('searchInput').value=q;
  $('clearSearch').hidden=!q;
  if(!raw.startsWith('search/'))hideSuggestions();
  if(raw==='category/diseases')diseaseFilter=stateFor(raw).disease;
  if(raw.startsWith('category/')&&categories[raw.slice(9)]){const cat=raw.slice(9);html=catalogue(cat);title=categories[cat].title;view=cat==='diseases'?'diseases':'library';}
  else if(raw==='dna'){html=dnaPage();title='DNA i genetyka';view='dna';}
  else if(raw==='school'||raw.startsWith('course/')){html=renderSchoolPage(raw);title=schoolRouteTitle(raw);view='school';}
  else if(raw==='learn'||raw.startsWith('lesson/')){html=renderSchoolPage(raw);title=schoolRouteTitle(raw);view='learn';}
  else if(raw==='tests'||raw.startsWith('test/')){html=renderTestsPage(raw);title='Testy — biologia 8';view='tests';}
  else if(raw==='visuals'){html=atlasPage();title='Atlas ilustracji';view='visuals';}
  else if(raw==='videos'){html=renderVideosPage(raw);title='Wideo';view='videos';}
  else if(raw==='lab'||raw.startsWith('lab/')){html=renderLearningPage(raw);title='Laboratorium DNA';view='lab';}
  else if(raw.startsWith('learn/')){html=renderLearningPage(raw);title='Ścieżki DNA';view='learn';}
  else if(raw==='quiz'){html=renderLearningPage(raw);title='Sprawdź swoją wiedzę';view='quiz';}
  else if(raw==='glossary'){html=renderLearningPage(raw);title='Słownik pojęć';view='glossary';}
  else if(raw==='mutations'){html=mutationsPage();title='Mutacje genetyczne';view='mutations';}
  else if(raw==='topics'){html=topicDirectory();title='Tematy od A do Z';view='topics';}
  else if(raw.startsWith('topic/')&&topics[raw.slice(6)]){const id=raw.slice(6);html=catalogue(undefined,id);title=topics[id].label;view=mutationTopicIds.includes(id)?'mutations':'topics';}
  else if(raw==='library'){html=catalogue();title='Wszystkie artykuły';view='library';}
  else if(raw==='saved'){html=savedPage();title='Moje zakładki';view='saved';}
  else if(raw==='about'){html=about();title='O projekcie';view='about';}
  else if(raw.startsWith('search/')){html=searchPage(q);title='Szukaj';view='';}
  else{html=home();}
  $('pageContent').innerHTML=html;$('breadcrumb').textContent=title;document.title=`${title} — Genom`;setNav(view);closeMenu(false);
  if(wasReader&&!changedRoute){const previousLink=document.querySelector(`a[href="#article/${currentArticleId}"]`);(previousLink||$('main')).focus({preventScroll:true});}
  else if(changedRoute&&isSchoolNavigation(raw)){
    const heading=$('pageContent').querySelector('h1');
    heading?.setAttribute?.('tabindex','-1');(heading||$('main'))?.focus?.({preventScroll:true});
    $('main')?.scrollIntoView?.({behavior:document.body.classList.contains('motion-paused')?'instant':'smooth',block:'start'});
  }else if(wasReader)$('main')?.focus?.({preventScroll:true});
}

function isSchoolNavigation(raw){return ['home','dna','school','learn','tests'].includes(raw)||raw.startsWith('course/')||raw.startsWith('lesson/')||raw.startsWith('test/')||raw.startsWith('learn/');}
function schoolRouteTitle(raw){
  try{
    const data=school()?.getData?.();
    if(raw.startsWith('course/'))return data?.units?.find(unit=>unit.id===raw.slice(7))?.title||schoolUnits.find(unit=>unit.id===raw.slice(7))?.title||'Dział biologii';
    if(raw.startsWith('lesson/'))return data?.lessons?.find(lesson=>lesson.id===raw.slice(7))?.title||'Mini-lekcja';
  }catch{}
  return raw==='learn'?'Mini-lekcje':'Biologia — klasa 8';
}
function renderSchoolPage(raw){
  try{if(school()?.render)return school().render(raw);}catch{}
  return intro('BIOLOGIA — KLASA 8',schoolRouteTitle(raw),'Lekcje są chwilowo niedostępne. Pozostałe materiały nadal działają.')+empty('Nie udało się wczytać lekcji','Odśwież stronę lub otwórz encyklopedię DNA.','book');
}
function renderTestsPage(raw){
  try{ensureSchoolTests();if(schoolTests()?.render)return schoolTests().render(raw);}catch{}
  return intro('SPRAWDŹ WIEDZĘ','Testy — biologia 8','Testy są chwilowo niedostępne. Możesz skorzystać z lekcji i encyklopedii.')+empty('Nie udało się wczytać testów','Odśwież stronę lub wróć do materiałów.','check');
}
function ensureSchoolTests(){
  const module=schoolTests(),curriculum=school()?.getData?.()||null;
  if(!module?.init)return;
  if(curriculum&&curriculum!==initializedTestCurriculum){module.init({curriculum,navigate});initializedTestCurriculum=curriculum;}
  else if(!curriculum&&!initializedTestCurriculum)module.init({curriculum:null,navigate});
}
function renderVideosPage(raw){
  try{if(videoLibrary()?.render)return videoLibrary().render(raw);}catch{}
  return intro('ZOBACZ I ZROZUM','Wideo','Materiały filmowe pomagają poznać DNA, geny i dziedziczenie.')+empty('Nie udało się wczytać filmów','Odśwież stronę albo poznaj temat w artykułach.','video');
}
function renderLearningPage(raw){
  try{
    const module=raw==='lab'||raw.startsWith('lab/')?laboratory():study();
    if(module?.render)return module.render(raw);
  }catch{}
  return intro('ODKRYWAJ W SWOIM TEMPIE',raw==='lab'||raw.startsWith('lab/')?'Laboratorium DNA':'Strefa nauki','Nie udało się wczytać tej części. Artykuły i ilustracje są nadal dostępne.')+empty('Nauka nadal jest na wyciągnięcie ręki','Odśwież stronę lub poznaj temat w encyklopedii.','book');
}
function readButton(id,extra=''){
  const read=hasRead(id);
  return `<button class="reader-read ${read?'is-read':''} ${extra}" type="button" data-mark-read="${id}" aria-pressed="${read}" aria-label="${read?'Cofnij oznaczenie artykułu jako przeczytanego':'Oznacz artykuł jako przeczytany'}">${icon('check')}<span>${read?'Przeczytane':'Oznacz jako przeczytane'}</span></button>`;
}
function updateReadUI(){
  document.querySelectorAll('[data-read-badge]').forEach(el=>el.hidden=!hasRead(el.dataset.readBadge));
  document.querySelectorAll('[data-mark-read]').forEach(el=>{
    const read=hasRead(el.dataset.markRead);el.classList.toggle('is-read',read);el.setAttribute('aria-pressed',String(read));el.setAttribute('aria-label',read?'Cofnij oznaczenie artykułu jako przeczytanego':'Oznacz artykuł jako przeczytany');const label=el.querySelector('span');if(label)label.textContent=read?'Przeczytane':'Oznacz jako przeczytane';
  });
}
function updateReaderProgress(){
  const dialog=$('articleDialog'),progress=$('readerProgress'),text=$('readerProgressText');if(!dialog?.open||!progress)return;
  const available=Math.max(0,(dialog.scrollHeight||0)-(dialog.clientHeight||0));
  const value=available>0?Math.max(0,Math.min(100,Math.round(((dialog.scrollTop||0)/available)*100))):100;
  progress.value=value;progress.setAttribute('aria-valuenow',String(value));if(text)text.textContent=value+'%';
}
function toggleReaderFocus(){
  const dialog=$('articleDialog'),focused=dialog.classList.toggle('reader-focus');
  try{localStorage.setItem('genom-reader-focus',String(focused));}catch{}
  const button=document.querySelector('[data-reader-focus]');if(button){button.setAttribute('aria-pressed',String(focused));button.setAttribute('aria-label',focused?'Wyłącz tryb skupienia':'Włącz tryb skupienia');}
}
async function copyArticleLink(id){
  const url=String(location.href||'').split('#')[0]+'#article/'+encodeURIComponent(id);
  try{
    if(typeof navigator==='undefined'||!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(url);showToast('Link do artykułu skopiowany');
  }catch{showToast('Link do artykułu znajdziesz w pasku adresu przeglądarki');}
}
async function initLearning(){
  try{if(study()?.init)await study().init({articles,navigate,onProgress:updateReadUI});}catch{}
  try{if(laboratory()?.init)laboratory().init({navigate});}catch{}
  try{if(videoLibrary()?.init)await videoLibrary().init({articles,navigate});}catch{}
  try{if(school()?.init)await school().init({articles,visuals,navigate});}catch{}
  try{ensureSchoolTests();}catch{}
}

function openArticle(article){
  currentArticleId=article.id;
  try{localStorage.setItem('genom-last-article',article.id);}catch{}
  let focused=false;try{focused=localStorage.getItem('genom-reader-focus')==='true';}catch{}
  $('articleDialog').classList.toggle('reader-focus',focused);
  const savedNow=saved.has(article.id),related=articles.filter(a=>a.id!==article.id).map(a=>({article:a,score:(a.topics||[]).filter(id=>hasTopic(article,id)).length*3+(a.category===article.category?1:0)})).filter(r=>r.score>0).sort((a,b)=>b.score-a.score).slice(0,3).map(r=>r.article);
  $('articleContent').innerHTML=`<header class="reader-toolbar"><a class="reader-brand" href="#home">genom<span>.</span></a><div class="reader-toolbar-actions reader-tools">${study()?.toggleRead?readButton(article.id):''}<button class="reader-action" type="button" data-copy-article="${article.id}" aria-label="Skopiuj link do artykułu" title="Skopiuj link do artykułu">${icon('share')}<span>Udostępnij</span></button><button class="reader-action reader-focus-toggle" type="button" data-reader-focus aria-pressed="${focused}" aria-label="${focused?'Wyłącz tryb skupienia':'Włącz tryb skupienia'}" title="Tryb skupienia">${icon('expand')}</button><button class="reader-save ${savedNow?'saved':''}" data-save="${article.id}" aria-pressed="${savedNow}">${icon('bookmark')}<span>${savedNow?'W zakładkach':'Zapisz'}</span></button><button class="icon-button" id="closeArticle" aria-label="Zamknij artykuł">${icon('close')}</button></div><div class="reader-progress"><progress id="readerProgress" max="100" value="0" aria-label="Postęp czytania artykułu"></progress><span id="readerProgressText" aria-hidden="true">0%</span></div></header><div class="reader-layout"><article class="reader-main"><a class="eyebrow" href="#category/${article.category}">${categories[article.category].title.toUpperCase()}</a><h1 id="articleTitle">${escapeHTML(article.title)}</h1><div class="reader-meta"><span>${article.minutes} min czytania</span><span>Dla ciekawych świata</span><span>Artykuł wprowadzający</span></div><p class="reader-summary">${escapeHTML(article.summary)}</p><div class="topic-links" aria-label="Tematy artykułu">${(article.topics||[]).filter(id=>topics[id]).map(id=>`<a class="topic-chip" href="#topic/${id}">${topics[id].label}</a>`).join('')}</div>${articleVisual(article)}${article.sections.map((s,i)=>`<section id="section-${i}"><h2>${escapeHTML(s.title)}</h2><p>${escapeHTML(s.body)}</p></section>`).join('')}<div class="medical-note">Materiał ma charakter edukacyjny. Pytania dotyczące własnego zdrowia i interpretacji wyników badań genetycznych omów z lekarzem lub specjalistą genetyki klinicznej.</div>${study()?.toggleRead?`<div class="reader-completion"><div><strong>Gotowe? Zapisz swój mały krok.</strong><p>Oznacz przeczytany artykuł i zobacz postęp w ścieżkach nauki.</p></div>${readButton(article.id)}<a href="#learn">Twoja strefa nauki ${icon('arrow')}</a></div>`:''}<div class="reader-sources" id="readerSources"><h2>Źródła i dalsza lektura</h2>${article.sources.map(s=>`<a href="${escapeHTML(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(s.title)} ↗</a>`).join('')}</div>${related.length?`<div class="related-articles"><h2>Powiązane artykuły</h2>${related.map(a=>`<a href="#article/${a.id}">${escapeHTML(a.title)} →</a>`).join('')}</div>`:''}</article><nav class="reader-toc" aria-label="Spis treści artykułu"><strong>W TYM ARTYKULE</strong>${visualForArticle(article)?'<a href="#readerDiagram" data-section="readerDiagram">Schemat poglądowy</a>':''}${article.sections.map((s,i)=>`<a href="#section-${i}" data-section="section-${i}">${escapeHTML(s.title)}</a>`).join('')}<a href="#readerSources" data-section="readerSources">Źródła ↗</a></nav></div>`;
  if(!$('articleDialog').open)$('articleDialog').showModal();
  $('articleDialog').scrollTop=0;document.title=`${article.title} — Genom`;
  $('articleTitle').setAttribute('tabindex','-1');$('articleTitle').focus({preventScroll:true});
  $('closeArticle').addEventListener('click',closeArticle);
  updateReaderProgress();
}
function closeArticle(){location.hash=previousRoute;}
function showToast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2300);}
function toggleSaved(id){
  if(!articleById(id))return;
  const adding=!saved.has(id);if(adding)saved.add(id);else saved.delete(id);
  try{localStorage.setItem('genom-saved',JSON.stringify([...saved]));}catch{showToast('Zakładki będą dostępne do zamknięcia strony');}
  updateCount();
  document.querySelectorAll('[data-save]').forEach(el=>{if(el.dataset.save===id){el.classList.toggle('saved',adding);el.setAttribute('aria-pressed',String(adding));const label=el.querySelector('span');if(label)label.textContent=adding?'W zakładkach':'Zapisz';else el.setAttribute('aria-label',`${adding?'Usuń z zakładek':'Dodaj do zakładek'}: ${articleById(id).title}`);}});
  if(currentRoute==='saved'&&!$('articleDialog').open)$('pageContent').innerHTML=savedPage();
  showToast(adding?'Artykuł dodany do zakładek':'Artykuł usunięty z zakładek');
}
function rerenderCurrent(){route();}
function listingItems(){
  const state=stateFor();
  if(currentRoute.startsWith('search/')){
    let list=searchArticles(safeDecode(currentRoute.slice(7)));
    if(state.category!=='all')list=list.filter(a=>a.category===state.category);
    if(state.topic!=='all')list=list.filter(a=>hasTopic(a,state.topic));
    return sortItems(list,state.sort);
  }
  let list=currentRoute.startsWith('category/')?articles.filter(a=>a.category===currentRoute.slice(9)):articles;
  if(currentRoute.startsWith('topic/'))list=list.filter(a=>hasTopic(a,currentRoute.slice(6)));
  else if(state.topic!=='all')list=list.filter(a=>hasTopic(a,state.topic));
  if(currentRoute==='category/diseases'&&state.disease!=='all')list=list.filter(a=>a.diseaseType===state.disease);
  return sortItems(list,state.sort);
}
document.addEventListener('click',e=>{
  const choose=e.target.closest('[data-home-choose]');if(choose){e.preventDefault();clearTimeout(searchTimer);hideSuggestions();const options=$(choose.getAttribute('aria-controls'));if(options){const open=choose.getAttribute('aria-expanded')!=='true';choose.setAttribute('aria-expanded',String(open));options.classList.toggle('open',open);options.setAttribute('aria-hidden',String(!open));setInert(options,!open);const label=choose.querySelector('[data-home-choose-label]');if(label)label.textContent=open?'Zwiń tematy':'Wybierz temat';if(open){window.GenomMotion?.refresh?.();$('homeSchoolTitle')?.focus({preventScroll:true});$('homeTopics')?.scrollIntoView({behavior:document.body.classList.contains('motion-paused')?'instant':'smooth',block:'start'});}}return;}
  const menuToggle=e.target.closest('[data-toggle-menu]');
  if(menuToggle&&!['menuButton','dockMenuButton','closeMenuButton'].includes(menuToggle.id)){e.preventDefault();toggleMenu(menuToggle);return;}
  const sidebarLink=e.target.closest('#sidebar a[href]');
  if(sidebarLink&&mobileMenuQuery.matches&&$('sidebar')?.classList.contains('open')){closeMenu(false);$('main')?.focus({preventScroll:true});}
  const read=e.target.closest('[data-mark-read]');if(read){e.preventDefault();if(study()?.toggleRead){const complete=study().toggleRead(read.dataset.markRead);updateReadUI();showToast(complete?'Artykuł oznaczony jako przeczytany':'Oznaczenie artykułu cofnięte');}return;}
  const copy=e.target.closest('[data-copy-article]');if(copy){e.preventDefault();copyArticleLink(copy.dataset.copyArticle);return;}
  if(e.target.closest('[data-reader-focus]')){e.preventDefault();toggleReaderFocus();return;}
  const zoom=e.target.closest('[data-visual-zoom]');if(zoom){e.preventDefault();const viewport=$('visualImageViewport');if(viewport){const enlarged=viewport.classList.toggle('visual-zoomed');zoom.setAttribute('aria-pressed',String(enlarged));const label=zoom.querySelector('span');if(label)label.textContent=enlarged?'Dopasuj do ekranu':'Powiększ 2×';if(!enlarged){viewport.scrollLeft=0;viewport.scrollTop=0;}}return;}
  if(e.target.closest('[data-focus-search]')){e.preventDefault();clearTimeout(searchTimer);closeMenu(false);$('searchInput').focus();$('searchInput').scrollIntoView({behavior:document.body.classList.contains('motion-paused')?'instant':'smooth',block:'center'});return;}
  const enlarge=e.target.closest('[data-enlarge-visual]');if(enlarge){e.preventDefault();openVisual(enlarge.dataset.enlargeVisual);return;}
  if(e.target.closest('[data-close-visual]')){e.preventDefault();closeVisual();return;}
  const zoomLink=e.target.closest('#visualDialog a[href^="#"]');if(zoomLink){e.preventDefault();closeVisual();navigate(zoomLink.getAttribute('href').slice(1));return;}
  if(e.target.closest('[data-clear-visual-search]')){visualQuery='';const input=document.querySelector('[data-visual-search]');if(input){input.value='';input.focus();}updateVisualResults();return;}
  if(e.target.closest('[data-retry-visuals]')){const retry=e.target.closest('[data-retry-visuals]');retry.disabled=true;retry.textContent='Wczytywanie…';loadVisuals().then(async loaded=>{if(loaded){try{await school()?.init?.({visuals});}catch{}}if(currentRoute==='visuals')route();});return;}
  if(e.target.closest('.search-suggestion,.suggestion-footer')){clearTimeout(searchTimer);hideSuggestions();}
  if(!e.target.closest('.search-shell'))hideSuggestions();
  if(e.target.closest('a[href^="#"]'))clearTimeout(searchTimer);
  if(e.target.closest('.skip-link')){e.preventDefault();$('main').focus();$('main').scrollIntoView();return;}
  const bookmark=e.target.closest('[data-save]');if(bookmark){e.preventDefault();toggleSaved(bookmark.dataset.save);return;}
  const filter=e.target.closest('[data-disease-filter]');if(filter){const state=stateFor();diseaseFilter=filter.dataset.diseaseFilter;state.disease=diseaseFilter;state.limit=PAGE_SIZE;rerenderCurrent();document.querySelector(`[data-disease-filter="${diseaseFilter}"]`)?.focus({preventScroll:true});return;}
  const topic=e.target.closest('[data-topic-filter]');if(topic){const state=stateFor();state.topic=topic.dataset.topicFilter;state.limit=PAGE_SIZE;rerenderCurrent();document.querySelector(`[data-topic-filter="${state.topic}"]`)?.focus({preventScroll:true});return;}
  const category=e.target.closest('[data-search-category]');if(category){const state=stateFor();state.category=category.dataset.searchCategory;state.topic='all';state.limit=PAGE_SIZE;rerenderCurrent();document.querySelector(`[data-search-category="${state.category}"]`)?.focus({preventScroll:true});return;}
  const more=e.target.closest('[data-load-more]');if(more){const state=stateFor(),oldLimit=state.limit,items=listingItems();state.limit+=PAGE_SIZE;rerenderCurrent();const next=items[oldLimit];if(next)document.querySelector(`a[href="#article/${next.id}"]`)?.focus();return;}
  const section=e.target.closest('[data-section]');if(section){e.preventDefault();$(section.dataset.section)?.scrollIntoView({behavior:document.body.classList.contains('motion-paused')?'instant':'smooth',block:'start'});}
});
document.addEventListener('input',e=>{if(e.target.matches('[data-visual-search]')){visualQuery=e.target.value;updateVisualResults();}});
document.addEventListener('error',e=>{if(e.target.classList?.contains('hero-art')){e.target.hidden=true;e.target.closest('.hero-visual')?.classList.add('art-fallback');}},true);
$('visualDialog')?.addEventListener('cancel',e=>{e.preventDefault();closeVisual();});
$('visualDialog')?.addEventListener('click',e=>{if(e.target===$('visualDialog')){const b=$('visualDialog').getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closeVisual();}});
document.addEventListener('change',e=>{
  if(e.target.matches('[data-result-sort]')){stateFor().sort=e.target.value;stateFor().limit=PAGE_SIZE;rerenderCurrent();document.querySelector('[data-result-sort]')?.focus({preventScroll:true});}
  if(e.target.matches('[data-search-topic]')){stateFor().topic=e.target.value;stateFor().limit=PAGE_SIZE;rerenderCurrent();document.querySelector('[data-search-topic]')?.focus({preventScroll:true});}
});
$('articleDialog').addEventListener('scroll',updateReaderProgress,{passive:true});
$('articleDialog').addEventListener('cancel',e=>{e.preventDefault();closeArticle();});
$('articleDialog').addEventListener('click',e=>{if(e.target===$('articleDialog')){const b=$('articleDialog').getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closeArticle();}});
$('searchForm').addEventListener('submit',e=>{e.preventDefault();clearTimeout(searchTimer);hideSuggestions();const q=$('searchInput').value.trim();navigate(q?'search/'+encodeURIComponent(q):'library');});
$('searchInput').addEventListener('input',()=>{clearTimeout(searchTimer);$('clearSearch').hidden=!$('searchInput').value;showSuggestions();searchTimer=setTimeout(()=>{const q=$('searchInput').value.trim();navigate(q?'search/'+encodeURIComponent(q):'home');},220);});
$('searchInput').addEventListener('focus',()=>{if($('searchInput').value.trim())showSuggestions();});
$('searchInput').addEventListener('keydown',e=>{if(e.key==='ArrowDown'){showSuggestions();const first=$('searchSuggestions')?.querySelector('a');if(first){e.preventDefault();first.focus();}}if(e.key==='Escape'){hideSuggestions();}});
$('clearSearch').addEventListener('click',()=>{clearTimeout(searchTimer);hideSuggestions();$('searchInput').value='';navigate('home');$('searchInput').focus();});
$('textSize').addEventListener('click',()=>{const large=document.body.classList.toggle('large-text');$('textSize').setAttribute('aria-pressed',String(large));$('textSize').setAttribute('aria-label',large?'Standardowy rozmiar tekstu':'Powiększ tekst');try{localStorage.setItem('genom-large',String(large));}catch{}showToast(large?'Powiększony tekst':'Standardowy rozmiar tekstu');});
$('randomArticle')?.addEventListener('click',()=>{if(articles.length)location.hash='article/'+articles[Math.floor(Math.random()*articles.length)].id;closeMenu(false);});
const mobileMenuQuery=typeof matchMedia==='function'?matchMedia('(max-width: 760px)'):{matches:false};
let menuReturnFocus=null;
function setInert(element,inert){
  if(!element)return;
  element.inert=Boolean(inert);
  if(inert)element.setAttribute('inert','');else element.removeAttribute('inert');
}
function setMoreMenu(open){
  const button=$('moreMenuButton'),panel=$('moreMenuPanel');
  if(!button||!panel)return;
  button.setAttribute('aria-expanded',String(open));panel.setAttribute('aria-hidden',String(!open));panel.classList.toggle('open',open);setInert(panel,!open);
}
function syncMenuState(){
  const sidebar=$('sidebar'),open=Boolean(mobileMenuQuery.matches&&sidebar?.classList.contains('open'));
  sidebar?.classList.toggle('open',open);$('mobileShade')?.classList.toggle('open',open);
  document.body.classList.toggle('menu-open',open);
  setInert(sidebar,Boolean(mobileMenuQuery.matches&&!open));
  setInert(document.querySelector('.workspace'),open);setInert(document.querySelector('.mobile-dock'),open);
  ['menuButton','dockMenuButton','closeMenuButton'].forEach(id=>{const button=$(id);if(button){button.setAttribute('aria-expanded',String(open));if(id!=='closeMenuButton')button.setAttribute('aria-label',open?'Zamknij menu':'Otwórz menu');}});
}
function menuFocusables(){
  const sidebar=$('sidebar');
  if(!sidebar?.querySelectorAll)return [];
  return Array.from(sidebar.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(el=>!el.hidden&&!el.disabled&&!el.closest?.('[inert]')&&(typeof el.getClientRects!=='function'||el.getClientRects().length>0));
}
function closeMenu(restoreFocus=true){
  const sidebar=$('sidebar'),wasOpen=Boolean(sidebar?.classList.contains('open'));
  sidebar?.classList.remove('open');syncMenuState();
  if(wasOpen&&restoreFocus&&menuReturnFocus?.isConnected!==false)menuReturnFocus?.focus?.({preventScroll:true});
  if(wasOpen)menuReturnFocus=null;
}
function toggleMenu(invoker){
  if(!mobileMenuQuery.matches)return;
  if($('sidebar')?.classList.contains('open')){closeMenu();return;}
  menuReturnFocus=invoker||document.activeElement;
  $('sidebar')?.classList.add('open');syncMenuState();
  const focusable=menuFocusables(),close=$('closeMenuButton');
  (focusable.includes(close)?close:focusable[0])?.focus?.({preventScroll:true});
}
$('menuButton')?.addEventListener('click',e=>{e.preventDefault();toggleMenu(e.currentTarget||$('menuButton'));});
$('dockMenuButton')?.addEventListener('click',e=>{e.preventDefault();toggleMenu(e.currentTarget||$('dockMenuButton'));});
$('closeMenuButton')?.addEventListener('click',e=>{e.preventDefault();closeMenu();});
$('moreMenuButton')?.addEventListener('click',()=>{setMoreMenu($('moreMenuButton').getAttribute('aria-expanded')!=='true');});
$('mobileShade')?.addEventListener('click',()=>closeMenu());
function syncMenuViewport(){
  const sidebar=$('sidebar'),active=document.activeElement,hadFocus=Boolean(sidebar?.contains?.(active));
  syncMenuState();
  if(mobileMenuQuery.matches&&!sidebar?.classList.contains('open')&&hadFocus)$('menuButton')?.focus?.({preventScroll:true});
  else if(!mobileMenuQuery.matches&&active===$('closeMenuButton'))menuFocusables().find(el=>el!==active&&el.tagName==='A')?.focus?.({preventScroll:true});
}
if(mobileMenuQuery.addEventListener)mobileMenuQuery.addEventListener('change',syncMenuViewport);
else if(mobileMenuQuery.addListener)mobileMenuQuery.addListener(syncMenuViewport);
window.addEventListener('resize',syncMenuViewport,{passive:true});
setMoreMenu(false);syncMenuState();
document.addEventListener('keydown',e=>{
  const menuOpen=mobileMenuQuery.matches&&$('sidebar')?.classList.contains('open');
  if(e.key==='Tab'&&menuOpen){
    const focusable=menuFocusables(),first=focusable[0],last=focusable[focusable.length-1],active=document.activeElement;
    if(!first){e.preventDefault();return;}
    if(e.shiftKey&&(active===first||!focusable.includes(active))){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&(active===last||!focusable.includes(active))){e.preventDefault();first.focus();}
  }
  if(e.key==='/'&&!$('articleDialog').open&&!$('visualDialog')?.open&&!$('videoDialog')?.open&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();closeMenu(false);$('searchInput').focus();}
  if(e.key==='Escape'){closeMenu();const inside=$('searchSuggestions')?.contains(document.activeElement);hideSuggestions();if(inside)$('searchInput').focus();}
});
window.addEventListener('hashchange',()=>{if(articles.length)route();});
Promise.all([fetch('articles.json').then(r=>{if(!r.ok)throw new Error('Articles unavailable');return r.json();}),loadVisuals()]).then(async([data])=>{articles=data;saved=new Set([...saved].filter(id=>articleById(id)));updateCount();await initLearning();route();}).catch(()=>{$('pageContent').innerHTML=empty('Nie udało się wczytać artykułów','Sprawdź połączenie z internetem i odśwież stronę.','book')+'<button class="primary-button" id="reloadPage">Spróbuj ponownie</button>';$('reloadPage').addEventListener('click',()=>location.reload());});
