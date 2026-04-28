# SQL Challenge — Frontend

Frontend do SQL Challenge: plataforma gamificada de aprendizado de SQL onde usuários resolvem mistérios de banco de dados.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (Turbopack) |
| UI | React 19 + Tailwind CSS 4 |
| Editor SQL | CodeMirror 6 |
| Auth | Firebase Client SDK |
| SQL no browser | sql.js (WebAssembly) |
| Container | Docker (multi-stage) |

## Desenvolvimento local

```bash
# Instalar dependências
npm install

# Criar variáveis de ambiente
cp .env.local.example .env.local
# edite com seus valores

# Iniciar servidor de dev
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Variáveis de ambiente (`.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
NEXT_PUBLIC_BASE_PATH=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Docker local

```bash
# Build e start
docker compose up -d --build

# Logs
docker compose logs -f frontend

# Stop
docker compose down
```

---

## Arquitetura de deploy

```
GitHub Actions
   ├── feat/** ──► CI apenas (lint + build)
   ├── dev     ──► CI → CD staging  (porta 3011, /sql-challenge-staging)
   └── main    ──► CI → CD produção (porta 3001, /sql-challenge)

VPS (Nginx + Let's Encrypt)
   ├── /sql-challenge          → localhost:3001 (produção)
   └── /sql-challenge-staging  → localhost:3011 (staging)
```

---

## Setup do servidor (primeira vez)

> Execute esses passos **uma única vez** quando o servidor for provisionado do zero.
> Re-execuções são seguras — o script é idempotente.

### Pré-requisitos na VPS

- Ubuntu 22.04+
- Usuário `admin` com acesso sudo
- Domínio apontando para o IP da VPS (`apihub-macedo.duckdns.org`)
- Acesso SSH: `ssh -p 2222 admin@<IP>`

### Passo 1 — Clonar o repositório

```bash
# Na VPS
git clone https://github.com/sql-challenge/sql-challenge-frontend.git \
  ~/sql-challenge-frontend
```

### Passo 2 — Criar arquivo de credenciais

```bash
bash ~/sql-challenge-frontend/scripts/setup-server.sh
```

Na primeira execução, o script cria o template `~/setup.env` e encerra. Edite o arquivo:

```bash
nano ~/setup.env
```

```env
# PostgreSQL
POSTGRES_USER=challenge_user
POSTGRES_PASSWORD=<senha forte, sem # no meio>

# Firebase Client SDK
FB_API_KEY=
FB_AUTH_DOMAIN=
FB_PROJECT_ID=
FB_STORAGE_BUCKET=
FB_MESSAGING_SENDER_ID=
FB_APP_ID=
FB_MEASUREMENT_ID=

# Firebase Admin SDK (backend)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Notificações por email
EMAIL_USER=
EMAIL_PASS=

# Email para certificado SSL
SSL_EMAIL=
```

### Passo 3 — Executar o setup completo

```bash
bash ~/sql-challenge-frontend/scripts/setup-server.sh
```

O script executa as seguintes fases automaticamente:

| Fase | O que faz |
|------|-----------|
| 1 | Instala Docker, Nginx, certbot, git, ufw |
| 2 | Clona os 3 repositórios em `/home/admin/` |
| 3 | Gera chave SSH Ed25519 para o GitHub Actions e exibe a chave privada |
| 4 | Remove artefatos espúrios que quebram o Docker build |
| 5 | Cria `.env.production` e `.env.staging` (backend + frontend) |
| 6 | Inicializa **ambos** os bancos via `db-init.sh` (produção + staging) com schemas, dados do jogo e usuários |
| 7 | Configura Nginx + SSL automático via certbot + renovação cron |
| 8 | Configura UFW (bloqueia portas internas, expõe só 80/443/SSH) |
| 9 | Verificação final + checklist de próximos passos |

### Passo 4 — Configurar GitHub Secrets

Configure os seguintes secrets em **ambos** os repositórios (`sql-challenge-backend` e `sql-challenge-frontend`):

> Settings → Secrets and variables → Actions → New repository secret

| Secret | Valor |
|--------|-------|
| `VPS_HOST` | IP da VPS |
| `VPS_PORT` | `2222` |
| `VPS_USER` | `admin` |
| `VPS_SSH_KEY` | Conteúdo da chave privada exibida na fase 3 |
| `MAIL_USERNAME` | Email para notificações de CI/CD |
| `MAIL_PASSWORD` | Senha de app do Gmail |
| `POSTGRES_USER` | `challenge_user` |
| `POSTGRES_PASSWORD` | Mesma do `setup.env` |
| `FB_API_KEY` | Firebase API Key |
| `FB_AUTH_DOMAIN` | Firebase Auth Domain |
| `FB_PROJECT_ID` | Firebase Project ID |
| `FB_STORAGE_BUCKET` | Firebase Storage Bucket |
| `FB_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `FB_APP_ID` | Firebase App ID |
| `FB_MEASUREMENT_ID` | Firebase Measurement ID |
| `FIREBASE_ADMIN_PROJECT_ID` | Firebase Admin Project ID |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Firebase Admin Client Email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Firebase Admin Private Key |

### Passo 5 — Primeiro deploy

```bash
# Staging (branch dev)
git push origin dev

# Produção (branch main)
git push origin main
```

### Passo 6 — Verificar endpoints

```
https://apihub-macedo.duckdns.org/sql-challenge           → frontend produção
https://apihub-macedo.duckdns.org/sql-challenge-staging   → frontend staging
```

### Limpeza de segurança (após confirmar que o CD funciona)

```bash
rm -f ~/setup.env
```

As credenciais ficam nos GitHub Secrets — a VPS não precisa manter o arquivo.

---

## Comandos úteis na VPS

```bash
# Ver containers rodando
docker ps

# Logs do frontend produção
docker compose -f ~/sql-challenge-frontend/docker-compose.yml logs -f

# Logs do frontend staging
docker compose -f ~/sql-challenge-frontend/docker-compose.staging.yml logs -f

# Reiniciar Nginx
sudo systemctl restart nginx

# Status do certificado SSL
sudo certbot certificates
```

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
