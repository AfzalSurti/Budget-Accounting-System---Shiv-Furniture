"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, UserRole } from '@/lib/types/user';
import { API_V1, getStoredToken, setStoredToken, getStoredUser, setStoredUser, clearAuth } from '@/config';
import { toast } from 'sonner';

interface AuthContextType extends AuthState {
  login: (identifier: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  setUser: (user: User) => void;
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  isCustomer: () => boolean;
}

interface RegisterPayload {
  email: string;
  loginId: string;
  password: string;
  role: UserRole;
  fullName?: string;
  companyId?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        const storedUser = getStoredUser();
        const token = getStoredToken();
        
        if (storedUser && token) {
          setUser(storedUser);
          
          // Verify token is still valid
          try {
            const res = await fetch(`${API_V1}/auth/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const payload = await res.json();
              if (payload?.data) {
                setUser(payload.data);
                setStoredUser(payload.data);
              }
            } else {
              // Token is invalid, clear auth
              clearAuth();
              setUser(null);
            }
          } catch (error) {
            console.error('Token validation failed:', error);
            // Keep the cached user data, token might be temporarily unreachable
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (identifier: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_V1}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        const details = Array.isArray(error?.details)
          ? error.details.map((d: { message?: string }) => d.message).filter(Boolean).join(", ")
          : "";
        const message = details || error?.message || "Login failed";
        toast.error(message);
        throw new Error(message);
      }
      const payload = await res.json();
      const user = payload?.data?.user as User;
      const token = payload?.data?.token as string;
      
      if (token) {
        setStoredToken(token);
        setStoredUser(user);
        setUser(user);
        toast.success('Login successful!');
        return user;
      }
      throw new Error('No token received');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async ({ email, loginId, password, role, fullName, companyId }: RegisterPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_V1}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, loginId, password, role, fullName, companyId }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        const details = Array.isArray(error?.details)
          ? error.details.map((d: { message?: string }) => d.message).filter(Boolean).join(", ")
          : "";
        const message = details || error?.message || "Signup failed";
        toast.error(message);
        throw new Error(message);
      }
      const payload = await res.json();
      const createdUser = payload?.data?.user as User;
      const token = payload?.data?.token as string;

      if (user?.role === "ADMIN") {
        toast.success('Portal user created successfully!');
        return createdUser;
      }

      if (token) {
        setStoredToken(token);
        setStoredUser(createdUser);
        setUser(createdUser);
        toast.success('Account created successfully!');
        return createdUser;
      }
      throw new Error('No token received');
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    clearAuth();
    toast.success('Logged out successfully');
    window.location.href = '/auth/login';
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const isAdmin = (): boolean => hasRole('ADMIN');
  const isCustomer = (): boolean => hasRole('PORTAL');

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        setUser,
        hasRole,
        isAdmin,
        isCustomer,
      }}
    >
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
