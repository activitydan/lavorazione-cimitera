import { useEffect, type KeyboardEvent, type RefObject } from 'react';

/**
 * Rende usabile con la tastiera un elemento che si apre con il clic (riga di tabella, cella, riquadro):
 * si raggiunge con Tab e si attiva con Invio o Spazio. I controlli al suo interno restano indipendenti.
 */
export function attivabile(azione: () => void) {
  return {
    tabIndex: 0,
    onClick: azione,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        azione();
      }
    },
  };
}

/** Esc chiude la finestra, ma solo se è quella in primo piano (non quella sotto a un'altra finestra). */
export function useEsc(chiudi: () => void, finestra: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const k = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const aperte = document.querySelectorAll('.overlay');
      if (aperte[aperte.length - 1] === finestra.current) chiudi();
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [chiudi, finestra]);
}
