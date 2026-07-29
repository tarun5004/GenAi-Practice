import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import logger from "../config/logger";

const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err }, err.message);
    }

    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  logger.error({ err }, "Unhandled error");
  res.status(500).json({ message: "Internal server error" });
};

export default errorHandler;