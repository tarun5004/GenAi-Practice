import apiClient from "@/lib/api-client";
import { authSchema, type AuthInput } from "@/features/auth/schemas";

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export async function registerUser(input: AuthInput) {
  const payload = authSchema.parse(input);
  return apiClient.post("/api/auth/register", payload) as unknown as Promise<AuthResponse>;
}

export async function loginUser(input: AuthInput) {
  const payload = authSchema.parse(input);
  return apiClient.post("/api/auth/login", payload) as unknown as Promise<AuthResponse>;
}