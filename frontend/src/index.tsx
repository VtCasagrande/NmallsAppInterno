import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './styles/theme';
import './debug'; // Importar arquivo de debug

// Adicionar código para debug
console.log('Inicializando aplicação React');

// Verificar se o elemento root existe
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Elemento root não encontrado!');
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
  console.log('Elemento root criado dinamicamente');
}

try {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );

  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
  console.log('Aplicação renderizada com sucesso!');
} catch (error) {
  console.error('Erro ao renderizar aplicação:', error);
  // Exibir mensagem de erro para o usuário
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
        <h1>Erro ao carregar a aplicação</h1>
        <p>Ocorreu um erro ao inicializar o Mall Recorrente.</p>
        <p>Por favor, tente novamente mais tarde ou contate o suporte.</p>
      </div>
    `;
  }
} 