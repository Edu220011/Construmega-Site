# 🛠️ Guia VPS AlmaLinux 9.7: Configuração Manual Passo a Passo

## 📋 Visão Geral
Este guia fornece instruções **detalhadas e manuais** para configurar seu site na VPS AlmaLinux 9.7. Cada passo inclui verificações e testes para garantir que tudo esteja funcionando corretamente.

---

## 🔍 **PASSO 1: Verificação Inicial do Sistema**

### 1.1 Acessar a VPS
```bash
ssh root@seu-ip-vps
```
**✅ Verificação:** Você deve ver o prompt do root na VPS.

### 1.2 Verificar Sistema Operacional
```bash
cat /etc/os-release
```
**✅ Resultado esperado:**
```
NAME="AlmaLinux"
VERSION="9.7 (Teal Serval)"
ID="almalinux"
VERSION_ID="9.7"
```

### 1.3 Verificar espaço em disco
```bash
df -h
```
**✅ Verificação:** Deve haver pelo menos 5GB de espaço livre.

### 1.4 Verificar memória RAM
```bash
free -h
```
**✅ Verificação:** Deve haver pelo menos 1GB de RAM disponível.

---

## 📦 **PASSO 2: Atualização do Sistema**

### 2.1 Atualizar pacotes do sistema
```bash
dnf update -y
```
**⏳ Tempo estimado:** 2-5 minutos
**✅ Verificação:** Comando deve terminar sem erros.

### 2.2 Verificar versão do sistema após atualização
```bash
dnf --version
```
**✅ Resultado esperado:** Versão do dnf deve aparecer.

---

## 🟢 **PASSO 3: Instalação do Node.js 18**

### 3.1 Baixar e executar o script de instalação do NodeSource
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
```
**⏳ Tempo estimado:** 30 segundos
**✅ Verificação:** Deve terminar sem erros "curl: command not found".

### 3.2 Instalar Node.js
```bash
dnf install -y nodejs
```
**⏳ Tempo estimado:** 1-2 minutos
**✅ Verificação:** Deve instalar sem erros.

### 3.3 Verificar instalação do Node.js
```bash
node --version
npm --version
```
**✅ Resultado esperado:**
```
v18.x.x
8.x.x
```

### 3.4 Testar Node.js
```bash
node -e "console.log('✅ Node.js funcionando! Versão:', process.version)"
```
**✅ Resultado esperado:** Mensagem de confirmação com versão.

---

## ⚙️ **PASSO 4: Instalação do PM2**

### 4.1 Instalar PM2 globalmente
```bash
npm install -g pm2 serve
```
**⏳ Tempo estimado:** 1-2 minutos
**✅ Verificação:** Deve instalar sem erros.

### 4.2 Verificar instalação do PM2
```bash
pm2 --version
```
**✅ Resultado esperado:** Versão do PM2 (ex: 5.x.x)

### 4.3 Testar PM2
```bash
pm2 list
```
**✅ Resultado esperado:** Tabela vazia (sem processos rodando ainda).

---

## 📚 **PASSO 5: Instalação de Utilitários Essenciais**

### 5.1 Instalar Git e ferramentas
```bash
dnf install -y git curl wget nano htop jq netcat
```
**⏳ Tempo estimado:** 1-2 minutos
**✅ Verificação:** Deve instalar sem erros.

### 5.2 Verificar instalações
```bash
git --version
curl --version | head -1
wget --version | head -1
nano --version | head -1
```
**✅ Resultado esperado:** Versões de todos os programas.

---

## 📁 **PASSO 6: Preparação do Projeto**

### 6.1 Navegar para o diretório do projeto
```bash
cd /root/Construmega-Site
```
**✅ Verificação:** Deve estar no diretório correto.

### 6.2 Verificar estrutura do projeto
```bash
ls -la
```
**✅ Resultado esperado:** Deve ver pastas `backend/`, `frontend/`, `backup/`, etc.

### 6.3 Verificar se é um repositório Git
```bash
git status
```
**✅ Resultado esperado:** Status do repositório Git.

---

## 🔧 **PASSO 7: Configuração do Backend**

### 7.1 Entrar na pasta backend
```bash
cd backend
```

### 7.2 Instalar dependências do backend
```bash
npm install
```
**⏳ Tempo estimado:** 2-5 minutos
**✅ Verificação:** Deve instalar sem erros críticos.

### 7.3 Verificar instalação das dependências
```bash
ls node_modules | head -10
```
**✅ Resultado esperado:** Deve ver várias pastas de módulos.

### 7.4 Testar se o backend inicia
```bash
timeout 10s npm start || echo "Backend testado (timeout normal)"
```
**✅ Verificação:** Deve iniciar sem erros críticos (timeout é normal).

### 7.5 Voltar para a raiz do projeto
```bash
cd ..
```

---

## 🎨 **PASSO 8: Configuração do Frontend**

### 8.1 Entrar na pasta frontend
```bash
cd frontend
```

### 8.2 Instalar dependências do frontend
```bash
npm install
```
**⏳ Tempo estimado:** 3-8 minutos
**✅ Verificação:** Deve instalar sem erros críticos.

### 8.3 Verificar dependências do frontend
```bash
ls node_modules | grep react
```
**✅ Resultado esperado:** Deve ver pastas relacionadas ao React.

### 8.4 Fazer build do frontend
```bash
npm run build
```
**⏳ Tempo estimado:** 2-5 minutos
**✅ Verificação:** Deve criar pasta `build/` sem erros.

### 8.5 Verificar build
```bash
ls -la build/
```
**✅ Resultado esperado:** Deve ver arquivos `index.html`, `static/`, etc.

### 8.6 Voltar para raiz
```bash
cd ..
```

---

## 🚀 **PASSO 9: Inicialização dos Serviços com PM2**

### 9.1 Iniciar backend com PM2
```bash
pm2 start backend/index.js --name "site-backend"
```
**✅ Verificação:** Deve iniciar sem erros.

### 9.2 Iniciar frontend com PM2
```bash
pm2 start npm --name "site-frontend" -- run serve
```
**✅ Verificação:** Deve iniciar sem erros.

### 9.3 Verificar status dos serviços
```bash
pm2 list
```
**✅ Resultado esperado:**
```
┌─────┬─────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id  │ name            │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├─────┼─────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0   │ site-backend    │ default     │ N/A     │ fork    │ 1234     │ 0s     │ 0    │ online    │ 0%       │ 50mb     │ root     │ disabled │
│ 1   │ site-frontend   │ default     │ N/A     │ fork    │ 1235     │ 0s     │ 0    │ online    │ 0%       │ 80mb     │ root     │ disabled │
```

### 9.4 Salvar configuração do PM2
```bash
pm2 save
```
**✅ Verificação:** Deve salvar sem erros.

### 9.5 Configurar PM2 para iniciar automaticamente
```bash
pm2 startup
```
**✅ Verificação:** Deve mostrar um comando para executar como root.

### 9.6 Executar o comando mostrado pelo PM2
```bash
# Execute o comando que apareceu no passo anterior
# Exemplo: systemctl enable pm2-root
```
**✅ Verificação:** Deve habilitar sem erros.

---

## 🧪 **PASSO 10: Testes de Funcionamento**

### 10.1 Testar conectividade do backend
```bash
curl -s http://localhost:3001 | head -5
```
**✅ Resultado esperado:** Deve retornar dados JSON ou HTML do backend.

### 10.2 Testar conectividade do frontend
```bash
curl -s http://localhost:8080 | head -5
```
**✅ Resultado esperado:** Deve retornar HTML do React.

### 10.3 Verificar portas abertas
```bash
netstat -tlnp | grep -E ':(3001|8080)'
```
**✅ Resultado esperado:** Deve mostrar as portas 3001 e 8080 abertas.

### 10.4 Testar endpoints específicos (se aplicável)
```bash
curl -s http://localhost:3001/api/health
```
**✅ Verificação:** Deve retornar status OK ou dados válidos.

---

## 🔄 **PASSO 11: Configuração de Atualização Manual**

### 11.1 Criar script de atualização
```bash
nano /root/atualizar-manual.sh
```

**Conteúdo do script:**
```bash
#!/bin/bash
echo "🔄 ATUALIZAÇÃO MANUAL DO SITE - $(date)"
echo "========================================"

# 1. Fazer backup
echo "📦 Fazendo backup dos dados..."
mkdir -p /root/backup-manual
cp backend/pedidos.json /root/backup-manual/pedidos-$(date +%Y%m%d-%H%M%S).json
cp backend/usuarios.json /root/backup-manual/usuarios-$(date +%Y%m%d-%H%M%S).json
echo "✅ Backup concluído"

# 2. Parar serviços
echo "⏹️ Parando serviços..."
pm2 stop all
echo "✅ Serviços parados"

# 3. Baixar atualizações
echo "⬇️ Baixando atualizações..."
git pull origin main
echo "✅ Atualizações baixadas"

# 4. Atualizar backend
echo "🔧 Atualizando backend..."
cd backend
npm install
cd ..
echo "✅ Backend atualizado"

# 5. Atualizar frontend
echo "🎨 Atualizando frontend..."
cd frontend
npm install
npm run build
cd ..
echo "✅ Frontend atualizado"

# 6. Reiniciar serviços
echo "▶️ Reiniciando serviços..."
pm2 restart all
sleep 5
echo "✅ Serviços reiniciados"

# 7. Verificar status
echo "📊 Verificando status..."
pm2 list

# 8. Testar conectividade
echo "🧪 Testando conectividade..."
curl -s http://localhost:3001 > /dev/null && echo "✅ Backend OK" || echo "❌ Backend com problema"
curl -s http://localhost:8080 > /dev/null && echo "✅ Frontend OK" || echo "❌ Frontend com problema"

echo ""
echo "🎉 ATUALIZAÇÃO MANUAL CONCLUÍDA - $(date)"
```

### 11.2 Tornar script executável
```bash
chmod +x /root/atualizar-manual.sh
```

### 11.3 Testar script de atualização
```bash
/root/atualizar-manual.sh
```
**⏳ Tempo estimado:** 5-10 minutos
**✅ Verificação:** Deve executar todas as etapas sem erros críticos.

---

## 📊 **PASSO 12: Configuração de Monitoramento**

### 12.1 Verificar logs do PM2
```bash
pm2 logs --lines 20
```
**✅ Verificação:** Deve mostrar logs sem erros críticos.

### 12.2 Monitor em tempo real (opcional)
```bash
pm2 monit
```
**✅ Verificação:** Interface de monitoramento deve abrir (Ctrl+C para sair).

### 12.3 Verificar uso de recursos
```bash
htop
```
**✅ Verificação:** Deve mostrar processos rodando (Ctrl+C para sair).

---

## 🔧 **PASSO 13: Configuração de Backup Manual**

### 13.1 Criar script de backup
```bash
nano /root/backup-manual.sh
```

**Conteúdo:**
```bash
#!/bin/bash
echo "📦 BACKUP MANUAL COMPLETO - $(date)"
echo "==================================="

DATA=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/root/backups-manuais"

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

echo "Criando backup em: $BACKUP_DIR/backup-$DATA"

# Backup dos dados principais
cp backend/pedidos.json $BACKUP_DIR/pedidos-$DATA.json
cp backend/usuarios.json $BACKUP_DIR/usuarios-$DATA.json
cp backend/configuracoes.json $BACKUP_DIR/config-$DATA.json

# Backup completo do projeto
tar -czf $BACKUP_DIR/projeto-completo-$DATA.tar.gz -C /root Construmega-Site

# Listar backups criados
echo "Backups criados:"
ls -lh $BACKUP_DIR/*$DATA*

echo "✅ Backup manual concluído!"
```

### 13.2 Tornar executável e testar
```bash
chmod +x /root/backup-manual.sh
/root/backup-manual.sh
```
**✅ Verificação:** Deve criar arquivos de backup.

---

## 🚨 **PASSO 14: Plano de Recuperação de Emergência**

### 14.1 Criar script de emergência
```bash
nano /root/emergencia-reset.sh
```

**Conteúdo:**
```bash
#!/bin/bash
echo "🚨 RESET DE EMERGÊNCIA - $(date)"
echo "==============================="

read -p "⚠️  Isso irá parar todos os serviços e reinstalar tudo. Continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operação cancelada."
    exit 1
fi

echo "⏹️ Parando serviços..."
pm2 kill
pm2 delete all

echo "🧹 Limpando caches..."
cd /root/Construmega-Site
rm -rf backend/node_modules
rm -rf frontend/node_modules
rm -rf frontend/build

echo "📦 Reinstalando dependências..."
cd backend
npm install
cd ../frontend
npm install
npm run build
cd ..

echo "▶️ Reiniciando serviços..."
pm2 start backend/index.js --name "site-backend"
pm2 start npm --name "site-frontend" -- run serve

echo "📊 Verificando..."
sleep 5
pm2 list

echo "✅ Reset de emergência concluído!"
```

### 14.2 Tornar executável
```bash
chmod +x /root/emergencia-reset.sh
```

---

## ✅ **PASSO 15: Verificação Final**

### 15.1 Checklist completo
- [ ] Sistema AlmaLinux 9.7 verificado
- [ ] Node.js 18 instalado e funcionando
- [ ] PM2 instalado e configurado
- [ ] Backend instalado e rodando
- [ ] Frontend instalado, buildado e rodando
- [ ] Serviços acessíveis via HTTP
- [ ] Scripts de atualização e backup criados
- [ ] PM2 configurado para auto-início

### 15.2 Teste final completo
```bash
echo "=== TESTE FINAL ==="
echo "Backend:" && curl -s -o /dev/null -w "%{http_code}" http://localhost:3001
echo "Frontend:" && curl -s -o /dev/null -w "%{http_code}" http://localhost:8080
echo "PM2 Status:" && pm2 jlist | jq -r '.[] | "\(.name): \(.pm2_env.status)"'
echo "Espaço em disco:" && df -h / | tail -1 | awk '{print $4 " disponível"}'
```

---

## 📞 **Suporte e Troubleshooting**

### Comandos Úteis para Manutenção:
```bash
# Ver status dos serviços
pm2 list

# Ver logs em tempo real
pm2 logs

# Reiniciar serviços
pm2 restart all

# Ver uso de recursos
htop

# Ver espaço em disco
df -h

# Ver processos
ps aux | grep node
```

### Em caso de problemas:
1. **Serviço não inicia:** Verificar logs com `pm2 logs nome-do-servico`
2. **Porta ocupada:** Usar `netstat -tlnp | grep :porta` para verificar
3. **Dependências faltando:** Executar `npm install` novamente
4. **Permissões:** Verificar se arquivos têm permissões corretas

---

## 🎯 **Resultado Final**

Após seguir todos os passos, você terá:
- ✅ **Site completamente funcional** no AlmaLinux 9.7
- ✅ **Backend e Frontend rodando** com PM2
- ✅ **Atualização manual** disponível
- ✅ **Backup manual** configurado
- ✅ **Monitoramento básico** ativo
- ✅ **Scripts de emergência** prontos

**Seu site está pronto para produção! 🚀**

---

*Guia Manual criado para AlmaLinux 9.7 - Janeiro 2026*