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
# Construir o frontend corretamente
RUN npm run build

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