import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearStoredUser, clearToken as removeToken, getStoredUser, getToken, setStoredUser, setToken } from "@/lib/auth";
import { loginUser, registerUser, type AuthResponse, type AuthUser } from "@/features/auth/api";
import type { AuthInput } from "@/features/auth/schemas";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (input: AuthInput) => Promise<AuthResponse>;
  register: (input: AuthInput) => Promise<AuthResponse>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setAuthToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getStoredUser();

    if (storedToken && storedUser) {
      setAuthToken(storedToken);
      setUser(storedUser);
    } else {
      removeToken();
      clearStoredUser();
    }

    setIsHydrated(true);
  }, []);

  const persistAuth = (response: AuthResponse) => {
    setToken(response.token);
    setStoredUser(response.user);
    setAuthToken(response.token);
    setUser(response.user);
    return response;
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isHydrated,
      login: async (input) => persistAuth(await loginUser(input)),
      register: async (input) => persistAuth(await registerUser(input)),
      logout: () => {
        removeToken();
        clearStoredUser();
        setAuthToken(null);
        setUser(null);
      },
    }),
    [isHydrated, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}