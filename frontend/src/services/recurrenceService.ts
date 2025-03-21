import api from './api';
import { Recurrence, RecurrenceStats, PaginatedResponse } from '../interfaces';

export const getRecurrences = async (
  page = 1, 
  limit = 10, 
  search = '', 
  sortBy = '',
  status = '',
  customer = '',
  overdue = false
): Promise<PaginatedResponse<Recurrence>> => {
  const params = new URLSearchParams();
  
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  if (search) params.append('search', search);
  if (sortBy) params.append('sortBy', sortBy);
  if (status) params.append('status', status);
  if (customer) params.append('customer', customer);
  if (overdue) params.append('overdue', 'true');
  
  const response = await api.get<PaginatedResponse<Recurrence>>(`/recurrences?${params.toString()}`);
  return response.data;
};

export const getRecurrence = async (id: string): Promise<{ success: boolean; data: Recurrence }> => {
  const response = await api.get<{ success: boolean; data: Recurrence }>(`/recurrences/${id}`);
  return response.data;
};

export const createRecurrence = async (recurrence: Partial<Recurrence>): Promise<{ success: boolean; data: Recurrence }> => {
  const response = await api.post<{ success: boolean; data: Recurrence }>('/recurrences', recurrence);
  return response.data;
};

export const updateRecurrence = async (id: string, recurrence: Partial<Recurrence>): Promise<{ success: boolean; data: Recurrence }> => {
  const response = await api.put<{ success: boolean; data: Recurrence }>(`/recurrences/${id}`, recurrence);
  return response.data;
};

export const cancelRecurrence = async (id: string, notes?: string): Promise<{ success: boolean; data: Recurrence }> => {
  const response = await api.put<{ success: boolean; data: Recurrence }>(`/recurrences/${id}/cancel`, { notes });
  return response.data;
};

export const confirmPurchase = async (id: string, notes?: string): Promise<{ success: boolean; data: Recurrence }> => {
  const response = await api.put<{ success: boolean; data: Recurrence }>(`/recurrences/${id}/confirm`, { notes });
  return response.data;
};

export const getRecurrenceStats = async (): Promise<{ success: boolean; data: RecurrenceStats }> => {
  const response = await api.get<{ success: boolean; data: RecurrenceStats }>('/recurrences/stats');
  return response.data;
}; 