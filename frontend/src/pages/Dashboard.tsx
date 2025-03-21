import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  People as PeopleIcon, 
  Repeat as RepeatIcon, 
  History as HistoryIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

import { RecurrenceStats } from '../interfaces';
import { getRecurrenceStats } from '../services/recurrenceService';
import { getRecurrences } from '../services/recurrenceService';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<RecurrenceStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [overdueRecurrences, setOverdueRecurrences] = useState([]);
  const [loadingOverdue, setLoadingOverdue] = useState(true);
  const [todayRecurrences, setTodayRecurrences] = useState([]);
  const [loadingToday, setLoadingToday] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getRecurrenceStats();
        setStats(response.data);
        setLoadingStats(false);
      } catch (error) {
        setError('Erro ao carregar estatísticas');
        setLoadingStats(false);
      }
    };

    const fetchOverdueRecurrences = async () => {
      try {
        const response = await getRecurrences(1, 5, '', 'nextDate:asc', 'active', '', true);
        setOverdueRecurrences(response.data);
        setLoadingOverdue(false);
      } catch (error) {
        setError('Erro ao carregar recorrências atrasadas');
        setLoadingOverdue(false);
      }
    };

    const fetchTodayRecurrences = async () => {
      try {
        // Filtrar por recorrências com data para hoje
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const response = await getRecurrences(1, 5, '', 'nextDate:asc');
        const todayData = response.data.filter((recurrence: any) => {
          const nextDate = new Date(recurrence.nextDate);
          return nextDate >= today && nextDate < tomorrow;
        });
        
        setTodayRecurrences(todayData);
        setLoadingToday(false);
      } catch (error) {
        setError('Erro ao carregar recorrências do dia');
        setLoadingToday(false);
      }
    };

    fetchStats();
    fetchOverdueRecurrences();
    fetchTodayRecurrences();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {/* Resumo de estatísticas */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'primary.light',
              color: 'primary.contrastText'
            }}
          >
            <RepeatIcon sx={{ fontSize: 40 }} />
            <Typography variant="h6" component="div">
              Recorrências Ativas
            </Typography>
            {loadingStats ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <Typography variant="h4" component="div">
                {stats?.active || 0}
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'warning.light',
              color: 'warning.contrastText'
            }}
          >
            <WarningIcon sx={{ fontSize: 40 }} />
            <Typography variant="h6" component="div">
              Recorrências Atrasadas
            </Typography>
            {loadingStats ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <Typography variant="h4" component="div">
                {stats?.overdue || 0}
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'success.light',
              color: 'success.contrastText'
            }}
          >
            <HistoryIcon sx={{ fontSize: 40 }} />
            <Typography variant="h6" component="div">
              Recorrências para Hoje
            </Typography>
            {loadingStats ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <Typography variant="h4" component="div">
                {stats?.today || 0}
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'info.light',
              color: 'info.contrastText'
            }}
          >
            <PeopleIcon sx={{ fontSize: 40 }} />
            <Typography variant="h6" component="div">
              Próxima Semana
            </Typography>
            {loadingStats ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <Typography variant="h4" component="div">
                {stats?.nextWeek || 0}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recorrências atrasadas e do dia */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error" gutterBottom>
                Recorrências Atrasadas
              </Typography>
              <Divider />
              
              {loadingOverdue ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress />
                </Box>
              ) : overdueRecurrences.length > 0 ? (
                <List>
                  {overdueRecurrences.map((recurrence: any) => (
                    <ListItem key={recurrence._id} divider>
                      <ListItemText
                        primary={`${recurrence.customer.name}`}
                        secondary={`Data: ${new Date(recurrence.nextDate).toLocaleDateString()} - R$ ${recurrence.totalValue.toFixed(2)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" p={2}>
                  Não há recorrências atrasadas.
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button
                component={RouterLink}
                to="/recurrences?overdue=true"
                color="primary"
              >
                Ver todas
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Recorrências para Hoje
              </Typography>
              <Divider />
              
              {loadingToday ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress />
                </Box>
              ) : todayRecurrences.length > 0 ? (
                <List>
                  {todayRecurrences.map((recurrence: any) => (
                    <ListItem key={recurrence._id} divider>
                      <ListItemText
                        primary={`${recurrence.customer.name}`}
                        secondary={`R$ ${recurrence.totalValue.toFixed(2)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" p={2}>
                  Não há recorrências para hoje.
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button
                component={RouterLink}
                to="/recurrences"
                color="primary"
              >
                Ver todas
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 