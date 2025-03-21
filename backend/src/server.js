const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/productRoutes');
const recurrenceRoutes = require('./routes/recurrenceRoutes');
const path = require('path');

// Inicializar o app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Conectar ao Banco de Dados
connectDB();

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/recurrences', recurrenceRoutes);

// Rota de teste/health check
app.get('/api', (req, res) => {
  res.json({ message: "API do Sistema de Recorrência", version: "1.0.0" });
});

// Servir arquivos estáticos do React em produção
if (process.env.NODE_ENV === 'production') {
  // Definir pasta estática
  app.use(express.static(path.join(__dirname, '../public')));

  // Todas as rotas não reconhecidas levam ao React
  app.get('*', (req, res) => {
    // Verificar se é uma rota de API antes de servir o HTML
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
    }
  });
}

// Middleware para rota não encontrada para rotas de API
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `Rota não encontrada - ${req.originalUrl}` });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erro no servidor", error: err.message });
});

// Definir porta
let PORT = parseInt(process.env.PORT) || 5000;

// Garantir que a porta não seja 80 para evitar conflito com Nginx
if (PORT === 80) {
  console.warn("ATENÇÃO: Porta 80 reservada para o Nginx. Alterando para porta 5000.");
  PORT = 5000;
}

// Iniciar o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===== Servidor iniciado =====`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`Porta: ${PORT}`);
  console.log(`MONGO_URI: ${process.env.MONGO_URI}`);
  console.log(`Data/Hora: ${new Date().toISOString()}`);
  console.log(`============================`);
});

module.exports = app; 