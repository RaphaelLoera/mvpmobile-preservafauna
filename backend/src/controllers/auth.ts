import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { signToken } from "../middleware/auth.js";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(100).regex(/[a-z]/, "A senha precisa ter uma letra minúscula.").regex(/[A-Z]/, "A senha precisa ter uma letra maiúscula."),
});
export const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) });

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const r = await pool.query("INSERT INTO users (name,email,password_hash) VALUES ($1,$2,$3) RETURNING id, role", [name, email, hash]);
    res.status(201).json({ token: signToken(r.rows[0]), user: { name, email, role: r.rows[0].role } });
  } catch { res.status(409).json({ error: "E-mail já cadastrado" }); }
}

export async function login(req: Request, res: Response) {
  const r = await pool.query("SELECT id, name, email, role, password_hash FROM users WHERE email=$1", [req.body.email]);
  const u = r.rows[0];
  if (!u || !(await bcrypt.compare(req.body.password, u.password_hash))) return res.status(401).json({ error: "Credenciais inválidas" });
  res.json({ token: signToken({ id: u.id, role: u.role }), user: { name: u.name, email: u.email, role: u.role } });
}
