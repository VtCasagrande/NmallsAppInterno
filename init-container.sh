#!/bin/bash

# Script de inicialização para o container

# Configurar cores para logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logs
log() {
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_error() {
  echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERRO:${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] AVISO:${NC} $1"
}

log_info() {
  echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

# Mostrar informações do sistema
log_info "Iniciando container Mall Recorrente"
log_info "Informações do sistema:"
log_info "$(uname -a)"
log_info "Node: $(node -v)"
log_info "NPM: $(npm -v)"

# Configurar nginx
log "Configurando NGINX..."

# Criar arquivo de configuração do nginx para servir o frontend e encaminhar as requisições da API para o backend
cat > /etc/nginx/http.d/default.conf << 'EOL'
server {
    listen 80;
    client_max_body_size 100M;
    
    # Configuração dos logs
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Servir os arquivos estáticos do React
    location / {
        root /app/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Encaminhar as requisições da API para o backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL

# Verificar configuração Nginx
log_info "Verificando configuração do Nginx..."
nginx -t || { log_error "Configuração do Nginx inválida!"; exit 1; }

# Iniciar Nginx
log "Iniciando NGINX..."
nginx || { log_error "Falha ao iniciar Nginx!"; exit 1; }

# Verificar se o frontend foi construído com sucesso
if [ -f "/app/frontend/build/index.html" ]; then
  filesize=$(stat -c%s "/app/frontend/build/index.html")
  log_info "Frontend build encontrado com tamanho: $filesize bytes"
  if [ "$filesize" -lt 500 ]; then
    log_warning "O arquivo index.html parece estar incompleto ($filesize bytes)"
    log_info "Conteúdo do index.html:"
    cat /app/frontend/build/index.html
  else
    log_info "O tamanho do arquivo index.html parece adequado"
  fi
else
  log_error "Frontend build não encontrado! Verificando diretório..."
  ls -la /app/frontend/build/ || { 
    log_error "Diretório de build não existe, criando fallback..."; 
    mkdir -p /app/frontend/build/
    echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Mall Recorrente</title></head><body><div id="root"><h1>Mall Recorrente</h1><p>Frontend em construção - Erro no script de inicialização</p><pre>Verifique os logs do container para mais informações.</pre></div></body></html>' > /app/frontend/build/index.html
  }
fi

# Iniciar backend
log "Iniciando backend na porta 5000..."
cd /app/backend
node src/server.js &
BACKEND_PID=$!

# Verificar se o backend está rodando
sleep 3
if ps -p $BACKEND_PID > /dev/null; then
  log_info "Backend iniciado com sucesso (PID: $BACKEND_PID)"
else
  log_error "Falha ao iniciar o backend!"
fi

# Monitoramento contínuo
log "Todos os serviços iniciados. Monitorando processos..."

# Função para verificar se um processo está em execução
check_process() {
  if [ "$1" == "nginx" ]; then
    pgrep -x nginx > /dev/null
    return $?
  else
    ps -p $2 > /dev/null
    return $?
  fi
}

# Loop para monitorar os processos
while true; do
  # Verificar backend
  if ! check_process "node" $BACKEND_PID; then
    log_error "Backend parou de funcionar! Tentando reiniciar..."
    cd /app/backend
    node src/server.js &
    BACKEND_PID=$!
    sleep 2
    if check_process "node" $BACKEND_PID; then
      log_info "Backend reiniciado com sucesso (PID: $BACKEND_PID)"
    else
      log_error "Falha ao reiniciar o backend!"
    fi
  fi

  # Verificar nginx
  if ! check_process "nginx"; then
    log_error "Nginx parou de funcionar! Tentando reiniciar..."
    nginx
    sleep 2
    if check_process "nginx"; then
      log_info "Nginx reiniciado com sucesso"
    else
      log_error "Falha ao reiniciar o Nginx!"
    fi
  fi

  # Criar um pequeno log a cada 5 minutos para confirmar que o container está ativo
  if [ $(($(date +%s) % 300)) -lt 5 ]; then
    log_info "Container funcionando normalmente - Backend: $(ps -p $BACKEND_PID -o %cpu,%mem | tail -1), Nginx: $(ps -C nginx -o %cpu,%mem | tail -1)"
  fi

  sleep 5
done 