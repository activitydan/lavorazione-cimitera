import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Check, ChevronDown, FileText, Layers, Lightbulb, Menu, MapPin, MapPinPlus, Plus, Satellite, ScrollText, Search, Wrench } from 'lucide-react';
import { apriModale, segnaLetti, seleziona, setCimitero, setFiltri, setUi, resetFiltri, useStore, volaA } from '../data/store';
import { descrizioneScheda, NOMI_CATEGORIA_ALERT, testoRicerca, useAlert, useCimitero, useDatiCimitero, useSchedeCimitero, type AlertItem } from '../data/selectors';
import type { CategoriaAlert, Concessione, Pratica, Scheda, StileMappa, UtenzaVotiva } from '../data/types';
import { NOMI_TIPO_CONCESSIONE, nomeSoggetto, nomiConcessionari, scadenzaLeggibile } from '../data/concessioni';
import { STATI_PRATICA, nomeOperazione } from '../data/pratiche';
import { NOMI_STATO_UTENZA, nomeDefuntoUtenza, statoUtenza } from '../data/utenze';
import { dataBreve, nomeCompleto, normalizza, numero } from '../lib/format';
import { centroide } from '../lib/geo';
import { useTelefono } from '../lib/schermo';
import { useRotta, vai } from '../router';
import { Seg, StatoBadge } from './ui';

function useFuori(ref: React.RefObject<HTMLElement | null>, onFuori: () => void) {
  useEffect(() => {
    const f = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && onFuori();
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, [ref, onFuori]);
}

function SelettoreCimitero() {
  const cimiteri = useStore((s) => s.db.cimiteri);
  const schede = useStore((s) => s.db.schede);
  const cim = useCimitero();
  const [aperto, setAperto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useFuori(ref, () => setAperto(false));
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="cim-select" onClick={() => setAperto(!aperto)} aria-haspopup="listbox" aria-expanded={aperto}>
        <span className="cim-select__name">{cim?.nome ?? 'Cimitero'}</span>
        <ChevronDown size={16} />
      </button>
      {aperto && (
        <div className="popover" style={{ left: 0, width: 320 }} role="listbox">
          {cimiteri.map((c) => {
            const n = schede.filter((s) => s.cimiteroId === c.id).length;
            return (
              <button
                key={c.id}
                className={`popover__item ${c.id === cim?.id ? 'is-active' : ''}`}
                onClick={() => {
                  setCimitero(c.id);
                  setAperto(false);
                }}
              >
                <MapPin size={18} color={c.id === cim?.id ? '#1B5A8F' : '#93A0B1'} />
                <span className="grow">
                  <b>{c.nome}</b>
                  <br />
                  <span className="small muted">{n ? `${numero(n)} schede · censimento in corso` : 'Censimento da avviare'}</span>
                </span>
                {c.id === cim?.id && <Check size={16} color="#1B5A8F" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

type Area = { tipo: 'viale' | 'quadrante'; id: string; label: string; lat: number; lng: number };
type Trovato =
  | { k: 'scheda'; s: Scheda }
  | { k: 'concessione'; c: Concessione }
  | { k: 'pratica'; p: Pratica }
  | { k: 'utenza'; u: UtenzaVotiva }
  | { k: 'area'; a: Area };
const GRUPPO: Record<Trovato['k'], string> = {
  scheda: 'Postazioni e defunti', concessione: 'Concessioni', pratica: 'Pratiche', utenza: 'Utenze votive', area: 'Aree sulla mappa',
};
const chiave = (r: Trovato) => (r.k === 'scheda' ? r.s.id : r.k === 'concessione' ? r.c.id : r.k === 'pratica' ? r.p.id : r.k === 'utenza' ? r.u.id : r.a.id);

/** Una ricerca sola per tutto il lavoro d'ufficio: postazioni e defunti, concessioni, pratiche, utenze votive, aree. */
function RicercaGlobale() {
  const schede = useSchedeCimitero();
  const { viali, quadranti } = useDatiCimitero();
  const cimitero = useCimitero();
  const concessioni = useStore((st) => st.db.concessioni);
  const pratiche = useStore((st) => st.db.pratiche);
  const utenze = useStore((st) => st.db.utenze);
  const rotta = useRotta();
  const telefono = useTelefono();
  const [q, setQ] = useState('');
  const [aperto, setAperto] = useState(false);
  const [att, setAtt] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  useFuori(ref, () => setAperto(false));

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  const risultati = useMemo<Trovato[]>(() => {
    const t = normalizza(q);
    if (t.length < 2) return [];
    const parole = t.split(/\s+/);
    const dentro = (testo: string) => {
      const n = normalizza(testo);
      return parole.every((p) => n.includes(p));
    };
    const out: Trovato[] = schede.filter((sc) => parole.every((p) => testoRicerca(sc).includes(p))).slice(0, 6).map((sc) => ({ k: 'scheda' as const, s: sc }));
    // concessioni, pratiche e utenze si lavorano dal computer: sul telefono la ricerca resta su postazioni e aree
    if (!telefono) {
      const qui = cimitero?.id;
      out.push(...concessioni.filter((c) => c.cimiteroId === qui && dentro(`${c.numero} ${c.concessionari.map(nomeSoggetto).join(' ')}`)).slice(0, 3).map((c) => ({ k: 'concessione' as const, c })));
      out.push(...pratiche.filter((p) => p.cimiteroId === qui && dentro(`${p.numero} ${nomeCompleto(p.defunto)}`)).slice(0, 3).map((p) => ({ k: 'pratica' as const, p })));
      out.push(...utenze.filter((u) => u.cimiteroId === qui && dentro(`${u.numero} ${nomeSoggetto(u.abbonato)} ${nomeDefuntoUtenza(u)}`)).slice(0, 3).map((u) => ({ k: 'utenza' as const, u })));
    }
    const aree: Area[] = [];
    for (const v of viali)
      if (normalizza(v.nome).includes(t) && v.tracciato.length) {
        const c = centroide(v.tracciato);
        aree.push({ tipo: 'viale', id: v.id, label: v.nome, lat: c[0], lng: c[1] });
      }
    for (const qd of quadranti)
      if (normalizza(qd.nome).includes(t)) {
        const c = centroide(qd.poligono);
        aree.push({ tipo: 'quadrante', id: qd.id, label: qd.nome, lat: c[0], lng: c[1] });
      }
    out.push(...aree.slice(0, 3).map((a) => ({ k: 'area' as const, a })));
    return out;
  }, [q, schede, viali, quadranti, concessioni, pratiche, utenze, cimitero?.id, telefono]);

  const scegli = (i: number) => {
    const r = risultati[i];
    if (!r) return;
    setAperto(false);
    setQ('');
    if (r.k === 'scheda') {
      // resti dove sei: la scheda si apre nel pannello di lato; sulla mappa ci si vola sopra
      if (rotta.path.startsWith('/scheda/')) vai(`/scheda/${r.s.id}`);
      else seleziona(r.s.id, { vola: rotta.path === '/' || rotta.path === '/mappa' });
    } else if (r.k === 'concessione') vai(`/concessioni?id=${r.c.id}`);
    else if (r.k === 'pratica') vai(`/operazioni?id=${r.p.id}`);
    else if (r.k === 'utenza') vai(`/illuminazione-votiva?id=${r.u.id}`);
    else {
      // un'area si guarda sulla mappa
      if (!['/', '/mappa'].includes(rotta.path)) vai('/mappa');
      seleziona(null);
      if (r.a.tipo === 'viale') resetFiltri({ viali: [r.a.label] });
      else resetFiltri({ quadranti: [r.a.id] });
      volaA(r.a.lat, r.a.lng, 18.75);
    }
  };

  const riga = (r: Trovato) => {
    if (r.k === 'scheda')
      return (
        <>
          <span className="grow" style={{ minWidth: 0 }}>
            <b className="ellipsis" style={{ display: 'block' }}>{descrizioneScheda(r.s)}</b>
            <span className="tiny muted">
              {r.s.id} · {r.s.viale}
              {r.s.defunti[0]?.dataMorte ? ` · † ${dataBreve(r.s.defunti[0].dataMorte)}` : ''}
            </span>
          </span>
          <StatoBadge stato={r.s.stato} small />
        </>
      );
    const [titolo, sotto] =
      r.k === 'concessione' ? [`${r.c.numero} · ${nomiConcessionari(r.c)}`, `${NOMI_TIPO_CONCESSIONE[r.c.tipo]} · ${r.c.perpetua ? 'perpetua' : `scade il ${scadenzaLeggibile(r.c)}`}`]
      : r.k === 'pratica' ? [`${r.p.numero} · ${nomeCompleto(r.p.defunto)}`, `${nomeOperazione(r.p)} · ${STATI_PRATICA.find((x) => x.id === r.p.stato)?.label ?? ''}`]
      : r.k === 'utenza' ? [`${r.u.numero} · ${nomeSoggetto(r.u.abbonato)}`, `${nomeDefuntoUtenza(r.u)} · ${NOMI_STATO_UTENZA[statoUtenza(r.u)]}`]
      : [r.a.label, r.a.tipo === 'viale' ? 'Viale · filtra le schede sulla mappa' : 'Quadrante · filtra le schede sulla mappa'];
    return (
      <span className="grow" style={{ minWidth: 0 }}>
        <b className="ellipsis" style={{ display: 'block' }}>{titolo}</b>
        <span className="tiny muted ellipsis" style={{ display: 'block' }}>{sotto}</span>
      </span>
    );
  };

  const etichetta = telefono ? 'Cerca per nome, ID o area' : 'Cerca per nome, numero o area';
  return (
    <div ref={ref} className="gsearch">
      <div className="input-icon input-icon--dx">
        <Search size={17} />
        <input
          ref={input}
          className="input"
          placeholder={`${etichetta}…`}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setAperto(true);
            setAtt(0);
          }}
          onFocus={() => setAperto(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setAtt((a) => Math.min(a + 1, risultati.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setAtt((a) => Math.max(a - 1, 0));
            } else if (e.key === 'Enter') scegli(att);
            else if (e.key === 'Escape') setAperto(false);
          }}
          aria-label={telefono ? etichetta : 'Cerca postazioni, defunti, concessioni, pratiche, utenze votive e aree'}
        />
      </div>
      {aperto && q.trim().length >= 2 && (
        <div className="popover gsearch__pop">
          {risultati.length === 0 && <div className="small muted" style={{ padding: 16 }}>Nessun risultato per “{q}”</div>}
          {risultati.map((r, i) => (
            <Fragment key={`${r.k}-${chiave(r)}`}>
              {(i === 0 || risultati[i - 1].k !== r.k) && <div className="gsearch__gruppo">{GRUPPO[r.k]}</div>}
              <button className={`popover__item ${i === att ? 'is-active' : ''}`} onMouseEnter={() => setAtt(i)} onClick={() => scegli(i)}>
                {riga(r)}
              </button>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

/** Campanella degli alert. Nel menu laterale il pannello si apre verso l'alto, a destra del menu. */
export function CampanellaAlert({ nelMenu }: { nelMenu?: boolean }) {
  const alert = useAlert();
  const letti = useStore((s) => s.db.alertLetti);
  const [aperto, setAperto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useFuori(ref, () => setAperto(false));
  const nonLetti = alert.filter((a) => !letti.includes(a.id));
  // filtro per categoria: "Inumazioni", "Tumulazioni", "Manutenzioni"... solo quelle che hanno almeno un alert
  const [categoria, setCategoria] = useState<CategoriaAlert | ''>('');
  const categorie = (Object.keys(NOMI_CATEGORIA_ALERT) as CategoriaAlert[]).filter((c) => alert.some((a) => a.categoria === c));
  const scelta = categoria && categorie.includes(categoria) ? categoria : '';
  const lista = scelta ? alert.filter((a) => a.categoria === scelta) : alert;
  const telefono = useTelefono();
  const pratiche = useStore((s) => s.db.pratiche);
  const apri = (a: AlertItem) => {
    segnaLetti([a.id]);
    setAperto(false);
    if (!a.link) return;
    // sul telefono le Operazioni cimiteriali non si aprono: l'alert porta alla scheda della postazione
    const m = telefono ? /^\/operazioni\?id=(.+)$/.exec(a.link) : null;
    const p = m ? pratiche.find((x) => x.id === m[1]) : undefined;
    if (p) vai(`/scheda/${p.schedaId}`);
    else if (!telefono || !/^\/(operazioni|concessioni|scadenze|illuminazione-votiva|amministrazione|impostazioni)/.test(a.link)) vai(a.link);
  };
  return (
    <div ref={ref} className={nelMenu ? 'campanella campanella--menu' : 'campanella'} style={{ position: 'relative' }}>
      <button className="icon-btn" onClick={() => setAperto(!aperto)} aria-label={`Alert: ${nonLetti.length} da leggere`}>
        <Bell size={20} />
        {nonLetti.length > 0 && <span className="icon-btn__dot">{nonLetti.length}</span>}
      </button>
      {aperto && (
        <div className="popover" style={nelMenu ? { left: 0, bottom: 44, top: 'auto', width: 380 } : { right: 0, width: 380 }}>
          <div className="row row--between" style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
            <b>I tuoi alert</b>
            <button className="btn btn--ghost btn--xs" onClick={() => segnaLetti(alert.map((a) => a.id))} disabled={!nonLetti.length}>
              Segna tutti come letti
            </button>
          </div>
          {categorie.length > 1 && (
            <div className="alert-filtri">
              <button className={`chip chip--sm ${!scelta ? 'is-on' : ''}`} onClick={() => setCategoria('')}>Tutti<span className="chip__n">{alert.length}</span></button>
              {categorie.map((c) => (
                <button key={c} className={`chip chip--sm ${scelta === c ? 'is-on' : ''}`} onClick={() => setCategoria(c)}>
                  {NOMI_CATEGORIA_ALERT[c]}<span className="chip__n">{alert.filter((a) => a.categoria === c).length}</span>
                </button>
              ))}
            </div>
          )}
          <div style={{ maxHeight: 420, overflow: 'auto' }}>
            {alert.length === 0 && <div className="small muted" style={{ padding: 16 }}>Nessun alert per te.</div>}
            {lista.map((a) => (
              <button key={a.id} className="popover__item alert-row" onClick={() => apri(a)} style={{ alignItems: 'flex-start', opacity: letti.includes(a.id) ? 0.6 : 1 }}>
                <span className={`alert-dot alert-dot--${a.livello}`} />
                <span className="grow">
                  <b style={{ fontSize: 13 }}>{a.titolo}</b>
                  <br />
                  <span className="small muted">{a.messaggio}</span>
                </span>
                <span className="tiny muted nowrap">{NOMI_CATEGORIA_ALERT[a.categoria]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const STILI: { id: StileMappa; label: string; icon: React.ReactNode }[] = [
  { id: 'satellite', label: 'Satellite', icon: <Satellite size={14} /> },
  { id: 'planimetria', label: 'Planimetria', icon: <Layers size={14} /> },
];

/** Satellite / Planimetria: nella barra sulla pagina Mappa, dentro la mappa nella Dashboard. */
export function SceltaStileMappa() {
  const stile = useStore((s) => s.ui.stileMappa);
  return <Seg options={STILI.map((s) => ({ ...s, label: <span className="seg-label">{s.label}</span> }))} value={stile} onChange={(v) => setUi({ stileMappa: v })} />;
}

/** La barra dell'agenzia funebre: solo il cimitero e, sul telefono, la campanella. */
export function TopbarAgenzia() {
  const telefono = useTelefono();
  return (
    <header className="topbar">
      <button className="icon-btn hamburger" onClick={() => setUi({ menuMobile: true })} aria-label="Apri il menu">
        <Menu size={22} />
      </button>
      <SelettoreCimitero />
      <div className="grow" />
      {telefono && <CampanellaAlert />}
    </header>
  );
}

/** Sul computer: da qui partono le cose che si creano più spesso alla scrivania. Il rilievo, lavoro da campo, resta in fondo. */
const VOCI_NUOVO = [
  { label: 'Pratica', nota: 'Operazione cimiteriale', icon: FileText, fai: () => vai('/operazioni?nuovo=1') },
  { label: 'Concessione', nota: 'Contratto su una postazione', icon: ScrollText, fai: () => vai('/concessioni?nuovo=1') },
  { label: 'Allaccio votivo', nota: 'Nuova utenza votiva', icon: Lightbulb, fai: () => vai('/illuminazione-votiva?nuovo=1') },
  { label: 'Segnalazione di manutenzione', nota: 'Guasto o lavoro da fare', icon: Wrench, fai: () => apriModale({ tipo: 'manutenzione' }) },
  { label: 'Rilievo', nota: 'Censire una postazione', icon: MapPinPlus, fai: () => vai('/rilievo') },
];

function MenuNuovo() {
  const [aperto, setAperto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pulsante = useRef<HTMLButtonElement>(null);
  useFuori(ref, () => setAperto(false));
  const chiudi = () => { setAperto(false); pulsante.current?.focus(); };
  return (
    <div ref={ref} style={{ position: 'relative' }} onKeyDown={(e) => { if (e.key === 'Escape' && aperto) { e.stopPropagation(); chiudi(); } }}>
      <button ref={pulsante} className="btn btn--success topbar__new" onClick={() => setAperto(!aperto)} aria-haspopup="menu" aria-expanded={aperto}>
        <Plus size={16} />
        <span>Nuovo</span>
        <ChevronDown size={14} />
      </button>
      {aperto && (
        <div className="popover menu-nuovo" role="menu" aria-label="Cosa vuoi creare">
          {VOCI_NUOVO.map((v) => (
            <button key={v.label} className="popover__item" role="menuitem" onClick={() => { setAperto(false); v.fai(); }}>
              <v.icon size={16} />
              <span className="grow"><b>{v.label}</b><span className="tiny muted">{v.nota}</span></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Topbar() {
  const rotta = useRotta();
  const home = rotta.path === '/';
  const telefono = useTelefono();
  return (
    <header className="topbar">
      <button className="icon-btn hamburger" onClick={() => setUi({ menuMobile: true })} aria-label="Apri il menu">
        <Menu size={22} />
      </button>
      <SelettoreCimitero />
      <RicercaGlobale />
      {rotta.path === '/mappa' && (
        <div className="topbar__seg">
          <SceltaStileMappa />
        </div>
      )}
      <div className="grow" />
      {telefono && <CampanellaAlert />}
      {home && !telefono && (
        <MenuNuovo />
      )}
    </header>
  );
}

export function filtraEVai(patch: Parameters<typeof setFiltri>[0], dove = '/mappa') {
  resetFiltri();
  setFiltri(patch);
  vai(dove);
}
