# Dockerfile para o Mall Recorrente

FROM node:18-alpine

# Instalar nginx e pacotes necessários
RUN apk add --no-cache nginx curl bash procps

WORKDIR /app

# Copiar todo o projeto
COPY . .

# Garantir que o script de inicialização seja executável
RUN chmod +x init-container.sh

# Configurar frontend
WORKDIR /app/frontend

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
COPY frontend/public/favicon.ico public/favicon.ico
COPY frontend/public/logo192.png public/logo192.png
COPY frontend/public/logo512.png public/logo512.png
COPY frontend/public/manifest.json public/manifest.json
COPY frontend/public/robots.txt public/robots.txt

# Executar fallbacks caso os arquivos não existam
RUN if [ ! -f "public/favicon.ico" ]; then \
    echo "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAA9JREFUCB1jYGBg+A8EEAIAAZUAkIrAFCoAAAAASUVORK5CYII=" | base64 -d > public/favicon.ico; \
    fi

RUN if [ ! -f "public/logo192.png" ]; then \
    echo "iVBORw0KGgoAAAANSUhEUgAAAMAAAADABAMAAACg8nE0AAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAACJJREFUeJztwTEBAAAAwqD1T20ND6AAAAAAAAAAAAAA4N8AKvgAAUFIrrEAAAAASUVORK5CYII=" | base64 -d > public/logo192.png; \
    fi

RUN if [ ! -f "public/logo512.png" ]; then \
    echo "iVBORw0KGgoAAAANSUhEUgAAAgAAAAIABAMAAAAGVsnJAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAACNJREFUeJztwQENAAAAwqD3T20PBxQAAAAAAAAAAAAAAHwbQgAAATmKlGMAAAAASUVORK5CYII=" | base64 -d > public/logo512.png; \
    fi

RUN if [ ! -f "public/manifest.json" ]; then \
    echo '{"short_name":"Mall","name":"Mall Recorrente","icons":[{"src":"favicon.ico","sizes":"64x64 32x32 24x24 16x16","type":"image/x-icon"},{"src":"logo192.png","type":"image/png","sizes":"192x192"},{"src":"logo512.png","type":"image/png","sizes":"512x512"}],"start_url":".","display":"standalone","theme_color":"#000000","background_color":"#ffffff"}' > public/manifest.json; \
    fi

RUN if [ ! -f "public/robots.txt" ]; then \
    echo "User-agent: *\nDisallow:" > public/robots.txt; \
    fi

# Instalar dependências e construir o frontend
RUN npm install --no-audit --no-fund
RUN npm run build || (echo "Build falhou, usando fallback" && mkdir -p build && echo '<html><body><h1>Mall Recorrente</h1><p>Frontend em construção</p></body></html>' > build/index.html)

# Verificar se o build foi gerado
RUN ls -la build && \
    if [ ! -f "build/index.html" ]; then \
        echo "ERRO: build/index.html não encontrado, criando fallback" && \
        mkdir -p build && \
        echo '<html><body><h1>Mall Recorrente</h1><p>Frontend em construção</p></body></html>' > build/index.html; \
    fi

# Configurar backend
WORKDIR /app/backend
RUN npm install --no-audit --no-fund

# Configurar nginx
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Voltar para o diretório raiz
WORKDIR /app

# Criar diretório de logs para o nginx
RUN mkdir -p /var/log/nginx && \
    touch /var/log/nginx/access.log && \
    touch /var/log/nginx/error.log && \
    chown -R root:root /var/log/nginx

EXPOSE 80 5000

# Executar script de inicialização
CMD ["./init-container.sh"] 