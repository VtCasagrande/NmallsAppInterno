#!/bin/bash

# Script de inicialização para o sistema Mall Recorrente
echo "Iniciando setup do Mall Recorrente..."

# Garantir que o arquivo .env existe
if [ ! -f .env ]; then
  echo "Criando arquivo .env a partir do exemplo..."
  cp .env.example .env
  echo "Por favor, edite o arquivo .env com suas configurações antes de continuar."
fi

# Iniciar os serviços com Docker Compose
echo "Iniciando os serviços..."
docker-compose up -d

# Esperar o MongoDB iniciar
echo "Aguardando MongoDB inicializar..."
sleep 10

# Criar usuário admin inicial
echo "Criando usuário administrador inicial..."
docker-compose exec backend npm run seed:admin

echo "Setup completo! O sistema Mall Recorrente está disponível em:"
echo "- Frontend: http://localhost:${FRONTEND_PORT:-3000}"
echo "- Backend API: http://localhost:${BACKEND_PORT:-5000}/api"
echo ""
echo "Use as seguintes credenciais para o primeiro acesso:"
echo "- Email: admin@mallrecorrente.com.br"
echo "- Senha: admin123"
echo ""
echo "IMPORTANTE: Altere a senha do administrador após o primeiro login!" 