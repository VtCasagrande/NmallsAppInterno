#!/bin/sh

# Definir variáveis de ambiente
export NODE_ENV=production

# Verificar se os arquivos necessários existem no frontend
if [ ! -d "/app/frontend/build" ]; then
  echo "AVISO: Diretório build não encontrado. Criando um básico..."
  mkdir -p /app/frontend/build
  echo "<html><body><h1>Mall Recorrente</h1><p>Frontend em construção</p></body></html>" > /app/frontend/build/index.html
fi

# Verificar se o nginx está configurado corretamente
if [ ! -f "/etc/nginx/conf.d/default.conf" ]; then
  echo "ERRO: Configuração do nginx não encontrada. Copiando configuração padrão..."
  cp /app/frontend/nginx.conf /etc/nginx/conf.d/default.conf
fi

# Copiar os arquivos estáticos do frontend para o diretório do Nginx
echo "Copiando arquivos estáticos do frontend para o Nginx..."
mkdir -p /usr/share/nginx/html
cp -r /app/frontend/build/* /usr/share/nginx/html/
echo "Permissões nos arquivos do Nginx..."
chmod -R 755 /usr/share/nginx/html

# Verificar se os arquivos foram copiados corretamente
if [ ! -f "/usr/share/nginx/html/index.html" ]; then
  echo "ERRO: index.html não encontrado. Criando fallback..."
  echo "<html><body><h1>Mall Recorrente</h1><p>Frontend em construção</p></body></html>" > /usr/share/nginx/html/index.html
fi

# Iniciar o servidor nginx para o frontend
echo "Iniciando servidor nginx para o frontend..."
nginx -g "daemon on;"

# Verificar se o nginx iniciou corretamente
if ! pgrep -x "nginx" > /dev/null; then
  echo "ERRO: Nginx não conseguiu iniciar. Verificando logs..."
  cat /var/log/nginx/error.log
else
  echo "Nginx iniciado com sucesso!"
fi

# Navegar para a pasta do backend
cd /app/backend

# Iniciar o servidor backend
echo "Iniciando servidor backend..."
node src/server.js

# O comando acima (node) já mantém o processo ativo

# Manter o container rodando
# O comando acima (node) já mantém o processo ativo, então não é necessário um loop adicional 