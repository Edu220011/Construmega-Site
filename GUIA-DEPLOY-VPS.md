# 🚀 Guia Completo de Deploy na VPS

## 📋 Situação Atual
O site já está na VPS e precisa ser atualizado com as novas mudanças.

---

## ✅ PASSO A PASSO PARA ATUALIZAR O SITE NA VPS

### 1️⃣ Acesse a VPS
```bash
ssh root@seu-ip-vps
```

### 2️⃣ Navegue até o projeto
```bash
cd /root/Construmega-Site
```

### 3️⃣ Pare os processos atuais
```bash
pm2 stop all
```

### 4️⃣ Baixe as atualizações do GitHub
```bash
git pull origin main
```

### 5️⃣ Instale dependências (se houver novas)
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 6️⃣ Gere o build do frontend
```bash
cd /root/Construmega-Site/frontend
npm run build
```

### 7️⃣ Inicie o Backend com PM2
```bash
cd /root/Construmega-Site/backend
pm2 start index.js --name site-backend
```

### 8️⃣ Inicie o Frontend com PM2 (COMANDO CORRETO)
```bash
cd /root/Construmega-Site/frontend
pm2 start npm --name site-frontend -- run serve
```

**OU use o script criado:**
```bash
chmod +x start-frontend.sh
pm2 start ./start-frontend.sh --name site-frontend
```

### 9️⃣ Configure para iniciar automaticamente após reboot
```bash
pm2 startup
# COPIE e EXECUTE o comando que aparecer
pm2 save
```

### 🔟 Verifique se está tudo funcionando
```bash
pm2 list
pm2 logs
```

---

## 🔧 COMANDOS ÚTEIS

### Ver status dos apps:
```bash
pm2 list
```

### Ver logs em tempo real:
```bash
pm2 logs
pm2 logs site-backend
pm2 logs site-frontend
```

### Reiniciar apps:
```bash
pm2 restart site-backend
pm2 restart site-frontend
pm2 restart all
```

### Parar apps:
```bash
pm2 stop site-backend
pm2 stop site-frontend
pm2 stop all
```

### Remover apps do PM2:
```bash
pm2 delete site-backend
pm2 delete site-frontend
```

---

## 🌐 CONFIGURAÇÃO DE PORTAS

### Backend (index.js):
- Porta padrão: **3001** ou **5000** (verificar no código)
- Acessível em: `http://seu-ip:3001`

### Frontend (build):
- Porta: **8080**
- Acessível em: `http://seu-ip:8080`

---

## ⚠️ TROUBLESHOOTING

### Erro: "serve: command not found"
```bash
npm install -g serve
```

### Erro: Porta já em uso
```bash
# Ver o que está usando a porta 8080
lsof -i :8080
# Matar o processo
kill -9 PID_DO_PROCESSO
```

### Frontend não abre após atualizar:
```bash
cd /root/Construmega-Site/frontend
rm -rf node_modules package-lock.json
npm install
npm run build
pm2 restart site-frontend
```

### Backend com erro:
```bash
pm2 logs site-backend
# Ver o erro específico e corrigir
```

---

## 🎯 CHECKLIST DE ATUALIZAÇÃO

- [ ] Fazer SSH na VPS
- [ ] Parar processos (`pm2 stop all`)
- [ ] Baixar atualizações (`git pull origin main`)
- [ ] Instalar dependências backend (`cd backend && npm install`)
- [ ] Instalar dependências frontend (`cd frontend && npm install`)
- [ ] Gerar build (`npm run build`)
- [ ] Iniciar backend com PM2
- [ ] Iniciar frontend com PM2
- [ ] Verificar logs (`pm2 logs`)
- [ ] Testar no navegador
- [ ] Configurar startup automático (`pm2 startup` e `pm2 save`)

---

## 📝 SCRIPT RÁPIDO DE ATUALIZAÇÃO

Copie e cole tudo de uma vez:

```bash
cd /root/Construmega-Site
pm2 stop all
git pull origin main
cd backend && npm install && cd ..
cd frontend && npm install && npm run build && cd ..
pm2 restart all
pm2 logs
```

---

## 🔄 PRIMEIRA INSTALAÇÃO (se ainda não tiver configurado)

```bash
# 1. Clonar repositório
cd /root
git clone https://github.com/seu-usuario/Construmega-Site.git
cd Construmega-Site

# 2. Instalar dependências
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 3. Build do frontend
cd frontend && npm run build && cd ..

# 4. Instalar PM2 e serve globalmente
npm install -g pm2 serve

# 5. Iniciar backend
cd backend
pm2 start index.js --name site-backend

# 6. Iniciar frontend
cd ../frontend
pm2 start npm --name site-frontend -- run serve

# 7. Configurar startup
pm2 startup
# EXECUTAR o comando que aparecer
pm2 save

# 8. Verificar
pm2 list
```

---

## 🎉 RESULTADO ESPERADO

Após seguir os passos, você terá:
- ✅ Backend rodando na porta 3001 (ou configurada)
- ✅ Frontend rodando na porta 8080
- ✅ Apps reiniciam automaticamente após reboot da VPS
- ✅ Logs acessíveis via `pm2 logs`
- ✅ Site funcionando normalmente

---

## 📞 VERIFICAÇÃO FINAL

```bash
# Ver processos rodando
pm2 list

# Testar backend
curl http://localhost:3001

# Testar frontend
curl http://localhost:8080

# Ver se portas estão abertas
netstat -tulpn | grep :8080
netstat -tulpn | grep :3001
```

Se tudo estiver ok, você verá os processos ativos e poderá acessar o site pelo IP da VPS! 🚀
