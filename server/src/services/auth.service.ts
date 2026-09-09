import bcrypt from "bcryptjs";
import logger from "../config/logger";
import AppError from "../utils/AppError";
import userRepository from "../repositories/user.repository";
import signAuthToken from "./token.service";
import { LoginInput, RegisterInput } from "../schemas/auth.schema";
import { IUser } from "../models/user.model";

const toAuthResponse = async (user: Pick<IUser, "_id" | "email">) => {
  const token = await signAuthToken({ userId: user._id.toString(), email: user.email });

  return {
    user: {
      id: user._id.toString(),
      email: user.email,
    },
    token,
  };
};

const register = async (input: RegisterInput) => {
  const existingUser = await userRepository.findByEmail(input.email);

  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const user = await userRepository.create({
    email: input.email,
    password: input.password,
  });

  logger.info({ userId: user._id.toString(), email: user.email }, "User registered successfully");

  return toAuthResponse(user);
};

const login = async (input: LoginInput) => {
  const user = await userRepository.findByEmail(input.email).select("+password");

  if (!user || !(await bcrypt.compare(input.password, user.password))) {
    logger.warn({ email: input.email }, "Failed login attempt");
    throw new AppError("Invalid credentials", 401);
  }

  return toAuthResponse(user);
};

export default {
  register,
  login,
};

import bcrypt from "bcryptjs";
import logger from "../config/logger";
import AppError from "../utils/AppError";
import userRepository from "../repositories/user.repository";
import signAuthToken from "./token.service";
import { LoginInput, RegisterInput } from "../schemas/auth.schema";
import { IUser } from "../models/user.model";

const toAuthResponse = async (user: Pick<IUser, "_id" | "email">) => {
  const token = await signAuthToken({ userId: user._id.toString(), email: user.email });

  return {
    user: {
      id: user._id.toString(),
      email: user.email,
    },
    token,
  };
};

const register = async (input: RegisterInput) => {
  const existingUser = await userRepository.findByEmail(input.email);

  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const user = await userRepository.create({
    email: input.email,
    password: input.password,
  });

  logger.info({ userId: user._id.toString(), email: user.email }, "User registered successfully");

  return toAuthResponse(user);
};

const login = async (input: LoginInput) => {
  const user = await userRepository.findByEmail(input.email).select("+password");

  if (!user || !(await bcrypt.compare(input.password, user.password))) {
    logger.warn({ email: input.email }, "Failed login attempt");
    throw new AppError("Invalid credentials", 401);
  }

  return toAuthResponse(user);
};

export default {
  register,
  login,
};