import { api, getToken } from "./api";
import { db } from "./db";

/** Envia a fila para POST /sync. Itens aceitos saem da fila. Seguro para repetir (id é UUID). */
export async function flushOutbox(): Promise<number> {
  if (!navigator.onLine || !getToken()) return 0;
  const items = await db.outbox.toArray();
  if (!items.length) { localStorage.setItem("pf_last_sync", String(Date.now())); return 0; }
  const normalized = items.map(item => ({
    ...item,
    occurredAt: new Date(item.occurredAt).toISOString()
  }));
  const r = await api<{ accepted: string[] }>("/sync", { method: "POST", body: JSON.stringify({ incidents: normalized }) });
  await db.outbox.bulkDelete(r.accepted);
  localStorage.setItem("pf_last_sync", String(Date.now()));
  window.dispatchEvent(new Event("pf:incident-synced"));
  return r.accepted.length;
}

/** Sincroniza ao abrir e quando a conexão volta (iOS não tem Background Sync). */
export function startAutoSync(onDone: () => void) {
  const run = () => flushOutbox().then(onDone).catch(() => {});
  window.addEventListener("online", run);
  run();
  return () => window.removeEventListener("online", run);
}
