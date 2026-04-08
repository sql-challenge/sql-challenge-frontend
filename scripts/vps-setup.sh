#!/bin/bash
# Roda UMA VEZ na VPS para preparar o ambiente
# ssh -p 2222 admin@216.22.27.169 "bash <(curl -s https://raw.githubusercontent.com/.../vps-setup.sh)"
set -e

echo "=== 1. Clonar repositórios ==="
cd /opt/apps/sql-challenge

if [ ! -d "backend" ]; then
  git clone https://github.com/sql-challenge/sql-challenge-backend.git backend
fi

if [ ! -d "frontend" ]; then
  git clone https://github.com/sql-challenge/sql-challenge-frontend.git frontend
fi

echo "=== 2. Criar .env.production e .env.staging no backend ==="
cat > /opt/apps/sql-challenge/backend/.env.production << 'ENVEOF'
POSTGRES_USER=challenge_user
POSTGRES_PASSWORD=G7#kpL2!mZq9Xv
POSTGRES_DB=db_gestao
DB_PORT=5432
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://challenge_user:G7%23kpL2!mZq9Xv@sql-challenge-db:5432/db_gestao?sslmode=disable
apiKey=AIzaSyCjcUNiPRfL20Di5Yd6gRCcVPeOBpnG9IE
authDomain=sqlmystery.firebaseapp.com
projectId=sqlmystery
storageBucket=sqlmystery.firebasestorage.app
messagingSenderId=813818123752
appId=1:813818123752:web:355985fbe43bf1237d005d
measurementId=G-KD09159NHG
FIREBASE_ADMIN_PROJECT_ID=sqlmystery
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@sqlmystery.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCzcO1rtmRuAmJg\nTp0TeHxfDy7KRz7stmyE9ap2DM5UbVW/cm6RfC+eDbU5Cc3ock9nLc444OjGgOqG\npUlqqrXo7R3ldOKT4AWao8Fwv1RgO+N0JjpH0xgv+TOc4fqaNkWovvdhfL0no25v\nCKfFM2kQHoU8674sh7c/fa0YOTprweSiOJA+tTkje2Pi2PbhuAGh6xvZsADRS4NK\n/9xs2xgaKBFb/p5d8zxy6pDlSWmmY+JcmNbGdpmJudSye6CtztY8uAQJogwm9tqt\n/EsGkqZAY+rYLOz3VDFpzNbg/pmiw7a+eLfNFEsZtCwiiF5HzsT6VyEZRT5876YK\nMNbnilOFAgMBAAECggEAHFxrphPanTmSv2qFcJOhQqwFZvKqSyMNFVm3wrdE8Dqk\nrCDjwWpZo1dCzpxSV1wj2Si3+KzxlZhAGR5sM2f+Xu2FRWQ7QIiOkjGyLAYNibVF\nfrDhEsOWRdTTF8duwqtzyJdARb//rJFr7bA2RhiZUTMlt2qCMQsVRztvnY3EAk5L\n+g1JKENdkFvOj4FCc/fGV9/x63Qgwv/PhG+0mHES/4c8cncCHB73PBlN6hiM4mUH\nOwagqkZx0uG4La9FFFeVEnLSzw/pM4hMvjPaOslgmyWXMEDKK0IV6/VVJOVNdE3U\nihV1stUOk2Y2+jdxtqMkgVDT1RVQAn/A0QQgwIJCWQKBgQDYBAsLpZS3/At21MMz\nn0GlKfdTNRlgxJav3XDbgfNsfusaTsZwZrUGwA7yReLzbG6QSEN5FnC5zxms01P1\n88irl2zKLSqm4vedsK6hu36ya8nwpbnJjksVAoZdlZId0fC3TJRPZ3ekrUsMAaWg\np3mO3xGJEtsEyJrVNjJadrrnvQKBgQDUp8kJHEZBEEU9XRPK891CSTKOyEmVn4P1\nYso2egd5LHlQAcJYPKbvbWJZ1pUnhJeknMxy08BZbZB9y1wd+v0UdRcyB40FQDQL\n6ZKUYzDI4dAQKOw95aDBWo88u2aXyj47b36zQziuixYuH/LQKQU/+yWiW6PApQUy\nL0Ki2ytTaQKBgF1KCbci8EIw0IamRhLyMThyEkTWBrq6y9Txjj7ONWFiwoffA2Yh\nhQaARTQuKGA2MN2Qx8rwfQhRv2Xa8kSi3sP0JmB99xCRrpxkZFamkYXedRy/hafd\nEuHk8EBUSwEj3JBcuyQ7q/jreiCaSXxDN4UTIxCOmxXKyMtRl5dn9ToFAoGAIQuR\nqeDC6gllOQvlr3wFve8x9A4boSyQjOk1ExITZzkKAOzFDoEeT8Znqh42P1XTWrki\n7BULptnnwiR/xAjkmvE3EYcq2s4HSHKbXIOtaQnuExTI4TV1rZYs+/sDDkNXOFUz\nExg3Dqh+YdyFFuPI9RBJ4NjssVrzW8EMUdJNAUECgYEAkM+Bo1F1SDqUI8oUACyN\nwIWOrLiGGZFFJgzH8u6O8F9da182Lqd9WqHsxQ1WtjI5h5oys3oNixOUo4lt/BdH\nqOklmSPmJ9wJkdPpUVnQwWGVYxBvUVijZlTHaWiiu7ah1Hztx7cd7lQJix9IlKkK\n8QRljJpgKu08G4WP9YylcG4=\n-----END PRIVATE KEY-----\n"
FRONTEND_URL=https://apihub-macedo.duckdns.org
FRONTEND_PORT=3001
ENVEOF
chmod 600 /opt/apps/sql-challenge/backend/.env.production

cat > /opt/apps/sql-challenge/backend/.env.staging << 'ENVEOF'
POSTGRES_USER=challenge_user
POSTGRES_PASSWORD=G7#kpL2!mZq9Xv
POSTGRES_DB=db_gestao_staging
DB_PORT=5432
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://challenge_user:G7%23kpL2!mZq9Xv@sql-challenge-db:5432/db_gestao_staging?sslmode=disable
apiKey=AIzaSyCjcUNiPRfL20Di5Yd6gRCcVPeOBpnG9IE
authDomain=sqlmystery.firebaseapp.com
projectId=sqlmystery
storageBucket=sqlmystery.firebasestorage.app
messagingSenderId=813818123752
appId=1:813818123752:web:355985fbe43bf1237d005d
measurementId=G-KD09159NHG
FIREBASE_ADMIN_PROJECT_ID=sqlmystery
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@sqlmystery.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCzcO1rtmRuAmJg\nTp0TeHxfDy7KRz7stmyE9ap2DM5UbVW/cm6RfC+eDbU5Cc3ock9nLc444OjGgOqG\npUlqqrXo7R3ldOKT4AWao8Fwv1RgO+N0JjpH0xgv+TOc4fqaNkWovvdhfL0no25v\nCKfFM2kQHoU8674sh7c/fa0YOTprweSiOJA+tTkje2Pi2PbhuAGh6xvZsADRS4NK\n/9xs2xgaKBFb/p5d8zxy6pDlSWmmY+JcmNbGdpmJudSye6CtztY8uAQJogwm9tqt\n/EsGkqZAY+rYLOz3VDFpzNbg/pmiw7a+eLfNFEsZtCwiiF5HzsT6VyEZRT5876YK\nMNbnilOFAgMBAAECggEAHFxrphPanTmSv2qFcJOhQqwFZvKqSyMNFVm3wrdE8Dqk\nrCDjwWpZo1dCzpxSV1wj2Si3+KzxlZhAGR5sM2f+Xu2FRWQ7QIiOkjGyLAYNibVF\nfrDhEsOWRdTTF8duwqtzyJdARb//rJFr7bA2RhiZUTMlt2qCMQsVRztvnY3EAk5L\n+g1JKENdkFvOj4FCc/fGV9/x63Qgwv/PhG+0mHES/4c8cncCHB73PBlN6hiM4mUH\nOwagqkZx0uG4La9FFFeVEnLSzw/pM4hMvjPaOslgmyWXMEDKK0IV6/VVJOVNdE3U\nihV1stUOk2Y2+jdxtqMkgVDT1RVQAn/A0QQgwIJCWQKBgQDYBAsLpZS3/At21MMz\nn0GlKfdTNRlgxJav3XDbgfNsfusaTsZwZrUGwA7yReLzbG6QSEN5FnC5zxms01P1\n88irl2zKLSqm4vedsK6hu36ya8nwpbnJjksVAoZdlZId0fC3TJRPZ3ekrUsMAaWg\np3mO3xGJEtsEyJrVNjJadrrnvQKBgQDUp8kJHEZBEEU9XRPK891CSTKOyEmVn4P1\nYso2egd5LHlQAcJYPKbvbWJZ1pUnhJeknMxy08BZbZB9y1wd+v0UdRcyB40FQDQL\n6ZKUYzDI4dAQKOw95aDBWo88u2aXyj47b36zQziuixYuH/LQKQU/+yWiW6PApQUy\nL0Ki2ytTaQKBgF1KCbci8EIw0IamRhLyMThyEkTWBrq6y9Txjj7ONWFiwoffA2Yh\nhQaARTQuKGA2MN2Qx8rwfQhRv2Xa8kSi3sP0JmB99xCRrpxkZFamkYXedRy/hafd\nEuHk8EBUSwEj3JBcuyQ7q/jreiCaSXxDN4UTIxCOmxXKyMtRl5dn9ToFAoGAIQuR\nqeDC6gllOQvlr3wFve8x9A4boSyQjOk1ExITZzkKAOzFDoEeT8Znqh42P1XTWrki\n7BULptnnwiR/xAjkmvE3EYcq2s4HSHKbXIOtaQnuExTI4TV1rZYs+/sDDkNXOFUz\nExg3Dqh+YdyFFuPI9RBJ4NjssVrzW8EMUdJNAUECgYEAkM+Bo1F1SDqUI8oUACyN\nwIWOrLiGGZFFJgzH8u6O8F9da182Lqd9WqHsxQ1WtjI5h5oys3oNixOUo4lt/BdH\nqOklmSPmJ9wJkdPpUVnQwWGVYxBvUVijZlTHaWiiu7ah1Hztx7cd7lQJix9IlKkK\n8QRljJpgKu08G4WP9YylcG4=\n-----END PRIVATE KEY-----\n"
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
