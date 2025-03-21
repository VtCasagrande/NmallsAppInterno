# Dockerfile simplificado para o Mall Recorrente

FROM node:18-alpine

# Instalar nginx
RUN apk add --no-cache nginx

WORKDIR /app

# Copiar todo o projeto
COPY . .

# Configurar frontend
WORKDIR /app/frontend
RUN npm install --no-audit --no-fund
RUN mkdir -p build
RUN echo "<html><body><h1>Mall Recorrente</h1><p>Frontend em construção</p></body></html>" > build/index.html

# Configurar backend
WORKDIR /app/backend
RUN npm install --no-audit --no-fund

# Configurar nginx
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Voltar para o diretório raiz
WORKDIR /app

# Tornar script executável
RUN chmod +x init-container.sh

EXPOSE 3000 5000

# Executar script de inicialização
CMD ["./init-container.sh"] 