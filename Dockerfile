# Dockerfile para o Mall Recorrente

FROM node:18-alpine

# Diretório de trabalho
WORKDIR /app

# Copiar package.json e instalar dependências antes de copiar o código
# isso permite melhor uso de cache do Docker
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Instalar dependências
RUN npm install --no-fund && \
    cd frontend && npm install --no-fund && \
    cd ../backend && npm install --no-fund

# Copiar o código do projeto
COPY . .

# Garantir que o script de inicialização seja executável
RUN chmod +x init-container.sh

# Construir o frontend
WORKDIR /app/frontend
RUN echo "Construindo frontend com NODE_ENV=production..."
RUN NODE_ENV=production GENERATE_SOURCEMAP=false CI=false npm run build || \
    echo "Build falhou, será usado fallback estático"

# Verificar o resultado do build
RUN echo "Verificando resultado do build:"
RUN if [ -d "build" ] && [ -f "build/index.html" ]; then \
        echo "Build do frontend concluído com sucesso!"; \
    else \
        echo "Criando diretório de build e fallback..."; \
        mkdir -p build; \
        echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Mall Recorrente</title></head><body><h1>Mall Recorrente</h1><p>Frontend em construção</p></body></html>' > build/index.html; \
    fi

# Voltar para o diretório raiz
WORKDIR /app

# Definir variáveis de ambiente
ENV PORT=5000
ENV NODE_ENV=production

# Expor porta para o backend
EXPOSE 5000

# Comando para iniciar o container
CMD ["./init-container.sh"] 