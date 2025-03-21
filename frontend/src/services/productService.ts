import api from './api';
import { Product, PaginatedResponse } from '../interfaces';

export const getProducts = async (
  page = 1, 
  limit = 10, 
  search = '', 
  sortBy = ''
): Promise<PaginatedResponse<Product>> => {
  const params = new URLSearchParams();
  
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  if (search) params.append('search', search);
  if (sortBy) params.append('sortBy', sortBy);
  
  const response = await api.get<PaginatedResponse<Product>>(`/products?${params.toString()}`);
  return response.data;
};

export const getProduct = async (id: string): Promise<{ success: boolean; data: Product }> => {
  const response = await api.get<{ success: boolean; data: Product }>(`/products/${id}`);
  return response.data;
};

export const getProductByEan = async (ean: string): Promise<{ success: boolean; data: Product }> => {
  const response = await api.get<{ success: boolean; data: Product }>(`/products/ean/${ean}`);
  return response.data;
};

export const createProduct = async (product: Partial<Product>): Promise<{ success: boolean; data: Product }> => {
  const response = await api.post<{ success: boolean; data: Product }>('/products', product);
  return response.data;
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<{ success: boolean; data: Product }> => {
  const response = await api.put<{ success: boolean; data: Product }>(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<{ success: boolean; data: {} }> => {
  const response = await api.delete<{ success: boolean; data: {} }>(`/products/${id}`);
  return response.data;
}; 