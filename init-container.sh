#!/bin/sh

# Definir variáveis de ambiente
export NODE_ENV=production

# Iniciar o servidor nginx para o frontend
echo "Iniciando servidor nginx para o frontend..."
nginx -g "daemon on;"

# Navegar para a pasta do backend
cd /app/backend

# Iniciar o servidor backend
echo "Iniciando servidor backend..."
node src/server.js

# O comando acima (node) já mantém o processo ativo

# Manter o container rodando
# O comando acima (node) já mantém o processo ativo, então não é necessário um loop adicional 