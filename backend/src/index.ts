import "dotenv/config";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { errorHandler, notFound } from "./middleware/errors.js";
import { routes } from "./routes/index.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? true }));
app.use(express.json({ limit: "5mb" }));
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use(routes);
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT ?? 3333);
app.listen(port, () => console.log(`API em http://localhost:${port}`));
