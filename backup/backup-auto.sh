#!/bin/bash

# Script de Backup Automático para GitHub
# Executa commit e push a cada 30 minutos

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Diretório do projeto (um nível acima da pasta backup)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR" || exit 1

echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando backup automático...${NC}"

# Adicionar arquivos críticos do backend explicitamente
echo -e "${YELLOW}→ Adicionando arquivos de dados...${NC}"
git add backend/usuarios.json 2>/dev/null
git add backend/pedidos.json 2>/dev/null
git add backend/produtos.json 2>/dev/null
git add backend/configuracoes.json 2>/dev/null

# Adicionar todos os outros arquivos modificados
git add .

# Verificar se há mudanças
if [ -z "$(git status --porcelain)" ]; then 
  echo -e "${GREEN}✓ Nenhuma mudança detectada. Backup não necessário.${NC}"
  exit 0
fi

# Criar mensagem de commit com timestamp
COMMIT_MSG="🔄 Backup automático - $(date '+%Y-%m-%d %H:%M:%S')"

# Fazer commit
if git commit -m "$COMMIT_MSG"; then
  echo -e "${GREEN}✓ Commit realizado com sucesso${NC}"
  
  # Push para GitHub
  if git push origin main; then
    echo -e "${GREEN}✓ Backup enviado para GitHub com sucesso!${NC}"
  else
    echo -e "${RED}✗ Erro ao enviar para GitHub${NC}"
    exit 1
  fi
else
  echo -e "${RED}✗ Erro ao fazer commit${NC}"
  exit 1
fi

echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] Backup concluído!${NC}"
