const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Gerar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'chavenmalls12344325', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Registrar novo usuário
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar se usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    // Criar usuário
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'operator'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Dados de usuário inválidos' });
    }
  } catch (error) {
    console.error(`Erro ao registrar: ${error.message}`);
    res.status(500).json({ message: 'Erro ao registrar', error: error.message });
  }
};

// @desc    Autenticar usuário e gerar token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    console.log('Login request:', req.body);
    
    const { email, password } = req.body;
    
    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Por favor, informe email e senha' 
      });
    }

    // Buscar usuário com senha incluída
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? 'Yes' : 'No');
    
    // Verificar se usuário existe
    if (!user) {
      return res.status(401).json({ 
        message: 'Email ou senha inválidos',
        debug: 'Usuário não encontrado'
      });
    }
    
    // Verificar se a senha está presente
    if (!user.password) {
      console.error('Senha não disponível para o usuário:', user._id);
      return res.status(500).json({ 
        message: 'Erro de configuração do sistema',
        debug: 'Senha não disponível'
      });
    }
    
    // Log para debug
    console.log('Password lengths:', {
      inputPassword: password.length,
      storedPassword: user.password.length
    });
    
    try {
      // Comparar senha
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({ 
          message: 'Email ou senha inválidos',
          debug: 'Senha não corresponde'
        });
      }
      
      // Gerar token e retornar usuário
      const token = generateToken(user._id);
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      });
    } catch (bcryptError) {
      console.error('Erro ao comparar senhas:', bcryptError);
      return res.status(500).json({ 
        message: 'Erro ao processar login',
        error: bcryptError.message
      });
    }
  } catch (error) {
    console.error(`Erro ao fazer login: ${error.message}`, error);
    res.status(500).json({ 
      message: 'Erro ao fazer login', 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
};

// @desc    Obter usuário atual
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(`Erro ao obter usuário: ${error.message}`);
    res.status(500).json({ message: 'Erro ao obter usuário', error: error.message });
  }
}; 