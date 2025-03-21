import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Contextos
import { AuthProvider } from './contexts/AuthContext';

// Componentes de Layout
import MainLayout from './components/Layout/MainLayout';
import PrivateRoute from './components/Layout/PrivateRoute';

// Páginas de Auth
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Páginas de Dashboard
import DashboardPage from './pages/Dashboard';
import NotFoundPage from './pages/NotFound';

// Páginas de Clientes
import CustomersListPage from './pages/customers/CustomersList';
import CustomerDetailsPage from './pages/customers/CustomerDetails';
import CustomerFormPage from './pages/customers/CustomerForm';

// Páginas de Produtos
import ProductsListPage from './pages/products/ProductsList';
import ProductDetailsPage from './pages/products/ProductDetails';
import ProductFormPage from './pages/products/ProductForm';

// Páginas de Recorrências
import RecurrencesListPage from './pages/recurrences/RecurrencesList';
import RecurrenceDetailsPage from './pages/recurrences/RecurrenceDetails';
import RecurrenceFormPage from './pages/recurrences/RecurrenceForm';

// Páginas de Usuários (apenas admin)
import UsersListPage from './pages/users/UsersList';
import UserFormPage from './pages/users/UserForm';

// Tema da aplicação
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
          
          {/* Rotas privadas */}
          <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            
            {/* Rotas de Clientes */}
            <Route path="clientes" element={<CustomersListPage />} />
            <Route path="clientes/novo" element={<CustomerFormPage />} />
            <Route path="clientes/editar/:id" element={<CustomerFormPage />} />
            <Route path="clientes/:id" element={<CustomerDetailsPage />} />
            
            {/* Rotas de Produtos */}
            <Route path="produtos" element={<ProductsListPage />} />
            <Route path="produtos/novo" element={<ProductFormPage />} />
            <Route path="produtos/editar/:id" element={<ProductFormPage />} />
            <Route path="produtos/:id" element={<ProductDetailsPage />} />
            
            {/* Rotas de Recorrências */}
            <Route path="recorrencias" element={<RecurrencesListPage />} />
            <Route path="recorrencias/novo" element={<RecurrenceFormPage />} />
            <Route path="recorrencias/editar/:id" element={<RecurrenceFormPage />} />
            <Route path="recorrencias/:id" element={<RecurrenceDetailsPage />} />
            
            {/* Rotas de Usuários (apenas admin) */}
            <Route path="usuarios" element={<UsersListPage />} />
            <Route path="usuarios/novo" element={<UserFormPage />} />
            <Route path="usuarios/editar/:id" element={<UserFormPage />} />
          </Route>
          
          {/* Página 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 