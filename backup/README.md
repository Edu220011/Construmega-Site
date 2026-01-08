# 🔄 Sistema de Backup Automático para GitHub

## 📋 Visão Geral
Sistema que faz backup automático dos dados do projeto para o repositório dedicado **Construmega-Backup** no GitHub.

**🔗 Repositório Principal:** https://github.com/Edu220011/Construmega-Site
**🔗 Repositório de Backup:** https://github.com/Edu220011/Construmega-Backup

**Dois métodos de backup disponíveis:**
1. **backup-auto.sh / backup-auto.bat** - Backup do projeto completo (desenvolvimento)
2. **backup-para-repo.sh / backup-para-repo.bat** - Backup organizado para repositório dedicado (VPS)

---

## 🎯 Método 1: Backup do Projeto Completo (Desenvolvimento)

### Para Linux/VPS

```bash
# Navegar até a pasta de backup
cd backup

# Tornar o script executável
chmod +x backup-auto.sh

# Executar manualmente
./backup-auto.sh
```

**Arquivos incluídos:**
- ✅ Todos os arquivos do projeto
- ✅ `backend/usuarios.json`
- ✅ `backend/pedidos.json`
- ✅ `backend/produtos.json`
- ✅ `backend/configuracoes.json`

### Para Windows

```cmd
cd backup
backup-auto.bat
```

---

## 🎯 Método 2: Backup Organizado para Repositório Dedicado (Recomendado para VPS)

Este método envia backups organizados para o repositório **Construmega-Backup**.

### 🐧 Configuração na VPS

#### 1️⃣ Preparar Scripts

```bash
# Navegar até a pasta de backup
cd /root/Construmega-Site/backup

# Tornar o script executável
chmod +x backup-para-repo.sh

# Testar o script
./backup-para-repo.sh
```

#### 2️⃣ Configurar Credenciais Git (Importante!)

Para evitar pedir senha a cada push:

```bash
# Opção 1: SSH (Recomendado)
# Gerar chave SSH
ssh-keygen -t ed25519 -C "seu-email@example.com"

# Copiar a chave pública
cat ~/.ssh/id_ed25519.pub

# Adicionar no GitHub:
# GitHub → Settings → SSH and GPG keys → New SSH key
```

**OU**

```bash
# Opção 2: Token de Acesso Pessoal
# 1. GitHub → Settings → Developer settings → Personal access tokens → Generate new token
# 2. Dar permissão de "repo"
# 3. Copiar o token

# Configurar credenciais com token
git config --global credential.helper store
git remote set-url origin https://SEU_USUARIO:SEU_TOKEN@github.com/usuario/repo.git
```

#### 3️⃣ Configurar Cron Job para Backup Automático

```bash
# Abrir editor de cron
crontab -e

# Adicionar linha para backup a cada 30 minutos
*/30 * * * * /root/Construmega-Site/backup/backup-para-repo.sh >> /var/log/backup-construmega.log 2>&1

# OU para backup a cada hora
0 * * * * /root/Construmega-Site/backup/backup-para-repo.sh >> /var/log/backup-construmega.log 2>&1
```

#### 4️⃣ Verificar Logs

```bash
# Ver últimos backups
tail -f /var/log/backup-construmega.log

# Ver todos os backups do dia
grep "$(date '+%Y-%m-%d')" /var/log/backup-construmega.log
```

---

## 🪟 Windows (Backup para Repositório Dedicado)

### 1️⃣ Executar Manualmente

```cmd
cd "C:\Users\Eduardo Antonio\Desktop\site 1.3\site 1.4\backup"
backup-para-repo.bat
```

### 2️⃣ Configurar Tarefa Agendada (Opcional)

1. **Abrir "Agendador de Tarefas"** (Task Scheduler)
2. Criar Nova Tarefa:
   - Nome: `Backup Construmega para Repositório Dedicado`
   - Descrição: `Backup a cada 30 minutos para Construmega-Backup`

3. **Aba "Gatilhos"**:
   - Novo → Repetir tarefa a cada: **30 minutos**
   - Por um período de: **Indefinidamente**

4. **Aba "Ações"**:
   - Programa: `C:\Windows\System32\cmd.exe`
   - Argumentos: `/c "C:\Users\Eduardo Antonio\Desktop\site 1.3\site 1.4\backup\backup-para-repo.bat"`

5. **Aba "Condições"**:
   - Desmarcar "Iniciar somente se o computador estiver usando energia CA"

---

## 📊 Estrutura do Repositório de Backup

O repositório **Construmega-Backup** terá esta estrutura:

```
Construmega-Backup/
├── dados/
│   ├── usuarios/
│   │   ├── usuarios-latest.json       # Último backup
│   │   └── usuarios-2026-01-08_*.json # Backups com timestamp
│   ├── pedidos/
│   │   ├── pedidos-latest.json
│   │   └── pedidos-2026-01-08_*.json
│   ├── produtos/
│   │   ├── produtos-latest.json
│   │   └── produtos-2026-01-08_*.json
│   └── configuracoes/
│       ├── configuracoes-latest.json
│       ├── configproduto-latest.json
│       └── perfis-latest.json
├── database/
│   ├── database-latest.sqlite
│   └── database-2026-01-08_*.sqlite
├── logs/
│   └── *.log (últimos 7 dias)
└── backup-info.txt                    # Informações do último backup
```

**Limpeza Automática:**
- Backups com timestamp são mantidos por 7 dias
- Arquivos `-latest` são sempre atualizados

---

## ⚙️ Personalização

### Alterar Frequência do Backup

**Linux (cron):**
```bash
# A cada 15 minutos
*/15 * * * * /root/Construmega-Site/backup/backup-para-repo.sh

# A cada 1 hora
0 * * * * /root/Construmega-Site/backup/backup-para-repo.sh

# A cada 2 horas
0 */2 * * * /root/Construmega-Site/backup/backup-para-repo.sh

# Diariamente às 2h da manhã
0 2 * * * /root/Construmega-Site/backup/backup-para-repo.sh
```

**Windows:**
- Editar a tarefa no Agendador
- Alterar intervalo de repetição

---

## 🔍 Verificação e Recuperação

### Verificar Último Backup

```bash
# Ver informações do último backup
cat /root/Construmega-Backup/backup-info.txt

# Ver commits recentes
cd /root/Construmega-Backup
git log --oneline -10
```

### Recuperar Dados do Backup

```bash
# 1. Clonar repositório de backup
git clone https://github.com/Edu220011/Construmega-Backup.git

# 2. Copiar arquivos necessários
cp Construmega-Backup/dados/usuarios/usuarios-latest.json /root/Construmega-Site/backend/
cp Construmega-Backup/dados/pedidos/pedidos-latest.json /root/Construmega-Site/backend/
cp Construmega-Backup/dados/produtos/produtos-latest.json /root/Construmega-Site/backend/

# 3. Reiniciar serviços
pm2 restart all
```

---

## 🚨 Solução de Problemas

### Erro: "Permission denied"
```bash
chmod +x backup-para-repo.sh
```

### Erro: "Git not found"
```bash
# Linux
dnf install git -y  # AlmaLinux/RHEL
# ou
apt install git -y  # Ubuntu/Debian

# Windows
# Baixar e instalar Git: https://git-scm.com/download/win
```

### Erro ao fazer push
```bash
# Verificar credenciais
git config --global credential.helper store

# Ou configurar SSH
ssh-keygen -t ed25519 -C "seu-email@example.com"
cat ~/.ssh/id_ed25519.pub  # Adicionar no GitHub
```

### Limpar espaço em disco
```bash
# Remover backups muito antigos
cd /root/Construmega-Backup
find dados -name "*-20*.json" -mtime +30 -delete
find database -name "database-20*.sqlite" -mtime +30 -delete
```

---

## 📚 Documentação Adicional

- [GUIA-BACKUP-GITHUB.md](../GUIA-BACKUP-GITHUB.md) - Guia completo de backup
- [GUIA-VPS-AUTOMATICO.md](../GUIA-VPS-AUTOMATICO.md) - Atualização automática da VPS
- [GUIA-VPS-MANUAL.md](../GUIA-VPS-MANUAL.md) - Deploy manual na VPS

# Node modules
node_modules/

# Build
build/
dist/

# Dados sensíveis (NÃO adicionar os JSON de dados!)
.env
```

**⚠️ NÃO adicione ao .gitignore:**
- ❌ `usuarios.json`
- ❌ `pedidos.json`
- ❌ `produtos.json`
- ❌ `configuracoes.json`

Esses arquivos DEVEM ser versionados para backup!

---

## 🔍 Testar o Sistema

### Linux:
```bash
# Navegar até a pasta
cd backup

# Executar manualmente
./backup-auto.sh

# Verificar se funcionou
cd ..
git log --oneline -5
```

### Windows:
```cmd
REM Navegar até a pasta
cd backup

REM Executar manualmente
backup-auto.bat

REM Verificar logs
cd ..
git log --oneline -5
```

---

## 📊 Monitoramento

### Ver histórico de backups:
```bash
git log --grep="Backup automático" --oneline
```

### Estatísticas:
```bash
# Total de backups automáticos
git log --grep="Backup automático" --oneline | wc -l

# Backups de hoje
git log --since="today" --grep="Backup automático" --oneline
```

---

## ⚠️ Avisos Importantes

1. **Tamanho do Repositório**: Backups frequentes aumentam o histórico. Considere fazer squash commits periodicamente.

2. **Arquivos Grandes**: GitHub tem limite de 100MB por arquivo. Use `.gitignore` para excluir arquivos grandes.

3. **Dados Sensíveis**: NUNCA faça commit de senhas, tokens ou dados sensíveis. Use `.env` e adicione ao `.gitignore`.

4. **Conflitos**: Se trabalhar em múltiplos locais, pode haver conflitos. Sempre faça `git pull` antes de trabalhar.

---

## 🛠️ Troubleshooting

### Erro: "Permission denied"
```bash
chmod +x backup-auto.sh
```

### Erro: "Could not resolve host"
```bash
# Verificar conexão com internet
ping github.com
```

### Erro: "Authentication failed"
```bash
# Reconfigurar credenciais
git config --global --unset credential.helper
git config --global credential.helper store
```

### Cron não está executando
```bash
# Verificar se cron está rodando
sudo service cron status

# Reiniciar cron
sudo service cron restart

# Ver logs do cron
grep CRON /var/log/syslog
```

---

## 📝 Exemplo de Uso na VPS

```bash
# 1. Fazer SSH na VPS
ssh root@seu-servidor.com

# 2. Navegar até o projeto
cd /root/site

# 3. Entrar na pasta de backup
cd backup

# 4. Tornar script executável
chmod +x backup-auto.sh

# 5. Testar manualmente
./backup-auto.sh

# 6. Configurar cron
crontab -e
# Adicionar: */30 * * * * /root/site/backup/backup-auto.sh >> /var/log/backup-git.log 2>&1

# 7. Verificar se foi agendado
crontab -l

# 8. Aguardar 30 minutos e verificar log
tail -f /var/log/backup-git.log
```

---

## ✅ Checklist de Configuração

- [ ] Scripts de backup na pasta `backup/`
- [ ] Script executável (Linux): `chmod +x backup-auto.sh`
- [ ] Credenciais Git configuradas (SSH ou Token)
- [ ] Cron job ou tarefa agendada configurada
- [ ] Teste manual executado com sucesso
- [ ] `.gitignore` configurado para excluir arquivos desnecessários
- [ ] Logs de backup sendo gerados
- [ ] Verificado primeiro backup automático

---

## 🎯 Resultado Esperado

Após configuração, você terá:
- ✅ Backup automático a cada 30 minutos
- ✅ Commits com timestamp no GitHub
- ✅ Logs de todas as operações
- ✅ Proteção contra perda de dados
- ✅ Histórico completo de mudanças
- ✅ Scripts organizados na pasta `backup/`

---

## 📁 Estrutura de Arquivos

```
projeto/
├── backup/
│   ├── backup-auto.sh      # Script Linux/VPS
│   ├── backup-auto.bat     # Script Windows
│   └── README.md           # Esta documentação
├── backend/
│   ├── usuarios.json       # ✅ Incluído no backup
│   ├── pedidos.json        # ✅ Incluído no backup
│   ├── produtos.json       # ✅ Incluído no backup
│   └── configuracoes.json  # ✅ Incluído no backup
└── frontend/
    └── ...
```

---

## 📞 Suporte

Se encontrar problemas, verifique:
1. Logs de erro (`/var/log/backup-git.log`)
2. Status do cron (`crontab -l`)
3. Permissões do script (`ls -la backup-auto.sh`)
4. Conectividade com GitHub (`ping github.com`)
5. Caminho correto no cron job
