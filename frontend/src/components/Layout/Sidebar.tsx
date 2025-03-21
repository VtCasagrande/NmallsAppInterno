import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Repeat as RepeatIcon,
  LocalShipping as ShippingIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, handleDrawerToggle }) => {
  const location = useLocation();
  const { authState, logout } = useAuth();
  const { user } = authState;

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['admin', 'operator']
    },
    {
      text: 'Clientes',
      icon: <PeopleIcon />,
      path: '/customers',
      roles: ['admin', 'operator']
    },
    {
      text: 'Produtos',
      icon: <InventoryIcon />,
      path: '/products',
      roles: ['admin', 'operator']
    },
    {
      text: 'Recorrências',
      icon: <RepeatIcon />,
      path: '/recurrences',
      roles: ['admin', 'operator']
    },
    {
      text: 'Rotas de Entrega',
      icon: <ShippingIcon />,
      path: '/routes',
      roles: ['admin', 'operator']
    },
    {
      text: 'Configurações',
      icon: <SettingsIcon />,
      path: '/settings',
      roles: ['admin']
    }
  ];

  const drawer = (
    <div>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" noWrap component="div">
          Mall Recorrente
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => {
          // Verificar se o usuário tem permissão para ver este item
          if (user && item.roles.includes(user.role)) {
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          }
          return null;
        })}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={logout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Sair" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="menu lateral"
    >
      {/* Versão móvel */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true // Melhor desempenho em dispositivos móveis.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Versão desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar; 