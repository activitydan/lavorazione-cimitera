# Information Architecture: CimiTera

Prima stesura del 20 novembre 2026. Descrive la struttura di oggi, letta dal codice, e propone alcuni spostamenti. **Le proposte non sono ancora nel codice: si fanno solo quelle che Dan approva.**

Punti fermi, già decisi: menu a lista unica; sul computer la Mappa si apre dalla Dashboard e non è nel menu; niente restyling, colori e caratteri di oggi ([DESIGN.md](../../DESIGN.md)); telefono fedele al computer; niente 3D. Le parole sono quelle del [glossario](../../GLOSSARY.md).

Dato di partenza per le proposte (risposta di Dan): in ufficio le quattro cose più frequenti pesano uguale. Sono cercare una postazione o un defunto, seguire le operazioni del giorno, seguire scadenze e pagamenti, lavorare sulle concessioni. Nessuna delle quattro deve stare più lontana delle altre.

## Proposte di spostamento

Ogni proposta ha un numero: basta dire quali vanno fatte.

| N. | Proposta | Oggi | Perché | Peso |
|---|---|---|---|---|
| 1 | **La ricerca in alto trova tutto e non ti sposta.** Risultati divisi per gruppo: postazioni e defunti, concessioni, pratiche, utenze votive, aree. Una postazione si apre nel pannello di lato, sulla pagina dove sei; concessione, pratica e utenza aprono la loro finestra; solo le aree portano alla Mappa. | Trova solo postazioni e aree, e porta sempre alla Mappa, anche se stavi lavorando in Concessioni. | Tutti e quattro i lavori d'ufficio partono da un nome o da un numero. | Medio |
| 2 | **Sul computer il pulsante verde diventa "Nuovo"**, con cinque scelte: Pratica, Concessione, Allaccio votivo, Segnalazione di manutenzione, Rilievo. Sul telefono resta "Nuovo rilievo". | In alto c'è solo "Nuovo rilievo". | Il rilievo si fa sul campo con il telefono; alla scrivania si creano pratiche, concessioni e allacci. | Piccolo |
| 3 | **Dashboard: riquadro "Scadenze e pagamenti" al posto di "Attività recente".** Quattro numeri che aprono la linguetta giusta: concessioni in scadenza, scadute, avvisi da pagare, morosi. | In basso ci sono Censimento, Manutenzione, Attività recente. Scadenze e concessioni non compaiono. | "Attività recente" ripete il Registro modifiche di Amministrazione. Cambia la decisione del 12 novembre ("Attività recente resta"). | Piccolo |
| 4 | **Ordine del menu:** Dashboard, Ricerca, Operazioni cimiteriali, Concessioni, Illuminazione votiva, Scadenze e pagamenti, Manutenzioni, Censimento. | Censimento e Manutenzioni vengono prima delle voci d'ufficio. | Le quattro cose frequenti stanno subito sotto Ricerca. Il Censimento va in fondo perché è una campagna che finisce. | Piccolo |
| 5 | **Una parola sola per la vista a giorni: "Calendario".** La linguetta "Agenda" di Operazioni cimiteriali diventa "Calendario". "Agenda di oggi" resta il nome dell'elenco di oggi e domani sulla Dashboard. | "Agenda" in Operazioni, "Calendario" in Manutenzioni, sulla Dashboard e per le agenzie. | Stessa cosa, stesso nome. | Minimo |
| 6 | **Un calendario solo.** Operazioni e Manutenzioni usano il calendario grande della Dashboard, già filtrato sul loro argomento, e tengono le loro azioni (vista a settimana, scegliere il giorno di una manutenzione). | Tre calendari diversi per aspetto e per comportamento. | Chi impara a leggerne uno li sa leggere tutti. | Grande |
| 7 | **Censimento › "Operatori" diventa "Rilievi per operatore".** | Due linguette "Operatori": in Censimento (quanto ha rilevato ognuno) e in Amministrazione (aggiungere e togliere persone). | Stesso nome per due cose diverse. | Minimo |
| 8 | **Il menu dice sempre dove sei.** Sulla scheda in vista estesa resta accesa "Ricerca"; sul Nuovo rilievo resta accesa "Censimento". | In quelle due pagine nel menu non è accesa nessuna voce. | Come già succede per la Mappa, che tiene accesa "Dashboard". | Minimo |
| 9 | **Agenzia funebre: "Pratiche" e "Richieste" in un elenco solo, "Operazioni"**, con lo stato: in attesa, confermata, eseguita, rifiutata. Il menu dell'agenzia passa a due voci. Da valutare. | Tre voci: Calendario, Pratiche, Richieste. | Per l'agenzia è la stessa operazione in due momenti. | Medio |
| 10 | **Stessa regola per gli indirizzi delle linguette.** Manutenzioni passa a `?tab=` come tutte le altre sezioni; i vecchi collegamenti continuano a funzionare. | Manutenzioni usa `?vista=calendario`, le altre sezioni `?tab=`. | Una regola sola: chi apre un collegamento arriva sempre alla linguetta giusta. | Minimo |

Cose che consiglio di **non** toccare: la lista unica del menu, con la sola intestazione "Configurazione"; la Mappa fuori dal menu sul computer; Amministrazione e Impostazioni separate (persone e regole da una parte, campi ed elenchi dall'altra); le Verifiche dentro Censimento sul computer e nel menu sul telefono; il menu del telefono.

## Site Map

Indirizzi dopo il `#`. Tra parentesi chi può aprire la pagina, se non è di tutti.

**Fuori dall'app**
- Entra come `/` (senza sessione): Cittadino, Operatore (con scelta del nome), Agenzia funebre (con scelta dell'agenzia), Amministratore
- Pagina del Cittadino `/cittadino`: pubblica, senza menu
  - Risultati della ricerca, poi il defunto con mappa, foto e indicazioni

**Operatore e Amministratore, sul computer**
- Dashboard `/`
  - Mappa `/mappa`: si apre da "Apri la mappa"; nel menu resta accesa Dashboard
- Ricerca `/ricerca`: viste "Schede" e "Defunti"
  - Scheda nel pannello di lato: si apre da qualunque elenco e dalla Mappa
  - Scheda in vista estesa `/scheda/ID`
- Censimento `/censimento`
  - Avanzamento `?tab=avanzamento`
  - Quadranti `?tab=quadranti`
  - Operatori `?tab=operatori` (proposta 7)
  - Verifiche `?tab=verifiche`
  - Colombari e cappelle `?tab=strutture`, con la griglia a parete di ogni struttura
  - Nuovo rilievo `/rilievo`: dal pulsante verde in alto
- Manutenzioni `/manutenzioni`
  - Elenco, con la finestra della manutenzione `?id=ID`
  - Calendario `?vista=calendario` (proposta 10)
- Concessioni `/concessioni`
  - Concessioni `?tab=concessioni`, con la finestra della concessione `?id=ID`
  - Concessionari `?tab=concessionari`
- Illuminazione votiva `/illuminazione-votiva`
  - Utenze `?tab=utenze`, con la finestra dell'utenza `?id=ID`
  - Lampade da controllare `?tab=lampade`
- Operazioni cimiteriali `/operazioni`
  - Pratiche `?tab=pratiche`, con la finestra della pratica `?id=ID`; qui arrivano le richieste delle agenzie
  - Agenda `?tab=agenda` (proposta 5)
  - Registro `?tab=registro`
- Scadenze e pagamenti `/scadenze`
  - Scadenzario `?tab=scadenzario`
  - Invii DAT `?tab=invii`, con il singolo invio `?lotto=ID`
  - Avvisi di pagamento `?tab=avvisi`
  - Morosi `?tab=morosi`
- Configurazione (solo Amministratore)
  - Amministrazione `/amministrazione`: Operatori, Agenzie funebri, Pagina del cittadino, Regole del Comune, Registro modifiche
  - Impostazioni `/impostazioni`: Campi della scheda, Elenchi

**Operatore e Amministratore, sul telefono**
- Dashboard `/`, Mappa `/mappa`, Ricerca `/ricerca`, Nuovo rilievo `/rilievo`, Manutenzioni `/manutenzioni`, Verifiche `/censimento?tab=verifiche`
- La scheda si apre a tutta pagina: `/scheda/ID`
- Le altre pagine dicono "Questa pagina si usa dal computer"

**Agenzia funebre**
- Calendario `/`
- Pratiche `/pratiche`
- Richieste `/richieste` (proposta 9)

## Navigation Model

- **Primary navigation**: menu laterale blu notte, lista unica. Dieci voci per l'Amministratore, otto per l'Operatore, tre per l'Agenzia. Una sola intestazione, "Configurazione".
- **Secondary navigation**: linguette sotto il titolo della pagina, da due a cinque. Ogni linguetta ha il suo indirizzo (`?tab=`).
- **Dettaglio**: una riga apre una finestra (concessione, pratica, utenza, manutenzione) o il pannello di lato (scheda). Non esiste un quarto livello: dal dettaglio si passa a un altro dettaglio con un collegamento, per esempio dalla scheda ad "Apri in Concessioni".
- **Utility navigation**: nella barra in alto la scelta del cimitero, la ricerca e il pulsante verde. In fondo al menu l'utente (cambia ruolo, simula senza rete) e la campanella degli alert, con i filtri per categoria.
- **Mobile navigation**: menu a scomparsa da sinistra con sei voci. Sulla Dashboard quattro azioni rapide: Nuovo rilievo, Ricerca, Segnala, Verifiche.
- **Regola della profondità**: al massimo tre passi, menu, linguetta, dettaglio.

## Content Hierarchy

### Dashboard
1. Mappa con i conteggi per stato: è la vista d'insieme del cimitero e la porta della Mappa grande.
2. Agenda di oggi: le operazioni di oggi e di domani.
3. Calendario grande: operazioni, manutenzioni, verifiche e scadenze del mese.
4. Riquadri in basso: Censimento, Manutenzione, Attività recente (proposta 3).

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
2. Agenda della settimana.
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
3. Calendario per scegliere il giorno.

### Censimento
1. Avanzamento: schede censite, ritmo, fine stimata.
2. Verifiche da chiudere.
3. Quadranti, operatori, colombari e cappelle: dati di servizio.

### Pagina del Cittadino
1. La casella "Nome e cognome".
2. Il defunto: nome, anni, dove si trova, mappa.
3. Il pulsante delle indicazioni per arrivarci.

### Agenzia funebre
1. Calendario delle proprie operazioni.
2. "Richiedi un'operazione".
3. Stato di pratiche e richieste.

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

### Ufficio: trovare una postazione e lavorarci
1. Ricerca in alto oppure pagina Ricerca.
2. Sceglie la riga: la scheda si apre nel pannello di lato (proposta 1: senza cambiare pagina).
3. Dalla scheda parte tutto: concessione, utenza votiva, pratica, segnalazione, documenti.

### Ufficio: registrare un'operazione cimiteriale
1. Operazioni cimiteriali, "Nuova pratica" (proposta 2: anche da "Nuovo" in alto).
2. Sceglie tipo, defunto, postazione, giorno e ora, operatori.
   - Su richiesta di un'agenzia: la pratica nasce accogliendo la richiesta.
   - Con tariffa: nasce l'avviso di pagamento.
3. La pratica passa da aperta a programmata e compare in agenda, sul calendario e tra gli alert di chi la esegue.
4. Il giorno dell'operazione si segna "eseguita": la scheda si aggiorna e l'operazione entra nel Registro.

### Ufficio: accogliere la richiesta di un'agenzia
1. Arriva un alert "Agenzie funebri"; la richiesta è in Operazioni cimiteriali.
2. L'ufficio assegna la postazione e accoglie, oppure rifiuta con il motivo.
3. L'agenzia vede la risposta nel suo calendario e nel suo elenco.

### Ufficio: nuova concessione
1. Concessioni, "Nuova concessione".
2. Sceglie una postazione senza concessione, il concessionario (persona o ente), la durata.
3. Nasce il contratto, scaricabile in PDF, e l'avviso di pagamento della tariffa.

### Ufficio: dalla scadenza al pagamento
1. Scadenzario: spunta le righe in scadenza.
2. "Invia tramite DAT": nasce un invio con le lettere di scadenza (simulato).
3. Rinnovo o chiusura della concessione; per il rinnovo nasce l'avviso di pagamento.
   - Pagato: fine.
   - Scaduto: il nome passa tra i Morosi, con sollecito e diffida.

### Agenzia funebre: chiedere un'operazione
1. Entra e vede il suo calendario.
2. "Richiedi un'operazione": tipo, defunto, giorno e ora proposti.
3. Aspetta la risposta dell'ufficio: confermata (diventa una pratica) o rifiutata.

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
| Domanda di un'agenzia | Richiesta | Diventa una pratica quando l'ufficio la accoglie. |
| Guasto o lavoro da fare | Manutenzione; l'azione è "Segnala" | |
| Controllo assegnato a un operatore | Verifica | |
| Censire una postazione sul campo | Rilievo | "Nuovo rilievo". |
| Lettera che avvisa di una scadenza | Lettera di scadenza | Parte con un Invio DAT. |
| Documento per pagare | Avviso di pagamento | "Avviso" da solo non si usa. |
| Notifica nella campanella | Alert | |
| Vista a giorni | Calendario | Oggi in Operazioni si chiama "Agenda" (proposta 5). |
| Elenco di oggi e domani | Agenda di oggi | Solo sulla Dashboard. |
| Zona del cimitero | Quadrante | Lettera e colore, gli stessi della mappa. |

## Component Reuse Map

| Componente | Dove si usa | Differenze |
|---|---|---|
| Guscio: menu, barra in alto, contenuto | Tutte le pagine tranne Entra come e Cittadino | Per l'agenzia la barra ha solo il cimitero. Sul telefono il menu è a scomparsa. |
| Linguette | Tutte le sezioni con più viste | La linguetta scelta sta nell'indirizzo. |
| Tabella con pagine | Ricerca, Concessioni, Illuminazione votiva, Operazioni, Scadenze, Censimento, Amministrazione | Sul telefono la Ricerca diventa un elenco a card. |
| Pannello della scheda | Ricerca, Mappa, Dashboard e ogni elenco che cita una scheda | Sul telefono è la pagina `/scheda/ID`. |
| Finestra di dettaglio | Concessione, pratica, utenza, manutenzione | Si apre con `?id=` e si chiude con Esc. |
| Calendario grande | Dashboard, Agenzia funebre | Per l'agenzia solo le sue operazioni. Proposta 6: anche Operazioni e Manutenzioni. |
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
- **Documenti della scheda**: pochi per scheda, elenco semplice.
- **Fisso**: menu, linguette, Regole del Comune, campi della scheda, elenchi. Cambia solo quando lo cambia l'Amministratore.

## URL Strategy

- Pattern: `#/sezione`, più `?tab=linguetta` e `?id=dettaglio`. Esempio: `#/operazioni?id=pr-0002` apre la pratica.
- Segmenti dinamici: solo la scheda, `#/scheda/CODICE`.
- Altri parametri: `vista` (in Ricerca "schede" o "defunti"; in Manutenzioni il calendario, vedi proposta 10), `stato` (filtro pronto in Manutenzioni), `q` (quadrante evidenziato), `lotto` (invio DAT aperto), `tutte` (sul telefono tutte le manutenzioni e non solo le mie).
- Regola: ogni linguetta e ogni dettaglio aperto ha un indirizzo. Così il tasto Indietro del browser funziona, e un alert o un collegamento possono portare al punto esatto.
- Fuori dal menu e senza sessione: `#/cittadino`. È l'indirizzo stampato sul cartello con il QR e non deve cambiare.
- L'agenzia usa indirizzi suoi (`#/`, `#/pratiche`, `#/richieste`): con un altro ruolo `#/pratiche` non esiste.
