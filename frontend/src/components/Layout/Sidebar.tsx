import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  IconButton,
} from '@mui/material';

// Ícones
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import RepeatIcon from '@mui/icons-material/Repeat';
import RouteIcon from '@mui/icons-material/Route';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';

import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

interface NavItem {
  text: string;
  icon: React.ReactElement;
  to: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    to: '/dashboard',
  },
  {
    text: 'Clientes',
    icon: <PeopleIcon />,
    to: '/clientes',
  },
  {
    text: 'Produtos',
    icon: <InventoryIcon />,
    to: '/produtos',
  },
  {
    text: 'Recorrências',
    icon: <RepeatIcon />,
    to: '/recorrencias',
  },
  {
    text: 'Rotas de Entrega',
    icon: <RouteIcon />,
    to: '/rotas',
  },
  {
    text: 'Usuários',
    icon: <PersonIcon />,
    to: '/usuarios',
    adminOnly: true,
  },
  {
    text: 'Configurações',
    icon: <SettingsIcon />,
    to: '/configuracoes',
    adminOnly: true,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  // Filtrar itens com base na permissão do usuário
  const filteredNavItems = navItems.filter((item) => {
    if (item.adminOnly) {
      return isAdmin();
    }
    return true;
  });

  return (
    <>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: [1],
        }}
      >
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
          Mall Recorrente
        </Typography>
        {onClose ? (
          <IconButton onClick={onClose}>
            <ChevronLeftIcon />
          </IconButton>
        ) : null}
      </Toolbar>
      
      <Divider />
      
      <List component="nav">
        {filteredNavItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.to}
              selected={location.pathname.startsWith(item.to)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default Sidebar; 