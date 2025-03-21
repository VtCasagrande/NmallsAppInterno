import React from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  // Se estiver carregando, mostra um spinner
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Verifica se o usuário está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Se a rota for apenas para administradores, verifica o perfil do usuário
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/dashboard" />;
  }

  // Usuário autenticado e com permissões adequadas
  return <>{children}</>;
};

export default PrivateRoute; 