#!/usr/bin/env bash
# =============================================================================
#  setup-server.sh — Setup completo da VPS para SQL Challenge
# =============================================================================
#  Execução:
#    ssh -p 2222 admin@<IP> "bash <(curl -s https://raw.githubusercontent.com/\
#      sql-challenge/sql-challenge-frontend/main/scripts/setup-server.sh)"
#
#  Ou localmente na VPS após clonar o repositório:
#    bash ~/sql-challenge-frontend/scripts/setup-server.sh
#
#  O script verifica ~/setup.env com as credenciais reais.
#  Na primeira execução, cria o template e pede para preencher.
# =============================================================================

set -euo pipefail

# ─── Cores e helpers ─────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[1;34m'; BOLD='\033[1m'; RESET='\033[0m'

info()  { echo -e "\n${BLUE}${BOLD}═══ $* ═══${RESET}"; }
ok()    { echo -e "  ${GREEN}✅ $*${RESET}"; }
warn()  { echo -e "  ${YELLOW}⚠️  $*${RESET}"; }
err()   { echo -e "  ${RED}❌ $*${RESET}"; exit 1; }
step()  { echo -e "  ${BOLD}▶ $*${RESET}"; }

# ─── Constantes ──────────────────────────────────────────────────────────────
DEPLOY_USER="${SUDO_USER:-$(whoami)}"
HOME_DIR="/home/$DEPLOY_USER"
BACKEND_DIR="$HOME_DIR/sql-challenge-backend"
FRONTEND_DIR="$HOME_DIR/sql-challenge-frontend"
MODELAGEM_DIR="$HOME_DIR/sql-challenge-modelagem_de_dados"
SETUP_ENV="$HOME_DIR/setup.env"
DOMAIN="apihub-macedo.duckdns.org"
GITHUB_ORG="sql-challenge"
SSH_PORT="2222"

# =============================================================================
#  FASE 0 — Verificar credenciais
# =============================================================================
info "FASE 0 — Credenciais de setup"

if [ ! -f "$SETUP_ENV" ] || grep -q "CHANGE_ME" "$SETUP_ENV" 2>/dev/null; then
  warn "Arquivo de credenciais não encontrado ou incompleto."
  step "Criando template em $SETUP_ENV"

  cat > "$SETUP_ENV" << 'ENVEOF'
# ─────────────────────────────────────────────────────────────
#  Preencha TODOS os valores CHANGE_ME antes de re-executar
#  o script. Não use # no meio de senhas (causa problema na URL).
# ─────────────────────────────────────────────────────────────

# PostgreSQL — mesma senha para produção e staging
POSTGRES_USER=challenge_user
POSTGRES_PASSWORD=CHANGE_ME

# Firebase Client SDK (mesmo para produção e staging)
FB_API_KEY=CHANGE_ME
FB_AUTH_DOMAIN=CHANGE_ME
FB_PROJECT_ID=CHANGE_ME
FB_STORAGE_BUCKET=CHANGE_ME
FB_MESSAGING_SENDER_ID=CHANGE_ME
FB_APP_ID=CHANGE_ME
FB_MEASUREMENT_ID=CHANGE_ME

# Firebase Admin SDK (backend)
FIREBASE_ADMIN_PROJECT_ID=CHANGE_ME
FIREBASE_ADMIN_CLIENT_EMAIL=CHANGE_ME
# Chave com \n literais (como exportada pelo Firebase Console)
FIREBASE_ADMIN_PRIVATE_KEY=CHANGE_ME

# Email para notificações (Gmail App Password)
EMAIL_USER=CHANGE_ME
EMAIL_PASS=CHANGE_ME

# Email para SSL (certbot)
SSL_EMAIL=CHANGE_ME
ENVEOF

  chmod 600 "$SETUP_ENV"
  echo ""
  echo -e "${YELLOW}${BOLD}Arquivo criado: $SETUP_ENV${RESET}"
  echo -e "${YELLOW}Edite o arquivo, preencha os valores e re-execute o script:${RESET}"
  echo ""
  echo "  nano $SETUP_ENV"
  echo "  bash $FRONTEND_DIR/scripts/setup-server.sh"
  echo ""
  exit 1
fi

# Carrega as credenciais
# shellcheck source=/dev/null
source "$SETUP_ENV"
ok "Credenciais carregadas de $SETUP_ENV"

# =============================================================================
#  FASE 1 — Pacotes do sistema
# =============================================================================
info "FASE 1 — Pacotes do sistema"

step "Atualizando apt"
sudo apt-get update -y -qq

step "Instalando dependências base"
sudo apt-get install -y -qq \
  curl git wget gnupg lsb-release \
  ca-certificates apt-transport-https \
  nginx certbot python3-certbot-nginx \
  ufw postgresql-client

# Docker
if command -v docker &>/dev/null; then
  ok "Docker já instalado: $(docker --version | cut -d' ' -f3)"
else
  step "Instalando Docker"
  curl -fsSL https://get.docker.com | sudo bash -s -- --quiet
  sudo usermod -aG docker "$DEPLOY_USER"
  ok "Docker instalado — faça logout/login para aplicar o grupo docker"
fi

# Garante que o usuário pode usar docker sem sudo
if ! groups "$DEPLOY_USER" | grep -q docker; then
  sudo usermod -aG docker "$DEPLOY_USER"
  warn "Usuário $DEPLOY_USER adicionado ao grupo docker (efetivo no próximo login)"
fi

# Docker Buildx (necessário para BuildKit)
if ! docker buildx version &>/dev/null; then
  step "Instalando Docker Buildx"
  mkdir -p "$HOME_DIR/.docker/cli-plugins"
  BUILDX_VERSION=$(curl -s https://api.github.com/repos/docker/buildx/releases/latest \
    | grep '"tag_name"' | cut -d'"' -f4)
  curl -fsSL "https://github.com/docker/buildx/releases/download/${BUILDX_VERSION}/buildx-${BUILDX_VERSION}.linux-amd64" \
    -o "$HOME_DIR/.docker/cli-plugins/docker-buildx"
  chmod +x "$HOME_DIR/.docker/cli-plugins/docker-buildx"
  ok "Docker Buildx instalado"
else
  ok "Docker Buildx: $(docker buildx version | head -1)"
fi

ok "Fase 1 concluída"

# =============================================================================
#  FASE 2 — Repositórios
# =============================================================================
info "FASE 2 — Clonando repositórios"

clone_or_pull() {
  local dir="$1" repo="$2" branch="${3:-main}"
  if [ -d "$dir/.git" ]; then
    step "$repo — atualizando para $branch"
    git -C "$dir" fetch origin
    git -C "$dir" checkout "$branch" 2>/dev/null || true
    git -C "$dir" reset --hard "origin/$branch"
  else
    step "Clonando $repo"
    git clone "https://github.com/$GITHUB_ORG/$repo.git" "$dir"
    git -C "$dir" checkout "$branch" 2>/dev/null || true
  fi
  ok "$repo em $dir"
}

clone_or_pull "$BACKEND_DIR"   "sql-challenge-backend"   "main"
clone_or_pull "$FRONTEND_DIR"  "sql-challenge-frontend"  "main"
clone_or_pull "$MODELAGEM_DIR" "sql-challenge-modelagem_de_dados" "main"

ok "Fase 2 concluída"

# =============================================================================
#  FASE 3 — Chave SSH para GitHub Actions
# =============================================================================
info "FASE 3 — Chave SSH para GitHub Actions"

SSH_KEY_FILE="$HOME_DIR/.ssh/github_actions_deploy"
mkdir -p "$HOME_DIR/.ssh"
chmod 700 "$HOME_DIR/.ssh"

if [ ! -f "$SSH_KEY_FILE" ]; then
  step "Gerando par de chaves Ed25519"
  ssh-keygen -t ed25519 -f "$SSH_KEY_FILE" -N "" -C "github-actions-sql-challenge"
  ok "Chave gerada: $SSH_KEY_FILE"
else
  ok "Chave SSH já existe: $SSH_KEY_FILE"
fi

# Garante que a chave pública está em authorized_keys
PUBKEY=$(cat "$SSH_KEY_FILE.pub")
touch "$HOME_DIR/.ssh/authorized_keys"
chmod 600 "$HOME_DIR/.ssh/authorized_keys"
if ! grep -qF "$PUBKEY" "$HOME_DIR/.ssh/authorized_keys"; then
  echo "$PUBKEY" >> "$HOME_DIR/.ssh/authorized_keys"
  ok "Chave pública adicionada a authorized_keys"
else
  ok "Chave pública já estava em authorized_keys"
fi

echo ""
echo -e "${YELLOW}${BOLD}╔══ SECRET VPS_SSH_KEY (copie para o GitHub) ══════════════╗${RESET}"
cat "$SSH_KEY_FILE"
echo -e "${YELLOW}${BOLD}╚══════════════════════════════════════════════════════════╝${RESET}"
echo ""

ok "Fase 3 concluída"

# =============================================================================
#  FASE 4 — Limpeza de artefatos que quebram o Docker build
# =============================================================================
info "FASE 4 — Limpeza de artefatos espúrios"

# O Next.js 16 + Turbopack quebra se encontrar symlinks quebrados no COPY context
STRAY_PATHS=(
  "$FRONTEND_DIR/sql-challenge"
  "$FRONTEND_DIR/sql-challenge-staging"
  "$FRONTEND_DIR/.next"
  "$FRONTEND_DIR/tsconfig.tsbuildinfo"
  "$BACKEND_DIR/dist"
)

for path in "${STRAY_PATHS[@]}"; do
  if [ -e "$path" ] || [ -L "$path" ]; then
    rm -rf "$path"
    warn "Removido: $path"
  fi
done

ok "Fase 4 concluída"

# =============================================================================
#  FASE 5 — Arquivos .env (backend e frontend)
# =============================================================================
info "FASE 5 — Arquivos de ambiente"

# ── Função utilitária ─────────────────────────────────────────────────────────
write_env() {
  local file="$1"; shift
  # Não sobrescreve se já existe e não tem CHANGE_ME
  if [ -f "$file" ] && ! grep -q "CHANGE_ME" "$file"; then
    warn "$file já existe com valores reais — não sobrescrito"
    return
  fi
  printf '%s\n' "$@" > "$file"
  chmod 600 "$file"
  ok "Escrito: $file"
}

# ── Backend · produção ────────────────────────────────────────────────────────
write_env "$BACKEND_DIR/.env.production" \
  "POSTGRES_USER=${POSTGRES_USER}" \
  "POSTGRES_PASSWORD=${POSTGRES_PASSWORD}" \
  "POSTGRES_DB=db_gestao" \
  "DB_PORT=5432" \
  "PORT=3000" \
  "NODE_ENV=production" \
  "DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/db_gestao?sslmode=disable" \
  "apiKey=${FB_API_KEY}" \
  "authDomain=${FB_AUTH_DOMAIN}" \
  "projectId=${FB_PROJECT_ID}" \
  "storageBucket=${FB_STORAGE_BUCKET}" \
  "messagingSenderId=${FB_MESSAGING_SENDER_ID}" \
  "appId=${FB_APP_ID}" \
  "measurementId=${FB_MEASUREMENT_ID}" \
  "FIREBASE_ADMIN_PROJECT_ID=${FIREBASE_ADMIN_PROJECT_ID}" \
  "FIREBASE_ADMIN_CLIENT_EMAIL=${FIREBASE_ADMIN_CLIENT_EMAIL}" \
  "FIREBASE_ADMIN_PRIVATE_KEY=${FIREBASE_ADMIN_PRIVATE_KEY}" \
  "FRONTEND_URL=https://${DOMAIN}" \
  "FRONTEND_PORT=3001" \
  "EMAIL_USER=${EMAIL_USER}" \
  "EMAIL_PASS=${EMAIL_PASS}" \
  "SITE_URL=https://${DOMAIN}/sql-challenge"

# ── Backend · staging ─────────────────────────────────────────────────────────
write_env "$BACKEND_DIR/.env.staging" \
  "POSTGRES_USER=${POSTGRES_USER}" \
  "POSTGRES_PASSWORD=${POSTGRES_PASSWORD}" \
  "POSTGRES_DB=db_gestao_staging" \
  "DB_PORT=5432" \
  "PORT=3000" \
  "NODE_ENV=production" \
  "DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db-staging:5432/db_gestao_staging?sslmode=disable" \
  "apiKey=${FB_API_KEY}" \
  "authDomain=${FB_AUTH_DOMAIN}" \
  "projectId=${FB_PROJECT_ID}" \
  "storageBucket=${FB_STORAGE_BUCKET}" \
  "messagingSenderId=${FB_MESSAGING_SENDER_ID}" \
  "appId=${FB_APP_ID}" \
  "measurementId=${FB_MEASUREMENT_ID}" \
  "FIREBASE_ADMIN_PROJECT_ID=${FIREBASE_ADMIN_PROJECT_ID}" \
  "FIREBASE_ADMIN_CLIENT_EMAIL=${FIREBASE_ADMIN_CLIENT_EMAIL}" \
  "FIREBASE_ADMIN_PRIVATE_KEY=${FIREBASE_ADMIN_PRIVATE_KEY}" \
  "FRONTEND_URL=https://${DOMAIN}" \
  "FRONTEND_PORT=3011" \
  "EMAIL_USER=${EMAIL_USER}" \
  "EMAIL_PASS=${EMAIL_PASS}" \
  "SITE_URL=https://${DOMAIN}/sql-challenge-staging"

# ── Frontend · produção ───────────────────────────────────────────────────────
write_env "$FRONTEND_DIR/.env.production" \
  "NEXT_PUBLIC_API_BASE_URL=https://${DOMAIN}" \
  "NEXT_PUBLIC_BASE_PATH=/sql-challenge" \
  "NEXT_PUBLIC_FIREBASE_API_KEY=${FB_API_KEY}" \
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${FB_AUTH_DOMAIN}" \
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID=${FB_PROJECT_ID}" \
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${FB_STORAGE_BUCKET}" \
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${FB_MESSAGING_SENDER_ID}" \
  "NEXT_PUBLIC_FIREBASE_APP_ID=${FB_APP_ID}"

# ── Frontend · staging ────────────────────────────────────────────────────────
write_env "$FRONTEND_DIR/.env.staging" \
  "NEXT_PUBLIC_API_BASE_URL=https://${DOMAIN}/staging" \
  "NEXT_PUBLIC_BASE_PATH=/sql-challenge-staging" \
  "NEXT_PUBLIC_FIREBASE_API_KEY=${FB_API_KEY}" \
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${FB_AUTH_DOMAIN}" \
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID=${FB_PROJECT_ID}" \
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${FB_STORAGE_BUCKET}" \
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${FB_MESSAGING_SENDER_ID}" \
  "NEXT_PUBLIC_FIREBASE_APP_ID=${FB_APP_ID}"

ok "Fase 5 concluída"

# =============================================================================
#  FASE 6 — Bancos de dados (produção + staging)
# =============================================================================
info "FASE 6 — Bancos de dados"

DB_INIT_SCRIPT="$BACKEND_DIR/scripts/db-init.sh"

if [ ! -f "$DB_INIT_SCRIPT" ]; then
  err "db-init.sh não encontrado em $BACKEND_DIR/scripts/
  Verifique se o repositório sql-challenge-backend foi clonado corretamente."
fi

chmod +x "$DB_INIT_SCRIPT"

step "Inicializando banco de PRODUÇÃO (db_gestao)"
bash "$DB_INIT_SCRIPT" \
  --env production \
  --modelagem "$MODELAGEM_DIR"

step "Inicializando banco de STAGING (db_gestao_staging)"
bash "$DB_INIT_SCRIPT" \
  --env staging \
  --modelagem "$MODELAGEM_DIR"

# Para os containers — o CI/CD sobe tudo na ordem correta no primeiro deploy
step "Parando containers de banco (o CD sobe a stack completa)"
cd "$BACKEND_DIR"
docker compose -f docker-compose.yml stop db 2>/dev/null || true
docker compose -f docker-compose.staging.yml stop db-staging 2>/dev/null || true

ok "Fase 6 concluída"

# =============================================================================
#  FASE 7 — Nginx + SSL (Let's Encrypt)
# =============================================================================
info "FASE 7 — Nginx e SSL"

step "Instalando config Nginx"
sudo cp "$FRONTEND_DIR/nginx/sql-challenge.conf" \
        /etc/nginx/sites-available/sql-challenge
sudo ln -sf /etc/nginx/sites-available/sql-challenge \
            /etc/nginx/sites-enabled/sql-challenge

# Remove site padrão para não conflitar
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
ok "Nginx configurado e rodando"

step "Verificando certificado SSL"
if [ -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
  ok "Certificado SSL já existe para ${DOMAIN}"
  sudo certbot renew --quiet --no-self-upgrade || true
else
  step "Obtendo certificado SSL via certbot"
  sudo certbot --nginx \
    -d "$DOMAIN" \
    --non-interactive \
    --agree-tos \
    --email "$SSL_EMAIL" \
    --redirect
  ok "Certificado SSL obtido para ${DOMAIN}"
fi

# Renovação automática via cron (caso não exista)
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
  (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet") | crontab -
  ok "Renovação automática de SSL agendada (diária às 3h)"
fi

ok "Fase 7 concluída"

# =============================================================================
#  FASE 8 — UFW (Firewall)
# =============================================================================
info "FASE 8 — Firewall (UFW)"

if command -v ufw &>/dev/null; then
  sudo ufw allow "$SSH_PORT/tcp"   comment "SSH"
  sudo ufw allow 80/tcp             comment "HTTP"
  sudo ufw allow 443/tcp            comment "HTTPS"
  # Bloqueia acesso externo direto às portas internas dos containers
  sudo ufw deny 3000/tcp  comment "backend prod (apenas via nginx)"
  sudo ufw deny 3001/tcp  comment "frontend prod (apenas via nginx)"
  sudo ufw deny 3010/tcp  comment "backend staging (apenas via nginx)"
  sudo ufw deny 3011/tcp  comment "frontend staging (apenas via nginx)"
  sudo ufw deny 5432/tcp  comment "postgres prod (apenas interno)"
  sudo ufw deny 5433/tcp  comment "postgres staging (apenas interno)"
  sudo ufw --force enable
  ok "Firewall configurado"
else
  warn "UFW não encontrado — configure o firewall manualmente"
fi

ok "Fase 8 concluída"

# =============================================================================
#  FASE 9 — Verificação final
# =============================================================================
info "FASE 9 — Verificação"

step "Docker"
docker info --format "  Engine: {{.ServerVersion}}" 2>/dev/null || warn "Docker daemon não responde"

step "Nginx"
sudo nginx -t 2>&1 | grep -E "ok|successful" && ok "Nginx config válida"

step "SSL"
if [ -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
  ok "Certificado: /etc/letsencrypt/live/${DOMAIN}"
else
  warn "Certificado SSL não encontrado"
fi

step "Repositórios"
for dir in "$BACKEND_DIR" "$FRONTEND_DIR" "$MODELAGEM_DIR"; do
  [ -d "$dir/.git" ] && ok "$dir" || warn "$dir não é repositório git"
done

step "Arquivos .env"
for f in "$BACKEND_DIR/.env.production" "$BACKEND_DIR/.env.staging" \
          "$FRONTEND_DIR/.env.production" "$FRONTEND_DIR/.env.staging"; do
  if [ -f "$f" ] && ! grep -q "CHANGE_ME" "$f"; then
    ok "$f"
  else
    warn "$f — faltando ou com CHANGE_ME"
  fi
done

step "Chave SSH"
[ -f "$SSH_KEY_FILE" ] && ok "$SSH_KEY_FILE" || warn "Chave SSH não encontrada"

# =============================================================================
#  RESUMO FINAL
# =============================================================================
echo ""
echo -e "${GREEN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                    ✅  SETUP CONCLUÍDO                              ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo -e "${RESET}"

echo -e "${BOLD}📋 PRÓXIMOS PASSOS (em ordem):${RESET}"
echo ""
echo -e "${BOLD}1. Configure os GitHub Secrets em AMBOS os repositórios:${RESET}"
echo "   (Settings → Secrets and variables → Actions → New repository secret)"
echo ""
echo "   Secret                   Valor"
echo "   ─────────────────────── ────────────────────────────────────────────"
echo "   VPS_HOST                 IP da VPS"
printf "   VPS_PORT                 %s\n" "$SSH_PORT"
printf "   VPS_USER                 %s\n" "$DEPLOY_USER"
echo "   VPS_SSH_KEY              conteúdo de $SSH_KEY_FILE  (chave PRIVADA)"
echo "   MAIL_USERNAME            $EMAIL_USER"
echo "   MAIL_PASSWORD            <senha de app do Gmail>"
echo "   POSTGRES_USER            $POSTGRES_USER"
echo "   POSTGRES_PASSWORD        <igual ao setup.env>"
echo "   FB_API_KEY               <igual ao setup.env>"
echo "   FB_AUTH_DOMAIN           <igual ao setup.env>"
echo "   FB_PROJECT_ID            <igual ao setup.env>"
echo "   FB_STORAGE_BUCKET        <igual ao setup.env>"
echo "   FB_MESSAGING_SENDER_ID   <igual ao setup.env>"
echo "   FB_APP_ID                <igual ao setup.env>"
echo "   FB_MEASUREMENT_ID        <igual ao setup.env>"
echo "   FIREBASE_ADMIN_PROJECT_ID   <igual ao setup.env>"
echo "   FIREBASE_ADMIN_CLIENT_EMAIL <igual ao setup.env>"
echo "   FIREBASE_ADMIN_PRIVATE_KEY  <igual ao setup.env>"
echo ""
echo -e "${BOLD}2. Faça push para disparar o primeiro CD:${RESET}"
echo "   git push origin dev    → staging  (3010/3011)"
echo "   git push origin main   → produção (3000/3001)"
echo ""
echo -e "${BOLD}3. Verifique os endpoints após o deploy:${RESET}"
echo "   https://${DOMAIN}/sql-challenge           → frontend produção"
echo "   https://${DOMAIN}/sql-challenge-staging   → frontend staging"
echo "   https://${DOMAIN}/api/health              → backend produção"
echo "   https://${DOMAIN}/staging/api/health      → backend staging"
echo ""
echo -e "${BOLD}4. (Opcional) Monitore os containers:${RESET}"
echo "   docker ps"
echo "   docker compose -f ~/sql-challenge-backend/docker-compose.yml logs -f"
echo ""
echo -e "${YELLOW}⚠️  Segurança:${RESET}"
echo "   - Apague ~/setup.env após confirmar que o CD funciona:"
echo "     rm -f $SETUP_ENV"
echo "   - As senhas estão nos GitHub Secrets — a VPS não precisa guardar"
echo ""
