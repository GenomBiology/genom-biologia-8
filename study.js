(function (global) {
  'use strict';

  const CATEGORY_LABELS = {all:'Wszystkie tematy',basics:'DNA i geny',inheritance:'Dziedziczenie',health:'Genetyka i zdrowie',technology:'Badania i technologia'};
  const CATEGORY_ICONS = {basics:'dna',inheritance:'branch',health:'heart',technology:'spark'};
  const SYMBOLS = {
    dna:'<path d="M7 2c0 9 10 11 10 20M17 2c0 9-10 11-10 20M8 5h8M10 9h4M10 15h4M8 19h8"/>',
    branch:'<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 7v5M5 17v-5h14v5"/>',
    heart:'<path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 6l-1.1-1.2a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-9.4a5.5 5.5 0 0 0 0-7.8Z"/><path d="M4 12h4l2-4 3 8 2-4h5"/>',
    spark:'<path d="m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7L12 2Z"/>',
    book:'<path d="M12 5v16M12 5C8 2 3 3 2 4v16c4-2 8-1 10 1 2-2 6-3 10-1V4c-4-2-8-1-10 1Z"/>',
    flask:'<path d="M8 2h8M10 2v7L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3L14 9V2M7 15h10"/>',
    arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    quiz:'<circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 0 1 6 1c0 2-3 2-3 4M12 17h.01"/>'
  };
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SYMBOLS[name] || SYMBOLS.book}</svg>`;
  const normalize = value => String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').replace(/[^a-z0-9]+/g,' ').trim();
  const articleWord = number => number===1?'artykuł':number%10>=2&&number%10<=4&&(number%100<12||number%100>14)?'artykuły':'artykułów';
  const questionWord = number => number===1?'pytanie':number%10>=2&&number%10<=4&&(number%100<12||number%100>14)?'pytania':'pytań';
  const getNode = id => document.getElementById(id);

  let context = {articles:[],navigate:null,onProgress:null};
  let articleMap = new Map();
  let data = {paths:[],questions:[],glossary:[]};
  let ready = false;
  let failed = false;
  let initPromise = null;
  let bound = false;
  let lastRoute = 'learn';
  let read = new Set();
  let quizCategory = 'all';
  let quiz = null;
  let quizBest = {};
  let glossaryQuery = '';
  let glossaryLetter = 'all';

  try {
    const stored = JSON.parse(localStorage.getItem('genom-read') || '[]');
    if(Array.isArray(stored)) read = new Set(stored.filter(id=>typeof id==='string'));
  } catch {}
  try {
    const stored = JSON.parse(localStorage.getItem('genom-quiz-best') || '{}');
    if(stored && typeof stored==='object' && !Array.isArray(stored)) {
      for(const category of Object.keys(CATEGORY_LABELS)) {
        const best=stored[category];
        if(best && Number.isInteger(best.correct) && Number.isInteger(best.total) && best.total>0 && best.correct>=0 && best.correct<=best.total) quizBest[category]={correct:best.correct,total:best.total,percent:Math.round(best.correct/best.total*100)};
      }
    }
  } catch {}

  function persistRead(){try{localStorage.setItem('genom-read',JSON.stringify([...read]));}catch{}}
  function isRead(id){return read.has(id);}
  function readCount(){return read.size;}
  function toggleRead(id){
    if(!articleMap.has(id))return false;
    if(read.has(id))read.delete(id);else read.add(id);
    persistRead();
    if(typeof context.onProgress==='function')context.onProgress(id,read.has(id));
    return read.has(id);
  }
  function pathStats(path){
    const done=path.articleIds.filter(isRead).length,total=path.articleIds.length;
    return {id:path.id,title:path.title,done,total,percent:total?Math.round(done/total*100):0,nextArticleId:path.articleIds.find(id=>!isRead(id))||null};
  }
  function correctCount(){return quiz?quiz.questions.reduce((count,question,index)=>count+(quiz.answers[index]===question.answer?1:0),0):0;}
  function stats(){return {readCount:read.size,totalArticles:context.articles.length,paths:data.paths.map(pathStats),dataReady:ready,questionCount:data.questions.length,glossaryCount:data.glossary.length,quiz:quiz?{active:!quiz.complete,category:quiz.category,index:quiz.index,total:quiz.questions.length,answered:Number.isInteger(quiz.answers[quiz.index]),complete:quiz.complete,correct:correctCount()}:null};}
  function articleLink(id,label){return `<a href="#article/${escapeHTML(id)}">${escapeHTML(label || articleMap.get(id)?.title || 'Czytaj artykuł')} ${icon('arrow')}</a>`;}
  function intro(kicker,title,description){return `<header class="study-intro"><span class="study-kicker">${escapeHTML(kicker)}</span><h1>${escapeHTML(title)}</h1><p class="study-lead">${escapeHTML(description)}</p></header>`;}
  function progress(path){const state=pathStats(path);return `<div class="study-progress"><progress class="study-progress-bar" value="${state.done}" max="${state.total||1}" aria-label="Postęp: ${state.done} z ${state.total} przeczytanych"></progress><span>Przeczytano ${state.done} z ${state.total}</span></div>`;}
  function pathCard(path,index){const state=pathStats(path);return `<article class="study-card"><span class="study-card-icon">${icon(CATEGORY_ICONS[path.id]||path.icon)}</span><div class="study-card-meta"><span>Ścieżka ${String(index+1).padStart(2,'0')}</span><span>${path.articleIds.length} lekcji</span></div><h2><a href="#learn/${escapeHTML(path.id)}">${escapeHTML(path.title)}</a></h2><p>${escapeHTML(path.description)}</p>${progress(path)}<a class="study-card-link" href="#learn/${escapeHTML(path.id)}">${state.done===state.total?'Wróć do ścieżki':state.done?'Kontynuuj naukę':'Odkryj ścieżkę'} ${icon('arrow')}</a></article>`;}
  function featureLinks(){return `<div class="study-feature-links"><a href="#learn"><span>${icon('book')}</span><strong>Ścieżki nauki</strong><small>Dobry początek, krok po kroku</small>${icon('arrow')}</a><a href="#lab"><span>${icon('flask')}</span><strong>Laboratorium DNA</strong><small>Sprawdź, jak działa genetyka</small>${icon('arrow')}</a><a href="#quiz"><span>${icon('quiz')}</span><strong>Sprawdź swoją wiedzę</strong><small>Krótkie pytania z wyjaśnieniami</small>${icon('arrow')}</a><a href="#glossary"><span>${icon('search')}</span><strong>Słownik pojęć</strong><small>Trudne słowa, proste znaczenia</small>${icon('arrow')}</a></div>`;}
  function resumeCard(){
    const started=data.paths.find(path=>{const state=pathStats(path);return state.done>0&&state.done<state.total;});
    const path=started || data.paths.find(path=>pathStats(path).done<path.articleIds.length) || data.paths[0];
    if(!path)return '';
    const state=pathStats(path),next=articleMap.get(state.nextArticleId);
    return `<div class="study-resume"><div><span class="study-kicker">${read.size?'TWÓJ KOLEJNY KROK':'ZACZNIJ OD CIEKAWOŚCI'}</span><h3>${next?escapeHTML(next.title):'Wszystkie ścieżki odkryte!'}</h3><p>${next?'Krótka lekcja, która łączy się z tym, co już wiesz.':'Wróć do ulubionych tematów albo sprawdź się w quizie.'}</p></div><a class="primary-button" href="${next?'#article/'+escapeHTML(next.id):'#quiz'}">${next?'Otwórz lekcję':'Przejdź do quizu'} ${icon('arrow')}</a><span class="study-resume-count">${read.size} ${articleWord(read.size)} oznaczono jako przeczytane</span></div>`;
  }
  function homePanel(){if(!ready)return '';return `<section class="study-home-panel"><div class="section-heading"><h2>Wiedza, która zostaje</h2><a href="#learn">Twoja strefa nauki ${icon('arrow')}</a></div>${resumeCard()}${featureLinks()}</section>`;}
  function learningHub(){return intro('TWOJA STREFA NAUKI','Odkrywaj w swoim tempie.','Wybierz ścieżkę, przeczytaj krótką lekcję i sprawdź, co już rozumiesz. Twój postęp zostaje w tej przeglądarce.')+resumeCard()+`<div class="study-toolbar"><h2>Wybierz swoją ścieżkę</h2><span>4 ścieżki · Bez konta · Bez pośpiechu</span></div><div class="study-grid">${data.paths.map(pathCard).join('')}</div>`+featureLinks();}
  function pathPage(id){
    const path=data.paths.find(item=>item.id===id);
    if(!path)return intro('ŚCIEŻKI NAUKI','Nie ma takiej ścieżki.','Wybierz jedną z czterech ścieżek i zacznij od tematu, który Cię ciekawi.')+'<a class="primary-button" href="#learn">Wszystkie ścieżki '+icon('arrow')+'</a>';
    const state=pathStats(path),next=state.nextArticleId;
    return `<a class="quiet-link" href="#learn">← Wszystkie ścieżki nauki</a>`+intro('ŚCIEŻKA NAUKI',path.title,path.description)+`<section class="path-header"><div><span class="path-status">${state.done===state.total?'Ścieżka ukończona':state.done?'Uczysz się w swoim tempie':'Każda lekcja to nowy kawałek układanki'}</span>${progress(path)}</div>${next?`<a class="primary-button" href="#article/${escapeHTML(next)}">${state.done?'Kontynuuj':'Pierwsza lekcja'} ${icon('arrow')}</a>`:`<a class="primary-button" href="#quiz">Sprawdź wiedzę ${icon('arrow')}</a>`}</section><ol class="path-lessons">${path.articleIds.map((articleId,index)=>{const article=articleMap.get(articleId),done=isRead(articleId);return `<li class="path-lesson ${done?'is-read':''}"><span class="path-lesson-number">${String(index+1).padStart(2,'0')}</span><div class="path-lesson-copy"><span class="path-status">${done?'Przeczytane':article.minutes+' min czytania'}</span><h2><a href="#article/${escapeHTML(articleId)}">${escapeHTML(article.title)}</a></h2><p>${escapeHTML(article.summary)}</p></div><button type="button" class="path-read-toggle ${done?'is-read':''}" data-study-read="${escapeHTML(articleId)}" aria-pressed="${done}" aria-label="${done?'Oznacz jako nieprzeczytane':'Oznacz jako przeczytane'}: ${escapeHTML(article.title)}">${icon('check')}<span>${done?'Przeczytane':'Oznacz'}</span></button><a class="path-open" href="#article/${escapeHTML(articleId)}" aria-label="Otwórz lekcję: ${escapeHTML(article.title)}">${icon('arrow')}</a></li>`;}).join('')}</ol><div class="study-note">Oznacz lekcję po przeczytaniu. Znaczniki możesz zmienić w dowolnej chwili — nie służą do oceniania.</div><a class="quiet-link" href="#quiz">Spróbuj krótkiego quizu ${icon('arrow')}</a>`;
  }

  function availableQuestions(category){return data.questions.filter(question=>category==='all'||question.category===category);}
  function shuffle(items){const copy=[...items];for(let index=copy.length-1;index>0;index--){const other=Math.floor(Math.random()*(index+1));[copy[index],copy[other]]=[copy[other],copy[index]];}return copy;}
  function startQuiz(){const pool=availableQuestions(quizCategory);if(!pool.length)return;quiz={category:quizCategory,questions:shuffle(pool).slice(0,quizCategory==='all'?10:6),index:0,answers:[],complete:false};}
  function finishQuiz(){
    if(!quiz || quiz.complete)return;
    quiz.complete=true;
    const correct=correctCount(),total=quiz.questions.length,percent=Math.round(correct/total*100),best=quizBest[quiz.category];
    if(!best||percent>best.percent||percent===best.percent&&correct>best.correct){quizBest[quiz.category]={correct,total,percent};try{localStorage.setItem('genom-quiz-best',JSON.stringify(quizBest));}catch{}}
  }
  function quizStart(){
    const available=availableQuestions(quizCategory).length,count=Math.min(available,quizCategory==='all'?10:6),best=quizBest[quizCategory];
    return intro('MAŁE PYTANIA. DUŻE ODKRYCIA.','Ile już wiesz o genetyce?','Wybierz temat i sprawdź wiedzę bez pośpiechu. Po każdej odpowiedzi dostaniesz krótkie wyjaśnienie i link do artykułu.')+`<section class="quiz-shell"><div class="quiz-start-icon">${icon('quiz')}</div><h2>Jeden quiz. Kilka nowych połączeń.</h2><p>Nie potrzebujesz timera. Możesz zajrzeć do artykułu i wrócić do pytania.</p><div class="quiz-categories" role="group" aria-label="Temat quizu">${Object.entries(CATEGORY_LABELS).map(([id,label])=>`<button class="quiz-category ${quizCategory===id?'active':''}" type="button" data-quiz-category="${id}" aria-pressed="${quizCategory===id}" ${availableQuestions(id).length?'':'disabled'}>${label}</button>`).join('')}</div><div class="quiz-start-meta"><span>${count} ${questionWord(count)}</span><span>Wyjaśnienia po każdej odpowiedzi</span>${best?`<span>Twój najlepszy wynik: ${best.percent}%</span>`:''}</div><button class="primary-button" type="button" data-quiz-start ${count?'':'disabled'}>Zaczynamy ${icon('arrow')}</button><p class="study-note">Wynik jest zapisywany tylko w tej przeglądarce.</p></section>`;
  }
  function quizQuestion(){
    const question=quiz.questions[quiz.index],selected=quiz.answers[quiz.index],answered=Number.isInteger(selected),correct=selected===question.answer;
    return intro('SPRAWDŹ SWOJĄ WIEDZĘ',CATEGORY_LABELS[quiz.category],'Każda odpowiedź to szansa, by coś lepiej zrozumieć.')+`<section class="quiz-shell"><div class="quiz-progress"><span>Pytanie ${quiz.index+1} z ${quiz.questions.length}</span><progress value="${quiz.index+(answered?1:0)}" max="${quiz.questions.length}" aria-label="Postęp quizu"></progress><button class="quiet-link" type="button" data-quiz-exit>Zmień zestaw</button></div><h2 class="quiz-question" id="quizQuestion" tabindex="-1">${escapeHTML(question.question)}</h2><div class="quiz-options" role="group" aria-labelledby="quizQuestion">${question.options.map((option,index)=>`<button class="quiz-option ${answered&&index===question.answer?'is-correct':''} ${answered&&index===selected&&!correct?'is-wrong':''} ${index===selected?'is-selected':''}" type="button" data-quiz-answer="${index}" aria-pressed="${index===selected}" ${answered?'disabled':''}><span>${String.fromCharCode(65+index)}</span><strong>${escapeHTML(option)}</strong>${answered&&index===question.answer?icon('check'):''}</button>`).join('')}</div>${answered?`<div class="quiz-feedback ${correct?'is-correct':'is-wrong'}" role="status" aria-live="polite"><h3 id="quizFeedback" tabindex="-1">${correct?'Tak, dokładnie!':'Dobrze, że to sprawdzasz.'}</h3>${correct?'':`<p class="quiz-correct-answer"><strong>Prawidłowa odpowiedź:</strong> ${escapeHTML(question.options[question.answer])}</p>`}<p>${escapeHTML(question.explanation)}</p>${articleLink(question.articleId,'Przeczytaj wyjaśnienie w artykule')}</div><div class="quiz-actions"><button class="primary-button" type="button" data-quiz-next>${quiz.index===quiz.questions.length-1?'Zobacz wynik':'Następne pytanie'} ${icon('arrow')}</button></div>`:`<p class="study-note">Wybierz jedną odpowiedź. Nie ma limitu czasu.</p>`}</section>`;
  }
  function quizResult(){
    const correct=correctCount(),total=quiz.questions.length,percent=Math.round(correct/total*100),best=quizBest[quiz.category];
    const revisit=[...new Set(quiz.questions.filter((question,index)=>quiz.answers[index]!==question.answer).map(question=>question.articleId))].slice(0,4);
    return intro('KOLEJNY KROK ZA TOBĄ','Wiesz już trochę więcej.','Wróć do ciekawych pojęć, zajrzyj do laboratorium albo spróbuj innego zestawu.')+`<section class="quiz-shell quiz-result"><span class="quiz-score">${percent}<small>%</small></span><h2 id="quizResultTitle" tabindex="-1">${percent>=80?'Świetna robota!':percent>=50?'Dobry początek.':'Każdy krok czegoś uczy.'}</h2><p>Poprawne odpowiedzi: <strong>${correct} z ${total}</strong></p>${best?`<p class="study-note">Najlepszy wynik w tym zestawie: ${best.percent}%</p>`:''}${revisit.length?`<div class="quiz-revisit"><h3>Warto jeszcze zajrzeć</h3>${revisit.map(id=>articleLink(id)).join('')}</div>`:`<p>W tym zestawie wszystkie odpowiedzi były poprawne. Odkryj kolejne tematy!</p>`}<div class="quiz-actions"><button class="primary-button" type="button" data-quiz-restart>Spróbuj nowego zestawu ${icon('arrow')}</button><button class="quiet-link" type="button" data-quiz-exit>Zmień temat</button><a class="quiet-link" href="#lab">Otwórz laboratorium ${icon('arrow')}</a></div></section>`;
  }
  function quizPage(){return quiz?quiz.complete?quizResult():quizQuestion():quizStart();}

  function sortedGlossary(){return [...data.glossary].sort((a,b)=>a.term.localeCompare(b.term,'pl'));}
  function firstLetter(term){return String(term).trim().charAt(0).toLocaleUpperCase('pl');}
  function glossaryMatches(){const words=normalize(glossaryQuery).split(/\s+/).filter(Boolean);return sortedGlossary().filter(entry=>(glossaryLetter==='all'||firstLetter(entry.term)===glossaryLetter)&&words.every(word=>normalize(entry.term+' '+entry.definition+' '+entry.aliases.join(' ')).includes(word)));}
  function glossaryResults(){
    const matches=glossaryMatches();
    if(!matches.length)return `<div class="empty-state"><span>${icon('search')}</span><h2>Nie znaleziono tego pojęcia</h2><p>Spróbuj krótszego słowa lub wyczyść filtr. Możesz pomijać polskie znaki.</p><button class="quiet-link" type="button" data-glossary-clear>Wyczyść wyszukiwanie ${icon('arrow')}</button></div>`;
    const groups=new Map();matches.forEach(entry=>{const letter=firstLetter(entry.term);if(!groups.has(letter))groups.set(letter,[]);groups.get(letter).push(entry);});
    return [...groups].map(([letter,entries])=>`<section class="glossary-group"><h2>${escapeHTML(letter)}</h2><dl class="glossary-list">${entries.map(entry=>`<div class="glossary-entry"><dt class="glossary-term">${escapeHTML(entry.term)}</dt><dd class="glossary-definition"><p>${escapeHTML(entry.definition)}</p>${articleLink(entry.articleId,'Poznaj temat')}</dd></div>`).join('')}</dl></section>`).join('');
  }
  function glossaryPage(){const letters=[...new Set(sortedGlossary().map(entry=>firstLetter(entry.term)))];return intro('TRUDNE SŁOWA. PROSTE ZNACZENIA.','Słownik genetyki',`${data.glossary.length} pojęć, które pomagają czytać genetyczny język. Szukaj słowa albo wybierz pierwszą literę.`)+`<div class="glossary-toolbar"><label class="glossary-search"><span>Szukaj pojęcia</span><span>${icon('search')}<input type="search" data-glossary-search value="${escapeHTML(glossaryQuery)}" placeholder="Np. allel, genotyp, mitochondrium…" maxlength="120" autocomplete="off" aria-controls="glossaryResults"></span></label><p id="glossaryCount" role="status">Wyniki: ${glossaryMatches().length} z ${data.glossary.length}</p></div><div class="glossary-letters" role="group" aria-label="Pierwsza litera pojęcia">${['all',...letters].map(letter=>`<button class="glossary-letter ${glossaryLetter===letter?'active':''}" type="button" data-glossary-letter="${escapeHTML(letter)}" aria-pressed="${glossaryLetter===letter}">${letter==='all'?'Wszystkie':escapeHTML(letter)}</button>`).join('')}</div><div id="glossaryResults">${glossaryResults()}</div>`;}
  function updateGlossary(){const results=getNode('glossaryResults');if(results)results.innerHTML=glossaryResults();const count=getNode('glossaryCount');if(count)count.textContent=`Wyniki: ${glossaryMatches().length} z ${data.glossary.length}`;document.querySelectorAll('[data-glossary-letter]').forEach(button=>{const active=button.dataset.glossaryLetter===glossaryLetter;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});}

  function content(raw){
    if(!ready)return intro('STREFA NAUKI','Jeszcze chwila…','Ścieżki, quiz i słownik pomagają połączyć informacje w całość.')+`<div class="empty-state"><span>${icon('book')}</span><h2>${failed?'Nie udało się wczytać strefy nauki':'Ładowanie materiałów'}</h2><p>${failed?'Artykuły i atlas są nadal dostępne. Sprawdź połączenie i spróbuj ponownie.':'Za moment będzie można wybrać temat.'}</p>${failed?'<button type="button" class="primary-button" data-study-retry>Spróbuj ponownie</button>':''}<a class="quiet-link" href="#library">Otwórz encyklopedię ${icon('arrow')}</a></div>`;
    if(raw==='quiz')return quizPage();
    if(raw==='glossary')return glossaryPage();
    if(raw.startsWith('learn/'))return pathPage(raw.slice(6));
    return learningHub();
  }
  function render(raw){lastRoute=String(raw||'learn').replace(/^#/,'');return `<div id="studyContent" data-study-route="${escapeHTML(lastRoute)}">${content(lastRoute)}</div>`;}
  function refresh(focusSelector,allowScroll=false){const root=getNode('studyContent');if(!root)return;root.innerHTML=content(lastRoute);if(focusSelector)root.querySelector(focusSelector)?.focus({preventScroll:!allowScroll});}
  function bindEvents(){
    if(bound)return;bound=true;
    document.addEventListener('click',event=>{
      const target=event.target;if(!target?.closest)return;
      const readButton=target.closest('[data-study-read]');if(readButton){event.preventDefault();const id=readButton.dataset.studyRead;if(!articleMap.has(id))return;toggleRead(id);refresh(`[data-study-read="${id}"]`);return;}
      const category=target.closest('[data-quiz-category]');if(category){event.preventDefault();const value=category.dataset.quizCategory;if(!Object.hasOwn(CATEGORY_LABELS,value))return;quizCategory=value;quiz=null;refresh(`[data-quiz-category="${value}"]`);return;}
      if(target.closest('[data-quiz-start]')){event.preventDefault();startQuiz();refresh('#quizQuestion',true);return;}
      const answer=target.closest('[data-quiz-answer]');if(answer){event.preventDefault();if(!quiz||quiz.complete||Number.isInteger(quiz.answers[quiz.index]))return;const value=Number(answer.dataset.quizAnswer);if(!Number.isInteger(value)||value<0||value>3)return;quiz.answers[quiz.index]=value;refresh('#quizFeedback',true);return;}
      if(target.closest('[data-quiz-next]')){event.preventDefault();if(!quiz||quiz.complete||!Number.isInteger(quiz.answers[quiz.index]))return;if(quiz.index<quiz.questions.length-1){quiz.index++;refresh('#quizQuestion',true);}else{finishQuiz();refresh('#quizResultTitle',true);}return;}
      if(target.closest('[data-quiz-restart]')){event.preventDefault();startQuiz();refresh('#quizQuestion',true);return;}
      if(target.closest('[data-quiz-exit]')){event.preventDefault();quiz=null;refresh('[data-quiz-start]');return;}
      const letter=target.closest('[data-glossary-letter]');if(letter){event.preventDefault();glossaryLetter=letter.dataset.glossaryLetter;refresh(`[data-glossary-letter="${glossaryLetter}"]`);return;}
      if(target.closest('[data-glossary-clear]')){event.preventDefault();glossaryQuery='';glossaryLetter='all';refresh('[data-glossary-search]');return;}
      if(target.closest('[data-study-retry]')){event.preventDefault();const retry=target.closest('[data-study-retry]');retry.disabled=true;retry.textContent='Wczytywanie…';init(context).then(()=>refresh());}
    });
    document.addEventListener('input',event=>{if(event.target?.matches?.('[data-glossary-search]')){glossaryQuery=event.target.value;glossaryLetter='all';updateGlossary();}});
  }
  function validateData(source){
    if(!source||!Array.isArray(source.paths)||!Array.isArray(source.questions)||!Array.isArray(source.glossary))throw new Error('Invalid learning data');
    const paths=source.paths.filter(path=>typeof path.id==='string'&&typeof path.title==='string'&&typeof path.description==='string'&&Array.isArray(path.articleIds)).map(path=>({...path,articleIds:[...new Set(path.articleIds)].filter(id=>articleMap.has(id))})).filter(path=>path.articleIds.length);
    const questions=source.questions.filter(question=>typeof question.id==='string'&&Object.hasOwn(CATEGORY_LABELS,question.category)&&question.category!=='all'&&typeof question.question==='string'&&Array.isArray(question.options)&&question.options.length===4&&question.options.every(option=>typeof option==='string')&&Number.isInteger(question.answer)&&question.answer>=0&&question.answer<4&&typeof question.explanation==='string'&&articleMap.has(question.articleId));
    const glossary=source.glossary.filter(entry=>typeof entry.id==='string'&&typeof entry.term==='string'&&typeof entry.definition==='string'&&articleMap.has(entry.articleId)).map(entry=>({...entry,aliases:Array.isArray(entry.aliases)?entry.aliases.filter(alias=>typeof alias==='string'):[]}));
    if(!paths.length||!questions.length||!glossary.length)throw new Error('Empty learning data');
    return {paths,questions,glossary};
  }
  function init(options={}){
    context={...context,...options};context.articles=Array.isArray(context.articles)?context.articles:[];articleMap=new Map(context.articles.map(article=>[article.id,article]));
    read=new Set([...read].filter(id=>articleMap.has(id)));persistRead();bindEvents();
    if(ready)return Promise.resolve(true);
    if(initPromise)return initPromise;
    initPromise=fetch('learning.json').then(response=>{if(!response.ok)throw new Error('Learning data unavailable');return response.json();}).then(source=>{data=validateData(source);ready=true;failed=false;return true;}).catch(()=>{ready=false;failed=true;return false;}).finally(()=>{initPromise=null;});
    return initPromise;
  }
  global.GenomStudy=Object.freeze({init,render,homePanel,isRead,toggleRead,readCount,stats});
})(window);
