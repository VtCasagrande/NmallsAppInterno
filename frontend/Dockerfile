# Estágio de build
FROM node:18-alpine as build

WORKDIR /app

# Copiar package.json e package-lock.json (se existir)
COPY package*.json ./

# Instalar todas as dependências, incluindo as de desenvolvimento necessárias para TypeScript
RUN npm install

# Copiar o restante dos arquivos do projeto
COPY . .

# Mostrar diretório para debug
RUN echo "Conteúdo do diretório src:" && ls -la src/

# Verificar se App.tsx existe
RUN test -f src/App.tsx || echo "ERRO: App.tsx não encontrado"

# Compilar o projeto React com TypeScript
RUN NODE_ENV=production npm run build

# Estágio de produção
FROM nginx:alpine

# Copiar os arquivos de build para o diretório do nginx
COPY --from=build /app/build /usr/share/nginx/html

# Adicionar configuração do nginx para roteamento SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor a porta 80
EXPOSE 80

# Iniciar o nginx
CMD ["nginx", "-g", "daemon off;"] 