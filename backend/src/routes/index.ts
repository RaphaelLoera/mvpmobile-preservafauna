import { Router } from "express";
import { login, loginSchema, register, registerSchema } from "../controllers/auth.js";
import { createIncident, getAlerts, getMapPoints, incidentSchema, sync, syncSchema } from "../controllers/incidents.js";
import { getSpecies } from "../controllers/species.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

export const routes = Router();

routes.post("/auth/register", validate(registerSchema), register);
routes.post("/auth/login", validate(loginSchema), login);

routes.get("/species", getSpecies);
routes.get("/map/points", optionalAuth, getMapPoints);
routes.get("/alerts", getAlerts);

routes.post("/incidents", requireAuth, validate(incidentSchema), createIncident);
routes.post("/sync", requireAuth, validate(syncSchema), sync);
