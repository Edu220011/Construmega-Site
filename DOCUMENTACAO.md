# Documentação do Projeto - Sistema de E-commerce

## Visão Geral

Este é um sistema completo de e-commerce desenvolvido com **backend em Node.js/Express** e **frontend em React**. O sistema inclui funcionalidades de vendas de produtos, sistema de pontos/fidelidade, gerenciamento de usuários, carrinho de compras, pagamentos via Mercado Pago e muito mais.

## Estrutura Geral do Projeto

```
site-1.4/
├── backend/                 # API e lógica do servidor
├── frontend/               # Interface do usuário React
├── backup/                 # Scripts de backup
├── package.json           # Dependências raiz
└── package-lock.json      # Lockfile das dependências
```

---

## Backend (Node.js/Express)

### Arquivos Principais

#### `index.js` (1272 linhas)
**Função:** Servidor principal da API REST.
**Principais funcionalidades:**
- Configuração do servidor Express com CORS
- Middleware de logging para todas as requisições
- Integração com Mercado Pago (pagamentos)
- Sistema de autenticação (login/logout)
- Gerenciamento de usuários, produtos, pedidos
- API de pontos e resgates
- Upload de imagens
- Webhooks para pagamentos
- Rota de configuração global

**Rotas principais:**
- `POST /login` - Autenticação de usuários
- `GET /produtos` - Listar produtos
- `POST /pedidos` - Criar pedidos
- `GET /usuarios` - Gerenciar usuários
- `POST /pagamento` - Processar pagamentos
- `GET /configuracoes` - Configurações da empresa

#### `atualizar-pedidos.js` (60 linhas)
**Função:** Script utilitário para atualizar pedidos antigos.
**O que faz:**
- Lê arquivo `pedidos.json`
- Gera comprovantes automaticamente para pedidos de resgate
- Adiciona campos faltantes (localRetirada, quantidade, tipo)
- Salva pedidos atualizados
- Exibe resumo dos pedidos

#### `logger.js` (86 linhas)
**Função:** Sistema de logging estruturado.
**Funcionalidades:**
- Níveis de log: ERROR, WARN, INFO, DEBUG
- Sanitização de dados sensíveis (senhas, tokens, etc.)
- Logs salvos em arquivos na pasta `logs/`
- Formatação consistente com timestamps
- Criação automática do diretório de logs

#### `validar-jsons.js` (38 linhas)
**Função:** Validador de arquivos JSON do backend.
**O que faz:**
- Verifica integridade de arquivos JSON
- Valida estrutura dos dados
- Arquivos validados: produtos.json, usuarios.json, pedidos.json, etc.

### Arquivos de Dados (JSON)

#### `produtos.json`
Armazena catálogo de produtos com preços, descrições, imagens e configurações.

#### `usuarios.json`
Base de dados de usuários com informações de perfil, pontos e histórico.

#### `pedidos.json`
Histórico completo de pedidos, incluindo vendas e resgates.

#### `configuracoes.json`
Configurações globais da empresa (endereço, contato, etc.).

#### `perfis.json`
Definições de perfis de usuário e permissões.

#### `pontos.json`
Sistema de pontos e regras de conversão.

#### `configproduto.json`
Configurações específicas de produtos.

### Outros Arquivos

#### `database.sqlite`
Banco de dados SQLite para armazenamento persistente.

#### `package.json`
Dependências do backend: express, bcrypt, mercadopago, sqlite3, etc.

#### `.env` / `.env.example`
Variáveis de ambiente (tokens, chaves API, etc.).

---

## Frontend (React)

### Arquivos Principais

#### `src/App.js` (859 linhas)
**Função:** Componente raiz da aplicação React.
**Funcionalidades:**
- Configuração do roteamento (React Router)
- Gerenciamento de estado global (usuário logado, carrinho)
- Hooks customizados para empresa e carrinho
- Renderização condicional baseada em autenticação
- Lazy loading de componentes

#### `src/index.js`
**Função:** Ponto de entrada da aplicação React.
**O que faz:** Renderiza o componente App no DOM.

### Componentes React (`src/components/`)

#### `Login.js`
**Função:** Tela de autenticação de usuários.

#### `Produtos.js`
**Função:** Catálogo de produtos com filtros e busca.

#### `Carrinho.js`
**Função:** Gerenciamento do carrinho de compras.

#### `Pedidos.js`
**Função:** Histórico e gerenciamento de pedidos.

#### `Perfil.js`
**Função:** Perfil do usuário logado.

#### `Usuarios.js` / `ListaUsuarios.js`
**Função:** Administração de usuários (apenas admin).

#### `EditarProduto.js` / `EditarUsuario.js`
**Função:** Formulários de edição de produtos/usuários.

#### `ConfiguracaoGlobal.js`
**Função:** Configurações globais da empresa.

#### `Pontuacao.js` / `LojaPontuacao.js`
**Função:** Sistema de pontos e loja de resgates.

#### `PagamentoCallback.js`
**Função:** Callback de pagamentos (Mercado Pago).

#### `PixCheckout.js` / `CreditCardCheckout.js`
**Função:** Processamento de pagamentos PIX e cartão.

#### `BarcodeReader.js`
**Função:** Leitor de códigos de barras.

#### `Estoque.js`
**Função:** Controle de estoque de produtos.

#### `HomePromocoes.js`
**Função:** Página inicial com promoções.

#### `MeusResgates.js` / `ResgatesAdmin.js`
**Função:** Gerenciamento de resgates de pontos.

#### `AdicionarPontos.js` / `AdicionarPontosForm.js`
**Função:** Adição manual de pontos aos usuários.

#### `ProdutoPontos.js` / `ProdutoVenda.js`
**Função:** Produtos específicos para pontos ou venda.

#### `PaymentMethodModal.js`
**Função:** Modal de seleção de método de pagamento.

#### `PainelCompraProduto.js`
**Função:** Painel de compra individual de produto.

#### `ComprovanteCard.js`
**Função:** Exibição de comprovantes de pedido.

#### `AlterarSenha.js`
**Função:** Formulário de alteração de senha.

#### `PerfilDropdown.js` / `PerfilDropdown.css`
**Função:** Dropdown do menu de perfil.

#### `CarrosselImagens.js` / `CarrosselImagens.css`
**Função:** Carrossel de imagens para produtos.

### Utilitários (`src/utils/`)

#### `carrinhoUtils.js` (84 linhas)
**Função:** Utilitários para gerenciamento de carrinho por usuário.
**Funções principais:**
- `salvarCarrinhoUsuario()` - Salva carrinho no localStorage
- `carregarCarrinhoUsuario()` - Carrega carrinho do usuário
- `limparCarrinhoUsuario()` - Remove carrinho do usuário
- `adicionarItemCarrinhoUsuario()` - Adiciona item ao carrinho
- `removerItemCarrinhoUsuario()` - Remove item do carrinho
- `calcularTotalCarrinho()` - Calcula valor total

#### `logger.js`
**Função:** Sistema de logging no frontend (similar ao backend).

#### `perfUtils.js`
**Função:** Utilitários para sistema de performance/pontos.

### Outros Arquivos Frontend

#### `package.json`
Dependências: react, react-router-dom, quagga (leitor QR), etc.

#### `config-overrides.js`
Configurações do react-app-rewired.

#### `build/`
Pasta com arquivos compilados para produção.

---

## Sistema de Backup (`backup/`)

#### `backup-auto.bat` / `backup-auto.sh`
Scripts para backup automático dos dados.

#### `README.md`
Documentação dos procedimentos de backup.

---

## Funcionalidades Principais do Sistema

### 🛒 E-commerce
- Catálogo de produtos
- Carrinho de compras por usuário
- Sistema de checkout
- Histórico de pedidos

### 💰 Pagamentos
- Integração Mercado Pago
- PIX e cartão de crédito
- Webhooks para confirmação

### 🎯 Sistema de Pontos
- Acumulação de pontos
- Loja de resgates
- Regras configuráveis

### 👥 Gerenciamento de Usuários
- Cadastro e login
- Perfis e permissões
- Administração completa

### 📊 Administração
- Painel administrativo
- Controle de estoque
- Relatórios e analytics

### 🔧 Configuração
- Configurações globais
- Personalização da empresa
- Upload de imagens

---

## Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite** - Banco de dados
- **Mercado Pago SDK** - Processamento de pagamentos
- **bcrypt** - Hash de senhas
- **CORS** - Controle de acesso
- **dotenv** - Variáveis de ambiente

### Frontend
- **React** - Biblioteca UI
- **React Router** - Roteamento
- **Quagga.js** - Leitor de códigos de barras
- **LocalStorage** - Persistência local

### Infraestrutura
- **PM2** - Gerenciador de processos
- **Nginx** - Servidor web (produção)
- **Git** - Controle de versão

---

## Como Executar

### Desenvolvimento
```bash
# Backend
cd backend && npm install && npm start

# Frontend
cd frontend && npm install && npm start
```

### Produção
```bash
# Build frontend
cd frontend && npm run build

# Iniciar com PM2
pm2 start backend/index.js --name site-backend
pm2 start frontend/start-frontend.sh --name site-frontend
```

---

## Manutenção e Deploy

Para atualizar na VPS, siga o guia de deploy:
1. Fazer backup dos dados
2. Baixar atualizações do Git
3. Instalar dependências
4. Gerar build do frontend
5. Reiniciar serviços com PM2

---

*Documentação gerada automaticamente em 8 de janeiro de 2026*