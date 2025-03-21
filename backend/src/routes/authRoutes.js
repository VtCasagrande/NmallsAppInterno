const express = require('express');
const router = express.Router();
const { login, register, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Rotas de autenticação
router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getCurrentUser);

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de auth funcionando' });
});

module.exports = router; 