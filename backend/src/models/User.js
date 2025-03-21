const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, informe o nome'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Por favor, informe o email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Por favor, informe um email válido'
    ]
  },
  password: {
    type: String,
    required: [true, 'Por favor, informe a senha'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
    select: false // Não retornar senha nas consultas
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'operator'],
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

// Criptografar senha usando bcrypt
UserSchema.pre('save', async function (next) {
  // Só executa se a senha foi modificada (ou é nova)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Gerar salt
    const salt = await bcrypt.genSalt(10);
    // Hash da senha
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Erro ao criptografar senha:', error);
    next(error);
  }
});

// Método para verificar senha
UserSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Erro ao comparar senhas:', error);
    throw error;
  }
};

// Método para criar admin inicial ou resetar admin
UserSchema.statics.createAdmin = async function (email = 'admin@mallrecorrente.com.br', password = 'admin123') {
  try {
    console.log('Tentando criar ou atualizar admin...');
    
    // Verificar se já existe um admin
    const adminExists = await this.findOne({ email });
    
    if (adminExists) {
      console.log('Admin já existe, atualizando senha...');
      
      // Admin já existe, atualizar senha
      adminExists.password = password;
      await adminExists.save();
      
      console.log('Senha do admin atualizada com sucesso');
      return adminExists;
    } else {
      console.log('Criando novo usuário admin...');
      
      // Criar novo admin
      const admin = await this.create({
        name: 'Administrador',
        email,
        password,
        role: 'admin'
      });
      
      console.log('Admin criado com sucesso');
      return admin;
    }
  } catch (error) {
    console.error('Erro ao criar/atualizar admin:', error);
    throw error;
  }
};

module.exports = mongoose.model('User', UserSchema); 