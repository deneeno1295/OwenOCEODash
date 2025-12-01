import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  instanceUrl: string;
}

interface AuthConfig {
  configured: boolean;
  loginUrl: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: authConfig, isLoading: configLoading } = useQuery<AuthConfig>({
    queryKey: ["auth-config"],
    queryFn: async () => {
      const res = await fetch("/auth/config");
      if (!res.ok) throw new Error("Failed to fetch auth config");
      return res.json();
    },
    staleTime: Infinity,
  });

  const { data: authData, isLoading: authLoading } = useQuery<{ authenticated: boolean; user: User | null }>({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await fetch("/auth/me");
      if (!res.ok) throw new Error("Failed to fetch auth status");
      return res.json();
    },
    enabled: authConfig?.configured === true,
    retry: false,
  });

  const isConfigured = authConfig?.configured ?? false;
  const isAuthenticated = isConfigured ? (authData?.authenticated ?? false) : true;
  const user = authData?.user ?? null;
  const isLoading = configLoading || (isConfigured && authLoading);

  const login = () => {
    window.location.href = "/auth/signin";
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch("/auth/logout", { method: "POST" });
      const data = await res.json();
      
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      
      if (data.logoutUrl) {
        window.location.href = data.logoutUrl;
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading: isLoading || isLoggingOut, isConfigured, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
