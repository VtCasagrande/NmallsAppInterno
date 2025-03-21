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

# Criar um fallback mais bonito e funcional
create_fallback_frontend() {
  log_warning "Criando página de fallback para o frontend..."
  mkdir -p /app/frontend/build/
  cat > /app/frontend/build/index.html << 'EOL'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mall Recorrente - Em manutenção</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            color: #333;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            text-align: center;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            padding: 40px;
            max-width: 800px;
            width: 90%;
        }
        h1 {
            color: #1976d2;
            margin-bottom: 0.5em;
        }
        .status {
            background-color: #ffebee;
            border-left: 4px solid #f44336;
            padding: 10px 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .actions {
            margin-top: 30px;
        }
        .btn {
            display: inline-block;
            background-color: #1976d2;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
            margin: 10px;
            transition: background-color 0.3s;
        }
        .btn:hover {
            background-color: #1565c0;
        }
        .btn-secondary {
            background-color: #757575;
        }
        .btn-secondary:hover {
            background-color: #616161;
        }
        .api-status {
            margin-top: 20px;
            padding: 15px;
            background-color: #e3f2fd;
            border-radius: 4px;
        }
        code {
            background-color: #f1f1f1;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
        }
        .logs {
            text-align: left;
            max-height: 200px;
            overflow-y: auto;
            background-color: #263238;
            color: #eee;
            padding: 15px;
            border-radius: 4px;
            font-family: monospace;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Mall Recorrente</h1>
        <p>Sistema de gerenciamento de recorrências</p>
        
        <div class="status">
            <h2>Status: Manutenção</h2>
            <p>O frontend da aplicação está temporariamente indisponível. A equipe está trabalhando para restabelecer o serviço o mais rápido possível.</p>
        </div>
        
        <div class="api-status">
            <h3>API Backend</h3>
            <p>O backend da aplicação está funcionando normalmente.</p>
            <p>Você pode verificar o status da API acessando: <code>/api/status</code></p>
        </div>
        
        <div class="actions">
            <a href="/api" class="btn">Acessar API Diretamente</a>
            <a href="javascript:location.reload()" class="btn btn-secondary">Tentar Novamente</a>
        </div>
        
        <div class="logs">
            <p>Detalhes técnicos:</p>
            <p>- Frontend build não encontrado ou corrompido</p>
            <p>- Certifique-se de que o processo de build do React está configurado corretamente</p>
            <p>- Verifique os logs do container para mais informações</p>
        </div>
    </div>
    <script>
        // Verificar status da API a cada 30 segundos
        function checkApiStatus() {
            fetch('/api/health', { method: 'GET' })
                .then(response => {
                    if (response.ok) {
                        document.querySelector('.api-status p').textContent = 'O backend da aplicação está funcionando normalmente.';
                    } else {
                        document.querySelector('.api-status p').textContent = 'O backend da aplicação está enfrentando problemas.';
                    }
                })
                .catch(error => {
                    document.querySelector('.api-status p').textContent = 'Não foi possível conectar ao backend.';
                });
        }
        
        // Verificar status inicial e configurar intervalo
        checkApiStatus();
        setInterval(checkApiStatus, 30000);
        
        // Tentar recarregar a página automaticamente após 60 segundos
        setTimeout(() => {
            location.reload();
        }, 60000);
    </script>
</body>
</html>
EOL
}

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
    
    # Criar fallback já que o index.html parece incompleto
    create_fallback_frontend
  else
    log_info "O tamanho do arquivo index.html parece adequado"
  fi
else
  log_error "Frontend build não encontrado! Verificando diretório..."
  ls -la /app/frontend/build/ || { 
    log_error "Diretório de build não existe, criando fallback..."; 
    create_fallback_frontend
  }
fi

# Tentar reconstruir o frontend se o build estiver ausente ou for muito pequeno
if [ ! -f "/app/frontend/build/index.html" ] || [ "$(stat -c%s "/app/frontend/build/index.html")" -lt 500 ]; then
  log_warning "Tentando reconstruir o frontend..."
  cd /app/frontend
  
  # Mostrar o conteúdo do package.json para debug
  log_info "Conteúdo do package.json antes do rebuild:"
  cat package.json
  
  # Tentar reinstalar dependências e reconstruir
  npm install --no-audit --no-fund
  NODE_ENV=production GENERATE_SOURCEMAP=false CI=false npm run build
  
  # Verificar se o build funcionou
  if [ -f "build/index.html" ] && [ "$(stat -c%s "build/index.html")" -gt 500 ]; then
    log_info "Reconstrução do frontend bem-sucedida!"
  else
    log_error "Reconstrução do frontend falhou, mantendo fallback."
  fi
  
  # Voltar para o diretório raiz
  cd /app
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