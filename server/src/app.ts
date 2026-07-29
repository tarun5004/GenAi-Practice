// src/app.ts
import express, { Request, Response } from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import pinoHttp from "pino-http";
import logger from "./config/logger";
import authRoutes from "./routes/auth.routes";
import notFoundHandler from "./middlewares/notFoundHandler";
import errorHandler from "./middlewares/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const existingId = req.headers["x-request-id"];
      const id = existingId ?? randomUUID();
      res.setHeader("x-request-id", id as string);
      return id as string;
    },
  })
);

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;