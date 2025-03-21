const bcrypt = require('bcryptjs');

async function testBcrypt() {
  try {
    console.log('Iniciando teste de bcrypt...');
    
    // Senha de teste
    const password = 'teste123';
    console.log('Senha original:', password);
    
    // Gerar salt
    console.log('Gerando salt...');
    const salt = await bcrypt.genSalt(10);
    console.log('Salt gerado:', salt);
    
    // Hash da senha
    console.log('Gerando hash...');
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Hash gerado:', hashedPassword);
    
    // Verificar hash
    console.log('Verificando hash com senha correta...');
    const isMatch1 = await bcrypt.compare(password, hashedPassword);
    console.log('Resultado (deve ser true):', isMatch1);
    
    // Verificar com senha incorreta
    console.log('Verificando hash com senha incorreta...');
    const isMatch2 = await bcrypt.compare('senhaErrada', hashedPassword);
    console.log('Resultado (deve ser false):', isMatch2);
    
    console.log('Teste concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o teste:', error);
  }
}

// Executar o teste
testBcrypt(); 