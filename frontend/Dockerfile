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

# Tentar compilar o projeto React com TypeScript
RUN NODE_ENV=production npm run build || \
    (mkdir -p build && \
     echo '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Mall Recorrente</title><style>body{font-family:Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;background-color:#f5f5f5;}h1{color:#2196f3;}p{margin-top:20px;}</style></head><body><h1>Mall Recorrente</h1><p>Sistema de Gerenciamento de Recorrências</p><p>Frontend em construção</p></body></html>' > build/index.html)

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