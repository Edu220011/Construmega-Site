#!/bin/bash
# 🔧 Script de Teste - Verificar se correções de domínio funcionaram

echo "============================================"
echo "🔍 TESTE DE CONFIGURAÇÃO - construmega.online"
echo "============================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Array para guardar resultados
TESTS_PASSED=0
TESTS_FAILED=0

# Função para testar
test_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ $2${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}❌ $2${NC}"
    ((TESTS_FAILED++))
  fi
}

# Test 1: Verificar se backend.env existe
echo "📋 TEST 1: Verificando arquivo backend/.env..."
if [ -f "backend/.env" ]; then
  test_result 0 "Arquivo backend/.env encontrado"
else
  test_result 1 "Arquivo backend/.env NÃO encontrado"
fi

# Test 2: Verificar se frontend.env existe
echo ""
echo "📋 TEST 2: Verificando arquivo frontend/.env..."
if [ -f "frontend/.env" ]; then
  test_result 0 "Arquivo frontend/.env encontrado"
else
  test_result 1 "Arquivo frontend/.env NÃO encontrado"
fi

# Test 3: Verificar FRONTEND_URL no .env do backend
echo ""
echo "📋 TEST 3: Verificando FRONTEND_URL no backend/.env..."
if grep -q "FRONTEND_URL=https://construmega.online" backend/.env; then
  test_result 0 "FRONTEND_URL corretamente configurado"
else
  test_result 1 "FRONTEND_URL não está configurado corretamente"
  echo "   Encontrado:"
  grep "FRONTEND_URL" backend/.env || echo "   (não encontrado)"
fi

# Test 4: Verificar BACKEND_URL no .env do backend
echo ""
echo "📋 TEST 4: Verificando BACKEND_URL no backend/.env..."
if grep -q "BACKEND_URL=https://construmega.online/api" backend/.env; then
  test_result 0 "BACKEND_URL corretamente configurado"
else
  test_result 1 "BACKEND_URL não está configurado corretamente"
  echo "   Encontrado:"
  grep "BACKEND_URL" backend/.env || echo "   (não encontrado)"
fi

# Test 5: Verificar REACT_APP_API_URL no .env do frontend
echo ""
echo "📋 TEST 5: Verificando REACT_APP_API_URL no frontend/.env..."
if grep -q "REACT_APP_API_URL=https://construmega.online/api" frontend/.env; then
  test_result 0 "REACT_APP_API_URL corretamente configurado"
else
  test_result 1 "REACT_APP_API_URL não está configurado corretamente"
  echo "   Encontrado:"
  grep "REACT_APP_API_URL" frontend/.env || echo "   (não encontrado)"
fi

# Test 6: Verificar se construmega.online está no CORS do backend
echo ""
echo "📋 TEST 6: Verificando domínio construmega.online no CORS..."
if grep -q "construmega.online" backend/index.js; then
  test_result 0 "Domínio construmega.online encontrado no CORS"
else
  test_result 1 "Domínio construmega.online NÃO encontrado no CORS"
fi

# Test 7: Verificar se há múltiplas variações do domínio
echo ""
echo "📋 TEST 7: Verificando variações do domínio (www, http, https)..."
DOMAIN_COUNT=$(grep -c "construmega.online" backend/index.js)
if [ $DOMAIN_COUNT -ge 4 ]; then
  test_result 0 "Encontradas $DOMAIN_COUNT variações do domínio (OK)"
else
  test_result 1 "Encontradas apenas $DOMAIN_COUNT variações (esperado >= 4)"
fi

# Test 8: Verificar NODE_ENV
echo ""
echo "📋 TEST 8: Verificando NODE_ENV no backend/.env..."
if grep -q "NODE_ENV=production" backend/.env; then
  test_result 0 "NODE_ENV configurado como production"
else
  test_result 1 "NODE_ENV não está configurado como production"
  echo "   Encontrado:"
  grep "NODE_ENV" backend/.env || echo "   (não encontrado)"
fi

# Test 9: Verificar PORT
echo ""
echo "📋 TEST 9: Verificando PORT no backend/.env..."
if grep -q "PORT=3001" backend/.env; then
  test_result 0 "PORT corretamente configurado como 3001"
else
  test_result 1 "PORT não está corretamente configurado"
  echo "   Encontrado:"
  grep "PORT" backend/.env || echo "   (não encontrado)"
fi

# Test 10: Verificar se npm packages estão instalados
echo ""
echo "📋 TEST 10: Verificando dependências do backend..."
if [ -d "backend/node_modules" ]; then
  test_result 0 "Dependências do backend instaladas"
else
  test_result 1 "Dependências do backend NÃO instaladas (execute: cd backend && npm install)"
fi

echo ""
echo "============================================"
echo "📊 RESULTADO FINAL"
echo "============================================"
echo -e "✅ Testes aprovados: ${GREEN}$TESTS_PASSED${NC}"
echo -e "❌ Testes falhados:  ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 TUDO CONFIGURADO CORRETAMENTE!${NC}"
  echo ""
  echo "Próximos passos:"
  echo "1. Fazer rebuild do frontend: cd frontend && npm run build"
  echo "2. Reiniciar PM2: pm2 restart all"
  echo "3. Testar em: https://construmega.online"
  exit 0
else
  echo -e "${RED}⚠️ PROBLEMAS ENCONTRADOS - Revise as configurações acima${NC}"
  exit 1
fi
