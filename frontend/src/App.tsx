import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ptBR } from '@mui/material/locale';

// Contextos
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import MainLayout from './components/Layout/MainLayout';
import PrivateRoute from './components/Layout/PrivateRoute';

// Páginas
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

const theme = createTheme(
  {
    palette: {
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#f50057',
      },
    },
  },
  ptBR
);

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Redirecionamento da rota raiz */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Rotas protegidas */}
            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Placeholders para páginas futuras */}
                <Route path="/customers" element={<div>Página de Clientes</div>} />
                <Route path="/customers/new" element={<div>Novo Cliente</div>} />
                <Route path="/customers/:id" element={<div>Detalhes do Cliente</div>} />
                <Route path="/customers/:id/edit" element={<div>Editar Cliente</div>} />
                
                <Route path="/products" element={<div>Página de Produtos</div>} />
                <Route path="/products/new" element={<div>Novo Produto</div>} />
                <Route path="/products/:id" element={<div>Detalhes do Produto</div>} />
                <Route path="/products/:id/edit" element={<div>Editar Produto</div>} />
                
                <Route path="/recurrences" element={<div>Página de Recorrências</div>} />
                <Route path="/recurrences/new" element={<div>Nova Recorrência</div>} />
                <Route path="/recurrences/:id" element={<div>Detalhes da Recorrência</div>} />
                <Route path="/recurrences/:id/edit" element={<div>Editar Recorrência</div>} />
                
                <Route path="/routes" element={<div>Página de Rotas</div>} />
                <Route path="/routes/new" element={<div>Nova Rota</div>} />
                <Route path="/routes/:id" element={<div>Detalhes da Rota</div>} />
                <Route path="/routes/:id/edit" element={<div>Editar Rota</div>} />
                
                <Route path="/settings" element={<div>Configurações</div>} />
              </Route>
            </Route>
            
            {/* Página 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 