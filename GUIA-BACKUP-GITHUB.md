# 🔄 Guia: Backup Automático da VPS para GitHub

## 📋 Visão Geral
Este guia configura um sistema de **backup automático** dos dados da VPS para um repositório dedicado no GitHub, garantindo segurança e recuperação rápida em caso de problemas.

## 🏗️ Passo 1: Criar Repositório de Backup no GitHub

### 1.1 Criar Novo Repositório
1. Acesse https://github.com
2. Clique em "New repository"
3. Nome: `Construmega-Backup`
4. **IMPORTANTE:** Deixe como **privado** (Private)
5. Não inicialize com README, .gitignore ou license
6. Clique "Create repository"

### 1.2 Configurar SSH (Recomendado)
```bash
# Na VPS, gerar chave SSH se não existir
ssh-keygen -t ed25519 -C "backup@construmega.com" -f ~/.ssh/id_backup -N ""

# Adicionar ao SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_backup

# Copiar chave pública
cat ~/.ssh/id_backup.pub
```

### 1.3 Adicionar Chave SSH ao GitHub
1. No GitHub, vá para Settings → SSH and GPG keys
2. Clique "New SSH key"
3. Title: "VPS Backup Key"
4. Cole a chave pública
5. Salve

---

## ⚙️ Passo 2: Configuração Inicial na VPS

### 2.1 Instalar Git e Configurar
```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Git se necessário
apt install git -y

# Configurar Git (usar seu email do GitHub)
git config --global user.name "Construmega Backup"
git config --global user.email "backup@construmega.com"
```

### 2.2 Criar Diretório de Backup
```bash
# Criar diretório para o repositório de backup
mkdir -p /root/backup-repo
cd /root/backup-repo

# Clonar repositório (usar SSH)
git clone git@github.com:Edu220011/Construmega-Backup.git .
```

### 2.3 Criar Estrutura de Backup
```bash
# Criar estrutura de pastas
mkdir -p dados json logs configuracao

# Criar .gitignore para proteger dados sensíveis
nano .gitignore
```

**Conteúdo do .gitignore:**
```
# Dados temporários
temp/
*.tmp

# Logs não essenciais
logs/debug.log
logs/old-*.log

# Arquivos de sistema
.DS_Store
Thumbs.db

# Backup local (não subir duplicado)
*.bak
```

---

## 📦 Passo 3: Scripts de Backup

### 3.1 Script Principal de Backup
```bash
nano /root/backup-para-github.sh
```

**Conteúdo do script:**
```bash
#!/bin/bash

# Script de backup automático para GitHub
# Versão: 1.0 - Janeiro 2026

echo "🔄 Iniciando backup para GitHub - $(date)"

# Variáveis
SITE_DIR="/root/Construmega-Site"
BACKUP_DIR="/root/backup-repo"
DATA=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/root/backup-github.log"

# Função de log
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Verificar se diretório do site existe
if [ ! -d "$SITE_DIR" ]; then
    log "❌ ERRO: Diretório do site não encontrado: $SITE_DIR"
    exit 1
fi

cd $BACKUP_DIR

# Backup dos dados JSON
log "📄 Copiando arquivos JSON..."
cp $SITE_DIR/backend/*.json dados/ 2>/dev/null || log "⚠️ Aviso: Alguns arquivos JSON não encontrados"

# Backup do banco de dados
log "🗄️ Copiando banco de dados..."
cp $SITE_DIR/backend/database.sqlite dados/database-$DATA.sqlite 2>/dev/null || log "⚠️ Aviso: Banco não encontrado"

# Backup das configurações
log "⚙️ Copiando configurações..."
cp $SITE_DIR/backend/.env configuracao/ 2>/dev/null || log "⚠️ Aviso: .env não encontrado"
cp $SITE_DIR/backend/config*.json configuracao/ 2>/dev/null

# Backup dos logs importantes (últimos 7 dias)
log "📋 Copiando logs recentes..."
find $SITE_DIR/backend/logs -name "*.log" -mtime -7 -exec cp {} logs/ \; 2>/dev/null

# Criar arquivo de metadados
log "📝 Criando metadados..."
cat > metadados.txt << EOF
Backup automático do Construmega Site
Data: $(date)
Servidor: $(hostname)
Versão do backup: 1.0
Arquivos incluídos:
- Dados JSON do backend
- Banco de dados SQLite
- Configurações
- Logs dos últimos 7 dias
EOF

# Verificar mudanças
if git diff --quiet && git diff --staged --quiet; then
    log "ℹ️ Nenhuma mudança detectada. Backup cancelado."
    exit 0
fi

# Adicionar arquivos
log "➕ Adicionando arquivos ao Git..."
git add .

# Commit
COMMIT_MSG="Backup automático - $DATA"
log "💾 Fazendo commit: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

# Push para GitHub
log "⬆️ Enviando para GitHub..."
if git push origin main 2>&1; then
    log "✅ Backup enviado com sucesso para GitHub!"
else
    log "❌ ERRO: Falha ao enviar para GitHub"
    exit 1
fi

# Limpeza: manter apenas últimos 10 commits locais
log "🧹 Limpando commits antigos..."
git branch -D $(git branch | grep -v main) 2>/dev/null || true

log "🎉 Backup concluído com sucesso!"
echo "----------------------------------------"
```

### 3.2 Script de Backup de Emergência
```bash
nano /root/backup-emergencia.sh
```

**Conteúdo:**
```bash
#!/bin/bash

# Backup de emergência completo
echo "🚨 Backup de emergência - $(date)"

BACKUP_DIR="/root/backup-repo"
SITE_DIR="/root/Construmega-Site"
DATA=$(date +%Y%m%d_%H%M%S)

cd $BACKUP_DIR

# Backup completo de todos os dados
echo "📦 Criando backup completo..."
tar -czf backup-emergencia-$DATA.tar.gz -C /root Construmega-Site/backend/*.json Construmega-Site/backend/database.sqlite

# Adicionar e enviar
git add .
git commit -m "EMERGÊNCIA: Backup completo - $DATA"
git push origin main

echo "✅ Backup de emergência concluído!"
```

### 3.3 Script de Restauração
```bash
nano /root/restaurar-do-github.sh
```

**Conteúdo:**
```bash
#!/bin/bash

# Script de restauração do GitHub
echo "🔄 Iniciando restauração do GitHub - $(date)"

BACKUP_DIR="/root/backup-repo"
SITE_DIR="/root/Construmega-Site"

cd $BACKUP_DIR

# Baixar último backup
echo "⬇️ Baixando último backup..."
git pull origin main

# Parar serviços
echo "⏹️ Parando serviços..."
pm2 stop all

# Restaurar arquivos
echo "📄 Restaurando arquivos JSON..."
cp dados/*.json $SITE_DIR/backend/

echo "🗄️ Restaurando banco de dados..."
cp dados/database-*.sqlite $SITE_DIR/backend/database.sqlite

echo "⚙️ Restaurando configurações..."
cp configuracao/* $SITE_DIR/backend/

# Reiniciar serviços
echo "▶️ Reiniciando serviços..."
pm2 restart all

echo "✅ Restauração concluída!"
```

---

## ⏰ Passo 4: Automação com Cron

### 4.1 Configurar Backup Automático
```bash
# Editar crontab
crontab -e
```

**Adicionar linhas:**
```bash
# Backup para GitHub a cada 6 horas
0 */6 * * * /root/backup-para-github.sh >> /root/backup-github.log 2>&1

# Backup completo diário às 3:00 AM
0 3 * * * /root/backup-para-github.sh full >> /root/backup-github.log 2>&1

# Limpeza semanal (domingos às 4:00 AM)
0 4 * * 0 /root/limpar-backups.sh >> /root/backup-github.log 2>&1
```

### 4.2 Script de Limpeza
```bash
nano /root/limpar-backups.sh
```

**Conteúdo:**
```bash
#!/bin/bash

# Limpeza de backups antigos no GitHub
echo "🧹 Limpando backups antigos - $(date)"

cd /root/backup-repo

# Manter apenas últimos 30 dias de backups
git log --since="30 days ago" --pretty=format:%H | tail -n +2 | xargs git branch -D 2>/dev/null || true

# Remover arquivos antigos não rastreados
find . -name "*.tar.gz" -mtime +30 -delete
find dados/ -name "database-*.sqlite" -mtime +30 -delete

echo "✅ Limpeza concluída!"
```

---

## 🔐 Passo 5: Segurança e Configuração

### 5.1 Proteger Scripts
```bash
chmod +x /root/backup-para-github.sh
chmod +x /root/backup-emergencia.sh
chmod +x /root/restaurar-do-github.sh
chmod +x /root/limpar-backups.sh
```

### 5.2 Configurar Logrotate para Logs
```bash
nano /etc/logrotate.d/backup-github
```

**Conteúdo:**
```
/root/backup-github.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
}
```

### 5.3 Teste Inicial
```bash
# Executar backup manual
/root/backup-para-github.sh

# Verificar logs
tail -f /root/backup-github.log

# Verificar no GitHub se os arquivos apareceram
```

---

## 📊 Monitoramento e Verificação

### Verificar Status do Backup
```bash
# Ver logs recentes
tail -20 /root/backup-github.log

# Ver status do repositório
cd /root/backup-repo
git status
git log --oneline -5

# Ver tamanho do backup
du -sh /root/backup-repo
```

### Dashboard de Backup
```bash
nano /root/status-backup.sh
```

**Conteúdo:**
```bash
#!/bin/bash

echo "📊 Status do Sistema de Backup"
echo "================================"

# Último backup
echo "🕒 Último backup:"
cd /root/backup-repo
git log -1 --format="%ai %s" || echo "Nenhum backup encontrado"

# Tamanho do repositório
echo "📏 Tamanho do backup:"
du -sh .

# Status do Git
echo "🔄 Status Git:"
git status --porcelain | wc -l | xargs echo " arquivos modificados"

# Espaço em disco
echo "💾 Espaço disponível:"
df -h / | tail -1 | awk '{print $4 " disponível"}'

echo "================================"
```

---

## 🚨 Recuperação de Desastre

### Cenário 1: VPS Quebrada
```bash
# Em nova VPS
git clone git@github.com:Edu220011/Construmega-Backup.git
cd Construmega-Backup

# Restaurar dados
cp dados/*.json /root/Construmega-Site/backend/
cp dados/database-*.sqlite /root/Construmega-Site/backend/database.sqlite

# Reconstruir aplicação
cd /root/Construmega-Site
npm install
cd frontend && npm install && npm run build
pm2 start ecosystem.config.js
```

### Cenário 2: Dados Corrompidos
```bash
# Restauração rápida
cd /root/backup-repo
git pull origin main
/root/restaurar-do-github.sh
```

---

## 📋 Checklist de Verificação

- [ ] Repositório GitHub criado e privado
- [ ] Chave SSH configurada
- [ ] Scripts criados e testados
- [ ] Cron jobs configurados
- [ ] Primeiro backup executado
- [ ] Logs sendo gerados
- [ ] Restauração testada

---

## 🎯 Benefícios do Sistema

✅ **Backup automático** a cada 6 horas  
✅ **Segurança máxima** com repositório privado  
✅ **Recuperação rápida** em caso de desastre  
✅ **Histórico completo** de mudanças  
✅ **Monitoramento contínuo** via logs  
✅ **Limpeza automática** de backups antigos  

---

## 💡 Dicas Avançadas

### Backup Seletivo
Para backups maiores, considere usar Git LFS para arquivos binários:
```bash
# Instalar Git LFS
apt install git-lfs
cd /root/backup-repo
git lfs install
git lfs track "*.sqlite"
```

### Notificações
Configure alertas por email quando backup falhar:
```bash
# Instalar mailutils
apt install mailutils -y

# Modificar script para enviar email em caso de erro
# Adicionar no final do script:
# echo "Backup falhou" | mail -s "ALERTA: Backup GitHub Falhou" seu-email@exemplo.com
```

---

*Sistema de backup automático para GitHub - Janeiro 2026*