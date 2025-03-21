// Interfaces de autenticação
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Interfaces de cliente
export interface Address {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface Customer {
  _id: string;
  name: string;
  cpf: string;
  phone: string;
  birthDate: string | Date;
  email?: string;
  address?: Address;
  active: boolean;
  createdBy: string | User;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Interfaces de produto
export interface Product {
  _id: string;
  ean: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  active: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Interfaces de recorrência
export interface RecurrenceItem {
  _id?: string;
  product: string | Product;
  ean: string;
  name: string;
  quantity: number;
  price: number;
}

export interface RecurrenceLog {
  _id?: string;
  date: string | Date;
  status: 'confirmed' | 'skipped' | 'canceled';
  notes?: string;
  registeredBy: string | User;
}

export interface Recurrence {
  _id: string;
  customer: string | Customer;
  startDate: string | Date;
  nextDate: string | Date;
  periodDays: number;
  items: RecurrenceItem[];
  discount: number;
  status: 'active' | 'paused' | 'canceled';
  logs: RecurrenceLog[];
  totalValue: number;
  createdBy: string | User;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface RecurrenceStats {
  total: number;
  active: number;
  paused: number;
  canceled: number;
  overdue: number;
  today: number;
  nextWeek: number;
}

// Interfaces de rota de entrega
export interface DeliveryItem {
  _id?: string;
  recurrence?: string | Recurrence;
  customer: string | Customer;
  address?: Address;
  status: 'pending' | 'delivered' | 'not_delivered' | 'canceled';
  deliveryTime?: string | Date;
  notes?: string;
}

export interface Route {
  _id: string;
  date: string | Date;
  driver: string | User;
  vehicle?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'canceled';
  deliveries: DeliveryItem[];
  startTime?: string | Date;
  endTime?: string | Date;
  notes?: string;
  createdBy: string | User;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Interfaces para paginação
export interface Pagination {
  next?: {
    page: number;
    limit: number;
  };
  prev?: {
    page: number;
    limit: number;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  pagination: Pagination;
  data: T[];
} 