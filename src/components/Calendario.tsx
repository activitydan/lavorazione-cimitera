import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { nomiConcessionari } from '../data/concessioni';
import { COLORI_OPERAZIONE, NOMI_OPERAZIONE, TIPI_OPERAZIONE, fineTurno, sovrapposizioni } from '../data/pratiche';
import { labelLista, NOMI_CATEGORIA_ALERT, useCimitero, useUtente } from '../data/selectors';
import { setUi, useStore } from '../data/store';
import type { ConfigScheda, Database, TipoOperazione } from '../data/types';
import { GIORNI_BREVI, aggiungiGiorni, dataBreve, meseAnno, nomeCompleto, oggiISO } from '../lib/format';
import { useTelefono } from '../lib/schermo';
import { vai } from '../router';
import { attivabile, useEsc } from '../lib/tastiera';
import { tintaTesto } from '../lib/tinta';
import { Avatar, Seg } from './ui';

// Calendario unico: tutto ciò che è in programma, diviso in "calendari" che si accendono e si spengono
// (come in un calendario condiviso). Ognuno può vedere solo le sue cose.

export type IdCalendario = TipoOperazione | 'manutenzione' | 'verifica' | 'scadenza';

export const CALENDARI: { id: IdCalendario; label: string; colore: string }[] = [
  ...TIPI_OPERAZIONE.map((t) => ({ id: t as IdCalendario, label: NOMI_CATEGORIA_ALERT[t], colore: COLORI_OPERAZIONE[t] })),
  { id: 'manutenzione', label: 'Manutenzioni', colore: '#D9473F' },
  { id: 'verifica', label: 'Verifiche', colore: '#B8860B' },
  { id: 'scadenza', label: 'Scadenze', colore: '#64748B' },
];
const COLORE = Object.fromEntries(CALENDARI.map((c) => [c.id, c.colore])) as Record<IdCalendario, string>;
// nello stesso giorno: prima le operazioni, poi manutenzioni e scadenze, le verifiche in fondo
const ORDINE: Record<IdCalendario, number> = { inumazione: 0, tumulazione: 0, esumazione: 0, estumulazione: 0, traslazione: 0, manutenzione: 1, scadenza: 2, verifica: 3 };

export interface EventoCalendario {
  id: string;
  giorno: string;
  ora?: string;
  calendario: IdCalendario;
  titolo: string;
  sotto: string;
  link?: string;
  /** sul telefono Operazioni cimiteriali e Concessioni non si aprono: si va alla scheda della postazione */
  linkTelefono?: string;
  /** già fatto: resta nel calendario, più chiaro */
  fatto?: boolean;
  /** richiesta di un'agenzia non ancora accolta dall'ufficio */
  attesa?: boolean;
  /** gli operatori a cui è assegnato */
  persone: string[];
  agenziaId?: string;
  praticaId?: string;
  richiestaId?: string;
  manutenzioneId?: string;
  /** una riga in più nella vista a settimana: l'agenzia funebre dell'operazione */
  extra?: string;
  /** qualcosa non torna: due operazioni alla stessa ora sulla stessa postazione o con lo stesso operatore */
  avviso?: string;
}

/** Tutto ciò che ha una data in un cimitero: operazioni, richieste delle agenzie, manutenzioni, verifiche e scadenze. */
export function eventiCalendario(db: Database, config: ConfigScheda, cimiteroId: string): EventoCalendario[] {
  const out: EventoCalendario[] = [];
  const programmate = db.pratiche.filter((p) => p.dataOra && (p.stato === 'programmata' || p.stato === 'eseguita'));
  for (const p of programmate) {
    if (p.cimiteroId !== cimiteroId || !p.dataOra) continue;
    const doppie = sovrapposizioni(p, programmate);
    out.push({
      id: `pr-${p.id}`, giorno: p.dataOra.slice(0, 10), ora: p.dataOra.slice(11, 16), calendario: p.tipo, titolo: `${NOMI_OPERAZIONE[p.tipo]} · ${nomeCompleto(p.defunto)}`,
      sotto: `${p.schedaId}${p.provvisoria ? ' · provvisoria' : ''}`, link: `/operazioni?id=${p.id}`, linkTelefono: `/scheda/${p.schedaId}`, fatto: p.stato === 'eseguita', persone: p.operatoriIds ?? [], agenziaId: p.agenziaId, praticaId: p.id,
      extra: p.agenziaId ? db.agenzie.find((a) => a.id === p.agenziaId)?.nome : undefined, avviso: doppie.length ? `Alla stessa ora: ${doppie.join(', ')}` : undefined,
    });
  }
  for (const r of db.richieste) {
    if (r.cimiteroId !== cimiteroId || r.stato !== 'in_attesa') continue;
    out.push({
      id: `ra-${r.id}`, giorno: r.dataOra.slice(0, 10), ora: r.dataOra.slice(11, 16), calendario: r.tipo, titolo: `${NOMI_OPERAZIONE[r.tipo]} · ${nomeCompleto(r.defunto)}`,
      sotto: `Richiesta ${r.numero} in attesa`, link: '/operazioni', linkTelefono: '', attesa: true, persone: [], agenziaId: r.agenziaId, richiestaId: r.id,
    });
  }
  for (const m of db.manutenzioni) {
    if (m.cimiteroId !== cimiteroId || !m.dataProgrammata || (m.stato !== 'programmata' && m.stato !== 'risolta')) continue;
    out.push({
      id: `man-${m.id}`, giorno: m.dataProgrammata, calendario: 'manutenzione', titolo: labelLista(config.categorieManutenzione, m.categoria), sotto: m.schedaId || m.luogo || '',
      link: `/manutenzioni?id=${m.id}`, fatto: m.stato === 'risolta', persone: m.operatoriIds ?? [], manutenzioneId: m.id,
    });
  }
  const mieSchede = new Set(db.schede.filter((s) => s.cimiteroId === cimiteroId).map((s) => s.id));
  for (const v of db.verifiche) {
    if (v.stato !== 'aperta' || !mieSchede.has(v.schedaId)) continue;
    out.push({ id: `ver-${v.id}`, giorno: v.scadenza, calendario: 'verifica', titolo: `Verifica · ${labelLista(config.motiviVerifica, v.motivo)}`, sotto: v.schedaId, link: '/censimento?tab=verifiche', persone: [v.operatoreId] });
  }
  for (const c of db.concessioni) {
    if (c.cimiteroId !== cimiteroId || c.stato === 'chiusa' || c.perpetua) continue;
    out.push({ id: `conc-${c.id}`, giorno: c.scadenza, calendario: 'scadenza', titolo: `Scade la concessione ${c.numero}`, sotto: nomiConcessionari(c), link: `/concessioni?id=${c.id}`, linkTelefono: `/scheda/${c.schedeIds[0]}`, persone: [] });
  }
  for (const s of db.schede) {
    if (s.cimiteroId !== cimiteroId || !s.defunti.length) continue;
    const fine = fineTurno(s, db.regole);
    if (fine) out.push({ id: `turno-${s.id}`, giorno: fine, calendario: 'scadenza', titolo: `Fine del turno · ${nomeCompleto(s.defunti[0])}`, sotto: s.id, link: `/scheda/${s.id}`, persone: [] });
    for (const d of s.defunti)
      if (d.provvisorio?.fino)
        out.push({ id: `prov-${s.id}-${d.cognome}-${d.nome}`, giorno: d.provvisorio.fino, calendario: 'scadenza', titolo: `Spostare ${nomeCompleto(d)}`, sotto: `Sepoltura provvisoria · ${s.id}`, link: `/scheda/${s.id}`, persone: [] });
  }
  return out;
}

const CHIAVE = 'cimitera:calendari-spenti';
function leggiSpenti(): IdCalendario[] {
  try {
    return JSON.parse(window.localStorage.getItem(CHIAVE) ?? '[]') as IdCalendario[];
  } catch {
    return [];
  }
}

const giornoLungo = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });

export interface OpzioniCalendario {
  /** il calendario di una sola agenzia funebre (le sue operazioni e le sue richieste in attesa) */
  agenziaId?: string;
  /** cosa fare al clic su una voce; se manca, si apre la pagina della voce */
  onEvento?: (e: EventoCalendario) => void;
  /** un pulsante in più nell'intestazione */
  azione?: ReactNode;
  /** solo questi calendari: nelle pagine di Operazioni cimiteriali e di Manutenzioni */
  solo?: IdCalendario[];
  /** aggiunge la vista a settimana, e parte da quella se non si dice altro */
  settimana?: boolean;
  vistaIniziale?: 'mese' | 'settimana';
  /** aggiunge la scelta del cimitero: si parte da quello scelto in alto, oppure da tutti */
  cimiteri?: boolean | 'tutti';
  /** chiamata dopo aver aperto una voce: la finestra del calendario si chiude */
  dopoApertura?: () => void;
  /** quando c'è, un clic su un giorno lo sceglie: serve per decidere quando fare una manutenzione */
  scegliGiorno?: { testo: ReactNode; onScegli: (giorno: string) => void };
  /** contenuto in più nella colonna di destra, sotto l'elenco del giorno */
  sotto?: ReactNode;
}

/** Il calendario unico dell'app: lo stesso sulla Dashboard, in Operazioni cimiteriali, in Manutenzioni e per le agenzie funebri. */
export function Calendario({ agenziaId, onEvento, azione, solo, settimana, vistaIniziale, cimiteri, dopoApertura, scegliGiorno, sotto }: OpzioniCalendario) {
  const db = useStore((s) => s.db);
  const config = useStore((s) => s.config);
  const cim = useCimitero();
  const utente = useUtente();
  const oggi = oggiISO();
  const [mese, setMese] = useState(() => ({ y: Number(oggi.slice(0, 4)), m: Number(oggi.slice(5, 7)) - 1 }));
  const [giorno, setGiorno] = useState(oggi);
  const [vista, setVista] = useState<'mese' | 'settimana'>(vistaIniziale ?? (settimana ? 'settimana' : 'mese'));
  const [quale, setQuale] = useState(() => (cimiteri === 'tutti' ? '' : cim?.id ?? '')); // '' = tutti i cimiteri
  // dentro una pagina i calendari accesi valgono solo lì; sulla Dashboard la scelta resta per la volta dopo
  const [spenti, setSpenti] = useState<IdCalendario[]>(() => (solo ? [] : leggiSpenti()));
  // sulla Dashboard l'Operatore parte dalle sue cose; dentro una pagina si parte sempre da tutto
  const [chi, setChi] = useState<string>(utente.operatoreId && !utente.amministratore && !solo ? 'io' : 'tutti');

  const calendari = (agenziaId ? CALENDARI.filter((c) => (TIPI_OPERAZIONE as string[]).includes(c.id)) : CALENDARI).filter((c) => !solo || solo.includes(c.id));
  const tutti = useMemo(() => {
    if (cimiteri && !quale) return db.cimiteri.flatMap((c) => eventiCalendario(db, config, c.id));
    const id = (cimiteri && quale) || cim?.id;
    return id ? eventiCalendario(db, config, id) : [];
  }, [db, config, cim, cimiteri, quale]);
  const visibili = useMemo(() => {
    const persona = chi === 'io' ? utente.operatoreId : chi.startsWith('op:') ? chi.slice(3) : null;
    const agenzia = agenziaId ?? (chi.startsWith('ag:') ? chi.slice(3) : null);
    const ammessi = new Set(calendari.map((c) => c.id));
    return tutti
      .filter((e) => ammessi.has(e.calendario) && !spenti.includes(e.calendario) && (agenzia ? e.agenziaId === agenzia : !persona || e.persone.includes(persona)))
      .sort((a, b) => (a.ora ?? '99').localeCompare(b.ora ?? '99') || ORDINE[a.calendario] - ORDINE[b.calendario] || a.titolo.localeCompare(b.titolo));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutti, spenti, chi, utente.operatoreId, agenziaId, solo?.join()]);
  const perGiorno = useMemo(() => {
    const m = new Map<string, EventoCalendario[]>();
    for (const e of visibili) {
      const l = m.get(e.giorno);
      if (l) l.push(e);
      else m.set(e.giorno, [e]);
    }
    return m;
  }, [visibili]);

  const primo = new Date(mese.y, mese.m, 1);
  const offset = (primo.getDay() + 6) % 7;
  const giorni = new Date(mese.y, mese.m + 1, 0).getDate();
  const celle = Array.from({ length: Math.ceil((offset + giorni) / 7) * 7 }, (_, i) => {
    const g = i - offset + 1;
    return g >= 1 && g <= giorni ? `${mese.y}-${String(mese.m + 1).padStart(2, '0')}-${String(g).padStart(2, '0')}` : null;
  });
  // la settimana del giorno scelto, da lunedì
  const lunedi = aggiungiGiorni(giorno, -((new Date(`${giorno}T12:00:00`).getDay() + 6) % 7));
  const dellaSettimana = Array.from({ length: 7 }, (_, i) => aggiungiGiorni(lunedi, i));
  const vaiA = (g: string) => {
    setGiorno(g);
    setMese({ y: Number(g.slice(0, 4)), m: Number(g.slice(5, 7)) - 1 });
  };
  const sposta = (d: number) => {
    if (vista === 'settimana') return vaiA(aggiungiGiorni(giorno, 7 * d));
    setMese(({ y, m }) => ({ y: m + d < 0 ? y - 1 : m + d > 11 ? y + 1 : y, m: (m + d + 12) % 12 }));
  };
  const accendi = (id: IdCalendario) => {
    const nuovi = spenti.includes(id) ? spenti.filter((x) => x !== id) : [...spenti, id];
    setSpenti(nuovi);
    if (solo) return;
    try { window.localStorage.setItem(CHIAVE, JSON.stringify(nuovi)); } catch { /* resta per questa volta */ }
  };
  const telefono = useTelefono();
  const apri = (e: EventoCalendario) => {
    if (onEvento) return onEvento(e);
    const dove = telefono && e.linkTelefono !== undefined ? e.linkTelefono : e.link;
    if (!dove) return;
    vai(dove);
    dopoApertura?.();
  };
  const scegli = (d: string) => {
    setGiorno(d);
    scegliGiorno?.onScegli(d);
  };
  const delGiorno = perGiorno.get(giorno) ?? [];
  const operatori = db.operatori.filter((o) => o.attivo);
  const agenzie = db.agenzie.filter((a) => a.attiva);
  const quante = (n: number) => (n === 0 ? 'niente in programma' : n === 1 ? 'una voce' : `${n} voci`);
  const periodo = vista === 'settimana' ? 'Settimana' : 'Mese';

  return (
    <section className="card calg">
      <div className="card__head calg__testa">
        <div className="row gap-8 row--wrap">
          <span className="widget__ico"><CalendarDays size={16} /></span>
          <h2 style={vista === 'mese' ? { textTransform: 'capitalize' } : undefined}>
            {vista === 'mese' ? meseAnno(mese.y, mese.m) : `${dataBreve(dellaSettimana[0])} – ${dataBreve(dellaSettimana[6])}`}
          </h2>
          <button className="btn btn--sm btn--icon" onClick={() => sposta(-1)} aria-label={`${periodo} precedente`}><ChevronLeft size={16} /></button>
          <button className="btn btn--sm" onClick={() => vaiA(oggi)}>Oggi</button>
          <button className="btn btn--sm btn--icon" onClick={() => sposta(1)} aria-label={`${periodo} successivo`}><ChevronRight size={16} /></button>
          {settimana && <Seg small light value={vista} onChange={setVista} options={[{ id: 'settimana', label: 'Settimana' }, { id: 'mese', label: 'Mese' }]} />}
        </div>
        <div className="row gap-8 row--wrap">
          {cimiteri && db.cimiteri.length > 1 && (
            <select className="select select--sm" style={{ width: 'auto' }} value={quale} onChange={(e) => setQuale(e.target.value)} aria-label="Di quale cimitero">
              <option value="">Tutti i cimiteri</option>
              {db.cimiteri.map((c) => <option key={c.id} value={c.id}>{c.breve}</option>)}
            </select>
          )}
          {!agenziaId && (
            <select className="select select--sm" style={{ width: 'auto' }} value={chi} onChange={(e) => setChi(e.target.value)} aria-label="Di chi è il calendario">
              <option value="tutti">Il calendario di tutti</option>
              {utente.operatoreId && <option value="io">Solo le mie cose</option>}
              <optgroup label="Operatori">
                {operatori.filter((o) => o.id !== utente.operatoreId).map((o) => <option key={o.id} value={`op:${o.id}`}>{o.nome}</option>)}
              </optgroup>
              {calendari.some((c) => (TIPI_OPERAZIONE as string[]).includes(c.id)) && (
                <optgroup label="Agenzie funebri">
                  {agenzie.map((a) => <option key={a.id} value={`ag:${a.id}`}>{a.nome}</option>)}
                </optgroup>
              )}
            </select>
          )}
          {azione}
        </div>
      </div>
      {scegliGiorno && <div className="callout calg__avviso">{scegliGiorno.testo}</div>}
      {/* nella vista a settimana le colonne prendono tutta la larghezza: l'elenco del giorno non serve, i calendari vanno sotto */}
      <div className={`calg__corpo ${vista === 'settimana' ? 'calg__corpo--settimana' : ''}`}>
        {vista === 'mese' ? (
          <div className="cal__grid calg__mese">
            {GIORNI_BREVI.map((g) => <div key={g} className="cal__dow">{g}</div>)}
            {celle.map((d, i) => {
              const voci = d ? perGiorno.get(d) ?? [] : [];
              return (
                <div key={i} className={`cal__day ${!d ? 'is-out' : ''} ${d === oggi ? 'is-today' : ''} ${d && d === giorno ? 'is-sel' : ''} ${d && scegliGiorno ? 'is-target' : ''}`}
                  {...(d ? { ...attivabile(() => scegli(d)), role: 'button', 'aria-pressed': d === giorno, 'aria-current': d === oggi ? ('date' as const) : undefined, 'aria-label': scegliGiorno ? `Scegli ${giornoLungo(d)}` : `${giornoLungo(d)}: ${quante(voci.length)}` } : {})}>
                  {d && <span className="cal__n">{Number(d.slice(8))}</span>}
                  {voci.slice(0, 3).map((e) => (
                    <button key={e.id} className={`cal__item ${e.attesa ? 'is-attesa' : ''}`} style={{ borderLeftColor: COLORE[e.calendario], opacity: e.fatto ? 0.55 : 1 }}
                      onClick={(ev) => { ev.stopPropagation(); setGiorno(e.giorno); apri(e); }} title={`${e.ora ? `${e.ora} · ` : ''}${e.titolo} · ${e.sotto}${e.avviso ? ` · ${e.avviso}` : ''}`}>
                      {e.fatto ? '✓ ' : ''}{e.ora ? <b>{e.ora} </b> : null}{e.titolo}
                    </button>
                  ))}
                  {voci.length > 3 && <span className="tiny muted strong">+{voci.length - 3} {voci.length - 3 === 1 ? 'altra' : 'altre'}</span>}
                  {voci.length > 0 && <span className="calg__punti">{voci.slice(0, 4).map((e) => <i key={e.id} style={{ background: COLORE[e.calendario] }} />)}</span>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="agenda agenda--settimana calg__settimana">
            {dellaSettimana.map((g, i) => {
              const voci = perGiorno.get(g) ?? [];
              return (
                <div key={g} className={`agenda__giorno ${g === oggi ? 'is-oggi' : ''}`}>
                  {scegliGiorno ? (
                    <button className="agenda__testa" onClick={() => scegli(g)} aria-label={`Scegli ${giornoLungo(g)}`}>
                      <span className="upper muted">{GIORNI_BREVI[i]}</span>
                      <b>{Number(g.slice(8))}</b>
                      <span className="tiny muted">{voci.length || ''}</span>
                    </button>
                  ) : (
                    <div className="agenda__testa" aria-label={`${giornoLungo(g)}: ${quante(voci.length)}`}>
                      <span className="upper muted">{GIORNI_BREVI[i]}</span>
                      <b>{Number(g.slice(8))}</b>
                      <span className="tiny muted">{voci.length || ''}</span>
                    </div>
                  )}
                  <div className="agenda__voci">
                    {voci.map((e) => (
                      <button key={e.id} className={`agenda__voce ${e.attesa ? 'is-attesa' : ''}`} style={{ borderLeftColor: COLORE[e.calendario], opacity: e.fatto ? 0.6 : 1 }} onClick={() => { setGiorno(g); apri(e); }} title={e.avviso}>
                        <span className="row row--between">
                          <b className="mono">{e.ora ?? '—'}</b>
                          {e.avviso && <AlertTriangle size={14} color="var(--danger-700)" aria-label={e.avviso} />}
                          {e.fatto && <CheckCircle2 size={14} color="var(--verde-600)" aria-label="Fatto" />}
                        </span>
                        {e.titolo.includes(' · ') && <span className="small strong ellipsis" style={{ color: tintaTesto(COLORE[e.calendario]) }}>{e.titolo.split(' · ')[0]}</span>}
                        <b className="ellipsis">{e.titolo.includes(' · ') ? e.titolo.split(' · ').slice(1).join(' · ') : e.titolo}</b>
                        <span className="tiny muted ellipsis">{e.sotto}</span>
                        {e.extra && !agenziaId && <span className="tiny muted ellipsis">{e.extra}</span>}
                        {e.persone.length > 0 && (
                          <span className="row gap-4">
                            {e.persone.map((id) => {
                              const o = db.operatori.find((x) => x.id === id);
                              return o ? <Avatar key={id} nome={o.nome} colore={o.colore} size="sm" /> : null;
                            })}
                          </span>
                        )}
                      </button>
                    ))}
                    {!voci.length && <span className="tiny muted" style={{ padding: 8 }}>Niente in programma</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <aside className="calg__lato">
          <div className="calg__giorno">
            <div className="upper muted">{giorno === oggi ? 'Oggi · ' : ''}{giornoLungo(giorno)}</div>
            {delGiorno.length === 0 && <p className="small muted">Niente in programma.</p>}
            {delGiorno.map((e) => (
              <button key={e.id} className={`calg__voce ${e.attesa ? 'is-attesa' : ''}`} style={{ borderLeftColor: COLORE[e.calendario], opacity: e.fatto ? 0.6 : 1 }} onClick={() => apri(e)} title={e.avviso}>
                <b className="mono">{e.ora ?? '—'}</b>
                <span className="grow">
                  <b>{e.titolo}</b>
                  <span className="tiny muted">{e.sotto}{e.fatto ? ' · fatto' : ''}</span>
                  {e.avviso && <span className="tiny calg__doppia"><AlertTriangle size={12} />{e.avviso}</span>}
                </span>
              </button>
            ))}
          </div>
          {sotto && <div className="calg__sotto">{sotto}</div>}
          {calendari.length > 1 && (
            <div className="calg__calendari">
              <div className="upper muted">Calendari</div>
              {calendari.map((c) => {
                const on = !spenti.includes(c.id);
                return (
                  <button key={c.id} className="calg__cal" onClick={() => accendi(c.id)} aria-pressed={on}>
                    <span className="calg__spunta" style={on ? { background: c.colore, borderColor: c.colore } : undefined}>{on && <Check size={11} />}</span>
                    {c.label}
                  </button>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

/**
 * Il calendario si apre con un comando solo, il pulsante "Calendario" in alto, e sta in una finestra sopra la pagina dove sei.
 * Dentro c'è tutto quello che ha una data: operazioni, manutenzioni, verifiche e scadenze.
 */
export function FinestraCalendario() {
  const aperto = useStore((s) => s.ui.calendario);
  const finestra = useRef<HTMLDivElement>(null);
  const chiudi = useCallback(() => setUi({ calendario: false }), []);
  useEsc(chiudi, finestra);
  if (!aperto) return null;
  return (
    <div className="overlay" ref={finestra} onMouseDown={(e) => e.target === e.currentTarget && chiudi()}>
      <div className="modal modal--xl calfin" role="dialog" aria-modal="true" aria-label="Calendario">
        <Calendario
          settimana
          vistaIniziale="mese"
          cimiteri
          dopoApertura={chiudi}
          azione={<button className="btn btn--ghost btn--icon btn--sm calfin__chiudi" onClick={chiudi} aria-label="Chiudi il calendario" autoFocus><X size={18} /></button>}
        />
      </div>
    </div>
  );
}
