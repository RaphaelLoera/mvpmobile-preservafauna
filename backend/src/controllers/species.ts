import { Request, Response } from "express";
import { listSpecies } from "../models/species.js";

export async function getSpecies(_req: Request, res: Response) {
  res.json(await listSpecies());
}
