require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const createAdmin = async () => {
  try {
    // Conectar ao banco de dados
    await connectDB();
    
    console.log('Verificando se já existe um administrador...');
    
    // Verificar se já existe um admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Um administrador já existe!');
      console.log(`Email: ${existingAdmin.email}`);
      process.exit(0);
    }
    
    // Criar novo admin
    const adminData = {
      name: 'Administrador',
      email: 'admin@mallrecorrente.com.br',
      password: 'admin123',
      role: 'admin'
    };
    
    console.log('Criando administrador...');
    const admin = await User.create(adminData);
    
    console.log('Administrador criado com sucesso!');
    console.log(`Email: ${admin.email}`);
    console.log('Senha: admin123');
    console.log('\nALTERE ESTA SENHA APÓS O PRIMEIRO LOGIN!');
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar administrador:', error.message);
    process.exit(1);
  }
};

createAdmin(); 