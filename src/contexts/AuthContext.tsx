import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { account, ID } from '../config/appwrite';
import type { Models } from 'appwrite';

interface User extends Models.User {}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithOAuth: (provider: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      await account.create(ID.unique(), email, password, name);
      await login(email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  }, []);

  const loginWithOAuth = useCallback(async (provider: string) => {
    try {
      await account.createOAuth2Session(
        provider,
        `${window.location.origin}/auth/callback`,
        `${window.location.origin}/auth/callback`
      );
    } catch (error: any) {
      throw new Error(error.message || 'OAuth login failed');
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    register,
    login,
    logout,
    loginWithOAuth,
  }), [user, loading, register, login, logout, loginWithOAuth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
