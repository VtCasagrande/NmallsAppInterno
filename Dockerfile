# Dockerfile para o projeto completo Mall Recorrente
# Esta é uma configuração multi-estágio para buildar backend e frontend

# Estágio de build do backend
FROM node:18-alpine AS backend-build

WORKDIR /app/backend

COPY ./backend/package*.json ./

RUN npm install

COPY ./backend ./

# Estágio de build do frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

COPY ./frontend/package*.json ./

RUN npm install

COPY ./frontend ./

RUN npm run build

# Estágio final com nginx e backend
FROM node:18-alpine

# Instalar nginx
RUN apk add --no-cache nginx

WORKDIR /app

# Copiar backend
COPY --from=backend-build /app/backend ./backend

# Configurar diretório do nginx e copiar os arquivos do frontend
RUN mkdir -p /usr/share/nginx/html
COPY --from=frontend-build /app/frontend/build /usr/share/nginx/html

# Copiar configuração do nginx
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Script de inicialização
COPY ./init-container.sh ./
RUN chmod +x ./init-container.sh

EXPOSE 3000 5000

# Script de inicialização para executar nginx e backend
CMD ["./init-container.sh"] 