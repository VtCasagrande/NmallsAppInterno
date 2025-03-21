const express = require('express');
const router = express.Router();
const { login, register, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Rotas de autenticação
router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getCurrentUser);

// Rota para status da API
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API funcionando normalmente',
    timestamp: new Date().toISOString()
  });
});

// Rota de inicialização do sistema
router.post('/init', async (req, res) => {
  try {
    console.log('Inicializando sistema - criando admin padrão');
    
    // Verifica se já existe algum usuário no sistema
    const userCount = await User.countDocuments();
    
    if (userCount > 0) {
      return res.status(400).json({ 
        message: 'Sistema já inicializado', 
        userCount 
      });
    }

    // Cria o primeiro usuário administrador
    const admin = await User.createAdmin();
    
    res.status(201).json({
      message: 'Sistema inicializado com sucesso',
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      credentials: {
        email: 'admin@mallrecorrente.com.br',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('Erro ao inicializar sistema:', error);
    res.status(500).json({ 
      message: 'Erro ao inicializar sistema', 
      error: error.message 
    });
  }
});

// APENAS PARA DESENVOLVIMENTO - reset do admin
router.post('/reset-admin', async (req, res) => {
  try {
    // Em produção, esta rota deveria ser desabilitada ou protegida
    if (process.env.NODE_ENV === 'production') {
      const isAllowed = process.env.ALLOW_ADMIN_RESET === 'true';
      
      if (!isAllowed) {
        return res.status(403).json({
          message: 'Esta operação não é permitida em ambiente de produção'
        });
      }
    }
    
    console.log('Solicitação de reset do admin recebida');
    
    // Alternar entre ambiente de teste e um endereço personalizado se fornecido
    const email = req.body.email || 'admin@mallrecorrente.com.br';
    const password = req.body.password || 'admin123';
    
    const admin = await User.createAdmin(email, password);
    
    res.status(200).json({
      message: 'Admin resetado com sucesso',
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      credentials: {
        email,
        password
      }
    });
  } catch (error) {
    console.error('Erro ao resetar admin:', error);
    res.status(500).json({ 
      message: 'Erro ao resetar admin', 
      error: error.message 
    });
  }
});

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de auth funcionando' });
});

module.exports = router; 