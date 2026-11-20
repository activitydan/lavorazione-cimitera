import { Fragment, useMemo } from 'react';
import { ArrowRight, CalendarDays, ClipboardCheck, MapPinPlus, Maximize2, Search, Wrench } from 'lucide-react';
import { CALENDARI } from '../components/Calendario';
import { CemeteryMap } from '../components/map/CemeteryMap';
import { SceltaStileMappa } from '../components/Topbar';
import { Dot } from '../components/ui';
import { apriModale, resetFiltri, seleziona, setFiltri, setUi, useStore } from '../data/store';
import { conta, labelLista, useCimitero, useDatiCimitero, useSchedeCimitero } from '../data/selectors';
import { COLORI_OPERAZIONE, NOMI_OPERAZIONE } from '../data/pratiche';
import { righeScadenzario, statoAvviso, ultimaLettera } from '../data/scadenze';
import { aggiungiGiorni, nomeCompleto, numero, oggiISO, percentuale } from '../lib/format';
import { useTelefono } from '../lib/schermo';
import { href, vai } from '../router';
import { statoEffettivo } from '../data/concessioni';
import { indiceUtenze, statoUtenza } from '../data/utenze';

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
  // scadenze e pagamenti: gli stessi numeri delle linguette di "Scadenze e pagamenti"
  const scadenze = useMemo(() => righeScadenzario(db, cimitero?.id ?? ''), [db, cimitero?.id]);
  const avvisi = useMemo(() => db.avvisi.filter((a) => a.cimiteroId === cimitero?.id).map((a) => statoAvviso(a)), [db.avvisi, cimitero?.id]);

  // I segnali delle sezioni: quante cose aspettano in ognuna, nell'ordine del menu. Ogni numero apre l'elenco già filtrato;
  // sul telefono restano le due sezioni che lì si aprono.
  const blocchi = useMemo(() => {
    const qui = cimitero?.id;
    const tutte = telefono ? '&tutte=1' : '';
    const pratiche = db.pratiche.filter((p) => p.cimiteroId === qui);
    const concessioni = db.concessioni.filter((c) => c.cimiteroId === qui && c.stato !== 'chiusa').map((c) => {
      const e = statoEffettivo(c, db.regole);
      return e.stato === 'chiusa' ? (e.motivo === 'scaduta' ? 'scaduta' : 'chiusa') : e.stato;
    });
    const utenze = db.utenze.filter((u) => u.cimiteroId === qui).map((u) => statoUtenza(u));
    const conUtenza = indiceUtenze(db.utenze);
    const lampade = schede.filter((sc) => sc.lampadaAccesa === true && !(conUtenza.get(sc.id) ?? []).some((u) => u.stato === 'attiva')).length;
    const mie = new Set(schede.map((sc) => sc.id));
    const verifiche = db.verifiche.filter((v) => v.stato === 'aperta' && mie.has(v.schedaId));
    const conta = <T,>(lista: T[], x: T) => lista.filter((y) => y === x).length;
    return [
      { titolo: 'Operazioni cimiteriali', voci: [
        { n: db.richieste.filter((r) => r.cimiteroId === qui && r.stato === 'in_attesa').length, label: 'richieste', link: '/operazioni' },
        { n: pratiche.filter((p) => p.stato === 'aperta').length, label: 'da programmare', link: '/operazioni?stato=aperta' },
        { n: pratiche.filter((p) => p.stato === 'programmata').length, label: 'programmate', link: '/operazioni?stato=programmata' },
      ] },
      { titolo: 'Concessioni', voci: [
        { n: conta(concessioni, 'in_scadenza'), label: 'in scadenza', link: '/concessioni?stato=in_scadenza' },
        { n: conta(concessioni, 'scaduta'), label: 'scadute', link: '/concessioni?stato=scaduta' },
        { n: conta(concessioni, 'in_decadenza'), label: 'in decadenza', link: '/concessioni?stato=in_decadenza' },
      ] },
      { titolo: 'Illuminazione votiva', voci: [
        { n: conta(utenze, 'da_allacciare'), label: 'da allacciare', link: '/illuminazione-votiva?stato=da_allacciare' },
        { n: conta(utenze, 'sospesa'), label: 'sospese', link: '/illuminazione-votiva?stato=sospesa' },
        { n: lampade, label: 'da controllare', link: '/illuminazione-votiva?tab=lampade' },
      ] },
      { titolo: 'Scadenze e pagamenti', voci: [
        { n: scadenze.filter((r) => !ultimaLettera(db.invii, r.chiave)).length, label: 'senza lettera', link: '/scadenze?stato=senza_lettera' },
        { n: conta(avvisi, 'da_pagare'), label: 'da pagare', link: '/scadenze?tab=avvisi' },
        { n: conta(avvisi, 'scaduto'), label: 'morosi', link: '/scadenze?tab=morosi', alto: true },
      ] },
      { titolo: 'Manutenzioni', campo: true, voci: [
        { n: manutenzioni.filter((m) => m.stato === 'aperta').length, label: 'da programmare', link: `/manutenzioni?stato=aperta${tutte}` },
        { n: manutenzioni.filter((m) => m.stato === 'programmata').length, label: 'programmate', link: `/manutenzioni?stato=programmata${tutte}` },
        { n: manutenzioni.filter((m) => m.stato !== 'risolta' && m.stato !== 'annullata' && m.priorita === 'urgente').length, label: 'urgenti', link: telefono ? '/manutenzioni?tutte=1' : '/manutenzioni', alto: true },
      ] },
      { titolo: 'Censimento', campo: true, voci: [
        { n: `${stimate ? percentuale(schede.length, stimate) : 0}%`, label: 'censito', link: telefono ? '' : '/censimento', nota: `${numero(schede.length)} schede su ${numero(stimate)} stimate` },
        { n: verifiche.length, label: 'verifiche aperte', link: '/censimento?tab=verifiche' },
        { n: verifiche.filter((v) => v.scadenza < oggi).length, label: 'in ritardo', link: '/censimento?tab=verifiche', alto: true },
      ] },
    ] as { titolo: string; campo?: boolean; voci: { n: number | string; label: string; link: string; alto?: boolean; nota?: string }[] }[];
  }, [db, schede, manutenzioni, scadenze, avvisi, stimate, cimitero?.id, telefono, oggi]);

  if (!cimitero) return null;
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
        <section className="card segnali" aria-label="Cosa aspetta in ogni sezione">
          {blocchi.filter((b) => !telefono || b.campo).map((b) => (
            <div key={b.titolo} className="segnali__blocco">
              <h3>{b.titolo}</h3>
              <div className="mini-kpis">
                {b.voci.map((v) => (
                  <a key={v.label} href={v.link ? href(v.link) : undefined} title={v.nota} className={`${v.alto && v.n !== 0 ? 'is-danger' : ''} ${v.n === 0 ? 'is-zero' : ''}`}>
                    <b>{typeof v.n === 'number' ? numero(v.n) : v.n}</b>
                    <span>{v.label}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
