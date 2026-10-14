#!/bin/bash
# Roda UMA VEZ na VPS para preparar o ambiente
# ssh -p 2222 admin@216.22.27.169 "bash <(curl -s https://raw.githubusercontent.com/.../vps-setup.sh)"
set -e

# ─── Segredos vêm do ambiente (nunca do repositório) ─────────────────────────
#   export POSTGRES_PASSWORD='...'          # senha do banco
#   export POSTGRES_PASSWORD_URLENC='...'   # idem, com URL-encoding (# → %23)
#   export FIREBASE_ADMIN_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n'
: "${POSTGRES_PASSWORD:?exporte POSTGRES_PASSWORD antes de rodar}"
: "${POSTGRES_PASSWORD_URLENC:?exporte POSTGRES_PASSWORD_URLENC antes de rodar}"
: "${FIREBASE_ADMIN_PRIVATE_KEY:?exporte FIREBASE_ADMIN_PRIVATE_KEY antes de rodar}"

echo "=== 1. Clonar repositórios ==="
cd /opt/apps/sql-challenge

if [ ! -d "backend" ]; then
  git clone https://github.com/sql-challenge/sql-challenge-backend.git backend
fi

if [ ! -d "frontend" ]; then
  git clone https://github.com/sql-challenge/sql-challenge-frontend.git frontend
fi

if [ ! -d "modelagem" ]; then
  git clone https://github.com/sql-challenge/sql-challenge-modelagem_de_dados.git modelagem
fi

echo "=== 2. Criar .env.production e .env.staging no backend ==="
cat > /opt/apps/sql-challenge/backend/.env.production << ENVEOF
POSTGRES_USER=challenge_user
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=db_gestao
DB_PORT=5432
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://challenge_user:${POSTGRES_PASSWORD_URLENC}@sql-challenge-db:5432/db_gestao?sslmode=disable
apiKey=AIzaSyCjcUNiPRfL20Di5Yd6gRCcVPeOBpnG9IE
authDomain=sqlmystery.firebaseapp.com
projectId=sqlmystery
storageBucket=sqlmystery.firebasestorage.app
messagingSenderId=813818123752
appId=1:813818123752:web:355985fbe43bf1237d005d
measurementId=G-KD09159NHG
FIREBASE_ADMIN_PROJECT_ID=sqlmystery
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@sqlmystery.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="${FIREBASE_ADMIN_PRIVATE_KEY}"
FRONTEND_URL=https://apihub-macedo.duckdns.org
FRONTEND_PORT=3001
ENVEOF
chmod 600 /opt/apps/sql-challenge/backend/.env.production

cat > /opt/apps/sql-challenge/backend/.env.staging << ENVEOF
POSTGRES_USER=challenge_user
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=db_gestao_staging
DB_PORT=5432
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://challenge_user:${POSTGRES_PASSWORD_URLENC}@sql-challenge-db-staging:5432/db_gestao_staging?sslmode=disable
apiKey=AIzaSyCjcUNiPRfL20Di5Yd6gRCcVPeOBpnG9IE
authDomain=sqlmystery.firebaseapp.com
projectId=sqlmystery
storageBucket=sqlmystery.firebasestorage.app
messagingSenderId=813818123752
appId=1:813818123752:web:355985fbe43bf1237d005d
measurementId=G-KD09159NHG
FIREBASE_ADMIN_PROJECT_ID=sqlmystery
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@sqlmystery.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="${FIREBASE_ADMIN_PRIVATE_KEY}"
FRONTEND_URL=https://apihub-macedo.duckdns.org
FRONTEND_PORT=3011
ENVEOF
chmod 600 /opt/apps/sql-challenge/backend/.env.staging

echo "=== 3. Criar .env.production e .env.staging no frontend ==="
cat > /opt/apps/sql-challenge/frontend/.env.production << 'ENVEOF'
NEXT_PUBLIC_API_BASE_URL=https://apihub-macedo.duckdns.org
NEXT_PUBLIC_BASE_PATH=/sql-challenge
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCjcUNiPRfL20Di5Yd6gRCcVPeOBpnG9IE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sqlmystery.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sqlmystery
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sqlmystery.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=813818123752
NEXT_PUBLIC_FIREBASE_APP_ID=1:813818123752:web:355985fbe43bf1237d005d
ENVEOF
chmod 600 /opt/apps/sql-challenge/frontend/.env.production

cat > /opt/apps/sql-challenge/frontend/.env.staging << 'ENVEOF'
NEXT_PUBLIC_API_BASE_URL=https://apihub-macedo.duckdns.org/staging
NEXT_PUBLIC_BASE_PATH=/sql-challenge-staging
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCjcUNiPRfL20Di5Yd6gRCcVPeOBpnG9IE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sqlmystery.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sqlmystery
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sqlmystery.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=813818123752
NEXT_PUBLIC_FIREBASE_APP_ID=1:813818123752:web:355985fbe43bf1237d005d
ENVEOF
chmod 600 /opt/apps/sql-challenge/frontend/.env.staging

echo "=== 4. Adicionar chave SSH do GitHub Actions ==="
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJNX6TyTQkJFQQNOnYYp8IKa76bnOdjv+xm5rvYxj99j github-actions-deploy" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

echo "=== 5. Configurar Nginx ==="
sudo cp /opt/apps/sql-challenge/frontend/nginx/sql-challenge.conf /etc/nginx/sites-available/sql-challenge
sudo ln -sf /etc/nginx/sites-available/sql-challenge /etc/nginx/sites-enabled/sql-challenge
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "✅ Setup concluído!"
echo ""
echo "Ambientes disponíveis após o primeiro deploy:"
echo "  Production  → https://apihub-macedo.duckdns.org/sql-challenge"
echo "  Staging     → https://apihub-macedo.duckdns.org/sql-challenge-staging"
echo ""
echo "Secrets necessários no GitHub:"
echo "  VPS_HOST · VPS_PORT · VPS_USER · VPS_SSH_KEY · MAIL_USERNAME · MAIL_PASSWORD"
