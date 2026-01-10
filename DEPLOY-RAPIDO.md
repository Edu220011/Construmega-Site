# ⚡ PASSO A PASSO RÁPIDO - Deploy das Correções

## 🎯 Objetivo
Corrigir o erro de carregamento de dados nas páginas por conta do domínio construmega.online não estar configurado.

---

## ⚙️ Passo 1: Conectar na VPS

```bash
ssh root@SEU_IP_VPS
```

---

## 📁 Passo 2: Navegar até o projeto

```bash
cd /root/Construmega-Site
# ou o caminho onde está seu projeto
ls -la
# Verifique se há pastas: backend/, frontend/, etc.
```

---

## 🔄 Passo 3: Atualizar código (se estiver em git)

```bash
git pull origin main
```

**OU** copie manualmente os arquivos modificados para a VPS.

---

## 🔧 Passo 4: Verificar arquivo backend/.env

```bash
cat backend/.env
```

**Deve conter:**
```
NODE_ENV=production
PORT=3001
MP_ACCESS_TOKEN=APP_USR-...
FRONTEND_URL=https://construmega.online
BACKEND_URL=https://construmega.online/api
```

**Se não tiver, edite:**
```bash
nano backend/.env
```

---

## ✅ Passo 5: Verificar arquivo frontend/.env

```bash
cat frontend/.env
```

**Deve conter:**
```
REACT_APP_API_URL=https://construmega.online/api
REACT_APP_MP_PUBLIC_KEY=APP_USR-...
```

**Se não tiver, edite:**
```bash
nano frontend/.env
```

---

## 🛠️ Passo 6: Instalar/Atualizar dependências (OPCIONAL - se não foi feito antes)

```bash
cd backend
npm install
cd ../frontend
npm install
cd ..
```

---

## 📦 Passo 7: Fazer rebuild do frontend

```bash
cd frontend
npm run build
cd ..
```

**⏳ Pode levar 2-5 minutos**

---

## 🚀 Passo 8: Reiniciar processos

```bash
pm2 restart all
```

**OU se não estão rodando:**

```bash
# Parar tudo antes
pm2 stop all
pm2 delete all

# Iniciar novamente
pm2 start backend/index.js --name "construmega-api" --env production
pm2 start "cd frontend && npm run serve" --name "construmega-web"
pm2 save
pm2 startup
```

---

## ✨ Passo 9: Testar (no navegador do seu PC)

Abra: **https://construmega.online**

**Verificar:**
1. Página carrega normalmente
2. Abra Console (F12)
3. Aba **Network** não mostra erro 403 de CORS
4. Clique em qualquer link que carregue dados
5. Dados aparecem normalmente ✅

---

## 🔍 Passo 10: Validar com teste rápido (OPCIONAL)

```bash
# Na VPS, teste a API
curl -I https://construmega.online/api/configuracoes

# Deve retornar algo tipo:
# HTTP/2 200
# ou
# HTTP/2 401 (sem problemas de CORS)
```

---

## 📋 Checklist Final

- [ ] Arquivo backend/.env tem FRONTEND_URL correto
- [ ] Arquivo backend/.env tem BACKEND_URL correto
- [ ] Arquivo frontend/.env tem REACT_APP_API_URL
- [ ] npm run build foi executado com sucesso
- [ ] pm2 restart all executado
- [ ] Site abre em https://construmega.online
- [ ] Não há erro de CORS no console (F12)
- [ ] Dados carregam nas páginas ✅

---

## ❌ Se ainda tiver problemas:

**Ver logs:**
```bash
pm2 logs
# Ctrl+C para sair
```

**Reiniciar Nginx (se usar):**
```bash
sudo systemctl restart nginx
```

**Limpar cache local (no seu navegador):**
- Ctrl+Shift+Delete
- Limpar "Cookies e dados de sites"
- Recarregar página

---

**Pronto! Suas páginas devem carregar normalmente agora! 🎉**
