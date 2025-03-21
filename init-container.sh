#!/bin/sh

# Definir variáveis de ambiente
export NODE_ENV=production

# Verificar arquivos e diretórios
echo "==== Verificando arquivos e diretórios ===="

# Verificar se o diretório build do frontend existe
if [ ! -d "/app/frontend/build" ]; then
  echo "ERRO: Diretório build não encontrado. Criando um básico..."
  mkdir -p /app/frontend/build
  echo "<html><body><h1>Mall Recorrente</h1><p>Frontend em construção</p></body></html>" > /app/frontend/build/index.html
else
  echo "Diretório build encontrado em /app/frontend/build"
  ls -la /app/frontend/build
fi

# Verificar configuração do nginx
if [ ! -f "/app/frontend/nginx.conf" ]; then
  echo "ERRO: Configuração do nginx não encontrada."
  exit 1
else
  echo "Arquivo de configuração do Nginx encontrado em /app/frontend/nginx.conf"
  # Copiar para o local padrão do nginx
  cp /app/frontend/nginx.conf /etc/nginx/nginx.conf
  echo "Configuração copiada para /etc/nginx/nginx.conf"
fi

# Limpar diretório do nginx e copiar os arquivos estáticos
echo "==== Preparando diretório do Nginx ===="
rm -rf /usr/share/nginx/html/*
mkdir -p /usr/share/nginx/html

echo "Copiando arquivos estáticos do frontend para o Nginx..."
cp -rv /app/frontend/build/* /usr/share/nginx/html/

echo "Definindo permissões nos arquivos do Nginx..."
find /usr/share/nginx/html -type d -exec chmod 755 {} \;
find /usr/share/nginx/html -type f -exec chmod 644 {} \;

echo "Conteúdo do diretório do Nginx:"
ls -la /usr/share/nginx/html

# Verificar se os arquivos foram copiados corretamente
if [ ! -f "/usr/share/nginx/html/index.html" ]; then
  echo "ERRO: index.html não encontrado. Criando fallback..."
  echo "<html><body><h1>Mall Recorrente</h1><p>Frontend em construção</p></body></html>" > /usr/share/nginx/html/index.html
else
  echo "index.html encontrado em /usr/share/nginx/html"
fi

# Iniciar serviços
echo "==== Iniciando serviços ===="

# Verificar a configuração do nginx
echo "Verificando configuração do Nginx..."
nginx -t

# Reiniciar nginx para garantir que a configuração seja carregada
echo "Iniciando o nginx..."
killall -9 nginx || echo "Nginx não estava rodando"
sleep 1
nginx

# Verificar se o nginx iniciou corretamente
if ! pgrep -x "nginx" > /dev/null; then
  echo "ERRO: Nginx não conseguiu iniciar. Verificando logs..."
  cat /var/log/nginx/error.log
else
  echo "Nginx iniciado com sucesso!"
  ps aux | grep nginx
fi

# Navegar para a pasta do backend
cd /app/backend

# Iniciar o servidor backend
echo "Iniciando servidor backend..."
node src/server.js

# O comando acima (node) já mantém o processo ativo

# Manter o container rodando
# O comando acima (node) já mantém o processo ativo, então não é necessário um loop adicional 