import { SignJWT } from "jose";
import { env } from "../config/env";

const secret = new TextEncoder().encode(env.JWT_SECRET);

const signAuthToken = async (payload: { userId: string; email: string }) => {
  return new SignJWT({ userId: payload.userId, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
};

export default signAuthToken;