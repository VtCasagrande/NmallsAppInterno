# Mall Recorrente - Sistema de Gerenciamento de Recorrências

Sistema para gerenciamento de clientes com compras recorrentes. Controle suas recorrências, clientes, produtos, e rotas de entrega.

## Estrutura do Projeto

O projeto é dividido em três partes principais:

- **Backend**: API RESTful em Node.js com Express e MongoDB
- **Frontend**: Interface web em React com Material UI
- **Mobile**: Aplicativo para motoristas (em desenvolvimento)
- **Extensão Chrome**: Integração com TINY PDV (em desenvolvimento)

## Recursos Principais

- Gerenciamento de clientes
- Gerenciamento de produtos
- Recorrências automáticas
- Confirmação de compras recorrentes
- Visualização de recorrências atrasadas
- Gestão de rotas de entrega

## Requisitos

- Node.js 18 ou superior
- MongoDB 4.4 ou superior
- npm ou yarn
- Docker e Docker Compose (para implantação)

## Instalação e Configuração

### Usando Docker (Recomendado)

1. Clone este repositório:
```
git clone https://github.com/seu-usuario/mall-recorrente.git
cd mall-recorrente
```

2. Crie um arquivo `.env` com base no `.env.example`:
```
cp .env.example .env
```

3. Edite o arquivo `.env` conforme suas necessidades

4. Execute o script de inicialização:
```
./init.sh
```

5. Acesse o sistema em:
   - Frontend: http://localhost:3000
   - API: http://localhost:5000/api

### Instalação Manual

#### Backend

1. Entre na pasta do backend:
```
cd backend
```

2. Instale as dependências:
```
npm install
```

3. Crie um arquivo `.env` com base no `.env.example`:
```
cp .env.example .env
```

4. Configure o arquivo `.env` com suas credenciais de MongoDB e chave JWT

5. Inicie o servidor:
```
npm run dev
```

O servidor estará disponível em http://localhost:5000

#### Frontend

1. Entre na pasta do frontend:
```
cd frontend
```

2. Instale as dependências:
```
npm install
```

3. Inicie o servidor de desenvolvimento:
```
npm start
```

O frontend estará disponível em http://localhost:3000

## Implantação

### Implantação no EasyPanel

1. No EasyPanel, crie um novo aplicativo e selecione "GitHub" como fonte.

2. Conecte seu repositório GitHub e selecione o branch principal.

3. Selecione o template "Docker Compose".

4. Configure as variáveis de ambiente conforme o arquivo `.env.example`.

5. Implante o aplicativo e aguarde a conclusão.

6. Execute o script de inicialização para criar o usuário administrador inicial:
```
docker-compose exec backend npm run seed:admin
```

7. Acesse o sistema usando:
   - Email: admin@mallrecorrente.com.br
   - Senha: admin123

IMPORTANTE: Altere a senha do administrador após o primeiro login!

## Licença

Este projeto é propriedade privada. Todos os direitos reservados. 