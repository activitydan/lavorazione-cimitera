---
name: CimiTera
description: Gestione cimiteriale per il Comune. Aspetto istituzionale e sobrio, niente effetti.
colors:
  navy: "#0a2f55"
  navy-900: "#0f1b2d"
  navy-950: "#0b1524"
  blu: "#1b5a8f"
  blu-600: "#164d7b"
  blu-200: "#9cc0df"
  blu-100: "#d5e5f2"
  blu-50: "#eaf2f9"
  verde: "#79aa4f"
  verde-700: "#3f7224"
  verde-600: "#4a822b"
  verde-50: "#eef6e7"
  navy-muted: "#8ea2b9"
  bg: "#f2f4f7"
  surface: "#ffffff"
  surface-2: "#f7f8fa"
  surface-3: "#eef1f5"
  border: "#e2e7ee"
  border-strong: "#cdd5df"
  border-soft: "#edf0f4"
  border-hover: "#aab6c4"
  text: "#14243a"
  text-2: "#33465c"
  muted: "#5d6d82"
  faint: "#93a0b1"
  ok: "#3f9a3c"
  warn: "#e9be1f"
  warn-50: "#fdf6dc"
  warn-200: "#f3e1a6"
  warn-700: "#8a6a00"
  danger: "#d9473f"
  danger-50: "#fdeeed"
  danger-200: "#efc4c1"
  danger-700: "#b8322b"
  orange: "#e07b22"
  orange-50: "#fdf0e4"
  orange-200: "#f1d3ad"
  orange-700: "#a85710"
typography:
  numero:
    fontFamily: "Montserrat, 'Nunito Sans Variable', system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  titolo-pagina:
    fontFamily: "Montserrat, 'Nunito Sans Variable', system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  titolo-finestra:
    fontFamily: "Montserrat, 'Nunito Sans Variable', system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  titolo-riquadro:
    fontFamily: "Montserrat, 'Nunito Sans Variable', system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  testo:
    fontFamily: "'Nunito Sans Variable', 'Nunito Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  testo-fitto:
    fontFamily: "'Nunito Sans Variable', 'Nunito Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
  etichetta:
    fontFamily: "'Nunito Sans Variable', 'Nunito Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.3
  minuto:
    fontFamily: "'Nunito Sans Variable', 'Nunito Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.25
rounded:
  cella: "2px"
  xs: "4px"
  sm: "6px"
  md: "8px"
  tondo: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  pagina-sopra: "20px"
  pagina-lati: "38px"
  pagina-lati-telefono: "16px"
components:
  button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-2}"
    typography: "{typography.testo-fitto}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "38px"
  button-hover:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text}"
  button-primary:
    backgroundColor: "{colors.blu}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "38px"
  button-primary-hover:
    backgroundColor: "{colors.blu-600}"
    textColor: "{colors.surface}"
  button-success:
    backgroundColor: "{colors.verde-600}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "38px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-2}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "38px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.testo}"
    rounded: "{rounded.sm}"
    padding: "0 11px"
    height: "38px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-2}"
    typography: "{typography.testo-fitto}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "34px"
  chip-on:
    backgroundColor: "{colors.blu-50}"
    textColor: "{colors.navy}"
  badge:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.text-2}"
    typography: "{typography.etichetta}"
    rounded: "{rounded.tondo}"
    padding: "0 9px"
    height: "24px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "16px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "#c9d5e3"
    typography: "{typography.testo}"
    rounded: "{rounded.sm}"
    padding: "0 12px 0 14px"
    height: "44px"
  nav-item-active:
    backgroundColor: "{colors.blu}"
    textColor: "{colors.surface}"
  table-header:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.muted}"
    typography: "{typography.etichetta}"
    padding: "10px 12px"
---

# Design System: CimiTera

## Overview

**Creative North Star: "Il registro comunale"**

CimiTera è lo strumento di lavoro di un ufficio comunale: un registro tenuto in ordine. Righe, numeri, stati e una mappa. Chi lo usa ci passa la giornata, spesso in piedi con il telefono in mano tra i viali: deve trovare subito il dato e non notare l'interfaccia. L'aspetto è istituzionale e sobrio. Il carattere viene dal marchio (blu notte e verde), dalla mappa e dalla precisione degli allineamenti, non dagli effetti.

La regola di fondo è sottrarre. Ogni colore dice qualcosa (uno stato, un'azione, il marchio); ogni ombra indica che qualcosa sta sopra a qualcos'altro; ogni angolo viene da una scala di quattro misure. Quello che serve solo a decorare non c'è: niente sfumature, niente riquadrini pastello dietro le icone, niente aloni, niente riquadri che si sollevano al passaggio del mouse.

I colori e i caratteri sono quelli scelti con il cliente e non si cambiano. La home su computer è lo standard: margini, distanze e misure delle altre pagine sono presi da lì.

**Key Characteristics:**
- Piatto: i riquadri hanno un bordo da 1 px e nessuna ombra.
- Fitto ma ordinato: testo a 14 px, tabelle e pulsanti a 13 px, distanze da 4, 8, 12, 16, 24.
- Un solo colore d'azione (blu). Il verde è il marchio e la conferma.
- I colori vivaci sono riservati agli stati e alla mappa.
- Stessa cosa, stesso aspetto: pulsanti, campi e riquadri identici in tutte le pagine.
- Tutto si usa anche con la tastiera, e sul telefono con un dito.

## Colors

Una base di grigi freddi, il blu notte del marchio per il menu, un blu per le azioni e un verde per il marchio e le conferme. I colori vivaci servono solo a dire lo stato di una cosa.

### Primary
- **Blu d'azione** (`blu`): pulsanti principali, collegamenti, voce attiva del menu, selezione, anello del focus. È l'unico colore che significa "qui si può agire".
- **Blu d'azione scuro** (`blu-600`): il pulsante principale quando ci passi sopra.
- **Blu chiaro** (`blu-50`, `blu-100`): sfondo della riga o della voce selezionata, avvisi informativi.

### Secondary
- **Verde del marchio** (`verde-600`): la parola "Tera" nel nome, il pulsante di conferma ("Salva", "Fatto"), i passi completati, le barre di avanzamento.
- **Verde chiaro del marchio** (`verde`): solo nel marchio su fondo scuro e nei grafici. Mai per il testo su bianco: non si legge abbastanza.

### Tertiary
- **Blu notte** (`navy`, `navy-900`, `navy-950`): il menu laterale (tinta unita `navy-900`), i codici delle schede, i titoli in evidenza.

### Neutral
- **Fondo pagina** (`bg`): dietro ai riquadri.
- **Bianco** (`surface`): riquadri, finestre, campi.
- **Grigi di servizio** (`surface-2`, `surface-3`): intestazioni delle tabelle, righe al passaggio del mouse, binari delle barre.
- **Bordi** (`border`, `border-strong`, `border-soft`, `border-hover`): `border` separa i riquadri; `border-soft` le righe dentro tabelle ed elenchi; `border-strong` disegna campi e pulsanti, che al passaggio prendono `border-hover`.
- **Testo** (`text`, `text-2`, `muted`): `text` per il contenuto, `text-2` per i pulsanti e le voci secondarie, `muted` per etichette e note. `muted` si legge su bianco e su tutti i grigi di servizio (contrasto di almeno 4,6 a 1).
- **Testo sul blu notte** (`navy-muted`): le scritte secondarie del menu laterale.
- **Grigio spento** (`faint`): solo segni grafici secondari. Mai per un testo da leggere.

### Stati
- **A posto** (`ok`), **Attenzione** (`warn`), **Urgente** (`danger`), **Da fare** (`orange`): pallini sulla mappa, etichette di stato, avvisi. Ogni stato ha la tinta chiara per lo sfondo (`-50`), una per il bordo (`-200`) e la tinta scura per il testo e per i contatori (`-700`). Il colore pieno non si usa per il testo piccolo: non si legge abbastanza.
- I colori dei tipi di sepoltura, dei quadranti, degli operatori e delle pratiche si scelgono in Impostazioni: sono dati, non decorazione. Compaiono come pallino, bordo o tinta di un'etichetta, mai come fondo pieno sotto un testo.
- I colori della planimetria e delle scritte sulla mappa stanno in `src/styles/map.css`: sono cartografia, non interfaccia.

### Named Rules
**La regola del colore che parla.** Un colore si usa solo se dice qualcosa: un'azione (blu), il marchio o una conferma (verde), uno stato. Se togliendolo non si perde nessuna informazione, va tolto.

**La regola delle tinte con il nome.** Nessun colore scritto a mano nelle pagine. Ogni colore è una variabile di `src/styles/base.css`; se ne serve uno nuovo, si aggiunge lì con un nome.

**La regola del dato che si legge.** Quando il colore di un dato diventa testo passa da `tintaTesto()` o `tinta()` (`src/lib/tinta.ts`), che lo scuriscono quanto basta per leggersi: stessa tinta, contrasto di almeno 4,5 a 1.

**La regola della tinta unita.** Niente sfumature. Fanno eccezione solo quelle che sono informazione: la quadrettatura della planimetria, il selettore "colore a scelta", la barra che scorre mentre l'app legge una lapide dalla foto, il tratteggio delle voci in attesa nel calendario.

## Typography

**Display Font:** Montserrat 700 e 800 (poi Nunito Sans, system-ui)
**Body Font:** Nunito Sans Variable (poi system-ui, Segoe UI)

**Character:** Montserrat dà il tono del marchio a titoli, numeri e codici. Nunito Sans porta tutto il resto: è morbido ma si legge bene anche piccolo, nelle tabelle e sul telefono. Il carattere a spaziatura fissa del sistema compare in un solo punto: il testo grezzo letto dalla foto di una lapide.

### Hierarchy
- **Numero** (Montserrat 800, 28 px, interlinea 1.1): i numeri grandi dei riepiloghi. Sempre con le cifre allineate (`tabular-nums`).
- **Titolo di pagina** (Montserrat 800, 20 px): uno per pagina.
- **Titolo di finestra** (Montserrat 700, 16 px): finestre, pannelli, nome del defunto nella scheda.
- **Titolo di riquadro** (Montserrat 700, 14 px): l'intestazione di ogni riquadro.
- **Testo** (Nunito Sans 400, 14 px, interlinea 1.45): il contenuto. Paragrafi mai più larghi di 75 caratteri.
- **Testo fitto** (Nunito Sans 400 o 700, 13 px): tabelle, elenchi, pulsanti, filtri.
- **Etichetta** (Nunito Sans 700, 12 px, colore `muted` o `text-2`): nomi dei campi, intestazioni delle tabelle, note, etichette di stato.
- **Minuto** (Nunito Sans 700, 11 px): contatori, voci dentro le caselle del calendario, assi dei grafici, scritte sulla mappa.

### Named Rules
**La regola delle sette misure.** Il testo usa solo 11, 12, 13, 14, 16, 20 e 28 px. Niente mezzi pixel. Le misure del marchio (nome e riga "by DAT | HYA Group") sono del cliente e restano fuori dalla scala.

**La regola delle minuscole.** Le etichette si scrivono normali, con la sola iniziale maiuscola. Niente maiuscolo spaziato. Fanno eccezione i nomi dei viali e delle aree sulla mappa, come nelle carte, e la riga sotto il marchio.

**La regola dei tre pesi.** Nunito Sans si usa a 400 (testo), 600 (voce in evidenza) e 700 (etichette, pulsanti, intestazioni). L'800 è solo di Montserrat: titoli di pagina, numeri e codici.

## Layout

Menu laterale blu notte (236 px da 1181 px in su, 76 px con le sole icone fino a 761 px, a scomparsa sul telefono), barra in alto da 64 px, contenuto che scorre. Le pagine usano tutta la larghezza con margini di 20 px sopra, 38 px ai lati e 24 px sotto; sul telefono 16 px ai lati.

Le distanze vengono da una scala corta: 4, 8, 12, 16, 24. Tra un riquadro e l'altro ci sono sempre 16 px, e 16 px è anche il margine interno dei riquadri. Le righe delle tabelle hanno 10 px sopra e sotto e 12 px ai lati; la prima e l'ultima colonna si allineano al titolo del riquadro.

Tre soglie: 1180 px (il menu si riduce alle icone), 1100 px (le colonne affiancate vanno una sotto l'altra), 760 px (telefono: menu a scomparsa, finestre che salgono dal basso, tabelle che diventano elenchi). Le tabelle con molte colonne mandano a capo le intestazioni invece di scorrere di lato.

## Elevation & Depth

Il sistema è piatto. I riquadri si staccano dal fondo con un bordo da 1 px e con il bianco su grigio, non con l'ombra. L'ombra compare solo su quello che sta davvero sopra ad altro contenuto.

### Shadow Vocabulary
- **Sulla mappa, piccolo** (`--shadow-1`: `0 1px 2px rgba(16, 24, 40, 0.1)`): le etichette della legenda e i selettori appoggiati sulla mappa.
- **Sospeso** (`--shadow-2`: `0 6px 16px rgba(16, 24, 40, 0.12), 0 1px 3px rgba(16, 24, 40, 0.08)`): menu a comparsa, comandi e riquadri sopra la mappa, messaggi a scomparsa, pannello laterale.
- **Finestra** (`--shadow-3`: `0 16px 40px rgba(10, 30, 60, 0.2)`): le finestre al centro dello schermo, sopra il velo scuro.
- **Focus** (`--focus-ring`: `0 0 0 2px #fff, 0 0 0 4px` blu): l'anello attorno all'elemento su cui si trova la tastiera, pieno e staccato da un filo bianco così si vede su ogni fondo, anche sul menu scuro. Nei campi il bordo diventa blu e lo accompagna un anello più leggero (`--focus`). Non è un'ombra decorativa e non si toglie mai.

### Named Rules
**La regola del piatto.** A riposo niente ombra. Al passaggio del mouse cambia il colore del bordo o dello sfondo, mai l'ombra, e niente si solleva o si sposta.

**La regola dell'ombra che serve.** Un'ombra è ammessa solo se l'elemento copre altro contenuto (mappa, pagina, finestra). Niente aloni colorati attorno a pulsanti, voci attive, pallini o caselle scelte.

## Shapes

Angoli appena smussati, da una scala di quattro misure. Più l'elemento è piccolo, più l'angolo è piccolo.

- **2 px** (`cella`): le caselline delle griglie dei loculi e le barre dei grafici, in alto.
- **4 px** (`--radius-xs`): elementi piccoli dentro altri elementi: casella di spunta, voce del calendario, etichetta sulla foto.
- **6 px** (`--radius-sm`): tutto quello che si preme o si compila: pulsanti, campi, filtri, voci del menu, righe cliccabili.
- **8 px** (`--radius`): i contenitori: riquadri, finestre, menu a comparsa, avvisi, foto.
- **Tondo** (999 px o 50%): etichette di stato, contatori, interruttori, pallini, cerchi con le iniziali.

I bordi sono da 1 px. Un bordo più spesso (3 o 4 px, solo a sinistra) si usa soltanto per dire il tipo o lo stato di una voce in agenda, nel calendario e nelle griglie dei loculi: lì il colore è il dato.

L'unica forma fuori scala è la sagoma del telefono nell'anteprima della Scheda Pro: è il disegno di un oggetto, non un riquadro.

## Components

### Buttons
Sobri e tutti uguali: stessa altezza dei campi, così stanno in riga.
- **Shape:** angolo da 6 px, bordo da 1 px, altezza 38 px (32 px il piccolo, 26 px il minimo, 46 px il grande); testo 13 px a peso 700.
- **Normale:** fondo bianco, bordo `border-strong`, testo `text-2`. Al passaggio: fondo `surface-2`.
- **Principale:** fondo `blu`, testo bianco; al passaggio `blu-600`. Uno per schermata.
- **Conferma:** fondo `verde-600`, testo bianco. Per chiudere un lavoro ("Salva", "Fatto").
- **Pericolo:** testo `danger`, bordo rosato; fondo `danger-50` al passaggio. Mai pieno.
- **Senza bordo:** trasparente, per le azioni secondarie dentro righe e intestazioni.
- **Focus:** anello `--focus`. **Spento:** opacità 0.5.
- Nessuna ombra e nessuno spostamento, né al passaggio né alla pressione.

### Chips
Filtri che si accendono e si spengono.
- **Style:** fondo bianco, bordo `border-strong`, angolo 6 px, altezza 34 px (28 px il piccolo), testo 13 px a peso 700.
- **Acceso:** fondo `blu-50`, bordo e testo blu, casella di spunta piena.

### Badges
- **Style:** tondo, altezza 24 px (20 px il piccolo), testo 12 px a peso 700, fondo chiaro e testo scuro della stessa tinta (`-50` e `-700`).
- Servono solo per lo stato o il tipo di una cosa. Lo stato è sempre scritto, mai detto dal solo colore.
- Le etichette nel colore di un dato (tipo di operazione, priorità, quadrante) prendono fondo e testo da `tinta()`.

### Avatar e sigle
- **Operatore:** cerchio bianco con le iniziali scure e un bordo da 2 px del colore dell'operatore. Mai iniziali bianche su fondo colorato: con i colori chiari non si leggono.
- **Quadrante:** quadratino bianco con la lettera scura e il bordo del colore del quadrante, lo stesso della mappa.

### Cards / Containers
- **Corner Style:** 8 px.
- **Background:** bianco su fondo pagina `bg`.
- **Shadow Strategy:** nessuna (vedi Elevation & Depth).
- **Border:** 1 px `border`.
- **Internal Padding:** 16 px; intestazione 14 px sopra e sotto, con una riga sotto.
- Un riquadro che si apre (cliccabile) cambia solo il colore del bordo al passaggio (`blu-100`).
- Mai un riquadro dentro un riquadro: dentro si separa con una riga o con un fondo `surface-2`.

### Inputs / Fields
- **Style:** fondo bianco, bordo `border-strong` da 1 px, angolo 6 px, altezza 38 px. Etichetta sopra, 12 px a peso 700.
- **Focus:** bordo `blu` e anello `--focus`.
- **Errore:** bordo `danger` e una riga di testo sotto che dice cosa correggere.

### Tables
- **Intestazione:** fondo `surface-2`, testo 12 px a peso 700 in `muted`, scritta normale (non maiuscola). Resta ferma in alto quando si scorre.
- **Righe:** 13 px, riga sottile sotto, fondo appena azzurro al passaggio, `blu-50` se scelta.
- Numeri a destra con le cifre allineate. Una riga che si apre si raggiunge con Tab e si apre con Invio.

### Navigation
- **Menu laterale:** fondo `navy-900` in tinta unita. Voci alte 44 px, angolo 6 px, testo 14 px a peso 700 in azzurro chiaro; al passaggio un velo bianco al 6%; la voce attiva ha il fondo `blu` pieno e il testo bianco, senza alone.
- **Linguette:** testo 13 px a peso 700, riga blu da 2 px sotto quella attiva.
- **Telefono:** il menu si apre da sinistra con il pulsante in alto; le voci sono le stesse ma ridotte a quelle che servono sul campo.

### Icone
Le icone stanno da sole, senza riquadrino colorato dietro. Blu notte (`navy`) accanto a un titolo o a una scelta, `muted` dentro le righe, bianche sui pulsanti pieni. Stessa famiglia (Lucide), tratto uguale, 16 px nei riquadri e 18-20 px nelle finestre.

### Mappa
Il componente che distingue l'app. Pallini pieni del colore dello stato con bordo bianco da 1 px; comandi e legenda bianchi con ombra `--shadow-2`, perché stanno sopra la fotografia. L'unica animazione continua dell'app è l'anello che pulsa attorno alla sepoltura scelta: serve a ritrovarla tra migliaia di punti.

## Do's and Don'ts

### Do:
- **Do** usare solo le variabili di `src/styles/base.css` per colori, angoli e ombre.
- **Do** tenere i riquadri piatti: bordo da 1 px `border`, angolo 8 px, nessuna ombra.
- **Do** usare le sette misure di testo (11, 12, 13, 14, 16, 20, 28 px) e i tre pesi di Nunito Sans (400, 600, 700).
- **Do** scrivere le etichette normali, con la sola iniziale maiuscola.
- **Do** scrivere sempre lo stato a parole accanto al colore.
- **Do** passare da `tinta()` o `tintaTesto()` ogni volta che il colore di un dato diventa testo.
- **Do** lasciare l'anello del focus su tutto quello che si può premere, righe delle tabelle comprese.
- **Do** tenere 16 px tra i riquadri e scegliere le altre distanze tra 4, 8, 12, 16 e 24.
- **Do** controllare ogni pagina a 1280 px, a 1440 px e sul telefono prima di chiuderla.

### Don't:
- **Don't** usare sfumature di colore, né sugli sfondi né sul testo né sulle barre.
- **Don't** mettere le icone dentro riquadrini pastello.
- **Don't** aggiungere ombre, aloni o sollevamenti al passaggio del mouse.
- **Don't** usare angoli più grandi di 8 px, né misure di testo con i mezzi pixel.
- **Don't** usare il maiuscolo spaziato per etichette e intestazioni.
- **Don't** scrivere un colore a mano in una pagina: se manca, va aggiunto alle variabili con un nome.
- **Don't** usare `faint` o il verde chiaro `verde` per un testo da leggere: il contrasto non basta.
- **Don't** cambiare colori, caratteri o marchio: sono quelli concordati con il cliente.
- **Don't** aggiungere animazioni: restano solo i passaggi brevi (0,15 s) che dicono che qualcosa è cambiato.
