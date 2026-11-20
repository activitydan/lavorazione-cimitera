# Information Architecture: CimiTera

Seconda stesura del 20 novembre 2026. Descrive la struttura com'è adesso nel codice. Le dieci proposte della prima stesura sono state approvate da Dan e fatte lo stesso giorno.

**Per tornare a prima delle proposte:** etichetta `backup-prima-della-struttura` e ramo `backup/prima-della-struttura` nel repository di lavorazione (commit `dfd4e0d`).

Punti fermi: menu a lista unica; sul computer la Mappa si apre dalla Dashboard e non è nel menu; niente restyling, colori e caratteri di oggi ([DESIGN.md](../../DESIGN.md)); telefono fedele al computer; niente 3D. Le parole sono quelle del [glossario](../../GLOSSARY.md).

Dato di partenza (risposta di Dan): in ufficio le quattro cose più frequenti pesano uguale. Sono cercare una postazione o un defunto, seguire le operazioni del giorno, seguire scadenze e pagamenti, lavorare sulle concessioni. Nessuna delle quattro deve stare più lontana delle altre.

## Cosa è cambiato con le dieci proposte

| N. | Cosa | Prima |
|---|---|---|
| 1 | La ricerca in alto trova postazioni e defunti, concessioni, pratiche, utenze votive e aree, divise per gruppo. Una postazione si apre nel pannello di lato sulla pagina dove sei; concessione, pratica e utenza aprono la loro finestra; solo le aree portano alla Mappa. | Trovava solo postazioni e aree e portava sempre alla Mappa. |
| 2 | Sul computer il pulsante verde della Dashboard è "Nuovo", con cinque scelte: Pratica, Concessione, Allaccio votivo, Segnalazione di manutenzione, Rilievo. | C'era solo "Nuovo rilievo". |
| 3 | Sulla Dashboard il riquadro "Scadenze e pagamenti": in scadenza, scadute, da pagare, morosi. | C'era "Attività recente", che ripeteva il Registro modifiche. |
| 4 | Ordine del menu: Dashboard, Ricerca, Operazioni cimiteriali, Concessioni, Illuminazione votiva, Scadenze e pagamenti, Manutenzioni, Censimento. | Censimento e Manutenzioni venivano prima delle voci d'ufficio. |
| 5 | La vista a giorni si chiama "Calendario" ovunque. | In Operazioni cimiteriali si chiamava "Agenda". |
| 6 | Un calendario solo: Dashboard, Operazioni cimiteriali, Manutenzioni e agenzie usano lo stesso. | Tre calendari diversi. |
| 7 | In Censimento la linguetta è "Rilievi per operatore". | Si chiamava "Operatori", come quella di Amministrazione. |
| 8 | Nel menu resta accesa "Ricerca" sulla scheda in vista estesa e "Censimento" sul Nuovo rilievo. | Non era accesa nessuna voce. |
| 9 | Agenzia funebre: un elenco solo, "Operazioni", con lo stato. Menu a due voci. | Tre voci: Calendario, Pratiche, Richieste. |
| 10 | Manutenzioni usa `?tab=` come le altre sezioni. | Usava `?vista=calendario`. |

I vecchi indirizzi continuano a funzionare: `?tab=agenda`, `?vista=calendario`, `/pratiche` e `/richieste` dell'agenzia.

Il pulsante "Nuovo" sta solo sulla Dashboard, dov'era "Nuovo rilievo": nelle altre pagine c'è già il pulsante principale della sezione ("Nuova pratica", "Nuova concessione") e due pulsanti principali vicini si farebbero concorrenza.

Lasciati come sono, per scelta: la lista unica del menu con la sola intestazione "Configurazione"; la Mappa fuori dal menu sul computer; Amministrazione e Impostazioni separate; le Verifiche dentro Censimento sul computer e nel menu sul telefono; il menu del telefono.

## Site Map

Indirizzi dopo il `#`. Tra parentesi chi può aprire la pagina, se non è di tutti.

**Fuori dall'app**
- Entra come `/` (senza sessione): Cittadino, Operatore (con scelta del nome), Agenzia funebre (con scelta dell'agenzia), Amministratore
- Pagina del Cittadino `/cittadino`: pubblica, senza menu
  - Risultati della ricerca, poi il defunto con mappa, foto e indicazioni

**Operatore e Amministratore, sul computer**
- Dashboard `/`
  - Mappa `/mappa`: si apre da "Apri la mappa"; nel menu resta accesa Dashboard
- Ricerca `/ricerca`: viste "Schede" e "Defunti" (`?vista=defunti`)
  - Scheda nel pannello di lato: si apre da qualunque elenco, dalla Mappa e dalla ricerca in alto
  - Scheda in vista estesa `/scheda/ID`: nel menu resta accesa Ricerca
- Operazioni cimiteriali `/operazioni`
  - Pratiche, con la finestra della pratica `?id=ID`; qui arrivano le richieste delle agenzie
  - Calendario `?tab=calendario`: settimana o mese, tutti i cimiteri o uno
  - Registro `?tab=registro`
- Concessioni `/concessioni`
  - Concessioni, con la finestra della concessione `?id=ID`
  - Concessionari `?tab=concessionari`
- Illuminazione votiva `/illuminazione-votiva`
  - Utenze, con la finestra dell'utenza `?id=ID`
  - Lampade da controllare `?tab=lampade`
- Scadenze e pagamenti `/scadenze`
  - Scadenzario
  - Invii DAT `?tab=invii`, con il singolo invio `?lotto=ID`
  - Avvisi di pagamento `?tab=avvisi`
  - Morosi `?tab=morosi`
- Manutenzioni `/manutenzioni`
  - Elenco, con la finestra della manutenzione `?id=ID`
  - Calendario `?tab=calendario`, con l'elenco "Da programmare"
- Censimento `/censimento`
  - Avanzamento
  - Quadranti `?tab=quadranti`
  - Rilievi per operatore `?tab=operatori`
  - Verifiche `?tab=verifiche`
  - Colombari e cappelle `?tab=strutture`, con la griglia a parete di ogni struttura
  - Nuovo rilievo `/rilievo`: da "Nuovo" sulla Dashboard; nel menu resta accesa Censimento
- Configurazione (solo Amministratore)
  - Amministrazione `/amministrazione`: Operatori, Agenzie funebri, Pagina del cittadino, Regole del Comune, Registro modifiche
  - Impostazioni `/impostazioni`: Campi della scheda, Elenchi

**Operatore e Amministratore, sul telefono**
- Dashboard `/`, Mappa `/mappa`, Ricerca `/ricerca`, Nuovo rilievo `/rilievo`, Manutenzioni `/manutenzioni`, Verifiche `/censimento?tab=verifiche`
- La scheda si apre a tutta pagina: `/scheda/ID`
- Le altre pagine dicono "Questa pagina si usa dal computer"

**Agenzia funebre**
- Calendario `/`
- Operazioni `/operazioni`: richieste e pratiche insieme, con i filtri di stato (`?stato=`)

## Navigation Model

- **Primary navigation**: menu laterale blu notte, lista unica. Dieci voci per l'Amministratore, otto per l'Operatore, due per l'Agenzia. Una sola intestazione, "Configurazione". Dopo Dashboard e Ricerca vengono le quattro voci d'ufficio, poi il lavoro sul campo.
- **Secondary navigation**: linguette sotto il titolo della pagina, da due a cinque. Ogni linguetta ha il suo indirizzo (`?tab=`).
- **Dettaglio**: una riga apre una finestra (concessione, pratica, utenza, manutenzione) o il pannello di lato (scheda). Non esiste un quarto livello: dal dettaglio si passa a un altro dettaglio con un collegamento, per esempio dalla scheda ad "Apri in Concessioni".
- **Utility navigation**: nella barra in alto la scelta del cimitero e la ricerca, che trova tutto senza cambiare pagina. Sulla Dashboard del computer il pulsante verde "Nuovo". In fondo al menu l'utente (cambia ruolo, simula senza rete) e la campanella degli alert, con i filtri per categoria.
- **Mobile navigation**: menu a scomparsa da sinistra con sei voci. Sulla Dashboard quattro azioni rapide: Nuovo rilievo, Ricerca, Segnala, Verifiche. La ricerca in alto resta su postazioni e aree.
- **Regola della profondità**: al massimo tre passi, menu, linguetta, dettaglio.

## Content Hierarchy

### Dashboard
1. Mappa con i conteggi per stato: è la vista d'insieme del cimitero e la porta della Mappa grande.
2. Agenda di oggi: le operazioni di oggi e di domani.
3. Calendario: operazioni, manutenzioni, verifiche e scadenze del mese.
4. Riquadri in basso: Censimento, Manutenzione, Scadenze e pagamenti. Ogni numero apre l'elenco che conta.

### Ricerca
1. Elenco delle schede o dei defunti, con l'interruttore "Schede / Defunti".
2. Filtri a sinistra: nome, codice, date, stato, quadrante, tipologia, struttura, concessione, lampada.
3. Esporta, sulle righe scelte o su tutti i risultati.

### Scheda (il centro di tutto)
1. Codice, nome, foto, stato della postazione.
2. Azioni: Modifica, Modifica GPS, Scheda PDF, Segnala, Verifica, Indicazioni, Sulla mappa.
3. Sezioni, in quest'ordine: Defunti, Ubicazione, Concessione, Illuminazione votiva, Pratiche, Manutenzioni e verifiche, Documenti, Note, Storico.
4. Ogni sezione porta alla sua pagina con un collegamento ("Apri in Concessioni").

### Operazioni cimiteriali
1. Pratiche da lavorare, aperte e programmate, e richieste delle agenzie in attesa.
2. Calendario della settimana: per ogni operazione tipo, defunto, postazione, agenzia, operatori. Un segnale avvisa se due operazioni si sovrappongono.
3. Registro delle operazioni eseguite.

### Concessioni
1. Elenco con i filtri di stato: attive, in scadenza, in decadenza, scadute, chiuse.
2. Finestra della concessione con le azioni: rinnovo, subentro, rinuncia, decadenza, contratto in PDF.
3. Concessionari.

### Illuminazione votiva
1. Numeri del servizio: utenze attive, punti luce, canoni dell'anno, da allacciare.
2. Elenco delle utenze con i filtri di stato.
3. Lampade da controllare.

### Scadenze e pagamenti
Le linguette seguono il giro: cosa scade (Scadenzario), la lettera che parte (Invii DAT), l'avviso da pagare (Avvisi di pagamento), chi non ha pagato (Morosi).

### Manutenzioni
1. Segnalazioni aperte e programmate, con foto e priorità.
2. Filtri per stato e categoria.
3. Calendario: a destra il giorno scelto e l'elenco "Da programmare". Scelta una voce, un clic sul giorno la programma.

### Censimento
1. Avanzamento: schede censite, ritmo, fine stimata.
2. Verifiche da chiudere.
3. Quadranti, rilievi per operatore, colombari e cappelle: dati di servizio.

### Pagina del Cittadino
1. La casella "Nome e cognome".
2. Il defunto: nome, anni, dove si trova, mappa.
3. Il pulsante delle indicazioni per arrivarci.

### Agenzia funebre
1. Calendario delle proprie operazioni.
2. "Richiedi un'operazione".
3. Le tue operazioni: in attesa, confermate, eseguite, rifiutate.

## User Flows

### Cittadino: trovare un defunto
1. Arriva su `/cittadino` dal QR all'ingresso del cimitero o da "Entra come".
2. Scrive nome e cognome.
   - Un solo risultato: si apre il defunto.
   - Più risultati: elenco con nome, anni e viale, poi sceglie.
   - Scheda non visibile al pubblico: non compare.
3. Vede dove si trova e apre le indicazioni.

### Operatore sul campo: nuovo rilievo (telefono)
1. Dashboard, azione rapida "Nuovo rilievo" (o voce del menu).
2. Cinque passi: foto, posizione, classificazione, anagrafica, riepilogo.
   - Dalla foto l'app legge nomi e date; l'operatore controlla e conferma.
   - Senza rete il rilievo resta sul telefono e parte quando la rete torna.
3. Salva: nasce la scheda con il suo codice. Da lì "Nuovo rilievo" per la postazione accanto.

### Operatore sul campo: chiudere una verifica (telefono)
1. Menu, Verifiche: le sue, in ordine di scadenza.
2. Apre la scheda, controlla sul posto.
3. Chiude con l'esito: dati confermati o corretti.

### Ufficio: trovare una cosa e lavorarci
1. Scrive un nome o un numero nella ricerca in alto, da qualunque pagina.
2. Sceglie il risultato.
   - Postazione o defunto: la scheda si apre nel pannello di lato, senza cambiare pagina.
   - Concessione, pratica o utenza: si apre la sua finestra, nella sua sezione.
   - Viale o quadrante: si va sulla Mappa.
3. Dalla scheda parte tutto: concessione, utenza votiva, pratica, segnalazione, documenti.

### Ufficio: registrare un'operazione cimiteriale
1. Dashboard, "Nuovo", Pratica. Oppure Operazioni cimiteriali, "Nuova pratica".
2. Sceglie tipo, defunto, postazione, giorno e ora, operatori.
   - Su richiesta di un'agenzia: la pratica nasce accogliendo la richiesta.
   - Con tariffa: nasce l'avviso di pagamento.
3. La pratica passa da aperta a programmata e compare nel calendario e tra gli alert di chi la esegue.
4. Il giorno dell'operazione si segna "eseguita": la scheda si aggiorna e l'operazione entra nel Registro.

### Ufficio: accogliere la richiesta di un'agenzia
1. Arriva un alert "Agenzie funebri"; la richiesta è in Operazioni cimiteriali.
2. L'ufficio assegna la postazione e accoglie, oppure rifiuta con il motivo.
3. L'agenzia vede la risposta nel suo calendario e nel suo elenco.

### Ufficio: nuova concessione
1. Dashboard, "Nuovo", Concessione. Oppure Concessioni, "Nuova concessione".
2. Sceglie una postazione senza concessione, il concessionario (persona o ente), la durata.
3. Nasce il contratto, scaricabile in PDF, e l'avviso di pagamento della tariffa.

### Ufficio: dalla scadenza al pagamento
1. Dashboard, riquadro "Scadenze e pagamenti": un numero porta alla linguetta giusta.
2. Scadenzario: spunta le righe in scadenza.
3. "Invia tramite DAT": nasce un invio con le lettere di scadenza (simulato).
4. Rinnovo o chiusura della concessione; per il rinnovo nasce l'avviso di pagamento.
   - Pagato: fine.
   - Scaduto: il nome passa tra i Morosi, con i solleciti.

### Ufficio: programmare una manutenzione
1. Manutenzioni, Calendario.
2. Sceglie una voce da "Da programmare", a destra.
3. Clic sul giorno: si apre la finestra con la data già scritta; sceglie gli operatori e salva.

### Agenzia funebre: chiedere un'operazione
1. Entra e vede il suo calendario.
2. "Richiedi un'operazione": tipo, defunto, giorno e ora proposti.
3. La richiesta compare in Operazioni come "In attesa". Diventa "Confermata" quando l'ufficio la accoglie, oppure "Rifiutata" con il motivo.

### Amministratore: adattare la scheda
1. Impostazioni, Campi della scheda.
2. Aggiunge o rinomina un campo, sceglie il tipo e dove compare (rilievo, filtri, colonna in Ricerca, obbligatorio).
3. L'anteprima a destra mostra subito il modulo sul telefono. Un campo con dati non si cancella: si archivia.

## Naming Conventions

| Concetto | Parola nell'interfaccia | Note |
|---|---|---|
| Posto di sepoltura | Postazione | Mai "manufatto". |
| Documento di una postazione | Scheda | Ha un codice, per esempio CIM-RAG-000123. |
| Persona sepolta | Defunto | |
| Colombaio o cappella | Struttura, nel menu "Colombari e cappelle" | I posti si vedono nella griglia a parete. |
| Contratto sulla postazione | Concessione | Chi la ha è il Concessionario. |
| Contratto della lampada | Utenza votiva | Chi la paga è l'Abbonato. |
| Inumazione, tumulazione, esumazione, estumulazione, traslazione | Operazione cimiteriale | Il suo fascicolo è la Pratica. |
| Domanda di un'agenzia | Richiesta | Diventa una pratica quando l'ufficio la accoglie. Per l'agenzia sono entrambe "Operazioni". |
| Guasto o lavoro da fare | Manutenzione; l'azione è "Segnala" | |
| Controllo assegnato a un operatore | Verifica | |
| Censire una postazione sul campo | Rilievo | "Nuovo rilievo". |
| Lettera che avvisa di una scadenza | Lettera di scadenza | Parte con un Invio DAT. |
| Documento per pagare | Avviso di pagamento | "Avviso" da solo non si usa. |
| Notifica nella campanella | Alert | |
| Vista a giorni | Calendario | Una parola sola, ovunque. |
| Elenco di oggi e domani | Agenda di oggi | Solo sulla Dashboard. |
| Zona del cimitero | Quadrante | Lettera e colore, gli stessi della mappa. |
| Creare qualcosa dalla Dashboard | Nuovo | Pratica, Concessione, Allaccio votivo, Segnalazione di manutenzione, Rilievo. |

## Component Reuse Map

| Componente | Dove si usa | Differenze |
|---|---|---|
| Guscio: menu, barra in alto, contenuto | Tutte le pagine tranne Entra come e Cittadino | Per l'agenzia la barra ha solo il cimitero. Sul telefono il menu è a scomparsa. |
| Linguette | Tutte le sezioni con più viste | La linguetta scelta sta nell'indirizzo. |
| Tabella con pagine | Ricerca, Concessioni, Illuminazione votiva, Operazioni, Scadenze, Censimento, Amministrazione, Agenzia | Sul telefono la Ricerca diventa un elenco a card. |
| Pannello della scheda | Ogni pagina: si apre da elenchi, Mappa e ricerca in alto | Sul telefono è la pagina `/scheda/ID`. |
| Finestra di dettaglio | Concessione, pratica, utenza, manutenzione | Si apre con `?id=` e si chiude con Esc. |
| Calendario (`src/components/Calendario.tsx`) | Dashboard, Operazioni cimiteriali, Manutenzioni, Agenzia funebre, Amministrazione › Agenzie | Dashboard: tutto, per mese. Operazioni: solo operazioni, settimana o mese, tutti i cimiteri. Manutenzioni: solo manutenzioni, con "Da programmare" e la scelta del giorno. Agenzia: solo le sue operazioni. |
| Ricerca in alto | Barra in alto | Sul telefono solo postazioni e aree. |
| Mappa | Dashboard, Mappa, Censimento › Quadranti, Nuovo rilievo, Cittadino | Sulla Dashboard del telefono è ferma. |
| Griglia a parete | Colombari e cappelle, scheda, Mappa | |
| Esporta | Ricerca, Concessioni, Illuminazione votiva, Manutenzioni | In Ricerca apre una finestra con Excel, PDF e totali; nelle altre scarica subito l'Excel dell'elenco. |
| Campanella | Menu sul computer, barra sul telefono | Filtri per categoria. |

## Content Growth Plan

- **Schede e defunti** (migliaia, crescono fino a fine censimento, poi piano): 50 righe per pagina, filtri, ricerca. Regge così.
- **Pratiche e Registro delle operazioni** (crescono per sempre): filtri per stato e tipo. Quando gli anni saranno più di uno servirà il filtro per anno, come in Avvisi di pagamento.
- **Avvisi di pagamento** (crescono ogni anno): già divisi per anno. Per gli invii DAT servirà la stessa divisione quando saranno molti.
- **Manutenzioni**: le chiuse escono dalla vista di lavoro con il filtro di stato; 25 per pagina.
- **Registro modifiche e Storico della scheda** (crescono a ogni modifica): dal più recente. Quando diventano lunghi servono le pagine.
- **Alert**: letti e non letti, filtri per categoria. Vanno fatti scadere dopo un periodo, altrimenti la campanella si riempie.
- **Risultati della ricerca in alto**: al massimo sei postazioni e tre per ogni altro gruppo. Chi ne vuole di più va nella sezione.
- **Documenti della scheda**: pochi per scheda, elenco semplice.
- **Fisso**: menu, linguette, Regole del Comune, campi della scheda, elenchi. Cambia solo quando lo cambia l'Amministratore.

## URL Strategy

- Pattern: `#/sezione`, più `?tab=linguetta` e `?id=dettaglio`. Esempio: `#/operazioni?id=pr-0002` apre la pratica.
- Segmenti dinamici: solo la scheda, `#/scheda/CODICE`.
- Altri parametri: `vista` (in Ricerca "schede" o "defunti"), `stato` (filtro pronto in Manutenzioni e nell'elenco dell'agenzia), `q` (quadrante evidenziato), `lotto` (invio DAT aperto), `tutte` (sul telefono tutte le manutenzioni e non solo le mie), `nuovo=1` (apre la finestra "nuovo" della sezione, poi sparisce dall'indirizzo).
- Regola: ogni linguetta e ogni dettaglio aperto ha un indirizzo. Così il tasto Indietro del browser funziona, e un alert o un collegamento possono portare al punto esatto.
- Un indirizzo che cambia tiene vivo quello vecchio: `?tab=agenda`, `?vista=calendario`, `/pratiche` e `/richieste` portano ancora nel posto giusto.
- Fuori dal menu e senza sessione: `#/cittadino`. È l'indirizzo stampato sul cartello con il QR e non deve cambiare.
- L'agenzia usa indirizzi suoi (`#/` è il suo calendario, `#/operazioni` il suo elenco): la stessa parola porta a pagine diverse secondo il ruolo.
