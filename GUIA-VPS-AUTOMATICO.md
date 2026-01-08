# 🚀 Guia VPS AlmaLinux 9.7: Atualização Automática e Funcionamento Contínuo

## 📋 Visão Geral
Este guia configura um sistema de **atualização automática** na VPS AlmaLinux 9.7, garantindo que o site esteja sempre atualizado e funcionando sem intervenção manual.

## ⚙️ Configuração Inicial na VPS AlmaLinux 9.7

### 🔍 Verificação do Sistema
Confirme que está executando AlmaLinux 9.7:

```bash
cat /etc/os-release
```

### 1️⃣ Acessar VPS e Preparar Ambiente
```bash
ssh root@seu-ip-vps
cd /root/Construmega-Site
```

### 2️⃣ Instalar Dependências Essenciais (AlmaLinux 9.7)

```bash
# 1. Atualizar sistema
dnf update -y

# 2. Instalar Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
dnf install -y nodejs

# 3. Instalar PM2 globalmente
npm install -g pm2 serve

# 4. Instalar Git e utilitários essenciais
dnf install -y git curl wget nano htop jq netcat

# 5. Verificar versões instaladas
echo "=== VERSÕES INSTALADAS ==="
node --version
npm --version
pm2 --version
git --version

# 6. Testar funcionamento
node -e "console.log('✅ Node.js funcionando!')"
pm2 list
git --version
```

---

## 🔄 Sistema de Atualização Automática

### Criar Script de Atualização Automática
```bash
nano /root/atualizar-site.sh
```

**Conteúdo do script:**
```bash
#!/bin/bash

# Script de atualização automática do site
# Salvar como /root/atualizar-site.sh

echo "🚀 Iniciando atualização automática - $(date)"

# Navegar para o projeto
cd /root/Construmega-Site

# Fazer backup dos dados importantes
echo "📦 Fazendo backup dos dados..."
cp backend/pedidos.json backup/pedidos-$(date +%Y%m%d-%H%M%S).json
cp backend/usuarios.json backup/usuarios-$(date +%Y%m%d-%H%M%S).json

# Parar serviços
echo "⏹️ Parando serviços..."
pm2 stop all

# Baixar atualizações
echo "⬇️ Baixando atualizações do GitHub..."
git pull origin main

# Instalar dependências backend
echo "📦 Instalando dependências backend..."
cd backend
npm install

# Instalar dependências frontend
echo "📦 Instalando dependências frontend..."
cd ../frontend
npm install

# Build do frontend
echo "🔨 Gerando build do frontend..."
npm run build

# Voltar para raiz
cd ..

# Reiniciar serviços
echo "▶️ Reiniciando serviços..."
pm2 restart all

# Verificar status
echo "📊 Verificando status..."
pm2 list
pm2 logs --lines 10

# Teste básico
echo "🧪 Testando conectividade..."
curl -s http://localhost:3001 > /dev/null && echo "✅ Backend OK" || echo "❌ Backend com problema"
curl -s http://localhost:8080 > /dev/null && echo "✅ Frontend OK" || echo "❌ Frontend com problema"

echo "✅ Atualização concluída - $(date)"
```

### Tornar Executável e Testar
```bash
chmod +x /root/atualizar-site.sh
/root/atualizar-site.sh
```

---

## ⏰ Agendamento Automático (Cron Job)

### Configurar Atualização Diária
```bash
# Editar crontab
crontab -e
```

**Adicionar estas linhas:**
```bash
# Atualização automática do site todos os dias às 2:00 AM
0 2 * * * /root/atualizar-site.sh >> /root/atualizacao.log 2>&1

# Limpeza de logs antigos (todos os domingos às 3:00 AM)
0 3 * * 0 find /root/Construmega-Site/backend/logs -name "*.log" -mtime +7 -delete

# Backup semanal (todos os domingos às 4:00 AM)
0 4 * * 0 /root/backup-semanal.sh
```

### Criar Script de Backup Semanal
```bash
nano /root/backup-semanal.sh
```

**Conteúdo:**
```bash
#!/bin/bash
# Backup semanal completo

DATA=$(date +%Y%m%d)
BACKUP_DIR="/root/backups"

mkdir -p $BACKUP_DIR

echo "📦 Iniciando backup semanal - $DATA"

# Backup do banco e dados
cp /root/Construmega-Site/backend/database.sqlite $BACKUP_DIR/database-$DATA.sqlite
cp /root/Construmega-Site/backend/pedidos.json $BACKUP_DIR/pedidos-$DATA.json
cp /root/Construmega-Site/backend/usuarios.json $BACKUP_DIR/usuarios-$DATA.json

# Compactar
tar -czf $BACKUP_DIR/backup-completo-$DATA.tar.gz -C /root Construmega-Site

# Manter apenas últimos 4 backups
cd $BACKUP_DIR
ls -t backup-completo-*.tar.gz | tail -n +5 | xargs rm -f

echo "✅ Backup semanal concluído - $DATA"
```

```bash
chmod +x /root/backup-semanal.sh
```

---

## 🔍 Monitoramento e Alertas

### Configurar Monitoramento Básico
```bash
# Verificar uso de disco
df -h

# Verificar processos
pm2 list
pm2 monit
```

### Script de Verificação de Saúde
```bash
nano /root/verificar-saude.sh
```

**Conteúdo:**
```bash
#!/bin/bash
# Verificação de saúde do sistema

echo "🏥 Verificação de saúde - $(date)"

# Verificar se serviços estão rodando
BACKEND_STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="site-backend") | .pm2_env.status')
FRONTEND_STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="site-frontend") | .pm2_env.status')

if [ "$BACKEND_STATUS" != "online" ]; then
    echo "❌ Backend offline! Tentando reiniciar..."
    pm2 restart site-backend
fi

if [ "$FRONTEND_STATUS" != "online" ]; then
    echo "❌ Frontend offline! Tentando reiniciar..."
    pm2 restart site-frontend
fi

# Verificar portas
if ! nc -z localhost 3001; then
    echo "❌ Porta 3001 (backend) não responde!"
fi

if ! nc -z localhost 8080; then
    echo "❌ Porta 8080 (frontend) não responde!"
fi

# Verificar espaço em disco
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo "⚠️ Disco quase cheio: ${DISK_USAGE}%"
fi

echo "✅ Verificação concluída"
```

```bash
chmod +x /root/verificar-saude.sh
```

### Adicionar ao Cron (verificação a cada hora)
```bash
crontab -e
# Adicionar:
0 * * * * /root/verificar-saude.sh >> /root/saude.log 2>&1
```

---

## 🔧 Configuração PM2 para Auto-restart

### Salvar Configuração PM2
```bash
# Após iniciar os serviços manualmente
pm2 startup
# Executar o comando que aparecer

pm2 save
```

### Arquivo de Configuração PM2 (Opcional)
```bash
nano /root/ecosystem.config.js
```

**Conteúdo:**
```javascript
module.exports = {
  apps: [{
    name: 'site-backend',
    script: '/root/Construmega-Site/backend/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }, {
    name: 'site-frontend',
    script: 'npm',
    args: 'run serve',
    cwd: '/root/Construmega-Site/frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

---

## 📊 Logs e Troubleshooting

### Verificar Logs
```bash
# Logs do PM2
pm2 logs

# Logs específicos
pm2 logs site-backend
pm2 logs site-frontend

# Logs de atualização
tail -f /root/atualizacao.log

# Logs de saúde
tail -f /root/saude.log
```

### Comandos Úteis para Manutenção
```bash
# Reiniciar tudo
pm2 restart all

# Ver status detalhado
pm2 show site-backend

# Monitor em tempo real
pm2 monit

# Limpar logs antigos
pm2 flush
```

---

## 🚨 Plano de Recuperação de Desastre

### Backup de Emergência
```bash
# Criar backup manual
tar -czf /root/backup-emergencia-$(date +%Y%m%d).tar.gz -C /root Construmega-Site

# Restaurar backup
cd /root
tar -xzf backup-emergencia-20240108.tar.gz
cd Construmega-Site
npm install
npm run build
pm2 restart all
```

### Reset Completo do Sistema
```bash
# Parar tudo
pm2 kill

# Limpar PM2
pm2 delete all

# Reinstalar
cd /root/Construmega-Site
rm -rf node_modules package-lock.json
npm install
cd frontend && rm -rf node_modules package-lock.json && npm install && npm run build && cd ..

# Reiniciar
pm2 start ecosystem.config.js
```

---

## 📈 Otimização de Performance

### Configurar Nginx (se usado)
```bash
dnf install -y nginx

nano /etc/nginx/conf.d/construmega.conf
```

**Conteúdo:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
nginx -t
systemctl enable nginx
systemctl start nginx
```

---

## ✅ Checklist de Verificação Final

- [ ] Script de atualização funcionando
- [ ] Cron jobs configurados
- [ ] Backup automático ativo
- [ ] Monitoramento de saúde ativo
- [ ] PM2 configurado para auto-restart
- [ ] Logs sendo gerados corretamente
- [ ] Teste de conectividade OK

---

## 🎯 Resultado Esperado

Com esta configuração, seu sistema terá:
- ✅ **Atualização automática** todos os dias às 2:00 AM
- ✅ **Backup semanal** automático
- ✅ **Monitoramento contínuo** da saúde
- ✅ **Auto-recuperação** em caso de falhas
- ✅ **Logs detalhados** para troubleshooting
- ✅ **Performance otimizada** com Nginx

O site ficará **100% automático** e sempre atualizado! 🚀

---

*Guia criado para AlmaLinux 9.7 - Janeiro 2026*