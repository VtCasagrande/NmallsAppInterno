require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Modelo de usuário simplificado para não depender do modelo real
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  active: Boolean,
  createdAt: Date
});

// Função de hash da senha
userSchema.pre('save', async function(next) {
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

const User = mongoose.model('User', userSchema);

async function createTestUser() {
  try {
    console.log('Conectando ao MongoDB...');
    
    // URI de conexão do MongoDB (usar variável de ambiente ou padrão local)
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mall_recorrente';
    
    await mongoose.connect(mongoURI);
    console.log('Conectado ao MongoDB!');
    
    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email: 'teste@mallrecorrente.com.br' });
    
    if (existingUser) {
      console.log('Usuário já existe, atualizando senha...');
      
      // Definir a senha diretamente como hash para evitar dupla criptografia
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('teste123', salt);
      
      await User.updateOne(
        { _id: existingUser._id }, 
        { $set: { password: hashedPassword } }
      );
      
      console.log('Senha atualizada com sucesso!');
      console.log('Dados do usuário:', {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role
      });
    } else {
      console.log('Criando novo usuário de teste...');
      
      // Criar usuário
      const newUser = await User.create({
        name: 'Usuário Teste',
        email: 'teste@mallrecorrente.com.br',
        password: 'teste123', // será criptografada pelo middleware
        role: 'operator',
        active: true,
        createdAt: new Date()
      });
      
      console.log('Usuário criado com sucesso!');
      console.log('Dados do usuário:', {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      });
    }
    
    console.log('Desconectando do MongoDB...');
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB!');
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Executar a função
createTestUser(); 