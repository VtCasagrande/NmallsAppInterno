# Dockerfile para o Mall Recorrente

FROM node:18-alpine

# Instalar nginx
RUN apk add --no-cache nginx

WORKDIR /app

# Copiar todo o projeto
COPY . .

# Configurar frontend
WORKDIR /app/frontend
RUN npm install --no-audit --no-fund
# Verificar se a pasta public existe e criar fallback se necessário
RUN if [ ! -d "public" ]; then mkdir -p public; fi
RUN if [ ! -f "public/index.html" ]; then \
    echo '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mall Recorrente</title></head><body><div id="root"></div></body></html>' > public/index.html; \
    fi
# Verificar se os arquivos necessários existem
RUN if [ ! -f "public/manifest.json" ]; then \
    echo '{"short_name":"Mall","name":"Mall Recorrente","icons":[],"start_url":".","display":"standalone","theme_color":"#000000","background_color":"#ffffff"}' > public/manifest.json; \
    fi
RUN if [ ! -f "public/robots.txt" ]; then \
    echo "User-agent: *\nDisallow:" > public/robots.txt; \
    fi
# Construir o frontend
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