import api from './api';
import { User } from '../interfaces';

interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  
  // Armazenar token e informações do usuário no localStorage
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  
  return response.data;
};

export const register = async (name: string, email: string, password: string, role: string): Promise<{ success: boolean; data: User }> => {
  const response = await api.post<{ success: boolean; data: User }>('/auth/register', { 
    name, 
    email, 
    password,
    role 
  });
  
  return response.data;
};

export const getMe = async (): Promise<{ success: boolean; data: User }> => {
  const response = await api.get<{ success: boolean; data: User }>('/auth/me');
  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}; 