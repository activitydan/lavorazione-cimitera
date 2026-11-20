import { Fragment, useMemo } from 'react';
import { ArrowRight, CalendarClock, CalendarDays, ClipboardCheck, ClipboardList, MapPinPlus, Maximize2, Search, Wrench } from 'lucide-react';
import { CALENDARI } from '../components/Calendario';
import { CemeteryMap } from '../components/map/CemeteryMap';
import { SceltaStileMappa } from '../components/Topbar';
import { Ciambella, Dot } from '../components/ui';
import { apriModale, resetFiltri, seleziona, setFiltri, setUi, useStore } from '../data/store';
import { conta, labelLista, useCimitero, useDatiCimitero, useSchedeCimitero } from '../data/selectors';
import { COLORI_OPERAZIONE, NOMI_OPERAZIONE } from '../data/pratiche';
import { righeScadenzario, statoAvviso } from '../data/scadenze';
import { aggiungiGiorni, nomeCompleto, numero, oggiISO, percentuale } from '../lib/format';
import { useTelefono } from '../lib/schermo';
import { href, vai } from '../router';

function Widget({ titolo, icona, link, linkLabel = 'Apri', azione, children, className }: {
  titolo: string; icona: React.ReactNode; link?: string; linkLabel?: string; azione?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={`card widget ${className ?? ''}`}>
      <div className="widget__head">
        <h3><span className="widget__ico">{icona}</span>{titolo}</h3>
        {link && <a className="widget__link" href={href(link)}>{linkLabel}<ArrowRight size={14} /></a>}
        {azione}
      </div>
      <div className="widget__body">{children}</div>
    </section>
  );
}

export function Dashboard() {
  const cimitero = useCimitero();
  const schede = useSchedeCimitero();
  const config = useStore((s) => s.config);
  const db = useStore((s) => s.db);
  const stileMappa = useStore((s) => s.ui.stileMappa);
  // sul telefono la Dashboard è la stessa del computer, in colonna: mappa piccola in alto, poi i riquadri
  const telefono = useTelefono();
  const { quadranti, strutture, viali, aree, manutenzioni } = useDatiCimitero();
  const domani = aggiungiGiorni(oggiISO(), 1);
  // il lavoro in programma oggi e domani: operazioni cimiteriali e manutenzioni, nell'ordine in cui si fanno
  const agenda = useMemo(() => {
    const giorni = [oggiISO(), domani];
    const nomi = (ids?: string[]) => (ids ?? []).map((id) => db.operatori.find((o) => o.id === id)?.nome).filter(Boolean).join(', ');
    const rossa = CALENDARI.find((c) => c.id === 'manutenzione')!.colore;
    return [
      ...db.pratiche.filter((p) => p.stato === 'programmata' && p.dataOra && p.cimiteroId === cimitero?.id && giorni.includes(p.dataOra.slice(0, 10))).map((p) => ({
        id: p.id, giorno: p.dataOra!.slice(0, 10), ora: p.dataOra!.slice(11, 16), colore: COLORI_OPERAZIONE[p.tipo], titolo: `${NOMI_OPERAZIONE[p.tipo]} · ${nomeCompleto(p.defunto)}`,
        sotto: [p.schedaId, nomi(p.operatoriIds)].filter(Boolean).join(' · '), link: telefono ? `/scheda/${p.schedaId}` : `/operazioni?id=${p.id}`,
      })),
      ...manutenzioni.filter((m) => m.stato === 'programmata' && m.dataProgrammata && giorni.includes(m.dataProgrammata)).map((m) => ({
        id: m.id, giorno: m.dataProgrammata!, ora: '', colore: rossa, titolo: `Manutenzione · ${labelLista(config.categorieManutenzione, m.categoria)}`,
        sotto: [m.schedaId || m.luogo, nomi(m.operatoriIds)].filter(Boolean).join(' · '), link: `/manutenzioni?id=${m.id}`,
      })),
    ].sort((a, b) => a.giorno.localeCompare(b.giorno) || (a.ora || '99').localeCompare(b.ora || '99') || a.titolo.localeCompare(b.titolo));
  }, [db.pratiche, db.operatori, manutenzioni, config.categorieManutenzione, cimitero?.id, domani, telefono]);
  const oggi = oggiISO();

  const stimate = quadranti.reduce((t, x) => t + x.stimaManufatti, 0);
  const perStato = useMemo(() => conta(schede, (s) => s.stato), [schede]);
  const defunti = useMemo(() => schede.reduce((t, s) => t + s.defunti.length, 0), [schede]);
  // scadenze e pagamenti: gli stessi numeri delle linguette di "Scadenze e pagamenti"
  const scadenze = useMemo(() => righeScadenzario(db, cimitero?.id ?? ''), [db, cimitero?.id]);
  const avvisi = useMemo(() => db.avvisi.filter((a) => a.cimiteroId === cimitero?.id).map((a) => statoAvviso(a)), [db.avvisi, cimitero?.id]);
  const settimana = useMemo(() => schede.filter((s) => s.rilevatoIl.slice(0, 10) >= aggiungiGiorni(oggi, -7)).length, [schede, oggi]);
  const urgenti = manutenzioni.filter((m) => m.stato !== 'risolta' && m.stato !== 'annullata' && m.priorita === 'urgente').length;

  if (!cimitero) return null;
  const tutte = telefono ? '&tutte=1' : '';
  const vaiMappa = (patch: Parameters<typeof setFiltri>[0]) => {
    resetFiltri();
    setFiltri(patch);
    vai('/mappa');
  };

  return (
    <div className={`page page--home ${telefono ? 'page--home-tel' : ''}`}>
      {/* senza intestazione: "Nuovo rilievo" sta nella barra in alto, come nel frame Figma */}
      <h1 className="sr-only">Dashboard · {cimitero.nome}</h1>
      <div className="bento">
        <section className="card bento__map">
          <CemeteryMap
            cimitero={cimitero}
            schede={schede}
            strutture={strutture}
            viali={viali}
            aree={aree}
            stile={stileMappa}
            compatta
            ferma={telefono}
            etichetteViali={false}
            segueVolo={false}
            onSelect={(id) => {
              seleziona(id, { pannello: false });
              vai('/mappa');
            }}
          />
          <div className="bento__map-top">
            <div className="bento__map-seg"><SceltaStileMappa /></div>
            <a className="btn btn--sm" href={href('/mappa')}><Maximize2 size={14} />{telefono ? 'Schermo intero' : 'Apri la mappa'}</a>
          </div>
          <div className="bento__map-legend">
            {config.stati.filter((s) => !s.archiviato).map((s) => (
              <button key={s.id} className="legend__item" onClick={() => vaiMappa({ stati: [s.id] })} title="Vedi sulla mappa">
                <Dot colore={s.colore} />
                {s.label}
                <b className="mono">{numero(perStato[s.id] ?? 0)}</b>
              </button>
            ))}
          </div>
        </section>

        {telefono && (
          <div className="bento__azioni azioni-grid">
            <button className="azione azione--verde" onClick={() => vai('/rilievo')}><MapPinPlus size={18} />Nuovo rilievo</button>
            <button className="azione" onClick={() => vai('/ricerca')}><Search size={18} />Ricerca</button>
            <button className="azione" onClick={() => apriModale({ tipo: 'manutenzione' })}><Wrench size={18} />Segnala</button>
            <button className="azione" onClick={() => vai('/censimento?tab=verifiche')}><ClipboardCheck size={18} />Verifiche</button>
          </div>
        )}

        <Widget titolo="Agenda di oggi" icona={<CalendarDays size={16} />} className="bento__alert"
          azione={telefono ? <button className="widget__link" onClick={() => setUi({ calendario: true })}>Calendario<ArrowRight size={14} /></button> : undefined}>
          <div className="alert-list">
            {agenda.length === 0 && <p className="small muted">Niente in programma oggi e domani.</p>}
            {(telefono ? agenda.slice(0, 5) : agenda).map((v, i, lista) => (
              <Fragment key={v.id}>
                {(i === 0 || lista[i - 1].giorno !== v.giorno) && <div className="agenda-giorno">{v.giorno === oggi ? 'Oggi' : 'Domani'}</div>}
                <a className="alert-item" href={href(v.link)}>
                  <span className="alert-dot" style={{ background: v.colore }} />
                  <span className="grow">
                    <b>{v.ora ? `${v.ora} · ` : ''}{v.titolo}</b>
                    <span className="small muted">{v.sotto}</span>
                  </span>
                </a>
              </Fragment>
            ))}
            {telefono && agenda.length > 5 && <p className="small muted">E altre {agenda.length - 5}: le trovi nel calendario.</p>}
          </div>
        </Widget>

        {/* il calendario grande, sotto tutta la mappa: tutto ciò che è in programma */}
        <Widget titolo="Censimento" icona={<ClipboardList size={16} />} link={telefono ? '/censimento?tab=verifiche' : '/censimento'} linkLabel={telefono ? 'Verifiche' : 'Apri'} className="bento__censite">
          <div className="row gap-16">
            <Ciambella
              size={112}
              spessore={13}
              dati={[{ id: 'c', label: 'Censite', valore: schede.length, colore: '#79AA4F' }, { id: 'r', label: 'Da censire', valore: Math.max(0, stimate - schede.length), colore: '#E2E7EE' }]}
              centro={<div className="display" style={{ fontSize: 20, fontWeight: 800 }}>{stimate ? percentuale(schede.length, stimate) : 0}%</div>}
              sotto={<div className="tiny muted">censito</div>}
            />
            <div className="col gap-4 grow">
              <div className="kpi__value">{numero(schede.length)}<small>/ {numero(stimate)} schede</small></div>
              <div className="small muted">+{numero(settimana)} negli ultimi 7 giorni</div>
              <div className="small muted">{numero(defunti)} defunti registrati</div>
            </div>
          </div>
        </Widget>

        <Widget titolo="Manutenzione" icona={<Wrench size={16} />} link="/manutenzioni" className="bento__manut">
          <div className="mini-kpis">
            <a href={href(`/manutenzioni?stato=aperta${tutte}`)}><b>{manutenzioni.filter((m) => m.stato === 'aperta').length}</b><span>aperte</span></a>
            <a href={href(`/manutenzioni?stato=programmata${tutte}`)}><b>{manutenzioni.filter((m) => m.stato === 'programmata').length}</b><span>programmate</span></a>
            <a href={href(`/manutenzioni?stato=risolta${tutte}`)}><b>{manutenzioni.filter((m) => m.stato === 'risolta').length}</b><span>risolte</span></a>
            <a href={href(telefono ? '/manutenzioni?tutte=1' : '/manutenzioni')} className="is-danger"><b>{urgenti}</b><span>urgenti</span></a>
          </div>
        </Widget>

        <Widget titolo="Scadenze e pagamenti" icona={<CalendarClock size={16} />} link={telefono ? undefined : '/scadenze'} className="bento__scadenze">
          {/* sul telefono si leggono soltanto: la pagina delle scadenze si usa dal computer */}
          <div className="mini-kpis">
            <a href={telefono ? undefined : href('/scadenze')}><b>{numero(scadenze.filter((r) => r.giorni >= 0).length)}</b><span>in scadenza</span></a>
            <a href={telefono ? undefined : href('/scadenze')}><b>{numero(scadenze.filter((r) => r.giorni < 0).length)}</b><span>scadute</span></a>
            <a href={telefono ? undefined : href('/scadenze?tab=avvisi')}><b>{numero(avvisi.filter((a) => a === 'da_pagare').length)}</b><span>da pagare</span></a>
            <a href={telefono ? undefined : href('/scadenze?tab=morosi')} className="is-danger"><b>{numero(avvisi.filter((a) => a === 'scaduto').length)}</b><span>morosi</span></a>
          </div>
        </Widget>
      </div>
    </div>
  );
}
