import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../interfaces';
import * as authService from '../services/authService';

interface AuthContextData {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr) as User;
          
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null
          });
          
          // Verificar se o token ainda é válido
          const response = await authService.getMe();
          
          // Atualizar informações do usuário
          setAuthState(prev => ({
            ...prev,
            user: response.data
          }));
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: 'Sessão expirada. Por favor, faça login novamente.'
          });
        }
      } else {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null
        });
      }
    };
    
    loadUserFromStorage();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      
      setAuthState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        loading: false,
        error: null
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao fazer login';
      
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: errorMessage
      });
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null
    });
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    setLoading(true);
    try {
      await authService.register(name, email, password, role);
      setLoading(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao registrar usuário';
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 