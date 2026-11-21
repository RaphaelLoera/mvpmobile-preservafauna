import { pool } from "../db.js";

export const listSpecies = async () =>
  (await pool.query("SELECT id, name, scientific, risk, habitat, behavior, diet, protected FROM species ORDER BY name")).rows;
