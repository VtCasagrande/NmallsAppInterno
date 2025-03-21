const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, informe o nome']
  },
  email: {
    type: String,
    required: [true, 'Por favor, informe o email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor, informe um email válido'
    ]
  },
  password: {
    type: String,
    required: [true, 'Por favor, informe a senha'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'operator'],
    default: 'operator'
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Criptografar senha antes de salvar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar senha
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Método estático para criar usuário administrador
UserSchema.statics.createAdminUser = async function(userData) {
  try {
    const existingAdmin = await this.findOne({ role: 'admin' });
    if (existingAdmin) {
      throw new Error('Já existe um usuário administrador');
    }
    
    return await this.create({
      name: userData.name || 'Administrador',
      email: userData.email || 'admin@mallrecorrente.com.br',
      password: userData.password || 'admin123',
      role: 'admin'
    });
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('User', UserSchema); 