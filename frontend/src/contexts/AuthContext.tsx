'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  cpf?: string;
  status?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  cpf?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar token salvo ao carregar
    const savedToken = localStorage.getItem('cursos_gt_token');
    const savedUser = localStorage.getItem('cursos_gt_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));

      // Validar token com o servidor
      api.getProfile()
        .then((profileData) => {
          setUser(profileData);
          localStorage.setItem('cursos_gt_user', JSON.stringify(profileData));
        })
        .catch(() => {
          // Token inválido
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    const { user: userData, access_token } = response;

    setUser(userData);
    setToken(access_token);
    localStorage.setItem('cursos_gt_token', access_token);
    localStorage.setItem('cursos_gt_user', JSON.stringify(userData));
  };

  const register = async (data: RegisterData) => {
    const response = await api.register(data);
    const { user: userData, access_token } = response;

    setUser(userData);
    setToken(access_token);
    localStorage.setItem('cursos_gt_token', access_token);
    localStorage.setItem('cursos_gt_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cursos_gt_token');
    localStorage.removeItem('cursos_gt_user');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
