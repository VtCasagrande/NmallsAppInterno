const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para proteger rotas
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Verificar se há token no header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extrair token do header Bearer
      token = req.headers.authorization.split(' ')[1];
    } 
    // Verificar se há token em cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Verificar se token existe
    if (!token) {
      return res.status(401).json({ 
        message: 'Acesso não autorizado, token não fornecido' 
      });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'chavenmalls12344325'
      );

      // Adicionar usuário à requisição
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ 
          message: 'Usuário não encontrado ou inativo' 
        });
      }

      next();
    } catch (jwtError) {
      console.error('Erro ao verificar token:', jwtError);
      
      // Token inválido ou expirado
      return res.status(401).json({ 
        message: 'Token inválido ou expirado',
        error: jwtError.message 
      });
    }
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({ 
      message: 'Erro no servidor', 
      error: error.message 
    });
  }
};

// Middleware para restringir acesso por função
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Autenticação necessária' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Acesso negado: função ${req.user.role} não tem permissão` 
      });
    }
    
    next();
  };
}; 