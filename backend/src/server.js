const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/productRoutes');
const recurrenceRoutes = require('./routes/recurrenceRoutes');

// Inicializar o app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Conectar ao Banco de Dados
connectDB();

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: "API do Sistema de Recorrência", version: "1.0.0" });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/recurrences', recurrenceRoutes);

// Middleware para rota não encontrada
app.use((req, res) => {
  res.status(404).json({ message: `Rota não encontrada - ${req.originalUrl}` });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erro no servidor", error: err.message });
});

// Porta
const PORT = process.env.PORT || 5000;

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app; 