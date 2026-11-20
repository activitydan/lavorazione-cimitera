import type { CSSProperties } from 'react';

// Colori dei dati (stati, tipi, priorità, quadranti, operatori): si scelgono in Impostazioni, quindi possono essere chiari.
// Quando diventano testo vanno scuriti quanto basta per leggersi: stessa tinta, contrasto di almeno 4,5 a 1.

type Rgb = [number, number, number];

const TESTO: Rgb = [20, 36, 58]; // --text
const FONDO: Rgb = [238, 241, 245]; // --surface-3, il fondo più scuro su cui finisce un'etichetta
const giaFatti = new Map<string, string>();

function leggi(colore: string): Rgb | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(colore.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminanza(c: Rgb): number {
  const [r, g, b] = c.map((v) => {
    const x = v / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrasto(a: Rgb, b: Rgb): number {
  const [chiaro, scuro] = [luminanza(a), luminanza(b)].sort((x, y) => y - x);
  return (chiaro + 0.05) / (scuro + 0.05);
}

/** Il colore di un dato usato come testo: la stessa tinta, scurita quanto basta per leggersi. */
export function tintaTesto(colore: string): string {
  const pronto = giaFatti.get(colore);
  if (pronto) return pronto;
  const c = leggi(colore);
  let esito = 'var(--text)';
  if (c) {
    for (let quanto = 1; quanto >= 0; quanto -= 0.05) {
      const m = c.map((v, i) => Math.round(v * quanto + TESTO[i] * (1 - quanto))) as Rgb;
      if (contrasto(m, FONDO) >= 4.6 || quanto < 0.05) {
        esito = `#${m.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
        break;
      }
    }
  }
  giaFatti.set(colore, esito);
  return esito;
}

/** Etichetta nel colore di un dato: fondo chiaro e testo scuro della stessa tinta. */
export function tinta(colore: string): CSSProperties {
  return { background: `color-mix(in srgb, ${colore} 10%, #fff)`, color: tintaTesto(colore) };
}
