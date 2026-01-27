import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { account, ID } from '../config/appwrite';
import type { Models } from 'appwrite';
import type { OAuthProvider } from 'appwrite';

interface User extends Models.User {}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithOAuth: (provider: OAuthProvider) => Promise<void>;
  requestPasswordReset: (email: string, redirectUrl: string) => Promise<void>;
  resetPassword: (userId: string, secret: string, newPassword: string) => Promise<void>;
  resendVerificationEmail: (email: string, password: string) => Promise<void>;
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
      // Enforce verified email before treating as logged-in
      if (!currentUser.emailVerification) {
        try {
          await account.deleteSession('current');
        } catch {
          // ignore
        }
        setUser(null);
      } else {
        setUser(currentUser);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      // 1) Create account
      const newUser = await account.create(ID.unique(), email, password, name);

      // 2) Create a short-lived session so Appwrite can associate the verification
      await account.createEmailPasswordSession(email, password);

      // 3) Trigger verification email – user must confirm before login
      const baseUrl = import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin;
      const redirectUrl = `${baseUrl}/email-verify`;
      await account.createVerification(redirectUrl);

      // 4) Clean up session so user is effectively logged out until verified
      try {
        await account.deleteSession('current');
      } catch {
        // ignore if no session
      }

      // Keep auth state as logged-out until verification succeeds
      if (newUser) {
        setUser(null);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      if (!currentUser.emailVerification) {
        // Do not allow unverified accounts to stay logged in
        await account.deleteSession('current');
        throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.');
      }
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

  const loginWithOAuth = useCallback(async (provider: OAuthProvider) => {
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

  const requestPasswordReset = useCallback(async (email: string, redirectUrl: string) => {
    try {
      await account.createRecovery(email, redirectUrl);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send password reset email');
    }
  }, []);

  const resetPassword = useCallback(async (userId: string, secret: string, newPassword: string) => {
    try {
      await account.updateRecovery(userId, secret, newPassword);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reset password');
    }
  }, []);

  const resendVerificationEmail = useCallback(async (email: string, password: string) => {
    try {
      // Must be authenticated to request verification email
      await account.createEmailPasswordSession(email, password);

      const baseUrl = import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin;
      const redirectUrl = `${baseUrl}/email-verify`;
      await account.createVerification(redirectUrl);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend verification email');
    } finally {
      // Always log out after sending
      try {
        await account.deleteSession('current');
      } catch {
        // ignore
      }
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    register,
    login,
    logout,
    loginWithOAuth,
    requestPasswordReset,
    resetPassword,
    resendVerificationEmail,
  }), [user, loading, register, login, logout, loginWithOAuth, requestPasswordReset, resetPassword, resendVerificationEmail]);

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
