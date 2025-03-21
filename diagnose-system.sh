#!/bin/bash

# Configurações
API_URL="https://nmallsinterno-nmallsinterno.op6qrj.easypanel.host"
API_HEALTH_ENDPOINT="/api/auth/health"
API_ROOT_ENDPOINT="/api"
FRONTEND_ROOT="/"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}    DIAGNÓSTICO DO MALL RECORRENTE      ${NC}"
echo -e "${YELLOW}=========================================${NC}"

# Verificar resposta da URL principal
echo -e "\n${BLUE}Verificando acesso à URL principal...${NC}"
MAIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)
if [ "$MAIN_STATUS" == "200" ]; then
  echo -e "${GREEN}URL principal respondendo com sucesso (HTTP 200 OK)${NC}"
else
  echo -e "${RED}URL principal respondendo com código HTTP $MAIN_STATUS${NC}"
  echo -e "${YELLOW}Tentando obter mais informações...${NC}"
  curl -v $API_URL 2>&1 | grep -E "< HTTP|curl:"
fi

# Verificar saúde da API
echo -e "\n${BLUE}Verificando saúde da API...${NC}"
HEALTH_RESULT=$(curl -s $API_URL$API_HEALTH_ENDPOINT)
echo $HEALTH_RESULT | grep -q "ok"
if [ $? -eq 0 ]; then
  echo -e "${GREEN}API está rodando normalmente${NC}"
  echo -e "${BLUE}Detalhes da resposta:${NC}"
  echo $HEALTH_RESULT | python3 -m json.tool 2>/dev/null || echo $HEALTH_RESULT
else
  echo -e "${RED}API não está respondendo corretamente ao health check${NC}"
  echo -e "${BLUE}Resposta recebida:${NC}"
  echo $HEALTH_RESULT
  
  # Verificar código de resposta HTTP
  HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_URL$API_HEALTH_ENDPOINT)
  echo -e "${YELLOW}Código de status HTTP: $HEALTH_STATUS${NC}"
fi

# Verificar resposta da raiz da API
echo -e "\n${BLUE}Verificando resposta da raiz da API...${NC}"
ROOT_RESULT=$(curl -s $API_URL$API_ROOT_ENDPOINT)
echo $ROOT_RESULT | grep -q "API do Sistema"
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Raiz da API respondendo corretamente${NC}"
  echo -e "${BLUE}Detalhes da resposta:${NC}"
  echo $ROOT_RESULT | python3 -m json.tool 2>/dev/null || echo $ROOT_RESULT
else
  echo -e "${RED}Raiz da API não está respondendo corretamente${NC}"
  echo -e "${BLUE}Resposta recebida:${NC}"
  echo $ROOT_RESULT
  
  # Verificar código de resposta HTTP
  ROOT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_URL$API_ROOT_ENDPOINT)
  echo -e "${YELLOW}Código de status HTTP: $ROOT_STATUS${NC}"
fi

# Tentar inicializar o sistema
echo -e "\n${BLUE}Tentando inicializar o sistema...${NC}"
INIT_RESULT=$(curl -s -X POST $API_URL/api/auth/init)
echo -e "${BLUE}Resposta da inicialização:${NC}"
echo $INIT_RESULT | python3 -m json.tool 2>/dev/null || echo $INIT_RESULT

# Tentar login com as credenciais padrão
echo -e "\n${BLUE}Tentando login com usuário admin padrão...${NC}"
LOGIN_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"admin@mallrecorrente.com.br","password":"admin123"}' \
  $API_URL/api/auth/login)
echo $LOGIN_RESULT | grep -q "token"
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Login bem-sucedido!${NC}"
  echo -e "${BLUE}Token JWT obtido${NC}"
else
  echo -e "${RED}Falha no login com usuário admin${NC}"
  echo -e "${BLUE}Resposta recebida:${NC}"
  echo $LOGIN_RESULT | python3 -m json.tool 2>/dev/null || echo $LOGIN_RESULT
  
  # Tentar resetar o admin
  echo -e "\n${YELLOW}Tentando resetar admin...${NC}"
  RESET_RESULT=$(curl -s -X POST $API_URL/api/auth/reset-admin)
  echo -e "${BLUE}Resposta do reset:${NC}"
  echo $RESET_RESULT | python3 -m json.tool 2>/dev/null || echo $RESET_RESULT
  
  # Tentar login novamente
  echo -e "\n${BLUE}Tentando login novamente...${NC}"
  LOGIN_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
    -d '{"email":"admin@mallrecorrente.com.br","password":"admin123"}' \
    $API_URL/api/auth/login)
  echo $LOGIN_RESULT | grep -q "token"
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Login bem-sucedido após reset!${NC}"
  else
    echo -e "${RED}Falha no login mesmo após reset${NC}"
    echo -e "${BLUE}Resposta:${NC}"
    echo $LOGIN_RESULT | python3 -m json.tool 2>/dev/null || echo $LOGIN_RESULT
  fi
fi

echo -e "\n${YELLOW}=========================================${NC}"
echo -e "${YELLOW}      DIAGNÓSTICO CONCLUÍDO             ${NC}"
echo -e "${YELLOW}=========================================${NC}" 