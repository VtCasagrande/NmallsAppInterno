const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Carregar variáveis de ambiente
dotenv.config();

// Conectar ao banco de dados
connectDB();

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/productRoutes');
const recurrenceRoutes = require('./routes/recurrenceRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Montar rotas
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/recurrences', recurrenceRoutes);

// Rota base
app.get('/', (req, res) => {
  res.json({
    message: 'API do Sistema de Recorrência',
    version: '1.0.0'
  });
});

// Middleware de tratamento de erro para rotas não encontradas
app.use((req, res, next) => {
  const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Middleware de tratamento de erros gerais
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando em ${process.env.NODE_ENV} na porta ${PORT}`);
});

// Tratamento de exceções não tratadas
process.on('unhandledRejection', (err, promise) => {
  console.log(`Erro: ${err.message}`);
  // Fechar servidor e sair do processo
  server.close(() => process.exit(1));
});

module.exports = server; 