import { useState, useRef } from 'react';
import { Navigation, Plus, X } from 'lucide-react';
import { BadgeAvviso } from '../components/Avvisi';
import { Calendario } from '../components/Calendario';
import { EditorDefunti } from '../components/scheda/SchedaForm';
import { Empty, Field, Modal, Seg } from '../components/ui';
import { COLORI_OPERAZIONE, NOMI_OPERAZIONE, STATI_PRATICA, TIPI_OPERAZIONE, inviaRichiesta, nomeOperazione } from '../data/pratiche';
import { descrizioneScheda, useCimitero, useUtente } from '../data/selectors';
import { indiceSchede, toast, useStore } from '../data/store';
import type { Defunto, Pratica, Richiedente, RichiestaAgenzia, Scheda, TipoOperazione } from '../data/types';
import { aggiungiGiorni, data, dataBreve, nomeCompleto, oggiISO } from '../lib/format';
import { googleMapsIndicazioni } from '../lib/geo';
import { setQuery, useRotta, vai } from '../router';
import { attivabile, useEsc } from '../lib/tastiera';
import { tinta } from '../lib/tinta';

// L'area dell'agenzia funebre: vede solo le sue operazioni e le sue richieste.
// Propone giorno e ora; la postazione la assegna l'ufficio quando apre la pratica.

const DEFUNTO_VUOTO: Defunto = { nome: '', cognome: '', dataNascita: null, dataMorte: null };

// Per l'agenzia una richiesta e la pratica che ne nasce sono la stessa operazione in due momenti: un elenco solo, con lo stato.
type StatoAgenzia = 'in_attesa' | 'confermata' | 'eseguita' | 'rifiutata' | 'annullata';
const STATI_AGENZIA: { id: StatoAgenzia; label: string; plurale: string; classe: string }[] = [
  { id: 'in_attesa', label: 'In attesa', plurale: 'In attesa', classe: 'badge--arancio' },
  { id: 'confermata', label: 'Confermata', plurale: 'Confermate', classe: 'badge--blu' },
  { id: 'eseguita', label: 'Eseguita', plurale: 'Eseguite', classe: 'badge--verde' },
  { id: 'rifiutata', label: 'Rifiutata', plurale: 'Rifiutate', classe: 'badge--rosso' },
  { id: 'annullata', label: 'Annullata', plurale: 'Annullate', classe: '' },
];
interface Riga { id: string; numero: string; tipo: TipoOperazione; nome: string; defunto: Defunto; stato: StatoAgenzia; ordine: string; p?: Pratica; r?: RichiestaAgenzia }

function BadgeTipo({ tipo, testo }: { tipo: TipoOperazione; testo?: string }) {
  const c = COLORI_OPERAZIONE[tipo];
  return <span className="badge badge--sm" style={tinta(c)}>{testo ?? NOMI_OPERAZIONE[tipo]}</span>;
}

function BadgeStato({ p }: { p: Pratica }) {
  const st = STATI_PRATICA.find((x) => x.id === p.stato)!;
  return <span className="badge badge--sm" style={tinta(st.colore)}>{st.label}</span>;
}

function dove(s: Scheda | undefined, db: ReturnType<typeof useStore.getState>['db']): string {
  if (!s) return '—';
  const str = s.posizione ? db.strutture.find((x) => x.id === s.posizione!.strutturaId) : undefined;
  return `${s.viale}${str && s.posizione ? ` · ${str.nome}, ${str.facce[s.posizione.faccia]?.nome ?? ''} fila ${s.posizione.fila} colonna ${s.posizione.colonna}` : ''}`;
}

function ModaleRichiesta({ agenziaId, onChiudi }: { agenziaId: string; onChiudi: () => void }) {
  const cim = useCimitero();
  const [tipo, setTipo] = useState<TipoOperazione>('tumulazione');
  const [defunto, setDefunto] = useState<Defunto>(DEFUNTO_VUOTO);
  const [richiedente, setRichiedente] = useState<Richiedente>({ nome: '', codiceFiscale: '' });
  const [giorno, setGiorno] = useState(aggiungiGiorni(oggiISO(), 1));
  const [orario, setOrario] = useState('10:00');
  const [note, setNote] = useState('');
  const invia = () => {
    if (!defunto.cognome.trim()) return toast('Scrivi almeno il cognome del defunto', 'errore');
    if (!richiedente.nome.trim() || !richiedente.codiceFiscale.trim()) return toast('Scrivi nome e codice fiscale del familiare che chiede l\'operazione', 'errore');
    if (!giorno || !orario || giorno < oggiISO()) return toast('Scegli un giorno e un\'ora da oggi in poi', 'errore');
    inviaRichiesta({ agenziaId, cimiteroId: cim.id, tipo, defunto, richiedente, dataOra: `${giorno}T${orario}`, note: note.trim() || undefined });
    onChiudi();
    vai('/operazioni?stato=in_attesa');
  };
  return (
    <Modal titolo="Richiedi un'operazione" sottotitolo="Proponi giorno e ora. L'ufficio assegna la postazione e ti conferma l'operazione." size="lg" onClose={onChiudi}
      footer={<><button className="btn" onClick={onChiudi}>Annulla</button><button className="btn btn--primary" onClick={invia}>Invia la richiesta</button></>}>
      <div className="col gap-16">
        <Field label="Operazione"><Seg light value={tipo} onChange={setTipo} options={TIPI_OPERAZIONE.map((t) => ({ id: t, label: NOMI_OPERAZIONE[t] }))} /></Field>
        <div className="grid-form">
          <Field label="Giorno"><input className="input" type="date" min={oggiISO()} value={giorno} onChange={(e) => setGiorno(e.target.value)} /></Field>
          <Field label="Ora"><input className="input" type="time" step={900} value={orario} onChange={(e) => setOrario(e.target.value)} /></Field>
        </div>
        <div>
          <h3 className="section-title">Defunto</h3>
          <EditorDefunti defunti={[defunto]} onChange={(d) => setDefunto(d[0] ?? DEFUNTO_VUOTO)} />
        </div>
        <div>
          <h3 className="section-title">Familiare che chiede l'operazione</h3>
          <div className="grid-form">
            <Field label="Nome e cognome"><input className="input" value={richiedente.nome} onChange={(e) => setRichiedente({ ...richiedente, nome: e.target.value })} /></Field>
            <Field label="Codice fiscale"><input className="input mono" value={richiedente.codiceFiscale} onChange={(e) => setRichiedente({ ...richiedente, codiceFiscale: e.target.value.toUpperCase() })} /></Field>
            <Field label="Indirizzo"><input className="input" value={richiedente.indirizzo ?? ''} onChange={(e) => setRichiedente({ ...richiedente, indirizzo: e.target.value })} placeholder="Via e numero, CAP e Comune" /></Field>
            <Field label="Telefono"><input className="input" value={richiedente.telefono ?? ''} onChange={(e) => setRichiedente({ ...richiedente, telefono: e.target.value })} /></Field>
            <Field label="Legame con il defunto"><input className="input" value={richiedente.legameDefunto ?? ''} onChange={(e) => setRichiedente({ ...richiedente, legameDefunto: e.target.value })} /></Field>
          </div>
        </div>
        <Field label="Note per l'ufficio"><input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Per esempio: c'è già una concessione, sepoltura provvisoria…" /></Field>
      </div>
    </Modal>
  );
}

/** La pratica vista dall'agenzia: sola lettura. */
function Dettaglio({ p, onChiudi }: { p: Pratica; onChiudi: () => void }) {
  const finestra = useRef<HTMLDivElement>(null);
  useEsc(onChiudi, finestra);
  const db = useStore((s) => s.db);
  const schede = indiceSchede(db.schede);
  const s = schede.get(p.schedaId);
  const arrivo = p.schedaArrivoId ? schede.get(p.schedaArrivoId) : undefined;
  const avviso = db.avvisi.find((a) => a.motivo === 'pratica' && a.riferimentoId === p.id && a.stato !== 'annullato');
  const meta = arrivo ?? s;
  return (
    <div className="overlay" ref={finestra} onMouseDown={(e) => e.target === e.currentTarget && onChiudi()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal__head">
          <div>
            <div className="row gap-8"><BadgeStato p={p} /><BadgeTipo tipo={p.tipo} testo={nomeOperazione(p)} /></div>
            <h2 className="mt-8">Pratica {p.numero}</h2>
            <p>{nomeCompleto(p.defunto)}{p.defunto.dataMorte ? ` · † ${data(p.defunto.dataMorte)}` : ''}</p>
          </div>
          <button className="btn btn--ghost btn--icon btn--sm" onClick={onChiudi} aria-label="Chiudi"><X size={18} /></button>
        </div>
        <div className="modal__body">
          <dl className="kv">
            <dt>Quando</dt>
            <dd>{p.dataOra ? <b>{data(p.dataOra.slice(0, 10))} alle {p.dataOra.slice(11, 16)}</b> : <span className="muted">L'ufficio non l'ha ancora programmata</span>}</dd>
            <dt>{p.tipo === 'traslazione' ? 'Da' : 'Postazione'}</dt>
            <dd>{s ? <><b>{s.id}</b> · {descrizioneScheda(s)}<div className="small muted">{dove(s, db)}</div></> : '—'}</dd>
            {p.tipo === 'traslazione' && (<><dt>A</dt><dd>{arrivo ? <><b>{arrivo.id}</b> · {descrizioneScheda(arrivo)}<div className="small muted">{dove(arrivo, db)}</div></> : '—'}</dd></>)}
            {p.provvisoria && (<><dt>Sepoltura</dt><dd><span className="badge badge--arancio badge--sm">Provvisoria {p.provvisoria.fino ? `fino al ${data(p.provvisoria.fino)}` : 'senza scadenza'}</span></dd></>)}
            <dt>Famiglia</dt>
            <dd>{p.richiedente ? `${p.richiedente.nome}${p.richiedente.telefono ? ` · ${p.richiedente.telefono}` : ''}` : '—'}</dd>
            <dt>Pagamento</dt>
            <dd>{avviso ? <BadgeAvviso a={avviso} /> : <span className="muted">—</span>}</dd>
            {p.stato === 'annullata' && (<><dt>Annullata il</dt><dd>{data(p.annullataIl)} · {p.motivoAnnullamento}</dd></>)}
            {p.note && (<><dt>Note</dt><dd>{p.note}</dd></>)}
          </dl>
        </div>
        <div className="modal__foot">
          {meta && <a className="btn" href={googleMapsIndicazioni(meta.lat, meta.lng)} target="_blank" rel="noreferrer"><Navigation size={15} />Indicazioni per la postazione</a>}
          <button className="btn btn--primary" onClick={onChiudi}>Chiudi</button>
        </div>
      </div>
    </div>
  );
}

export function AgenziaPage() {
  const rotta = useRotta();
  const utente = useUtente();
  const db = useStore((s) => s.db);
  const [nuova, setNuova] = useState(false);
  const agenzia = db.agenzie.find((a) => a.id === utente.agenziaId);
  if (!agenzia) return <div className="page"><Empty titolo="Agenzia non trovata" testo="Esci e rientra dalla schermata iniziale." /></div>;

  const vista = rotta.parti[0] === undefined ? 'calendario' : 'operazioni';
  const schede = indiceSchede(db.schede);
  const pratiche = db.pratiche.filter((p) => p.agenziaId === agenzia.id);
  const sel = rotta.query.get('id') ? pratiche.find((p) => p.id === rotta.query.get('id')) : undefined;
  const avviso = new Map(db.avvisi.filter((a) => a.motivo === 'pratica' && a.stato !== 'annullato').map((a) => [a.riferimentoId, a]));
  // una richiesta accolta è già nell'elenco con la sua pratica
  const richieste = db.richieste.filter((r) => r.agenziaId === agenzia.id && !(r.praticaId && pratiche.some((p) => p.id === r.praticaId)));
  const righe: Riga[] = [
    ...pratiche.map((p): Riga => ({ id: p.id, numero: p.numero, tipo: p.tipo, nome: nomeOperazione(p), defunto: p.defunto, stato: p.stato === 'eseguita' ? 'eseguita' : p.stato === 'annullata' ? 'annullata' : 'confermata', ordine: p.dataOra ?? p.apertaIl, p })),
    ...richieste.map((r): Riga => ({ id: r.id, numero: r.numero, tipo: r.tipo, nome: NOMI_OPERAZIONE[r.tipo], defunto: r.defunto, stato: r.stato === 'rifiutata' ? 'rifiutata' : 'in_attesa', ordine: r.dataOra, r })),
  ].sort((a, b) => b.ordine.localeCompare(a.ordine));
  const conta = (st: StatoAgenzia) => righe.filter((x) => x.stato === st).length;
  const f = rotta.query.get('stato');
  const filtro = STATI_AGENZIA.some((x) => x.id === f && conta(x.id)) ? (f as StatoAgenzia) : null;
  const lista = filtro ? righe.filter((x) => x.stato === filtro) : righe;
  const bottone = <button className="btn btn--primary" onClick={() => setNuova(true)}><Plus size={16} />Richiedi un'operazione</button>;

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head__title">
          <h1>{vista === 'calendario' ? 'Calendario' : 'Le tue operazioni'}</h1>
        </div>
        <div className="page-head__actions">{bottone}</div>
      </div>

      {vista === 'calendario' && <Calendario agenziaId={agenzia.id} onEvento={(e) => (e.praticaId ? setQuery('id', e.praticaId) : vai('/operazioni?stato=in_attesa'))} />}

      {vista === 'operazioni' && (
        <section className="card">
          <div className="row row--wrap gap-8" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <button className={`chip chip--sm ${!filtro ? 'is-on' : ''}`} onClick={() => setQuery('stato', null)}>Tutte<span className="chip__n">{righe.length}</span></button>
            {STATI_AGENZIA.filter((x) => conta(x.id)).map((x) => (
              <button key={x.id} className={`chip chip--sm ${filtro === x.id ? 'is-on' : ''}`} onClick={() => setQuery('stato', filtro === x.id ? null : x.id)}>{x.plurale}<span className="chip__n">{conta(x.id)}</span></button>
            ))}
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Numero</th><th>Operazione</th><th>Defunto</th><th>Postazione</th><th>Quando</th><th>Pagamento</th><th>Stato</th></tr></thead>
              <tbody>
                {lista.map((x) => {
                  const st = STATI_AGENZIA.find((y) => y.id === x.stato)!;
                  const sc = x.p ? schede.get(x.p.schedaId) : undefined;
                  const quando = x.p ? x.p.dataOra : x.r!.dataOra;
                  return (
                    <tr key={x.id} className={x.p ? 'clickable' : undefined} {...(x.p ? attivabile(() => setQuery('id', x.p!.id)) : {})}>
                      <td className="id">{x.numero}</td>
                      <td><BadgeTipo tipo={x.tipo} testo={x.nome} /></td>
                      <td><b>{nomeCompleto(x.defunto)}</b></td>
                      <td>{x.p ? <><span className="id">{x.p.schedaId}</span><div className="tiny muted">{sc?.viale}</div></> : <span className="muted">La assegna l'ufficio</span>}</td>
                      <td className="nowrap">
                        {quando ? `${dataBreve(quando.slice(0, 10))} · ${quando.slice(11, 16)}` : <span className="muted">da programmare</span>}
                        {x.r && <div className="tiny muted">proposta da te · inviata il {data(x.r.inviataIl)}</div>}
                      </td>
                      <td>{x.p && avviso.get(x.p.id) ? <BadgeAvviso a={avviso.get(x.p.id)!} /> : <span className="muted">—</span>}</td>
                      <td>
                        <span className={`badge badge--sm ${st.classe}`}>{st.label}</span>
                        {x.stato === 'in_attesa' && <div className="tiny muted">L'ufficio la sta valutando</div>}
                        {x.stato === 'rifiutata' && x.r?.motivoRifiuto && <div className="tiny muted">{x.r.motivoRifiuto}</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!lista.length && <div className="empty"><h3>Nessuna operazione</h3><p>Con "Richiedi un'operazione" proponi giorno e ora all'ufficio.</p></div>}
          </div>
        </section>
      )}

      {sel && <Dettaglio p={sel} onChiudi={() => setQuery('id', null)} />}
      {nuova && <ModaleRichiesta agenziaId={agenzia.id} onChiudi={() => setNuova(false)} />}
    </div>
  );
}
