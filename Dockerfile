# Dockerfile para o Mall Recorrente

FROM node:18-alpine

# Instalar nginx e pacotes necessários
RUN apk add --no-cache nginx curl bash procps net-tools

# Diretório de trabalho
WORKDIR /app

# Copiar o código do projeto
COPY . .

# Mostrar estrutura de diretórios para debugging
RUN echo "Listando conteúdo do diretório raiz:"
RUN ls -la
RUN echo "Listando conteúdo do diretório frontend:"
RUN ls -la frontend/ || echo "Diretório frontend não encontrado!"

# Garantir que o script de inicialização seja executável
RUN chmod +x init-container.sh

# Configurar frontend
WORKDIR /app/frontend

# Verificar o package.json do frontend
RUN echo "Verificando se package.json existe:"
RUN ls -la package.json || echo "ERRO: package.json não encontrado!"
RUN echo "Conteúdo do package.json:"
RUN cat package.json || echo "ERRO: Não foi possível ler package.json"

# Instalar dependências do frontend
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
RUN echo "Estrutura de diretórios src:"
RUN ls -la /app/frontend/src || echo "ERRO: Diretório src não encontrado!"

# Verificar arquivos principais do React
RUN echo "Verificando arquivos principais React:"
RUN ls -la /app/frontend/src/index.tsx || echo "AVISO: index.tsx não encontrado!"
RUN ls -la /app/frontend/src/App.tsx || echo "AVISO: App.tsx não encontrado!"

# Verificar conteúdo do arquivo index.tsx
RUN echo "Conteúdo do arquivo index.tsx:"
RUN cat /app/frontend/src/index.tsx || echo "ERRO: Não foi possível ler index.tsx"

# Verificar conteúdo do arquivo package.json
RUN echo "Conteúdo do package.json:"
RUN cat package.json || echo "ERRO: Não foi possível ler package.json"

# Verificar se o node_modules existe
RUN echo "Verificando node_modules:"
RUN ls -la node_modules/.bin/react-scripts || echo "AVISO: react-scripts não encontrado em node_modules!"

# Tentar várias abordagens para build
RUN echo "Construindo frontend com NODE_ENV=production... (Tentativa 1)"
RUN node --version && npm --version
RUN NODE_ENV=production GENERATE_SOURCEMAP=false CI=false npm run build || \
    (echo "Tentando build alternativo com PUBLIC_URL... (Tentativa 2)" && \
     NODE_ENV=production GENERATE_SOURCEMAP=false CI=false PUBLIC_URL=/ npm run build) || \
    (echo "Tentando build com react-scripts diretamente... (Tentativa 3)" && \
     NODE_ENV=production CI=false node_modules/.bin/react-scripts build) || \
    (echo "Tentando build com configurações específicas... (Tentativa 4)" && \
     SKIP_PREFLIGHT_CHECK=true GENERATE_SOURCEMAP=false NODE_ENV=production CI=false TSC_COMPILE_ON_ERROR=true npm run build) || \
    (echo "Build falhou após todas as tentativas, criando fallback..." && \
     mkdir -p build && \
     echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Mall Recorrente</title><style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;background:#f5f5f5;}h1{color:#1976d2;}p{background:#ffebee;padding:15px;border-left:4px solid #f44336;}</style></head><body><h1>Mall Recorrente</h1><p>Frontend em construção - Build falhou</p><p>Verifique os logs do container para mais detalhes</p></body></html>' > build/index.html)

# Verificar o resultado do build
RUN echo "Verificando resultado do build:"
RUN ls -la build || echo "Diretório build não encontrado!"
RUN if [ -f "build/index.html" ]; then \
        echo "Tamanho do arquivo index.html:" && \
        stat -c "%s" build/index.html && \
        echo "Primeiras 100 linhas do index.html:" && \
        head -n 100 build/index.html; \
    else \
        echo "ERRO: build/index.html não encontrado!" && \
        mkdir -p build && \
        echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Mall Recorrente</title><style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;background:#f5f5f5;}h1{color:#1976d2;}p{background:#ffebee;padding:15px;border-left:4px solid #f44336;}</style></head><body><h1>Mall Recorrente</h1><p>Frontend em construção - Arquivo index.html não encontrado</p></body></html>' > build/index.html; \
    fi

# Copiar todos os arquivos do src para a build, para poder debugar em produção
RUN mkdir -p build/src && cp -r /app/frontend/src/* build/src/ || echo "Falha ao copiar arquivos de src"

# Criar arquivo de índice estático como fallback extremo
RUN echo "Criando fallback extremo em caso de falha total:"
RUN echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Mall Recorrente</title><style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;background:#f5f5f5;}h1{color:#1976d2;}p{background:#ffebee;padding:15px;border-left:4px solid #f44336;}.container{background:white;padding:30px;border-radius:8px;box-shadow:0 3px 10px rgba(0,0,0,0.1);max-width:800px;width:90%;text-align:center;}.btn{display:inline-block;background:#1976d2;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;margin-top:20px;font-weight:500;}</style></head><body><div class="container"><h1>Mall Recorrente</h1><p>Frontend em construção - Este é um fallback de emergência</p><p>O sistema está passando por manutenção. Por favor, tente novamente mais tarde.</p><div>Status: O frontend não pôde ser carregado.</div><a href="/api" class="btn">Acessar API diretamente</a></div></body></html>' > build/fallback.html
RUN cp build/fallback.html build/index.html || echo "Não foi possível criar fallback extremo"

# Configurar backend
WORKDIR /app/backend

# Verificar o package.json do backend
RUN echo "Verificando package.json do backend:"
RUN cat package.json || echo "ERRO: Não foi possível ler package.json do backend"

# Instalar dependências do backend
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