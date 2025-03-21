import api from './api';
import { Customer, PaginatedResponse } from '../interfaces';

export const getCustomers = async (
  page = 1, 
  limit = 10, 
  search = '', 
  sortBy = ''
): Promise<PaginatedResponse<Customer>> => {
  const params = new URLSearchParams();
  
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  if (search) params.append('search', search);
  if (sortBy) params.append('sortBy', sortBy);
  
  const response = await api.get<PaginatedResponse<Customer>>(`/customers?${params.toString()}`);
  return response.data;
};

export const getCustomer = async (id: string): Promise<{ success: boolean; data: Customer }> => {
  const response = await api.get<{ success: boolean; data: Customer }>(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (customer: Partial<Customer>): Promise<{ success: boolean; data: Customer }> => {
  const response = await api.post<{ success: boolean; data: Customer }>('/customers', customer);
  return response.data;
};

export const updateCustomer = async (id: string, customer: Partial<Customer>): Promise<{ success: boolean; data: Customer }> => {
  const response = await api.put<{ success: boolean; data: Customer }>(`/customers/${id}`, customer);
  return response.data;
};

export const deleteCustomer = async (id: string): Promise<{ success: boolean; data: {} }> => {
  const response = await api.delete<{ success: boolean; data: {} }>(`/customers/${id}`);
  return response.data;
}; 