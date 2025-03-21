#!/bin/bash

# Usar -e para parar o script se algum comando falhar
set -e

# Mostrar informações de diagnóstico
echo "=== INFORMAÇÕES DO AMBIENTE ==="
echo "Data e hora: $(date)"
echo "Diretório atual: $(pwd)"
echo "Conteúdo do backend:"
ls -la backend/

# Configurar variáveis de ambiente se não estiverem definidas
export NODE_ENV=${NODE_ENV:-production}
export MONGO_URI=${MONGO_URI:-mongodb://mongodb:27017/mall_recorrente}
export JWT_SECRET=${JWT_SECRET:-chavenmalls12344325}
export JWT_EXPIRE=${JWT_EXPIRE:-30d}
export PORT=${PORT:-5000}

# Mostrar variáveis de ambiente
echo "=== VARIÁVEIS DE AMBIENTE ==="
echo "NODE_ENV: $NODE_ENV"
echo "MONGO_URI: $MONGO_URI"
echo "PORT: $PORT"

# Verificar e criar diretório public no backend
echo "=== PREPARANDO DIRETÓRIOS ==="
if [ ! -d "backend/public" ]; then
  echo "Criando diretório public no backend..."
  mkdir -p backend/public
fi

# Copiar build do frontend para o backend/public
echo "=== COPIANDO BUILD DO FRONTEND ==="
if [ -d "frontend/build" ] && [ -f "frontend/build/index.html" ]; then
  echo "Build do frontend encontrado, copiando para backend/public..."
  cp -r frontend/build/* backend/public/
  echo "Conteúdo de backend/public:"
  ls -la backend/public/
else
  echo "Build do frontend não encontrado ou inválido, criando página de fallback..."
  echo "<html><head><title>Frontend em construção</title></head><body style='font-family: Arial, sans-serif; text-align: center; padding-top: 50px;'><h1>Frontend em construção</h1><p>A interface está sendo compilada, tente novamente em alguns minutos.</p></body></html>" > backend/public/index.html
fi

# Executar script de correção de usuários
echo "=== EXECUTANDO SCRIPT DE CORREÇÃO DE USUÁRIOS ==="
if [ -f "backend/fix-users.js" ]; then
  echo "Executando script fix-users.js..."
  cd backend && node fix-users.js
  cd ..
else
  echo "AVISO: Script fix-users.js não encontrado!"
fi

# Iniciar o backend
echo "=== INICIANDO BACKEND ==="
cd backend
echo "Executando: npm start"
npm start 