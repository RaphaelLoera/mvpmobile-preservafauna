import { Request, Response } from "express";
import { z } from "zod";
import { conflictsNear, IncidentInput, insertIncident, mapPoints } from "../models/incident.js";
import { approx, canSeeExact } from "../middleware/privacy.js";

export const incidentSchema = z.object({
  id: z.string().uuid(),
  predator: z.string().min(1).max(60),
  animal: z.string().min(1).max(60),
  quantity: z.number().int().min(0).max(1000),
  impact: z.string().min(1).max(200),
  notes: z.string().max(1000).optional(),
  occurredAt: z.string().datetime(),
  locality: z.string().max(80).optional(),
  photo: z.string().startsWith("data:image/").max(200000).optional(),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180)
});

export const syncSchema = z.object({ incidents: z.array(incidentSchema).max(200) });

const mask = (rows: any[], exact: boolean) =>
  rows.map(r => (exact ? r : { ...r, lat: approx(r.lat), lon: approx(r.lon) }));

export async function createIncident(req: Request, res: Response) {
  const created = await insertIncident(res.locals.user.id, req.body as IncidentInput);
  res.status(created ? 201 : 200).json({ id: req.body.id, created });
}

export async function sync(req: Request, res: Response) {
  const accepted: string[] = [], rejected: { id: string; error: string }[] = [];
  for (const i of req.body.incidents as IncidentInput[]) {
    try { await insertIncident(res.locals.user.id, i); accepted.push(i.id); }
    catch { rejected.push({ id: i.id, error: "Falha ao salvar" }); }
  }
  res.json({ accepted, rejected });
}

export async function getMapPoints(_req: Request, res: Response) {
  res.json(mask(await mapPoints(), canSeeExact(res.locals.user)));
}

export async function getAlerts(req: Request, res: Response) {
  const q = z.object({ lat: z.coerce.number(), lon: z.coerce.number(), km: z.coerce.number().max(50).default(5) }).parse(req.query);
  res.json(mask(await conflictsNear(q.lat, q.lon, q.km), false));
}
