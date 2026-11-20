import { useEffect, useMemo, useState, useRef } from 'react';
import { Ban, CalendarDays, Camera, CheckCircle2, Download, ExternalLink, List, Map as MapIcon, Plus, Search, X } from 'lucide-react';
import { BarraPagine, paginaDi } from '../components/Esporta';
import { ScegliFoto } from '../components/scheda/Media';
import { DaInviare } from '../components/StrisciaRete';
import { Avatar, Field, Modal, Seg, Tabs } from '../components/ui';
import { MOTIVI_ANNULLAMENTO, STATI_MANUTENZIONE, UFFICIO } from '../config/defaults';
import {
  aggiungiFoto, annullaManutenzione, apriModale, indiceSchede, programmaManutenzione, resetFiltri, risolviManutenzione, seleziona, toast, useStore,
} from '../data/store';
import { descrizioneScheda, labelLista, prioritaDef, useDatiCimitero, useUtente } from '../data/selectors';
import type { Manutenzione, Scheda } from '../data/types';
import { righeManutenzioni, scaricaExcel } from '../lib/excel';
import { aggiungiGiorni, dataBreve, data, normalizza, numero, oggiISO } from '../lib/format';
import { segnapostoImmagine } from '../lib/photo';
import { useTelefono } from '../lib/schermo';
import { setQuery, useRotta, vai } from '../router';
import { useEsc } from '../lib/tastiera';
import { tinta } from '../lib/tinta';
import { Calendario } from '../components/Calendario';

type Vista = 'elenco' | 'calendario';
const PER_PAGINA = 25;

function statoM(id: string) {
  return STATI_MANUTENZIONE.find((s) => s.id === id) ?? STATI_MANUTENZIONE[0];
}
const chiusa = (m: Manutenzione) => m.stato === 'risolta' || m.stato === 'annullata';

/** Foto caricata dall'operatore; se manca, segnaposto neutro. */
function FotoManutenzione({ m, dopo }: { m: Manutenzione; dopo?: boolean }) {
  const foto = useStore((st) => st.foto);
  const id = dopo ? m.fotoRisoluzione : m.fotoProblemaId;
  const src = (id && foto[id]) || segnapostoImmagine();
  return <img src={src} alt={dopo ? 'Foto dopo l’intervento' : 'Foto della segnalazione'} />;
}

export function ManutenzioniPage() {
  const rotta = useRotta();
  const telefono = useTelefono();
  const utente = useUtente();
  const vista: Vista = !telefono && (rotta.query.get('tab') ?? rotta.query.get('vista')) === 'calendario' ? 'calendario' : 'elenco';
  const selId = rotta.query.get('id');
  const config = useStore((s) => s.config);
  const db = useStore((s) => s.db);
  const { manutenzioni } = useDatiCimitero();
  const indice = indiceSchede(db.schede);
  const [stati, setStati] = useState<string[]>(() => (rotta.query.get('stato') ? [rotta.query.get('stato')!] : ['aperta', 'programmata']));
  const [cat, setCat] = useState('');
  const [q, setQ] = useState('');
  const [pagina, setPagina] = useState(0);
  // sul telefono si parte dalle proprie: quelle assegnate a me o segnalate da me
  const [soloMie, setSoloMie] = useState(() => rotta.query.get('tutte') !== '1');
  const io = utente.operatoreId ?? 'ufficio';
  const oggi = oggiISO();

  const lista = useMemo(() => {
    const t = normalizza(q);
    const peso = { urgente: 0, alta: 1, media: 2, bassa: 3 };
    return manutenzioni
      .filter((m) => (!stati.length || stati.includes(m.stato)) && (!cat || m.categoria === cat))
      .filter((m) => !telefono || !soloMie || m.operatoriIds?.includes(io) || m.segnalataDa === io)
      .filter((m) => !t || normalizza(`${m.id} ${m.schedaId} ${m.luogo ?? ''} ${m.descrizione} ${descrizioneScheda(indice.get(m.schedaId) ?? ({ defunti: [] } as unknown as Scheda))}`).includes(t))
      .sort((a, b) => (chiusa(a) ? 1 : 0) - (chiusa(b) ? 1 : 0) || peso[a.priorita] - peso[b.priorita] || b.segnalataIl.localeCompare(a.segnalataIl));
  }, [manutenzioni, stati, cat, q, indice, telefono, soloMie, io]);
  useEffect(() => setPagina(0), [stati, cat, q, soloMie]);

  const sel = selId ? db.manutenzioni.find((m) => m.id === selId) : undefined;
  const conta = (st: string) => manutenzioni.filter((m) => m.stato === st).length;
  const vediMappa = () => { resetFiltri({ stati: ['da_manutenzionare'] }); vai('/mappa'); };
  const esporta = () => scaricaExcel(`CimiTera_manutenzioni_${oggi}`, [{ nome: 'Manutenzioni', righe: righeManutenzioni(lista, db, config) }]);
  const righe = paginaDi(lista, pagina, PER_PAGINA);

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head__title">
          <h1>Manutenzioni</h1>
        </div>
        <div className="page-head__actions">
          <button className="btn" onClick={vediMappa}><MapIcon size={16} />Vedi sulla mappa</button>
          {!telefono && <button className="btn" disabled={!lista.length} onClick={esporta}><Download size={16} />Esporta {numero(lista.length)}</button>}
          <button className="btn btn--primary" onClick={() => apriModale({ tipo: 'manutenzione' })}><Plus size={16} />{telefono ? 'Segnala' : 'Segnala manutenzione'}</button>
        </div>
      </div>

      {!telefono && (
        <Tabs value={vista} onChange={(v) => { setQuery('vista', null); setQuery('tab', v === 'calendario' ? 'calendario' : null); }} tabs={[
          { id: 'elenco', label: 'Elenco', icon: <List size={16} />, count: lista.length },
          { id: 'calendario', label: 'Calendario', icon: <CalendarDays size={16} /> },
        ]} />
      )}

      {vista === 'elenco' && (
        <div className="manut">
          <div className="manut__filtri">
            {telefono && <Seg small light value={soloMie ? 'mie' : 'tutte'} onChange={(v) => setSoloMie(v === 'mie')} options={[{ id: 'mie', label: 'Mie' }, { id: 'tutte', label: 'Tutte' }]} />}
            <div className="input-icon" style={{ minWidth: 220, flex: '1 1 220px' }}>
              <Search size={16} />
              <input className="input input--sm" placeholder="Cerca ID, scheda, descrizione" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="row row--wrap gap-4">
              {STATI_MANUTENZIONE.map((s) => (
                <button key={s.id} className={`chip chip--sm ${stati.includes(s.id) ? 'is-on' : ''}`} onClick={() => setStati(stati.includes(s.id) ? stati.filter((x) => x !== s.id) : [...stati, s.id])}>
                  <span className="dot" style={{ background: s.colore }} />{s.label}
                  <span className="chip__n">{conta(s.id)}</span>
                </button>
              ))}
            </div>
            <select className="select select--sm" style={{ width: 'auto' }} value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">Tutte le categorie</option>
              {config.categorieManutenzione.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          {telefono ? (
            <div className="card">
              {righe.map((m) => {
                const s = indice.get(m.schedaId);
                const pr = prioritaDef(m.priorita);
                return (
                  <button key={m.id} className="ricerca__card" onClick={() => setQuery('id', m.id)}>
                    <span className="list-item__thumb" style={{ overflow: 'hidden', display: 'block' }}><FotoManutenzione m={m} dopo={m.stato === 'risolta'} /></span>
                    <span className="grow">
                      <b className="ellipsis">{labelLista(config.categorieManutenzione, m.categoria)} <DaInviare riferimento={m.id} /></b>
                      <span className="tiny muted">{m.schedaId || m.luogo}{s ? ` · ${s.viale}` : ''}</span>
                      <span className="tiny muted">{m.dataProgrammata && !chiusa(m) ? `Programmata ${dataBreve(m.dataProgrammata)}` : `Segnalata ${dataBreve(m.segnalataIl)}`}</span>
                    </span>
                    <span className="badge badge--sm" style={tinta(pr.colore)}>{pr.label}</span>
                  </button>
                );
              })}
              {!lista.length && <div className="empty"><h3>{soloMie ? 'Nessuna manutenzione tua' : 'Nessuna manutenzione'}</h3><p>{soloMie ? 'Passa a “Tutte” per vedere le altre.' : 'Cambia i filtri.'}</p></div>}
              <BarraPagine pagina={pagina} totale={lista.length} perPagina={PER_PAGINA} onPagina={setPagina} />
            </div>
          ) : (
            <>
              <div className="manut__grid">
                {righe.map((m) => {
                  const s = indice.get(m.schedaId);
                  const st = statoM(m.stato);
                  const pr = prioritaDef(m.priorita);
                  return (
                    <button key={m.id} className={`card ticket ${selId === m.id ? 'is-sel' : ''}`} onClick={() => setQuery('id', m.id)}>
                      <div className="ticket__foto"><FotoManutenzione m={m} dopo={m.stato === 'risolta'} /></div>
                      <div className="ticket__body">
                        <div className="row row--between">
                          <span className="tiny muted strong">{m.id} <DaInviare riferimento={m.id} /></span>
                          <span className="badge badge--sm" style={tinta(st.colore)}>{st.label}</span>
                        </div>
                        <b className="ticket__title">{labelLista(config.categorieManutenzione, m.categoria)}</b>
                        <span className="small muted ellipsis">{m.schedaId ? `${m.schedaId} · ${s ? descrizioneScheda(s) : ''}` : `Parte comune · ${m.luogo ?? ''}`}</span>
                        <span className="small ticket__desc">{m.descrizione}</span>
                        <div className="row row--between mt-8">
                          <span className="badge badge--sm" style={tinta(pr.colore)}>{pr.label}</span>
                          <span className="tiny muted">
                            {m.stato === 'risolta' ? `Risolta ${dataBreve(m.risoltaIl)}` : m.stato === 'annullata' ? `Annullata ${dataBreve(m.annullataIl)}` : m.dataProgrammata ? `Programmata ${dataBreve(m.dataProgrammata)}` : `Segnalata ${dataBreve(m.segnalataIl)}`}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {!lista.length && <div className="empty" style={{ gridColumn: '1 / -1' }}><h3>Nessuna manutenzione con questi filtri</h3></div>}
              </div>
              <div className="card mt-16"><BarraPagine pagina={pagina} totale={lista.length} perPagina={PER_PAGINA} onPagina={setPagina} /></div>
            </>
          )}
        </div>
      )}

      {vista === 'calendario' && <Programmazione manutenzioni={manutenzioni} />}

      {sel && <DettaglioManutenzione m={sel} onChiudi={() => setQuery('id', null)} />}
    </div>
  );
}

/** Il calendario delle manutenzioni è quello grande dell'app, con in più l'elenco di ciò che aspetta un giorno. */
function Programmazione({ manutenzioni }: { manutenzioni: Manutenzione[] }) {
  const config = useStore((s) => s.config);
  const [daProgrammare, setDaProgrammare] = useState<string | null>(null);
  const [programma, setProgramma] = useState<{ id: string; data: string } | null>(null);
  // le urgenti in cima alla lista da programmare
  const peso = { urgente: 0, alta: 1, media: 2, bassa: 3 };
  const aperte = manutenzioni.filter((m) => m.stato === 'aperta').sort((a, b) => peso[a.priorita] - peso[b.priorita] || a.segnalataIl.localeCompare(b.segnalataIl));

  return (
    <>
      <Calendario
        solo={['manutenzione']}
        onEvento={(e) => e.manutenzioneId && setQuery('id', e.manutenzioneId)}
        scegliGiorno={daProgrammare ? { testo: <>Scegli il giorno in cui programmare <b>{daProgrammare}</b>.</>, onScegli: (g) => setProgramma({ id: daProgrammare, data: g }) } : undefined}
        sotto={
          <>
            <div className="calg__sotto-testa"><h3>Da programmare</h3><span className="badge badge--sm">{aperte.length}</span></div>
            <div className="list">
              {aperte.map((m) => (
                <button key={m.id} className={`list-item ${daProgrammare === m.id ? 'is-sel' : ''}`} aria-pressed={daProgrammare === m.id} onClick={() => setDaProgrammare(daProgrammare === m.id ? null : m.id)} style={daProgrammare === m.id ? { background: 'var(--blu-50)' } : undefined}>
                  <span className="dot" style={{ background: prioritaDef(m.priorita).colore }} />
                  <span className="grow" style={{ minWidth: 0 }}>
                    <b className="small">{labelLista(config.categorieManutenzione, m.categoria)}</b>
                    <span className="tiny muted ellipsis" style={{ display: 'block' }}>{m.schedaId || m.luogo} · {m.descrizione}</span>
                  </span>
                </button>
              ))}
              {!aperte.length && <p className="small muted" style={{ padding: 16 }}>Niente da programmare.</p>}
            </div>
          </>
        }
      />
      {programma && (
        <ModaleProgramma
          id={programma.id}
          dataIniziale={programma.data}
          onChiudi={(fatto) => {
            setProgramma(null);
            if (fatto) setDaProgrammare(null);
          }}
        />
      )}
    </>
  );
}

/** Programmare: una data e uno o più operatori, almeno uno. */
function ModaleProgramma({ id, dataIniziale, onChiudi }: { id: string; dataIniziale?: string; onChiudi: (fatto: boolean) => void }) {
  const m = useStore((s) => s.db.manutenzioni.find((x) => x.id === id))!;
  const operatori = useStore((s) => s.db.operatori).filter((o) => o.attivo || m.operatoriIds?.includes(o.id));
  const [dataP, setDataP] = useState(dataIniziale ?? m.dataProgrammata ?? aggiungiGiorni(oggiISO(), 3));
  const [scelti, setScelti] = useState<string[]>(m.operatoriIds ?? []);
  const cambia = (oid: string) => setScelti((x) => (x.includes(oid) ? x.filter((y) => y !== oid) : [...x, oid]));
  const salva = () => {
    programmaManutenzione(id, dataP, scelti);
    toast(`Manutenzione programmata il ${data(dataP)}`);
    onChiudi(true);
  };
  return (
    <Modal titolo={`${m.stato === 'programmata' ? 'Riprogramma' : 'Programma'} ${m.id}`} onClose={() => onChiudi(false)}
      footer={<><button className="btn" onClick={() => onChiudi(false)}>Annulla</button><button className="btn btn--primary" disabled={!scelti.length || !dataP} onClick={salva}>Salva</button></>}>
      <div className="col gap-16">
        <Field label="Data"><input className="input" type="date" value={dataP} onChange={(e) => setDataP(e.target.value)} /></Field>
        <Field label="Operatori" hint="Almeno uno. Ricevono un alert nella loro campanella.">
          <div className="col gap-4">
            {operatori.map((o) => (
              <label key={o.id} className="row gap-8" style={{ cursor: 'pointer' }}>
                <input type="checkbox" className="check" checked={scelti.includes(o.id)} onChange={() => cambia(o.id)} />
                <Avatar nome={o.nome} colore={o.colore} size="sm" />
                {o.nome}
              </label>
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  );
}

function ModaleAnnulla({ m, onChiudi }: { m: Manutenzione; onChiudi: () => void }) {
  const [motivo, setMotivo] = useState<string>(MOTIVI_ANNULLAMENTO[0]);
  return (
    <Modal titolo={`Annulla ${m.id}`} onClose={onChiudi}
      footer={<><button className="btn" onClick={onChiudi}>Indietro</button><button className="btn btn--danger" onClick={() => { annullaManutenzione(m.id, motivo); toast('Manutenzione annullata'); onChiudi(); }}><Ban size={15} />Annulla la manutenzione</button></>}>
      <Field label="Motivo">
        <Seg light value={motivo} onChange={setMotivo} options={MOTIVI_ANNULLAMENTO.map((x) => ({ id: x, label: x }))} />
      </Field>
    </Modal>
  );
}

function ModaleRisolvi({ m, onChiudi }: { m: Manutenzione; onChiudi: () => void }) {
  const [foto, setFoto] = useState<string | null>(null);
  const [note, setNote] = useState('');
  return (
    <Modal titolo={`Risolvi ${m.id}`} sottotitolo={m.schedaId ? 'La foto che alleghi diventa la foto della scheda.' : 'Allega la foto del lavoro fatto.'} onClose={onChiudi}
      footer={<><button className="btn" onClick={onChiudi}>Annulla</button><button className="btn btn--success" disabled={!foto} onClick={() => { risolviManutenzione(m.id, aggiungiFoto(foto!), note || 'Intervento completato'); toast('Manutenzione risolta, foto aggiornata nella scheda'); onChiudi(); }}><CheckCircle2 size={16} />Segna come risolta</button></>}>
      <div className="col gap-16">
        {foto ? (
          <div className="foto"><img src={foto} alt="Foto aggiornata" /></div>
        ) : (
          <ScegliFoto className="drop" onFoto={setFoto}>
            <Camera size={26} />
            <div className="strong mt-8">Scatta o carica la foto aggiornata della postazione</div>
            <div className="small">Serve per chiudere la manutenzione</div>
          </ScegliFoto>
        )}
        {foto && <ScegliFoto className="btn btn--sm" onFoto={setFoto}><Camera size={14} />Cambia foto</ScegliFoto>}
        <Field label="Note sull'intervento"><textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Es. sostituita la lastra, sigillato il giunto" /></Field>
      </div>
    </Modal>
  );
}

function DettaglioManutenzione({ m, onChiudi }: { m: Manutenzione; onChiudi: () => void }) {
  const finestra = useRef<HTMLDivElement>(null);
  useEsc(onChiudi, finestra);
  const config = useStore((s) => s.config);
  const db = useStore((s) => s.db);
  const telefono = useTelefono();
  const s = indiceSchede(db.schede).get(m.schedaId);
  const [modale, setModale] = useState<'programma' | 'risolvi' | 'annulla' | null>(null);
  const st = statoM(m.stato);
  const pr = prioritaDef(m.priorita);
  const nome = (id?: string) => (id === 'ufficio' ? UFFICIO : db.operatori.find((o) => o.id === id)?.nome ?? '—');
  return (
    <div className="overlay" ref={finestra} onMouseDown={(e) => e.target === e.currentTarget && onChiudi()}>
      <div className="modal modal--lg">
        <div className="modal__head">
          <div>
            <div className="row gap-8">
              <span className="badge" style={tinta(st.colore)}>{st.label}</span>
              <span className="badge" style={tinta(pr.colore)}>Priorità {pr.label.toLowerCase()}</span>
            </div>
            <h2 className="mt-8">{labelLista(config.categorieManutenzione, m.categoria)} · {m.id}</h2>
            <p>{s ? `${s.id} · ${descrizioneScheda(s)} · ${s.viale}` : m.schedaId || `Parte comune · ${m.luogo ?? ''}`}</p>
          </div>
          <button className="btn btn--ghost btn--icon btn--sm" onClick={onChiudi} aria-label="Chiudi"><X size={18} /></button>
        </div>
        <div className="modal__body">
          <div className={`prima-dopo ${m.stato === 'risolta' ? '' : 'prima-dopo--uno'}`}>
            <figure><div className="foto"><FotoManutenzione m={m} /></div><figcaption>Segnalazione · {data(m.segnalataIl)}</figcaption></figure>
            {m.stato === 'risolta' && <figure><div className="foto"><FotoManutenzione m={m} dopo /></div><figcaption>Dopo l'intervento · {data(m.risoltaIl)}</figcaption></figure>}
          </div>
          <dl className="kv mt-16">
            <dt>Descrizione</dt><dd>{m.descrizione}</dd>
            <dt>Segnalata da</dt><dd>{nome(m.segnalataDa)} · {data(m.segnalataIl)}</dd>
            {m.dataProgrammata && (<><dt>Programmata il</dt><dd>{data(m.dataProgrammata)}</dd></>)}
            {!!m.operatoriIds?.length && (<><dt>Operatori</dt><dd>{m.operatoriIds.map(nome).join(', ')}</dd></>)}
            {m.stato === 'risolta' && (<><dt>Risolta il</dt><dd>{data(m.risoltaIl)}</dd><dt>Note</dt><dd>{m.noteRisoluzione}</dd></>)}
            {m.stato === 'annullata' && (<><dt>Annullata il</dt><dd>{data(m.annullataIl)}</dd><dt>Motivo</dt><dd>{m.motivoAnnullamento}</dd></>)}
          </dl>
        </div>
        <div className="modal__foot">
          {s && <button className="btn" onClick={() => { onChiudi(); seleziona(s.id); }}><ExternalLink size={15} />Apri scheda</button>}
          {!chiusa(m) && !telefono && <button className="btn" onClick={() => setModale('programma')}><CalendarDays size={15} />{m.stato === 'programmata' ? 'Riprogramma' : 'Programma'}</button>}
          {!chiusa(m) && !telefono && <button className="btn" onClick={() => setModale('annulla')}><Ban size={15} />Annulla</button>}
          {!chiusa(m) && <button className="btn btn--success" onClick={() => setModale('risolvi')}><CheckCircle2 size={15} />Risolvi</button>}
        </div>
      </div>
      {modale === 'programma' && <ModaleProgramma id={m.id} onChiudi={() => setModale(null)} />}
      {modale === 'risolvi' && <ModaleRisolvi m={m} onChiudi={() => setModale(null)} />}
      {modale === 'annulla' && <ModaleAnnulla m={m} onChiudi={() => setModale(null)} />}
    </div>
  );
}
