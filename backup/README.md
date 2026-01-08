# 🔄 Sistema de Backup Automático para GitHub

## 📋 Visão Geral
Sistema que faz backup automático do projeto no GitHub a cada 30 minutos quando a VPS estiver rodando.

**Arquivos de Dados Críticos Incluídos:**
- ✅ `backend/usuarios.json` - Dados de usuários
- ✅ `backend/pedidos.json` - Histórico de pedidos
- ✅ `backend/produtos.json` - Catálogo de produtos
- ✅ `backend/configuracoes.json` - Configurações do sistema

---

## 🐧 Linux/VPS (Recomendado)

### 1️⃣ Preparar o Script

```bash
# Navegar até a pasta de backup
cd backup

# Tornar o script executável
chmod +x backup-auto.sh

# O script já detecta automaticamente o diretório do projeto!
```

### 2️⃣ Configurar Credenciais Git (Importante!)

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

### 3️⃣ Configurar Cron Job

```bash
# Abrir editor de cron
crontab -e

# Adicionar linha para executar a cada 30 minutos
*/30 * * * * /caminho/completo/para/backup/backup-auto.sh >> /var/log/backup-git.log 2>&1

# Exemplo real (ajuste o caminho):
# */30 * * * * /root/site/backup/backup-auto.sh >> /var/log/backup-git.log 2>&1
```

### 4️⃣ Verificar Logs

```bash
# Ver últimos backups
tail -f /var/log/backup-git.log

# Ver todos os backups do dia
grep "$(date '+%Y-%m-%d')" /var/log/backup-git.log
```

---

## 🪟 Windows (Desenvolvimento Local)

### 1️⃣ Configurar Tarefa Agendada

1. **Abrir "Agendador de Tarefas"** (Task Scheduler)
2. Criar Nova Tarefa:
   - Nome: `Backup GitHub Automático`
   - Descrição: `Backup a cada 30 minutos`

3. **Aba "Gatilhos"**:
   - Novo → Repetir tarefa a cada: **30 minutos**
   - Por um período de: **Indefinidamente**

4. **Aba "Ações"**:
   - Programa: `C:\Windows\System32\cmd.exe`
   - Argumentos: `/c "c:\Users\Eduardo Antonio\Desktop\site 1.3\site 1.4\backup\backup-auto.bat"`

5. **Aba "Condições"**:
   - Desmarcar "Iniciar somente se o computador estiver usando energia CA"

### 2️⃣ Configurar Credenciais

```cmd
REM Abrir Git Bash e executar:
git config --global credential.helper wincred

REM Ou usar token (mesmo processo do Linux)
```

---

## ⚙️ Personalização

### Alterar Frequência do Backup

**Linux (cron):**
```bash
# A cada 15 minutos
*/15 * * * * /caminho/backup/backup-auto.sh

# A cada 1 hora
0 * * * * /caminho/backup/backup-auto.sh

# A cada 2 horas
0 */2 * * * /caminho/backup/backup-auto.sh
```

**Windows:**
- Editar a tarefa no Agendador
- Alterar intervalo de repetição

### Excluir Arquivos do Backup

**IMPORTANTE:** Os arquivos JSON de dados NÃO devem estar no `.gitignore`.

Adicione apenas arquivos temporários:
```
# Arquivos temporários
*.tmp
*.cache
nul

# Logs
debug.txt
*.log

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
