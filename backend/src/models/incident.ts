import { pool } from "../db.js";

export interface IncidentInput {
  id: string; predator: string; animal: string; quantity: number; impact: string;
  notes?: string; occurredAt: string; locality?: string; lat: number; lon: number; photo?: string;
}

/** Idempotente: reenviar o mesmo id não duplica. Retorna true se inseriu. */
export async function insertIncident(userId: string, i: IncidentInput) {
  const r = await pool.query(
    `INSERT INTO incidents (id, user_id, predator, animal, quantity, impact, notes, occurred_at, locality, geom, photo)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, ST_SetSRID(ST_MakePoint($11,$10),4326)::geography, $12)
     ON CONFLICT (id) DO NOTHING`,
    [i.id, userId, i.predator, i.animal, i.quantity, i.impact, i.notes ?? null, i.occurredAt, i.locality ?? null, i.lat, i.lon, i.photo ?? null]
  );
  return (r.rowCount ?? 0) > 0;
}

export const mapPoints = async () =>
  (await pool.query(
    `SELECT id, predator, animal, impact, locality, occurred_at,
            ST_Y(geom::geometry) AS lat, ST_X(geom::geometry) AS lon
       FROM incidents ORDER BY occurred_at DESC LIMIT 500`)).rows;

export const conflictsNear = async (lat: number, lon: number, km: number) =>
  (await pool.query(
    `SELECT id, predator, animal, locality, occurred_at,
            ST_Y(geom::geometry) AS lat, ST_X(geom::geometry) AS lon
       FROM incidents
      WHERE occurred_at > now() - interval '30 days'
        AND ST_DWithin(geom, ST_SetSRID(ST_MakePoint($2,$1),4326)::geography, $3)
      ORDER BY occurred_at DESC`, [lat, lon, km * 1000])).rows;
