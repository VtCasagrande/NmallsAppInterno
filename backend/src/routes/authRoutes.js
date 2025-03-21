const express = require('express');
const router = express.Router();
const { login, register, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Rotas de autenticação
router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getCurrentUser);

// Rota para status da API
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'API funcionando normalmente',
    time: new Date().toISOString()
  });
});

// Rota de inicialização do sistema
router.post('/init', async (req, res) => {
  try {
    const User = require('../models/User');
    
    // Verificar se já existe algum usuário admin
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      return res.status(400).json({ 
        success: false,
        message: 'Já existe pelo menos um usuário administrador no sistema' 
      });
    }
    
    // Criar usuário admin inicial
    const adminUser = await User.create({
      name: 'Administrador',
      email: 'admin@mallrecorrente.com.br',
      password: 'admin123',
      role: 'admin'
    });
    
    res.status(201).json({
      success: true,
      message: 'Usuário administrador criado com sucesso',
      data: {
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Erro ao inicializar o sistema:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao inicializar o sistema', 
      error: error.message 
    });
  }
});

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de auth funcionando' });
});

module.exports = router; 