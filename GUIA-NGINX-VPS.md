# 🌐 Configuração Nginx para VPS - Construmega

Este guia explica como configurar o Nginx na VPS AlmaLinux 9.7 para servir o site Construmega com proxy reverso, HTTPS e domínio personalizado.

## 📋 Visão Geral da Arquitetura

```
Internet (construmega.com.br)
         ↓
    Nginx (porta 80/443)
         ↓
    ┌────────────────┐
    │  Proxy Reverso │
    └────────────────┘
         ↓
    ┌────┴────┐
    ↓         ↓
Frontend   Backend
(8080)     (3001)
```

## 🔧 Passo 1: Instalar Nginx

```bash
# Instalar Nginx
dnf install -y nginx

# Habilitar e iniciar Nginx
systemctl enable nginx
systemctl start nginx

# Verificar status
systemctl status nginx

# Verificar versão
nginx -v
```

## 📝 Passo 2: Criar Configuração do Site

Crie o arquivo de configuração:

```bash
nano /etc/nginx/conf.d/construmega.conf
```

Cole a seguinte configuração:

```nginx
# Configuração do site Construmega
# Backend API + Frontend React

# Redireciona HTTP para HTTPS (descomente após configurar SSL)
# server {
#     listen 80;
#     listen [::]:80;
#     server_name construmega.com.br www.construmega.com.br;
#     return 301 https://$server_name$request_uri;
# }

# Servidor HTTP (temporário - use enquanto não tiver SSL)
server {
    listen 80;
    listen [::]:80;
    server_name construmega.com.br www.construmega.com.br 129.121.35.197;
    
    # Logs
    access_log /var/log/nginx/construmega_access.log;
    error_log /var/log/nginx/construmega_error.log;
    
    # Tamanho máximo de upload (para imagens de produtos)
    client_max_body_size 50M;
    
    # Frontend React (SPA) - porta 8080
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout para conexões
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Backend API - porta 3001
    # Rotas: /api/, /login, /usuarios, /configuracoes, /pedidos, /resgates, /chave, /pagamento, /teste
    location ~ ^/(api|login|usuarios|configuracoes|pedidos|resgates|chave|pagamento|teste) {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts maiores para pagamentos
        proxy_connect_timeout 90s;
        proxy_send_timeout 90s;
        proxy_read_timeout 90s;
    }
    
    # Headers de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}

# Servidor HTTPS (descomente após obter certificado SSL)
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     server_name construmega.com.br www.construmega.com.br;
#     
#     # Certificados SSL (Let's Encrypt)
#     ssl_certificate /etc/letsencrypt/live/construmega.com.br/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/construmega.com.br/privkey.pem;
#     
#     # Configurações SSL recomendadas
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers HIGH:!aNULL:!MD5;
#     ssl_prefer_server_ciphers on;
#     ssl_session_cache shared:SSL:10m;
#     ssl_session_timeout 10m;
#     
#     # Logs
#     access_log /var/log/nginx/construmega_ssl_access.log;
#     error_log /var/log/nginx/construmega_ssl_error.log;
#     
#     # Tamanho máximo de upload
#     client_max_body_size 50M;
#     
#     # Frontend React (SPA) - porta 8080
#     location / {
#         proxy_pass http://127.0.0.1:8080;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#         
#         proxy_connect_timeout 60s;
#         proxy_send_timeout 60s;
#         proxy_read_timeout 60s;
#     }
#     
#     # Backend API - porta 3001
#     location ~ ^/(api|login|usuarios|configuracoes|pedidos|resgates|chave|pagamento|teste) {
#         proxy_pass http://127.0.0.1:3001;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#         
#         proxy_connect_timeout 90s;
#         proxy_send_timeout 90s;
#         proxy_read_timeout 90s;
#     }
#     
#     # Headers de segurança
#     add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
#     add_header X-Frame-Options "SAMEORIGIN" always;
#     add_header X-Content-Type-Options "nosniff" always;
#     add_header X-XSS-Protection "1; mode=block" always;
#     add_header Referrer-Policy "no-referrer-when-downgrade" always;
# }
```

## 🔐 Passo 3: Configurar SSL com Let's Encrypt (Recomendado)

### 3.1 Instalar Certbot

```bash
# Instalar Certbot e plugin Nginx
dnf install -y certbot python3-certbot-nginx

# Verificar instalação
certbot --version
```

### 3.2 Obter Certificado SSL

```bash
# Parar Nginx temporariamente
systemctl stop nginx

# Obter certificado (modo standalone)
certbot certonly --standalone -d construmega.com.br -d www.construmega.com.br

# OU: Se Nginx estiver rodando, use o plugin nginx
certbot --nginx -d construmega.com.br -d www.construmega.com.br

# Siga as instruções:
# 1. Digite seu email
# 2. Aceite os termos
# 3. Escolha se quer compartilhar email (opcional)
```

### 3.3 Ativar Configuração HTTPS

Após obter o certificado, edite o arquivo de configuração:

```bash
nano /etc/nginx/conf.d/construmega.conf
```

- Descomente o bloco `server` HTTPS (linhas com `listen 443`)
- Descomente o redirect HTTP→HTTPS no primeiro bloco
- Salve e saia (Ctrl+X, Y, Enter)

### 3.4 Renovação Automática

```bash
# Testar renovação
certbot renew --dry-run

# Configurar renovação automática (já vem configurado)
systemctl enable certbot-renew.timer
systemctl start certbot-renew.timer

# Verificar timer
systemctl list-timers | grep certbot
```

## 🔥 Passo 4: Configurar Firewall

```bash
# Permitir HTTP e HTTPS
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https

# Recarregar firewall
firewall-cmd --reload

# Verificar regras
firewall-cmd --list-all
```

## ✅ Passo 5: Testar e Ativar Configuração

```bash
# Testar configuração do Nginx
nginx -t

# Se OK, recarregar Nginx
systemctl reload nginx

# Verificar status
systemctl status nginx

# Ver logs em tempo real
tail -f /var/log/nginx/construmega_access.log
tail -f /var/log/nginx/construmega_error.log
```

## 🧪 Passo 6: Testar o Site

### Teste Local (na VPS):

```bash
# Testar frontend
curl -I http://localhost

# Testar backend
curl -I http://localhost/api/produtos

# Testar com domínio
curl -I http://construmega.com.br
curl -I https://construmega.com.br  # Se SSL configurado
```

### Teste Externo (do seu computador):

```bash
# Abrir no navegador:
http://129.121.35.197
http://construmega.com.br
https://construmega.com.br  # Se SSL configurado
```

## 📊 Comandos Úteis de Manutenção

```bash
# Recarregar configuração (sem downtime)
systemctl reload nginx

# Reiniciar Nginx (com downtime breve)
systemctl restart nginx

# Parar Nginx
systemctl stop nginx

# Iniciar Nginx
systemctl start nginx

# Ver logs de erro
tail -n 50 /var/log/nginx/construmega_error.log

# Ver logs de acesso
tail -n 50 /var/log/nginx/construmega_access.log

# Testar configuração sem aplicar
nginx -t

# Ver processos Nginx
ps aux | grep nginx
```

## 🚨 Troubleshooting

### Problema: "502 Bad Gateway"

**Causa:** Backend/Frontend não está rodando

**Solução:**
```bash
pm2 list
pm2 restart all
netstat -tlnp | grep -E ':(3001|8080)'
```

### Problema: "403 Forbidden"

**Causa:** Permissões de arquivo ou SELinux

**Solução:**
```bash
# Verificar SELinux
getenforce

# Permitir proxy no SELinux
setsebool -P httpd_can_network_connect 1
```

### Problema: Certificado SSL não funciona

**Causa:** Domínio não aponta para IP da VPS

**Solução:**
```bash
# Verificar DNS
nslookup construmega.com.br

# Deve retornar: 129.121.35.197
```

### Problema: Logs não aparecem

**Causa:** Diretório de logs não existe

**Solução:**
```bash
mkdir -p /var/log/nginx
chown nginx:nginx /var/log/nginx
systemctl restart nginx
```

## 📝 Checklist Final

- [ ] Nginx instalado e rodando
- [ ] Arquivo de configuração criado em `/etc/nginx/conf.d/construmega.conf`
- [ ] Firewall configurado (portas 80 e 443 abertas)
- [ ] PM2 rodando backend (porta 3001) e frontend (porta 8080)
- [ ] Teste local funcionando (`curl http://localhost`)
- [ ] Teste externo funcionando (navegador)
- [ ] SSL configurado (Let's Encrypt)
- [ ] Redirect HTTP→HTTPS ativo
- [ ] Renovação automática de certificado configurada
- [ ] Logs sendo gerados em `/var/log/nginx/`

## 🎯 URLs Finais

Após a configuração completa:

- **Frontend:** https://construmega.com.br
- **Backend API:** https://construmega.com.br/api/produtos (exemplo)
- **Alternativa (IP):** http://129.121.35.197

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs: `tail -f /var/log/nginx/construmega_error.log`
2. Verificar PM2: `pm2 logs`
3. Verificar firewall: `firewall-cmd --list-all`
4. Verificar portas: `netstat -tlnp | grep -E ':(80|443|3001|8080)'`

---

**Configuração criada para:** AlmaLinux 9.7 | Nginx | Node.js 18 | PM2
**Data:** Janeiro 2026
**Domínio:** construmega.com.br | IP: 129.121.35.197
