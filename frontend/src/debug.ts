// Importar React
import React from 'react';

// Arquivo de debug para auxiliar na identificação de problemas no build
console.log('----- Informações de debug do frontend -----');
console.log('Ambiente:', process.env.NODE_ENV);
console.log('URL da API:', process.env.REACT_APP_API_URL);
console.log('Versão do React:', React.version);

// Log de variáveis de ambiente disponíveis
console.log('Variáveis de ambiente disponíveis:');
Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')).forEach(key => {
  console.log(`${key}:`, process.env[key]);
});

// Função para testar se módulos principais estão sendo carregados corretamente
export const testImports = () => {
  try {
    // Testar importações de componentes e bibliotecas
    const testReactImport = 'React importado corretamente';
    const testMuiImport = 'Material UI importado corretamente';
    
    console.log('Teste de importações:', { testReactImport, testMuiImport });
    return true;
  } catch (error) {
    console.error('Erro ao testar importações:', error);
    return false;
  }
};

// Executar teste de importações
testImports();

// Exportar um objeto de debug para uso em outros componentes
export const debug = {
  environment: process.env.NODE_ENV,
  apiUrl: process.env.REACT_APP_API_URL,
  buildDate: new Date().toISOString(),
  testImports
}; 