#!/bin/bash

# Script de Backup Automático para Repositório Dedicado
# Envia backups para https://github.com/Edu220011/Construmega-Backup.git

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
BACKUP_REPO_DIR="/root/Construmega-Backup"
PROJECT_DIR="/root/Construmega-Site"
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔄 Backup Automático - Construmega${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}⏰ $(date '+%Y-%m-%d %H:%M:%S')${NC}\n"

# Verificar se o diretório de backup existe
if [ ! -d "$BACKUP_REPO_DIR" ]; then
  echo -e "${YELLOW}📁 Criando diretório de backup...${NC}"
  mkdir -p "$BACKUP_REPO_DIR"
  cd "$BACKUP_REPO_DIR"
  
  echo -e "${YELLOW}📥 Clonando repositório de backup...${NC}"
  git clone https://github.com/Edu220011/Construmega-Backup.git .
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao clonar repositório de backup${NC}"
    exit 1
  fi
fi

cd "$BACKUP_REPO_DIR"

# Criar estrutura de pastas se não existir
mkdir -p dados/{usuarios,pedidos,produtos,configuracoes}
mkdir -p logs
mkdir -p database

echo -e "${YELLOW}📦 Copiando arquivos de dados...${NC}"

# Copiar arquivos JSON do backend
if [ -f "$PROJECT_DIR/backend/usuarios.json" ]; then
  cp "$PROJECT_DIR/backend/usuarios.json" dados/usuarios/usuarios-$TIMESTAMP.json
  cp "$PROJECT_DIR/backend/usuarios.json" dados/usuarios/usuarios-latest.json
  echo -e "${GREEN}  ✓ usuarios.json${NC}"
fi

if [ -f "$PROJECT_DIR/backend/pedidos.json" ]; then
  cp "$PROJECT_DIR/backend/pedidos.json" dados/pedidos/pedidos-$TIMESTAMP.json
  cp "$PROJECT_DIR/backend/pedidos.json" dados/pedidos/pedidos-latest.json
  echo -e "${GREEN}  ✓ pedidos.json${NC}"
fi

if [ -f "$PROJECT_DIR/backend/produtos.json" ]; then
  cp "$PROJECT_DIR/backend/produtos.json" dados/produtos/produtos-$TIMESTAMP.json
  cp "$PROJECT_DIR/backend/produtos.json" dados/produtos/produtos-latest.json
  echo -e "${GREEN}  ✓ produtos.json${NC}"
fi

if [ -f "$PROJECT_DIR/backend/configuracoes.json" ]; then
  cp "$PROJECT_DIR/backend/configuracoes.json" dados/configuracoes/configuracoes-$TIMESTAMP.json
  cp "$PROJECT_DIR/backend/configuracoes.json" dados/configuracoes/configuracoes-latest.json
  echo -e "${GREEN}  ✓ configuracoes.json${NC}"
fi

# Copiar outros arquivos importantes
if [ -f "$PROJECT_DIR/backend/configproduto.json" ]; then
  cp "$PROJECT_DIR/backend/configproduto.json" dados/configuracoes/configproduto-latest.json
fi

if [ -f "$PROJECT_DIR/backend/perfis.json" ]; then
  cp "$PROJECT_DIR/backend/perfis.json" dados/configuracoes/perfis-latest.json
fi

if [ -f "$PROJECT_DIR/backend/pontos.json" ]; then
  cp "$PROJECT_DIR/backend/pontos.json" dados/configuracoes/pontos-latest.json
fi

# Copiar banco de dados SQLite se existir
if [ -f "$PROJECT_DIR/backend/database.sqlite" ]; then
  cp "$PROJECT_DIR/backend/database.sqlite" database/database-$TIMESTAMP.sqlite
  cp "$PROJECT_DIR/backend/database.sqlite" database/database-latest.sqlite
  echo -e "${GREEN}  ✓ database.sqlite${NC}"
fi

# Copiar logs recentes (últimos 7 dias)
if [ -d "$PROJECT_DIR/backend/logs" ]; then
  find "$PROJECT_DIR/backend/logs" -name "*.log" -mtime -7 -exec cp {} logs/ \;
  echo -e "${GREEN}  ✓ logs recentes${NC}"
fi

# Criar arquivo de informações do backup
cat > backup-info.txt << EOF
🔄 Backup Automático - Construmega
===================================
Data/Hora: $(date '+%Y-%m-%d %H:%M:%S')
Servidor: $(hostname)
Usuário: $(whoami)

📊 Arquivos Incluídos:
- Usuários (usuarios.json)
- Pedidos (pedidos.json)
- Produtos (produtos.json)
- Configurações (configuracoes.json)
- Banco de Dados SQLite
- Logs (últimos 7 dias)

🔗 Repositório Origem: https://github.com/Edu220011/Construmega-Site
🔗 Repositório Backup: https://github.com/Edu220011/Construmega-Backup
EOF

echo -e "\n${YELLOW}📝 Commitando alterações...${NC}"

# Adicionar todos os arquivos
git add .

# Verificar se há mudanças
if [ -z "$(git status --porcelain)" ]; then 
  echo -e "${GREEN}✓ Nenhuma mudança detectada. Backup já atualizado.${NC}"
  exit 0
fi

# Criar commit
COMMIT_MSG="🔄 Backup automático - $(date '+%Y-%m-%d %H:%M:%S')"

if git commit -m "$COMMIT_MSG"; then
  echo -e "${GREEN}✓ Commit realizado com sucesso${NC}"
  
  # Push para GitHub
  echo -e "${YELLOW}📤 Enviando para GitHub...${NC}"
  if git push origin main 2>&1; then
    echo -e "${GREEN}✅ Backup enviado com sucesso!${NC}"
    
    # Limpar backups antigos (manter apenas últimos 7 dias de backups com timestamp)
    echo -e "${YELLOW}🧹 Limpando backups antigos...${NC}"
    find dados/usuarios -name "usuarios-20*.json" -mtime +7 -delete 2>/dev/null
    find dados/pedidos -name "pedidos-20*.json" -mtime +7 -delete 2>/dev/null
    find dados/produtos -name "produtos-20*.json" -mtime +7 -delete 2>/dev/null
    find dados/configuracoes -name "*.json" -mtime +7 ! -name "*-latest.json" -delete 2>/dev/null
    find database -name "database-*.sqlite" -mtime +7 ! -name "*-latest.sqlite" -delete 2>/dev/null
    
  else
    echo -e "${RED}❌ Erro ao enviar para GitHub${NC}"
    exit 1
  fi
else
  echo -e "${RED}❌ Erro ao fazer commit${NC}"
  exit 1
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Backup concluído com sucesso!${NC}"
echo -e "${BLUE}========================================${NC}"
