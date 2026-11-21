import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type Role = "produtor" | "tecnico" | "admin";
export interface AuthUser { id: string; role: Role }

const secret = () => process.env.JWT_SECRET ?? "dev";

function readUser(req: Request): AuthUser | null {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return null;
  try { return jwt.verify(h.slice(7), secret()) as AuthUser; } catch { return null; }
}

/** Exige login. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = readUser(req);
  if (!user) return res.status(401).json({ error: "Não autenticado" });
  res.locals.user = user;
  next();
}

/** Login opcional (rotas públicas que mudam a resposta conforme o perfil). */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  res.locals.user = readUser(req);
  next();
}

export const signToken = (u: AuthUser) => jwt.sign(u, secret(), { expiresIn: "7d" });
