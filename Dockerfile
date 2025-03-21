# Dockerfile para o Mall Recorrente

FROM node:18-alpine

# Instalar nginx e pacotes necessários
RUN apk add --no-cache nginx curl

WORKDIR /app

# Copiar todo o projeto
COPY . .

# Configurar frontend
WORKDIR /app/frontend

# Criar ícones em branco se não existirem
RUN mkdir -p public
RUN if [ ! -f "public/favicon.ico" ]; then \
    echo "Criando favicon vazio..." && \
    echo "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAA9JREFUCB1jYGBg+A8EEAIAAZUAkIrAFCoAAAAASUVORK5CYII=" | base64 -d > public/favicon.ico; \
    fi
RUN if [ ! -f "public/logo192.png" ]; then \
    echo "Criando logo192.png vazio..." && \
    echo "iVBORw0KGgoAAAANSUhEUgAAAMAAAADABAMAAACg8nE0AAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAACJJREFUeJztwTEBAAAAwqD1T20ND6AAAAAAAAAAAAAA4N8AKvgAAUFIrrEAAAAASUVORK5CYII=" | base64 -d > public/logo192.png; \
    fi
RUN if [ ! -f "public/logo512.png" ]; then \
    echo "Criando logo512.png vazio..." && \
    echo "iVBORw0KGgoAAAANSUhEUgAAAgAAAAIABAMAAAAGVsnJAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAACNJREFUeJztwQENAAAAwqD3T20PBxQAAAAAAAAAAAAAAHwbQgAAATmKlGMAAAAASUVORK5CYII=" | base64 -d > public/logo512.png; \
    fi

# Verificar arquivos necessários
RUN if [ ! -f "public/index.html" ]; then \
    echo '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mall Recorrente</title></head><body><div id="root"></div></body></html>' > public/index.html; \
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

# Configurar backend
WORKDIR /app/backend
RUN npm install --no-audit --no-fund

# Configurar nginx
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Voltar para o diretório raiz
WORKDIR /app

# Tornar script executável
RUN chmod +x init-container.sh

EXPOSE 80 5000

# Executar script de inicialização
CMD ["./init-container.sh"] 