export type PinType = "occurrence" | "sighting" | "conflict" | "protected";
export interface Pin { id: string; type: PinType; la: number; lo: number; name: string; info: string; custom?: boolean; photo?: string }

/** Pontos de exemplo (demonstração). Localidades com coordenadas de estações CEMADEN/INEA; PARNASO e Três Picos aproximados. */
export const MAP_PINS: Pin[] = [
  {
    "id": "p1",
    "type": "occurrence",
    "la": -22.45,
    "lo": -42.99,
    "name": "PARNASO • Sede Teresópolis",
    "info": "Área núcleo de preservação com alta presença de onça-parda e gato-maracajá."
  },
  {
    "id": "p2",
    "type": "sighting",
    "la": -22.2714,
    "lo": -42.7947,
    "name": "Vale de Bonsucesso",
    "info": "Pegadas de onça-parda registradas há 3h perto da mata ciliar."
  },
  {
    "id": "p3",
    "type": "conflict",
    "la": -22.344,
    "lo": -42.894,
    "name": "Vargem Grande",
    "info": "Ataque recente a galinheiro sem tela enterrada. Orientação técnica realizada."
  },
  {
    "id": "p4",
    "type": "protected",
    "la": -22.262,
    "lo": -42.737,
    "name": "Sítio Modelo • Vieira",
    "info": "Propriedade com cerca elétrica solar: zero incidentes há 2 anos."
  },
  {
    "id": "p5",
    "type": "occurrence",
    "la": -22.37,
    "lo": -42.7,
    "name": "P.E. dos Três Picos",
    "info": "Corredor florestal entre Teresópolis e Nova Friburgo."
  }
];

export const LABELS: [string, number, number][] = [
  ["Teresópolis", -22.4119, -42.9658], ["Venda Nova", -22.32, -42.87], ["Pessegueiros", -22.293, -42.945],
  ["Vieira", -22.262, -42.737], ["Vargem Grande", -22.344, -42.894], ["Bonsucesso", -22.2714, -42.7947],
  ["Imbuí", -22.39, -42.998], ["PARNASO (aprox.)", -22.45, -43.0]
];
export const COLORS: Record<PinType, string> = { occurrence: "#1B4332", sighting: "#D97706", conflict: "#DC2626", protected: "#0284C7" };
export const RADIUS: Record<PinType, number> = { occurrence: 3500, sighting: 1200, conflict: 1800, protected: 1500 };
export const LAYER_NAMES: Record<PinType, string> = { occurrence: "Ocorrência", sighting: "Avistamento", conflict: "Conflito", protected: "Área protegida" };

/** Privacidade: avistamentos e conflitos são arredondados (~1 km). */
export const approx = (p: Pick<Pin, "type" | "la" | "lo">) =>
  p.type === "conflict" || p.type === "sighting"
    ? { la: Math.round(p.la * 100) / 100, lo: Math.round(p.lo * 100) / 100 }
    : { la: p.la, lo: p.lo };
