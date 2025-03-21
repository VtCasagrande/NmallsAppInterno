# Dockerfile para o Mall Recorrente

FROM node:18-alpine

# Instalar nginx e pacotes necessários
RUN apk add --no-cache nginx curl bash procps net-tools

# Diretório de trabalho
WORKDIR /app

# Copiar package.json para instalar dependências antes
COPY package*.json ./
RUN npm install --no-audit --no-fund

# Copiar o resto dos arquivos
COPY . .

# Garantir que o script de inicialização seja executável
RUN chmod +x init-container.sh

# Configurar frontend
WORKDIR /app/frontend

# Copiar package.json primeiro para instalar dependências
COPY frontend/package*.json ./
RUN npm install --no-audit --no-fund

# Criar diretório public e arquivos necessários
RUN mkdir -p public 

# Criar arquivo de entrada principal
RUN echo '<!DOCTYPE html>\n\
<html lang="pt-BR">\n\
  <head>\n\
    <meta charset="utf-8" />\n\
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />\n\
    <meta name="viewport" content="width=device-width, initial-scale=1" />\n\
    <meta name="theme-color" content="#000000" />\n\
    <meta name="description" content="Sistema de Gerenciamento de Recorrências" />\n\
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />\n\
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />\n\
    <title>Mall Recorrente</title>\n\
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />\n\
  </head>\n\
  <body>\n\
    <noscript>Você precisa habilitar o JavaScript para executar este aplicativo.</noscript>\n\
    <div id="root"></div>\n\
  </body>\n\
</html>' > public/index.html

# Criar ícones básicos
RUN echo "Criando ícone padrão..."
RUN echo "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAA9JREFUCB1jYGBg+A8EEAIAAZUAkIrAFCoAAAAASUVORK5CYII=" | base64 -d > public/favicon.ico

RUN echo "Criando logo padrão..."
RUN echo "iVBORw0KGgoAAAANSUhEUgAAAMAAAADABAMAAACg8nE0AAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAACJJREFUeJztwTEBAAAAwqD1T20ND6AAAAAAAAAAAAAA4N8AKvgAAUFIrrEAAAAASUVORK5CYII=" | base64 -d > public/logo192.png

RUN echo "Criando logo grande padrão..."
RUN echo "iVBORw0KGgoAAAANSUhEUgAAAgAAAAIABAMAAAAGVsnJAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAACNJREFUeJztwQENAAAAwqD3T20PBxQAAAAAAAAAAAAAAHwbQgAAATmKlGMAAAAASUVORK5CYII=" | base64 -d > public/logo512.png

RUN echo "Criando manifest.json padrão..."
RUN echo '{"short_name":"Mall","name":"Mall Recorrente","icons":[{"src":"favicon.ico","sizes":"64x64 32x32 24x24 16x16","type":"image/x-icon"},{"src":"logo192.png","type":"image/png","sizes":"192x192"},{"src":"logo512.png","type":"image/png","sizes":"512x512"}],"start_url":".","display":"standalone","theme_color":"#000000","background_color":"#ffffff"}' > public/manifest.json

RUN echo "Criando robots.txt padrão..."
RUN echo "User-agent: *\nDisallow:" > public/robots.txt

# Verificar estrutura de diretórios
RUN echo "Estrutura de diretórios:" && ls -la /app/frontend/src

# Verificar arquivo package.json
RUN echo "Conteúdo do package.json:" && cat package.json

# Tentar várias abordagens para build
RUN echo "Construindo frontend com NODE_ENV=production... (Tentativa 1)"
RUN NODE_ENV=production GENERATE_SOURCEMAP=false CI=false npm run build || \
    (echo "Tentando build alternativo com PUBLIC_URL... (Tentativa 2)" && \
     NODE_ENV=production GENERATE_SOURCEMAP=false CI=false PUBLIC_URL=/ npm run build) || \
    (echo "Tentando build com configurações específicas... (Tentativa 3)" && \
     SKIP_PREFLIGHT_CHECK=true GENERATE_SOURCEMAP=false NODE_ENV=production CI=false TSC_COMPILE_ON_ERROR=true npm run build) || \
    (echo "Build falhou após todas as tentativas, criando fallback..." && \
     mkdir -p build && \
     echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Mall Recorrente</title></head><body><div id="root"><h1>Mall Recorrente</h1><p>Frontend em construção - Build falhou</p></div></body></html>' > build/index.html)

# Verificar o resultado do build
RUN ls -la build || echo "Diretório build não encontrado!"
RUN if [ -f "build/index.html" ]; then \
        echo "Tamanho do arquivo index.html:" && \
        stat -c "%s" build/index.html && \
        echo "Primeiras 100 linhas do index.html:" && \
        head -n 100 build/index.html; \
    else \
        echo "ERRO: build/index.html não encontrado!" && \
        mkdir -p build && \
        echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Mall Recorrente</title></head><body><div id="root"><h1>Mall Recorrente</h1><p>Frontend em construção - Arquivo index.html não encontrado</p></div></body></html>' > build/index.html; \
    fi

# Copiar todos os arquivos do src para a build, para poder debugar em produção
RUN mkdir -p build/src && cp -r /app/frontend/src/* build/src/ || echo "Falha ao copiar arquivos de src"

# Configurar backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --no-audit --no-fund

# Voltar para o diretório raiz
WORKDIR /app

# Criar diretório de logs para o nginx
RUN mkdir -p /var/log/nginx && \
    touch /var/log/nginx/access.log && \
    touch /var/log/nginx/error.log && \
    chown -R root:root /var/log/nginx

# Remover configuração padrão do nginx para evitar conflitos
RUN rm -f /etc/nginx/conf.d/default.conf

# Definir variáveis de ambiente para construção
ENV PORT=5000
ENV PORT_BACKEND=5000
ENV NODE_ENV=production

EXPOSE 80 5000

# Executar script de inicialização
CMD ["./init-container.sh"] 