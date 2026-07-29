import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import authService from "../services/auth.service";

const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.status(200).json(result);
});

const me = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    user: {
      id: req.user?.userId,
      email: req.user?.email,
    },
  });
});

export default {
  register,
  login,
  me,
};