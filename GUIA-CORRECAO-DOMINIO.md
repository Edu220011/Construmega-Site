# 🔧 GUIA DE CORREÇÃO - Erro de IP/Domínio construmega.online

## ❌ Problema Identificado
O sistema não estava carregando dados nas páginas derivadas porque:

1. **Backend (CORS)**: O domínio `construmega.online` não estava na lista de origens permitidas
2. **Frontend**: A variável `REACT_APP_API_URL` não estava apontando para a URL correta da API
3. **Ambiente**: As variáveis de ambiente não estavam configuradas para produção com HTTPS

---

## ✅ SOLUÇÃO IMPLEMENTADA

### 1️⃣ Backend - Adicionado domínio ao CORS
**Arquivo:** `backend/index.js`

Foram adicionadas as seguintes origens permitidas:
```javascript
'http://construmega.online',
'https://construmega.online',
'http://www.construmega.online',
'https://www.construmega.online'
```

### 2️⃣ Backend - Atualizado arquivo .env
**Arquivo:** `backend/.env`

```env
NODE_ENV=production
FRONTEND_URL=https://construmega.online
BACKEND_URL=https://construmega.online/api
PORT=3001
```

### 3️⃣ Frontend - Configurado API URL
**Arquivo:** `frontend/.env`

```env
REACT_APP_API_URL=https://construmega.online/api
```

---

## 📋 PASSOS PARA APLICAR AS CORREÇÕES NA VPS

### Passo 1: Conectar à VPS
```bash
ssh root@SEU_IP_VPS
```

### Passo 2: Navegar até o projeto
```bash
cd /root/Construmega-Site
# ou o caminho onde seu projeto está instalado
```

### Passo 3: Atualizar o arquivo .env do backend
```bash
nano backend/.env
```

**Certifique-se de que contém:**
```env
NODE_ENV=production
PORT=3001
MP_ACCESS_TOKEN=APP_USR-397030436628329-010606-13c7eac153d41700d4f43e09fb94aaca-155753633
FRONTEND_URL=https://construmega.online
BACKEND_URL=https://construmega.online/api
```

**Salve:** `Ctrl+O` → `Enter` → `Ctrl+X`

### Passo 4: Atualizar o arquivo .env do frontend
```bash
nano frontend/.env
```

**Certifique-se de que contém:**
```env
REACT_APP_API_URL=https://construmega.online/api
REACT_APP_MP_PUBLIC_KEY=APP_USR-c9515a36-ecc3-459f-991f-07222f278435
WATCHPACK_WATCHER_LIMIT=1000
WATCHPACK_IGNORE_FILES=**/pagefile.sys,**/swapfile.sys,**/hiberfil.sys,**/System Volume Information/**
```

**Salve:** `Ctrl+O` → `Enter` → `Ctrl+X`

### Passo 5: Verificar o arquivo backend/index.js (linhas 22-35)
```bash
nano backend/index.js
```

**Procure a seção:** `const corsOptions = {`

**Verifique se contém:**
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:8080',
      'http://129.121.35.197',
      'https://129.121.35.197',
      'http://construmega.com.br',
      'https://construmega.com.br',
      'http://www.construmega.com.br',
      'https://www.construmega.com.br',
      'http://construmega.online',
      'https://construmega.online',
      'http://www.construmega.online',
      'https://www.construmega.online'
    ];
```

**Se não tiver, adicione as linhas:**
```
      'http://construmega.online',
      'https://construmega.online',
      'http://www.construmega.online',
      'https://www.construmega.online'
```

### Passo 6: Reinstalar dependências (se necessário)
```bash
cd backend
npm install
cd ../frontend
npm install
cd ..
```

### Passo 7: Fazer rebuild do frontend
```bash
cd frontend
npm run build
cd ..
```

### Passo 8: Reiniciar os processos PM2
```bash
pm2 restart all
```

**Ou se ainda não estão rodando:**
```bash
pm2 start backend/index.js --name "construmega-api" --env production
pm2 start frontend/build --name "construmega-web" 
pm2 save
pm2 startup
```

### Passo 9: Testar a conexão
```bash
# Teste a API
curl -I https://construmega.online/api/configuracoes

# Deve retornar status 200 ou 401 (não 403 ou erro de origem bloqueada)
```

---

## 🔍 VERIFICAÇÃO - Testando se está funcionando

### No navegador, acesse:
- `https://construmega.online` - Deve carregar a página
- **Abra o console** (F12 ou Ctrl+Shift+I)
- Vá para a aba **Network**
- Clique em qualquer página que faça carregamento de dados

### Verificar se há erro de CORS:
**Erro esperado anterior (AGORA CORRIGIDO):**
```
Access to XMLHttpRequest at 'https://construmega.online/api/...' 
from origin 'https://construmega.online' has been blocked by CORS policy
```

**Deve estar funcionando agora ✅**

---

## 📝 RESUMO DAS MUDANÇAS

| Arquivo | O que foi mudado |
|---------|-----------------|
| `backend/index.js` | Adicionado domínio `construmega.online` ao CORS |
| `backend/.env` | Atualizado para HTTPS e domínio correto |
| `frontend/.env` | Adicionado `REACT_APP_API_URL` apontando para a API |

---

## ⚠️ NOTAS IMPORTANTES

1. **HTTPS é OBRIGATÓRIO**: Se não tiver certificado SSL, a API não funcionará
   - Use Let's Encrypt (Certbot) para gerar certificado grátis

2. **Limpar cache do navegador**: Se continuar com erro, limpe o cache (Ctrl+Shift+Delete)

3. **Verificar DNS**: Certifique-se de que `construmega.online` está apontando para o IP correto da VPS

4. **Reiniciar serviços**: Após fazer mudanças, sempre restart:
   ```bash
   pm2 restart all
   # ou
   sudo systemctl restart nginx
   ```

---

## 🆘 Se ainda tiver problemas:

### Ver logs do backend
```bash
pm2 logs construmega-api
```

### Ver logs do Nginx
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Testar CORS com curl
```bash
curl -H "Origin: https://construmega.online" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS https://construmega.online/api/configuracoes \
     -v
```

**Deve retornar headers com:** `Access-Control-Allow-Origin: https://construmega.online`

---

**Data de criação:** 10 de janeiro de 2026
**Status:** ✅ Corrigido
