import { NextFunction, Request, Response } from "express";
import { jwtVerify } from "jose";
import { env } from "../config/env";
import AppError from "../utils/AppError";

const secret = new TextEncoder().encode(env.JWT_SECRET);

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new AppError("Unauthorized", 401));
    return;
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId;
    const email = payload.email;

    if (typeof userId !== "string" || typeof email !== "string") {
      throw new AppError("Unauthorized", 401);
    }

    req.user = { userId, email };
    next();
  } catch {
    next(new AppError("Unauthorized", 401));
  }
};

export default authMiddleware;