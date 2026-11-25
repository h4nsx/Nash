import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiClient } from '../api/client';

export interface User {
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('nash_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as User;
        setUser(parsed);

        if (!parsed.userId) {
          apiClient<User>('/auth/me')
            .then((res) => {
              if (res.success && res.data) {
                setUser(res.data);
                localStorage.setItem('nash_user', JSON.stringify(res.data));
              }
            })
            .catch(() => {
              // Ignore silent refresh failure if session is invalid/offline
            });
        }
      } catch {
        localStorage.removeItem('nash_user');
      }
    }
    setIsInitialized(true);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('nash_user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    localStorage.removeItem('nash_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isInitialized }}>
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
