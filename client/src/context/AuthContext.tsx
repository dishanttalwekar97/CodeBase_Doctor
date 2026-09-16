import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isDemo: boolean;
  loading: boolean;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  toggleMode: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isDemo: false,
  loading: true,
  loginDemo: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  toggleMode: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const data = await authService.getMe();
      setUser(data.user);
      setIsDemo(data.isDemo);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const loginDemo = async () => {
    setLoading(true);
    try {
      const demoUser = await authService.loginDemo();
      setUser(demoUser);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = async () => {
    const res = await authService.toggleMode();
    await fetchUser();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsDemo(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isDemo,
        loading,
        loginDemo,
        logout,
        refreshUser: fetchUser,
        toggleMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
