#!/bin/bash
set -e

# Imprimir informações sobre o ambiente
echo "=== INFORMAÇÕES DO AMBIENTE ==="
echo "Data e hora: $(date)"
echo "Diretório atual: $(pwd)"
echo "Conteúdo do diretório raiz:"
ls -la

# Configurar variáveis de ambiente se não estiverem definidas
export NODE_ENV=${NODE_ENV:-production}
export MONGO_URI=${MONGO_URI:-mongodb://mongodb:27017/mall_recorrente}
export JWT_SECRET=${JWT_SECRET:-chavenmalls12344325}
export JWT_EXPIRE=${JWT_EXPIRE:-30d}
export PORT=${PORT:-5000}

echo "=== VARIÁVEIS DE AMBIENTE ==="
echo "NODE_ENV: $NODE_ENV"
echo "MONGO_URI: $MONGO_URI"
echo "PORT: $PORT"

echo "=== INICIANDO APLICAÇÃO ==="

# Verificar e criar diretório public no backend se não existir
if [ ! -d "/app/backend/public" ]; then
  echo "Criando diretório public no backend..."
  mkdir -p /app/backend/public
fi

# Verificar build do frontend
echo "=== VERIFICANDO BUILD DO FRONTEND ==="
if [ -d "/app/frontend/build" ]; then
  echo "Diretório build encontrado, verificando conteúdo..."
  ls -la /app/frontend/build
  
  # Verificar se o index.html existe e tem conteúdo
  if [ -f "/app/frontend/build/index.html" ]; then
    echo "Arquivo index.html encontrado:"
    wc -l /app/frontend/build/index.html
    
    # Verificar tamanho do arquivo
    SIZE=$(stat -c%s "/app/frontend/build/index.html" 2>/dev/null || stat -f%z "/app/frontend/build/index.html")
    if [ "$SIZE" -lt 100 ]; then
      echo "AVISO: O arquivo index.html parece estar incompleto (tamanho: $SIZE bytes)"
    else
      echo "Arquivo index.html tem tamanho adequado: $SIZE bytes"
    fi
  else
    echo "ERRO: index.html não encontrado no build!"
  fi
else
  echo "AVISO: Diretório build do frontend não encontrado!"
fi

# Copiar build do frontend para o backend/public (se existir)
if [ -d "/app/frontend/build" ]; then
  echo "Copiando build do frontend para o backend/public..."
  cp -r /app/frontend/build/* /app/backend/public/
  echo "Conteúdo de backend/public:"
  ls -la /app/backend/public
else
  echo "Criando página de fallback..."
  echo "<html><head><title>Frontend em construção</title></head><body style='font-family: Arial, sans-serif; text-align: center; padding-top: 50px;'><h1>Frontend em construção</h1><p>A interface está sendo compilada, tente novamente em alguns minutos.</p></body></html>" > /app/backend/public/index.html
fi

# Executar script de correção de usuários
echo "=== EXECUTANDO SCRIPT DE CORREÇÃO DE USUÁRIOS ==="
if [ -f "/app/backend/fix-users.js" ]; then
  echo "Executando script fix-users.js..."
  cd /app/backend && node fix-users.js
else
  echo "AVISO: Script fix-users.js não encontrado!"
fi

# Iniciar o backend
echo "Iniciando o backend..."
cd /app/backend && npm start 