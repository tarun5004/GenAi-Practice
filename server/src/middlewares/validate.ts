import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";
import AppError from "../utils/AppError";

const validate = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      next(new AppError(JSON.stringify(parsed.error.flatten()), 400));
      return;
    }

    req.body = parsed.data;
    next();
  };
};

export default validate;