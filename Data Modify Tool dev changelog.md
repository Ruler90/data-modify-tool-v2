
= = = = = = = = = = =

### v2.0.0 - 14.09.2026

Przepisanie na TypeScript i zmiana formatu z Chrome Extension na bookmarklet, zgodnie z Cookie Managerem v2 i Random Pickerem. Toolchain ten sam co w random-pickerze: Vite (lib/IIFE) + Terser + SCSS + Vitest. `npm audit`: 0 podatności.

**Poprawione błędy**

- Pole "na" przy zamianie znaków trafiało prosto do `String.replace()`, więc `$&`, `$1`, `` $` `` i `$'` były interpretowane jako wzorce podstawienia zamiast wstawiane literalnie. Zamiana `a` na `$&$&` podwajała match. Regexy zniknęły całkowicie - `replace` i `split` działają teraz na `String.split`/`join`, więc wszystko jest literalne i nie ma powierzchni na ReDoS.
- Puste pole "z" dawało `new RegExp('', 'g')`, które matchuje na każdej pozycji i wplatało zamiennik pomiędzy każdy znak. Teraz operacja odmawia z komunikatem.
- Pusty separator przy "Separator → Kolumna" robił `''.split('')` i rozbijał input na pojedyncze znaki. Teraz odmawia z komunikatem.
- Komunikat "Copied to clipboard" pokazywał się zawsze, nawet gdy `document.execCommand('copy')` zwróciło `false`. Kopiowanie idzie teraz przez `navigator.clipboard.writeText()` z fallbackiem na `execCommand`, a status mówi prawdę o tym, czy się udało.
- `setTimeout` gaszący komunikat nie był czyszczony, więc przy serii szybkich operacji pierwszy timer gasił komunikat w trakcie kolejnej.
- Przycisk czyszczenia kasował tylko lewe pole, zostawiając nieaktualny wynik po prawej.
- Znaki końca linii są normalizowane do `\n`, więc dane z windowsowego edytora zachowują się tak samo jak reszta.

**Zmiany funkcjonalne**

- "Start row with..." recyklingowało pole Separator jako prefiks, przez co nie dało się mieć ustawionego separatora i prefiksu jednocześnie. Zastąpione przez "Modify rows" z osobnymi polami "start with" i "end with" - typowy przypadek to owinięcie kolumny id w apostrofy i przecinek pod SQL `IN (...)`.
- Każde pole stoi teraz w wierszu razem z przyciskami, które z niego korzystają, zamiast osobno od kolumny przycisków.
- Nowy przycisk "Copy", który ponownie wrzuca wynik na schowek. Automatyczne kopiowanie po każdej operacji zostaje, ale łatwo je stracić - dowolne późniejsze Ctrl+C na stronie nadpisuje schowek. "Copy" bierze aktualną zawartość prawego pola, razem z ręcznymi poprawkami.
- Czyszczenie przeniesione z ikony kosza w headerze do przycisku "Clear" obok "Remove duplicates". Kosz trzeba było najpierw rozpoznać, i leżał daleko od pól, które opróżniał. W headerze zostaje samo zamknięcie.
- "Copy" i "Clear" nie przekształcają danych, więc stoją na końcu swojego wiersza w wyciszonym stylu, zamiast w indigo, które zostaje dla pięciu przycisków faktycznie zmieniających dane. Obydwa są nieaktywne, dopóki nie ma na czym działać.
- Liczniki wierszy nad obydwoma polami. Liczą linie rzeczywiste, nie zawinięte, więc wynik sklejony przecinkami pokazuje "1 line" niezależnie od tego, na ile rzędów rozłoży się na ekranie.
- Obydwa pola zawijają długie linie. Każde z nich regularnie trzyma jeden bardzo długi ciąg - sklejenie kolumny taki produkuje, a rozbicie na kolumnę od takiego się zaczyna - i bez zawijania siedział on za poziomym scrollbarem, pokazując kilkadziesiąt znaków naraz. Na danych kolumnowych nic się nie traci, bo zawijanie włącza się tylko na linii, która i tak się nie mieści. Robi to `overflow-wrap: break-word`, bo samo `pre-wrap` łamie na spacjach, a lista id po przecinkach nie ma żadnej.
- Zamknięcie Escapem, tylko jedna instancja naraz (ponowne kliknięcie bookmarkletu podświetla otwarty panel).

**Bez zmian**

- Brak persystencji: zamknięcie panelu czyści obydwa pola. Zero `localStorage`, zero cookies, zero requestów sieciowych.
- Puste linie są normalną wartością i nie są nigdzie po cichu wycinane, więc kolumna z Excela zakończona pustą linią dalej daje wiszący separator.
- Usuwanie duplikatów porównuje całe wiersze, dokładnie, z uwzględnieniem wielkości liter i białych znaków.

**Wygląd**

- Nowy panel na palecie Cookie Managera i Random Pickera (indigo `#4f46e5`, ten sam cień, promienie i overlay), z defensywnym resetem `.mw-dmt *` przeciwko CSS strony hosta. Prefiks klas `mw-dmt-`, więc wszystkie trzy bookmarklety mogą być otwarte na jednej stronie.
- Font Roboto z `fonts.googleapis.com` usunięty. W bookmarklecie to request third-party z dowolnej strony, blokowany przez CSP na wielu serwisach. Panel dziedziczy font strony, tak jak Cookie Manager i Random Picker. Textarea to wyjątek - wymuszają monospace niezależnie od hosta, bo dane z arkusza układają się w kolumny tylko przy równej szerokości glifów.

**Testy**

- 84 testy jednostkowe (Vitest + jsdom). Logika operacji siedzi w `src/core/transforms.ts` jako czyste funkcje `string -> string`, bez DOM-u, więc testy to zwykłe pary wejście/wyjście.

= = = = = = = = = = =

### v1.2.5 - 15.02.2020

- Dodanie w manifeście Chrome Extension "offline_enabled": true, żeby pokazywało w Chrome Store, że rozszerzenie działa też offline.

= = = = = = = = = = =

### v1.2.4 - 13.02.2020

- Dodanie fonta Roboto.

- Ustawienie wielkości fonta dla OperationsContainera i dla buttonów.

- Przygotowanie Chrome Extension i dodanie archiwum do folderu z projektem.

= = = = = = = = = = =

### v1.2.3 - 28.12.2019

- Przygotowanie plików do umieszczenia w publicznym repozytorium.

- Zmiana z wersji polskiej na angielską.

- Poprawa numeracji wersji.

= = = = = = = = = = =

### v1.2.2 - 14.10.2019

- Zmiana kilku letów na consty.

- Przebudowanie struktury folderów i podpięcie Webpacka.

- Zmiana onclicków z pliku .html na eventListenery w pliku .js.

= = = = = = = = = = =

### v1.2.1 - 08.07.2019

- Od teraz zaczęto dzielić notatki na wcześniejsze wersje, więc nie wszystko będzie w 100% dokładne.

- Skrócona funkcja zmiany duplikatów. Było:
const arrAsSet = new Set(splitedArr); // zamiana Arraya na Set
const setToArr = [...arrAsSet]; // zamiana Set z powrotem na Array
const modifiedData = setToArr.join("\n"); // zamiana Arraya na string dodając nowe linie

Nowa wersja:
const noDuplicatesArr = [...new Set(splitedArr)]; // zamiana Arraya na Set i od razu rozbicie go z powrotem na Array
const modifiedData = noDuplicatesArr.join("\n"); // zamiana Arraya na string dodając nowe linie

= = = = = = = = = = =

### v1.2.0 - 05.07.2019

- Funkcja kasowania duplikatów działa z danymi wklejonymi jako kolumny, ponieważ używa "\n", aby rozbić poszczególne wiersze jako elementy arraya. Następnie array jest zmieniany w obiekt Set, który nie dopuszcza, aby były w nim zduplikowane dane i sam je kasuje. Jeśli zostanie wklejonych kilka kolumn, to i tak porównywane będą całe wiersze:
    a) jeśli są minimum dwa identyczne wiersze (np. kolumna A, B i C), to zostaje tylko jeden;
    b) jeśli jakakolwiek kolumna w wierszu ma inną wartość (np. A i B są identyczne z innym wierszem, ale C ma inną wartość), wtedy nie jest to traktowane jako duplikat;
Potem obiekt Set jest zamieniany z powrotem na array za pomocą spread operator i jest łączony za pomocą "\n" w string, który jest wklejany do pola z wynikiem.
Czas potrzebny na wklejenie tu tabeli, usunięcie duplikatów oraz wklejenie jej z powrotem jest podobny do skorzystania z usunięcia duplikatów bezpośrednio w Excelu. Excel jest o tyle dokładniejszy, że można jeszcze wskazać konkretną kolumnę, w której mają być szukane dupliakty. 

= = = = = = = = = = =

### v1.1.0 - 02.07.2019

- Udało się poprawić kod zamiany znaków. Skróciło to kod tej funkcji z 19 do 11 linii. Teraz nie powinno być żadnych problemów nawet przy łączeniu znaków specjalnych z literami i cyframi w dowolnych kombinacjach. We wcześniejszej wersji była pętla, która jeśli wykryła znak specjalny, to dodawała escape char do wszystkich znaków w stringu. Prawdopodobnie w takim wypadku czasem mogły pojawiać się zbędne backslashe, które uniemożliwiały zmatchowanie stringów i replace znaków, a dodając do niektórych liter escape char tworzyły kolejne specjalne wyrażenia zarezerwowane dla RegExp.
    
Teraz jest tam:
const specialCharsToCheck = /[|\\{}()[\]^$+*?.]/g;
let charChangeFrom = charChangeFromField.replace(specialCharsToCheck, "\\$&");
$& oznacza, że przy każdym matchu zostaną dodane znaki, które są przed tym wyrażeniem - w tym przypadku \\ (jest podwójny, ponieważ sam wymaga escape char, żeby go użyć).

= = = = = = = = = = =

### v1.0.0 - 23.06.2019

- Tooltip stworzony przez połączenie użycia atrybutu data przy divie o klasie tooltipSymbol i właściwości clip-path (z pomocą narzędzia Clippy). Znacznie skróciło to kod css (z 65 linijek do 14 [13 jeśli nie liczyć prefixa pod Safari]), dzięki czemu nie trzeba było używać innych sposobów na dodanie trójktąta do tooltipa.
- Jest to pierwsza wersja narzędzia, jaką przekazałem w pracy.

= = = = = = = = = = =

### v??? - 22.06.2019

- Dodano tooltip bazujący na kilku rozwiązaniach znalezionych na różnych stronach i codepenach.

= = = = = = = = = = =

### v??? - 18.06.2019

- Button - Separator --> Kolumna - ustawiono, żeby zmieniał najpierw string na array dzieląc go na elementy arraya zgodnie z separatorem, a następnie, żeby połączył te elementy dodając nową linię po każdym. Dzięki temu nie trzeba było tworzyć RegExp z flagą, bo metoda split z automatu wyszukuje wszystkie powtórzenia znaku, który ma podzielić string na array. Skróciło to kod tego buttona z 21 do 8 linii.

= = = = = = = = = = =

### v??? - 17.06.2019

- Całkowita zmiana wyglądu.

= = = = = = = = = = =

### v??? - ??

- Oddzielny button dla normalnych separatorów i drugi (z pętlą) do znaków specjalnych. Potem połączono je w jeden korzystając z if statement. Nie działało to właściwie, dopóki nie zmieniono tam let na var - przy próbie wykorzystania let dalej w kodzie (już po if statement) konsola zwracała info, że jest undefined.

= = = = = = = = = = =

### v??? - 09.06.2019

- Dla buttona zmieniającego dane z wersji z separatorem na kolumnę najpierw stworzono obiekt RegExp z flagą global. W takim przypadku jeśli pojawiały się niektóre znaki specjalne, które JS rozumie po swojemu, to funkcja nie działała tak jak powinna, np. z $ lub * w ogóle nie działało, ^ dodawało \n tylko na początku stringa, kropka zamieniała wszystkie dane na \n, () dawało \n po każdym znaku.
Konieczne było dodanie pętli, która doda escape character "\" do wszystkich znaków i wtedy będą zachowywały się jak zwykły string.
