# Site de Vendas de Material de Construção

Este projeto é um site base para vendas de materiais de construção, utilizando React no frontend, Node.js no backend e SQLite como banco de dados. Estrutura pronta para futuras modificações.

## Segurança
- Senhas são armazenadas com hash usando bcrypt (salt rounds: 10).
- Tokens de autenticação são gerados para sessões.

## Estrutura
- **backend/**: API Node.js com Express e SQLite
- **frontend/**: Aplicação React

## Como rodar o projeto

### Backend
1. Entre na pasta `backend`
2. Instale as dependências:
   ```
npm install
   ```
3. Inicie o servidor:
   ```
npm start
   ```

### Frontend
1. Entre na pasta `frontend`
2. Instale as dependências:
   ```
npm install
   ```
3. Inicie o frontend:
   ```
npm start
   ```

O backend roda na porta 3001 e o frontend na porta 3000.

## Funcionalidades básicas
- Cadastro e listagem de produtos
- Cadastro e listagem de usuários
- Cadastro e listagem de pedidos

Pronto para expansão e customização.
