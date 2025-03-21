/**
 * Script para corrigir o problema do login e criar/resetar usuários
 * 
 * Este script deve ser copiado para o container Docker e executado com:
 * node fix-users.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Conectar ao MongoDB
async function connectDB() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://mongodb:27017/mall_recorrente';
    
    console.log('Conectando ao MongoDB...', mongoURI);
    await mongoose.connect(mongoURI);
    console.log('Conectado ao MongoDB!');
    
    return true;
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    return false;
  }
}

// Definir o modelo de usuário
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  active: Boolean,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

// Função principal
async function main() {
  try {
    // Conectar ao banco de dados
    const connected = await connectDB();
    if (!connected) {
      console.error('Não foi possível conectar ao MongoDB. Abortando...');
      process.exit(1);
    }
    
    // Listar todos os usuários
    console.log('\n=== USUÁRIOS EXISTENTES ===');
    const users = await User.find({}).select('+password');
    if (users.length === 0) {
      console.log('Nenhum usuário encontrado no sistema.');
    } else {
      users.forEach(user => {
        console.log(`ID: ${user._id}`);
        console.log(`Nome: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Função: ${user.role}`);
        console.log(`Hash da senha: ${user.password || 'NÃO DEFINIDA'}`);
        console.log('-'.repeat(50));
      });
    }
    
    // Criar/resetar o admin
    console.log('\n=== CRIANDO/RESETANDO ADMIN ===');
    const adminEmail = 'admin@mallrecorrente.com.br';
    const adminPassword = 'admin123';
    
    // Gerar hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    // Verificar se admin já existe
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (adminExists) {
      console.log('Admin encontrado, atualizando senha...');
      
      // Atualizar senha
      await User.updateOne(
        { _id: adminExists._id }, 
        { 
          $set: { 
            password: hashedPassword, 
            active: true 
          } 
        }
      );
      
      console.log('Admin atualizado com sucesso!');
    } else {
      console.log('Admin não encontrado, criando novo...');
      
      // Criar admin
      await User.create({
        name: 'Administrador',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        active: true,
        createdAt: new Date()
      });
      
      console.log('Admin criado com sucesso!');
    }
    
    // Criar/resetar usuário de teste
    console.log('\n=== CRIANDO/RESETANDO USUÁRIO DE TESTE ===');
    const testEmail = 'teste@mallrecorrente.com.br';
    const testPassword = 'teste123';
    
    // Gerar hash da senha
    const testSalt = await bcrypt.genSalt(10);
    const testHashedPassword = await bcrypt.hash(testPassword, testSalt);
    
    // Verificar se o usuário já existe
    const testUserExists = await User.findOne({ email: testEmail });
    
    if (testUserExists) {
      console.log('Usuário de teste encontrado, atualizando senha...');
      
      // Atualizar senha
      await User.updateOne(
        { _id: testUserExists._id }, 
        { 
          $set: { 
            password: testHashedPassword, 
            active: true 
          } 
        }
      );
      
      console.log('Usuário de teste atualizado com sucesso!');
    } else {
      console.log('Usuário de teste não encontrado, criando novo...');
      
      // Criar usuário de teste
      await User.create({
        name: 'Usuário Teste',
        email: testEmail,
        password: testHashedPassword,
        role: 'operator',
        active: true,
        createdAt: new Date()
      });
      
      console.log('Usuário de teste criado com sucesso!');
    }
    
    // Testar verificação de senha
    console.log('\n=== TESTANDO VERIFICAÇÃO DE SENHA ===');
    
    // Buscar admin
    const admin = await User.findOne({ email: adminEmail }).select('+password');
    if (admin && admin.password) {
      console.log('Admin encontrado, testando senha...');
      
      // Verificar senha
      const isValid = await bcrypt.compare(adminPassword, admin.password);
      console.log('Resultado da verificação:', isValid ? 'VÁLIDA' : 'INVÁLIDA');
    } else {
      console.log('Admin não encontrado ou sem senha definida!');
    }
    
    // Buscar usuário de teste
    const testUser = await User.findOne({ email: testEmail }).select('+password');
    if (testUser && testUser.password) {
      console.log('Usuário de teste encontrado, testando senha...');
      
      // Verificar senha
      const isValid = await bcrypt.compare(testPassword, testUser.password);
      console.log('Resultado da verificação:', isValid ? 'VÁLIDA' : 'INVÁLIDA');
    } else {
      console.log('Usuário de teste não encontrado ou sem senha definida!');
    }
    
    console.log('\n=== OPERAÇÃO CONCLUÍDA COM SUCESSO ===');
    
    // Desconectar do banco de dados
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB!');
    
  } catch (error) {
    console.error('Erro durante a execução:', error);
  }
}

// Executar a função principal
main(); 