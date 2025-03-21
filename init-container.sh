#!/bin/sh

# Iniciar o servidor nginx para o frontend
echo "Iniciando servidor nginx para o frontend..."
nginx -g "daemon on;"

# Navegar para a pasta do backend
cd /app/backend

# Iniciar o servidor backend
echo "Iniciando servidor backend..."
node src/server.js

# Manter o container rodando
# O comando acima (node) já mantém o processo ativo, então não é necessário um loop adicional 