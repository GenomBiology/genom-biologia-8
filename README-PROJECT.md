Eksport do pobrania: pliki z katalogu `dist/` opisanego poniżej znajdują się tutaj bezpośrednio obok `index.html`. Instrukcja otwierania i publikacji: `START-HERE.txt`.

# Genom — biologia, klasa 8

Polskojęzyczny portal do nauki biologii w klasie 8, z osobnym działem DNA i encyklopedią genetyki.

- 4 działy szkolne: genetyka, ewolucja, ekologia oraz człowiek i środowisko.
- 40 mini-lekcji z celami, objaśnieniami, pojęciami, podsumowaniem, źródłami i sprawdzaniem zrozumienia.
- Postęp lekcji zapisywany na urządzeniu; wyszukiwanie lekcji także bez polskich znaków.
- Bank 80 pytań: wybór jednej lub wielu odpowiedzi oraz prawda/fałsz.
- Cztery testy działowe po 20 pytań i test przekrojowy z 40 pytaniami, po 10 z każdego działu.
- Tryby sprawdzianu i ćwiczenia, powrót do pytań, oznaczanie wątpliwości, zapis i wznowienie próby.
- Wynik z objaśnieniami wszystkich odpowiedzi, odnośnikami do lekcji, powtórką błędów i historią ostatnich 10 prób.
- 84 artykuły, w tym 40 o chorobach i predyspozycjach genetycznych.
- 5 działów oraz 21 tematów, w tym cztery wejścia do rodzajów, skutków i przyczyn mutacji.
- Strona główna zaczyna się pełnym ekranem powitalnym. Przycisk „Wybierz temat” znajduje się pod akapitem powitalnym i pozostaje niewidoczny do przewinięcia w dół; gdy znajdzie się wyraźnie w widocznym obszarze ekranu, powoli pojawia się przez 1,6 sekundy. Fokus klawiatury, pauza i ograniczenie ruchu pokazują go od razu. Przycisk płynnie rozwija lub zwija cztery działy biologii i po otwarciu przewija do nich stronę; zwinięte karty pozostają poza nawigacją klawiaturą. Osobna zakładka DNA skupia tematy mutacji, podstawy i narzędzia genetyczne.
- Siedem głównych pozycji menu, pozostałe narzędzia w rozwijanej grupie „Więcej”. Na dole telefonu tylko Start, Szukaj i Menu.
- Widoczny GIF DNA na stronie głównej; wersja statyczna przy pauzie lub systemowym ograniczeniu ruchu.
- Tło bocznego menu używa dokładnego filmu z pinu Pinterest wybranego przez użytkownika: trawa i poranne słońce. Lokalny MP4 odtwarza się w pętli bez dźwięku; dopasowany obraz statyczny pozostaje przy pauzie, ograniczeniu ruchu lub błędzie odtwarzania. Film zatrzymuje się przy ukrytej karcie i zamkniętym menu telefonu. Ciemne tło pod odnośnikami zachowuje czytelność.
- Miękkie otwieranie menu na telefonie, stopniowe pojawianie się jego pozycji i płynnie rozwijana grupa dodatkowych narzędzi.
- Podpis autorów i opisy ich wkładu w stopce, zgodnie z podanymi informacjami.
- Zachowane 4 wcześniejsze ścieżki czytania o genetyce pod dotychczasowymi adresami.
- Interaktywne laboratorium: dopasowanie nici DNA, krzyżówka Punnetta i podstawienia zasad.
- Zachowany wcześniejszy quiz genetyczny z bankiem 24 pytań.
- Słownik 48 pojęć z wyszukiwaniem bez polskich znaków i filtrem literowym.
- Biblioteka 12 filmów: 8 po polsku i 4 po angielsku, z polskimi opisami, filtrami tematu i języka oraz linkami do powiązanych artykułów.
- Filmy są osadzane z YouTube dopiero po kliknięciu. Zamknięcie okna lub przejście do innej sekcji zatrzymuje odtwarzacz; dostępny jest również link bezpośredni.
- Atlas 23 objaśniających schematów z wyszukiwarką i powiększaniem; 20 ilustracji w 60 powiązanych artykułach oraz 3 nowe schematy do lekcji o doborze naturalnym, obiegu materii i bioróżnorodności.
- Zapętlone tło DNA w formacie GIF oraz przycisk pauzy. Ustawienie ograniczenia ruchu w systemie automatycznie włącza statyczny obraz.
- Łagodne przejścia, grafika DNA na stronie głównej i przycisk powrotu na górę.
- Miękkie pojawianie się bloków przy przewijaniu, spokojny ruch grafiki głównej i delikatne reakcje kart, przycisków oraz okien.
- Dodatkowa animacja jest zatrzymywana podczas pisania, przy ukrytej karcie, po włączeniu pauzy oraz przy systemowym ograniczeniu ruchu.
- Wyszukiwanie w tytułach, słowach kluczowych i treści, także bez polskich znaków.
- Podpowiedzi podczas wpisywania, filtry działów i tematów oraz sortowanie wyników.
- Katalog wszystkich tematów i stopniowe wczytywanie długich list artykułów.
- Stałe odnośniki do artykułów, spis treści i źródła.
- Tryb skupienia w czytniku, wskaźnik przewijania, oznaczanie przeczytania i kopiowanie odnośnika.
- Zakładki i ustawienie wielkości tekstu są zapisywane w localStorage przeglądarki.
- Układ dostosowany do urządzeń mobilnych, czytnik artykułów i nawigacja klawiaturą.
- Bez rejestracji, zbierania danych osobowych i zewnętrznych zapytań o fonty.

Publikowany katalog: `dist`. Kompilacja nie jest wymagana.
Dane artykułów: `dist/articles.json`. Nawigacja używa fragmentu URL.
Treści 40 mini-lekcji i bank 80 pytań: `dist/curriculum.json`; moduły: `dist/school.js`, `dist/tests.js`; style: `dist/school.css`.
Adresy nauki: `#school`, `#learn`, `#course/{dział}`, `#lesson/{lekcja}`, `#tests`, `#test/{dział}` i `#dna`.
Progres, bieżąca próba i historia pozostają w localStorage. Testy nie przesyłają odpowiedzi na serwer ani nie wystawiają oficjalnych ocen szkolnych.
Treści ścieżek, quizu i słownika: `dist/learning.json`; moduły: `study.js` i `lab.js`.
Filmy i metadane źródeł: `dist/videos.json`; moduł i style: `videos.js`, `videos.css`. Karty używają oznaczonych ilustracji tematu zamiast niezweryfikowanych miniaturek.
Nowa warstwa wizualna: `dist/upgrade.css`, wczytywana po bazowym arkuszu.
Uproszczenie strony, menu, GIF i stopka: `dist/refine.css`.
Ekran powitalny, dolny wybór działów i animowane tło menu: `dist/welcome.css`.
Sterowanie odtwarzaniem tła menu i oszczędzaniem ruchu: `dist/background.js`.
Oddzielne ujawnianie przycisku dopiero po przewinięciu: `dist/choice-reveal.js`; przycisk nie używa ogólnej animacji kart.
Warstwa miękkiego ruchu: `dist/motion.css` i `dist/motion.js`; animacje obserwatora nie ukrywają treści, gdy wymagane API jest niedostępne.
Ilustracje i powiązania: `dist/visuals.json` oraz `dist/illustrations/`.
Gotowe media są zapisane w `dist/media/`; generator GIF-a znajduje się w `scripts/create-dna-background.py`.
Film tła: [Pinterest — pin Richard Daniel „Morning has broken like the first morning”](https://pl.pinterest.com/pin/286330488799846543/). Powiązanie pinu z oryginalnym MP4 zweryfikowano w danych samego pinu. Plik zachowano bez zmian (1280×720, 30 kl./s, 21 sekund, 6.07 MiB); witryna wycisza jego ścieżkę dźwiękową. Szczegóły pochodzenia w `dist/media/earth-pinterest-source.json`.

Weryfikacja: kontrola składni skryptów, spójności danych i odnośników; programowe sprawdzenie wyszukiwarki,
filtrów, nawigacji, zakładek, lekcji i ich zadań, oceniania testów, zapisu/wznawiania, powtórek błędów,
starszych ścieżek, quizu, słownika, laboratorium, atlasu i czytnika. Wszystkie 40 lekcji i 80 pytań przeszły niezależny przegląd naukowy; źródła sprawdzono w materiałach ZPE i instytucji naukowych. Nowe schematy sprawdzono także na renderach PNG.
Testy wizualne w przeglądarce są niedostępne w tym środowisku.
Metadane filmów zweryfikowano w źródłach autorów; rzeczywistego odtwarzania strumienia i dostępności osadzania nie zweryfikowano w przeglądarce.
