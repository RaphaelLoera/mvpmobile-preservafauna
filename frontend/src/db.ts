import Dexie, { Table } from "dexie";

export interface Species { id: string; name: string; scientific: string; risk: "Alto" | "Médio" | "Baixo"; habitat?: string; behavior?: string; diet?: string }
export interface Incident {
  id: string; predator: string; animal: string; quantity: number; impact: string;
  notes?: string; occurredAt: string; locality?: string; lat: number; lon: number; photo?: string;
}

class AppDB extends Dexie {
  outbox!: Table<Incident, string>;   // registros feitos offline, aguardando envio
  incidents!: Table<Incident, string>; // histórico local dos registros feitos no aparelho
  species!: Table<Species, string>;   // cache do catálogo
  constructor() {
    super("preserva");
    this.version(1).stores({ outbox: "id, occurredAt", species: "id" });
    this.version(2).stores({ outbox: "id, occurredAt", incidents: "id, occurredAt", species: "id" });
  }
}
export const db = new AppDB();
