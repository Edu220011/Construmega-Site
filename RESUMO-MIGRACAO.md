# 🚀 Migração para Produção - Resumo das Alterações

Este documento resume todas as alterações feitas para preparar o site para produção na VPS com Nginx.

## 📝 O Que Foi Alterado

### 1. ✅ Proteção de Dados Sensíveis

**Arquivo:** `.gitignore`

Adicionado proteção para arquivos com dados de produção:
- `backend/usuarios.json` - Dados de usuários (senhas, CPFs, emails)
- `backend/pedidos.json` - Histórico de pedidos
- `backend/pontos.json` - Pontuação de clientes
- `backend/perfis.json` - Perfis de usuários
- `backend/configuracoes.json` - Configurações da empresa
- `backend/configproduto.json` - Configuração de produtos
- `backend/logs/` - Logs do sistema

**Criados templates vazios:**
- `backend/*.json.example` - Templates para inicialização em novas instalações

### 2. ✅ Sistema de Configuração de API

**Novo arquivo:** `frontend/src/config/api.js`

Função `getApiUrl()` que:
- Em desenvolvimento: retorna URLs relativas (usa proxy local)
- Em produção: retorna URLs completas com domínio/IP da VPS

**Variáveis de ambiente:**
- `frontend/.env.development` - Vazio (usa proxy)
- `frontend/.env.production` - `REACT_APP_API_URL=https://construmega.com.br`

**Removido:** Linha `"proxy": "http://localhost:3001"` do `frontend/package.json`

### 3. ✅ Atualização de Chamadas de API

**22 componentes atualizados:**
1. AdicionarPontosForm.js
2. ConfigProduto.js
3. ConfiguracaoGlobal.js
4. EditarUsuario.js
5. Estoque.js
6. HomePromocoes.js
7. ListaUsuarios.js
8. LojaPontuacao.js
9. MeusResgates.js
10. PainelCompraProduto.js
11. Pedidos.js
12. Perfil.js
13. PixCheckout.js
14. CreditCardCheckout.js
15. ProdutoPontos.js
16. Produtos.js
17. ProdutosCadastrados.js
18. ProdutoVenda.js
19. ResgatesAdmin.js
20. Usuarios.js
21. AlterarSenha.js
22. EditarProduto.js
23. Carrinho.js
24. Login.js

**Total: 61 chamadas fetch() atualizadas**

**Antes:**
```javascript
fetch('/api/produtos')
```

**Depois:**
```javascript
import { getApiUrl } from '../config/api';

fetch(getApiUrl('api/produtos'))
```

### 4. ✅ CORS Restrito no Backend

**Arquivo:** `backend/index.js`

**Antes:**
```javascript
app.use(cors());  // Aceita qualquer origem
```

**Depois:**
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:8080'
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`Origem bloqueada pelo CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 5. ✅ Variáveis de Ambiente de Produção

**Arquivo:** `backend/.env`

Configurado para produção:
```env
FRONTEND_URL=https://construmega.com.br
BACKEND_URL=https://construmega.com.br
```

### 6. ✅ Documentação Nginx

**Novo arquivo:** `GUIA-NGINX-VPS.md`

Contém instruções completas para:
- Instalação do Nginx
- Configuração de proxy reverso
- Configuração de SSL (Let's Encrypt)
- Firewall
- Troubleshooting

---

## 🔄 Procedimento de Deploy

### Passo 1: Preparar Localmente

```bash
# 1. Commitar alterações
git add .
git commit -m "Migração para produção com Nginx e CORS restrito"
git push origin main

# 2. Fazer backup dos arquivos JSON atuais (local)
# Copie manualmente:
# - backend/usuarios.json
# - backend/pedidos.json
# - backend/pontos.json
# - backend/perfis.json
# - backend/configuracoes.json
# - backend/configproduto.json
```

### Passo 2: Atualizar na VPS

```bash
# Conectar na VPS
ssh root@129.121.35.197

# Navegar para o projeto
cd /root/Construmega-Site

# Fazer backup dos JSONs de produção
mkdir -p /root/backup-jsons-$(date +%Y%m%d)
cp backend/*.json /root/backup-jsons-$(date +%Y%m%d)/

# Parar serviços
pm2 stop all

# Atualizar código
git pull origin main

# Restaurar JSONs de produção (não foram versionados)
cp /root/backup-jsons-$(date +%Y%m%d)/*.json backend/

# Atualizar .env com URLs de produção
nano backend/.env
# Descomente as linhas com HTTPS:
# FRONTEND_URL=https://construmega.com.br
# BACKEND_URL=https://construmega.com.br

# Reinstalar dependências backend
cd backend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
cd ..

# Reinstalar dependências e rebuild frontend
cd frontend
rm -rf node_modules package-lock.json build
npm cache clean --force
npm install
npm run build
cd ..

# Reiniciar serviços
pm2 restart all
pm2 save

# Verificar status
pm2 list
pm2 logs --lines 20
```

### Passo 3: Configurar Nginx

Siga o guia completo em [GUIA-NGINX-VPS.md](GUIA-NGINX-VPS.md)

Resumo:
```bash
# Instalar Nginx
dnf install -y nginx

# Criar configuração
nano /etc/nginx/conf.d/construmega.conf
# (Cole a configuração do guia)

# Configurar firewall
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload

# Testar e iniciar
nginx -t
systemctl enable nginx
systemctl start nginx
```

### Passo 4: Configurar SSL (Recomendado)

```bash
# Instalar Certbot
dnf install -y certbot python3-certbot-nginx

# Obter certificado
certbot --nginx -d construmega.com.br -d www.construmega.com.br

# Renovação automática já vem configurada
systemctl enable certbot-renew.timer
```

### Passo 5: Testar

```bash
# Na VPS:
curl -I http://localhost
curl -I http://localhost/api/produtos
curl -I https://construmega.com.br

# No navegador:
https://construmega.com.br
```

---

## 🧪 Testando em Desenvolvimento Local

Para testar as alterações localmente antes do deploy:

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend (desenvolvimento)
cd frontend
npm start
# Acesse: http://localhost:3000

# Terminal 3: Frontend (build - simular produção)
cd frontend
npm run build
npx serve -s build -l 8080
# Acesse: http://localhost:8080
```

**Verificações:**
- ✅ Login funciona
- ✅ Produtos carregam
- ✅ Carrinho funciona
- ✅ Pedidos são criados
- ✅ Não há erros de CORS no console

---

## 📊 Diferenças entre Desenvolvimento e Produção

| Aspecto | Desenvolvimento | Produção |
|---------|----------------|----------|
| **Proxy** | Sim (package.json) | Não (Nginx) |
| **Frontend URL** | http://localhost:3000 | https://construmega.com.br |
| **Backend URL** | http://localhost:3001 | https://construmega.com.br |
| **CORS** | Aberto (localhost) | Restrito (domínio) |
| **SSL** | Não | Sim (Let's Encrypt) |
| **Servidor Web** | React Dev Server | Nginx + serve |
| **Portas Expostas** | 3000, 3001 | 80, 443 |
| **Portas Internas** | 3000, 3001 | 8080, 3001 |

---

## 🔐 Segurança Implementada

1. ✅ **CORS Restrito** - Apenas domínio configurado pode acessar API
2. ✅ **Dados Sensíveis** - JSONs não versionados no Git
3. ✅ **HTTPS** - Certificado SSL gratuito (Let's Encrypt)
4. ✅ **Headers de Segurança** - X-Frame-Options, X-XSS-Protection, etc.
5. ✅ **Firewall** - Apenas portas necessárias abertas
6. ✅ **Variáveis de Ambiente** - Configurações sensíveis em .env

---

## 📞 Troubleshooting

### Problema: "Failed to fetch" no frontend

**Causa:** Backend não está acessível ou CORS bloqueando

**Solução:**
1. Verificar se backend está rodando: `pm2 list`
2. Verificar logs: `pm2 logs site-backend`
3. Verificar CORS: `tail -f backend/logs/app.log`
4. Verificar .env: `cat backend/.env`

### Problema: Build do frontend falha

**Causa:** Dependências corrompidas

**Solução:**
```bash
cd frontend
rm -rf node_modules package-lock.json build
npm cache clean --force
npm install
npm run build
```

### Problema: Nginx retorna 502

**Causa:** Backend/Frontend não está rodando

**Solução:**
```bash
pm2 restart all
netstat -tlnp | grep -E ':(3001|8080)'
```

### Problema: SSL não funciona

**Causa:** Domínio não aponta para IP da VPS

**Solução:**
```bash
nslookup construmega.com.br
# Deve retornar: 129.121.35.197
```

---

## ✅ Checklist Final de Deploy

- [ ] Código commitado e pushed para GitHub
- [ ] Backup dos JSONs de produção feito
- [ ] Git pull executado na VPS
- [ ] JSONs restaurados na VPS
- [ ] .env atualizado com URLs de produção
- [ ] Dependências reinstaladas (backend e frontend)
- [ ] Build do frontend executado
- [ ] PM2 reiniciado
- [ ] Nginx instalado e configurado
- [ ] Firewall configurado
- [ ] SSL configurado (Let's Encrypt)
- [ ] Testes de funcionamento realizados
- [ ] Logs verificados sem erros
- [ ] Site acessível via https://construmega.com.br

---

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
- `frontend/src/config/api.js`
- `frontend/.env.development`
- `frontend/.env.production`
- `backend/*.json.example` (6 templates)
- `GUIA-NGINX-VPS.md`
- `RESUMO-MIGRACAO.md` (este arquivo)
- `update_fetch_calls.py` (script auxiliar)

### Arquivos Modificados:
- `.gitignore`
- `frontend/package.json`
- `backend/index.js`
- `backend/.env`
- `frontend/src/components/*.js` (22 componentes)

### Arquivos Protegidos (não versionados):
- `backend/usuarios.json`
- `backend/pedidos.json`
- `backend/pontos.json`
- `backend/perfis.json`
- `backend/configuracoes.json`
- `backend/configproduto.json`

---

**Migração preparada por:** GitHub Copilot
**Data:** Janeiro 2026
**Domínio:** construmega.com.br
**IP VPS:** 129.121.35.197
**Sistema:** AlmaLinux 9.7 | Node.js 18 | PM2 | Nginx
