# DEVELOPMENT.md — Ambiente de desenvolvimento

Guia para rodar o frontend localmente. Complementa o [README](./README.md).

## Pré-requisitos

| Requisito | Observação |
|-----------|------------|
| Node.js ≥ 20 · npm ≥ 9 | — |
| Backend rodando | `http://localhost:3002` (veja `sql-challenge-backend/DEVELOPMENT.md`) |
| Projeto Firebase | Mesmas credenciais (Client SDK) do backend |

## Primeira vez

```bash
# 1. Dependências
npm install

# 2. Variáveis de ambiente
cp .env.local.example .env.local
# edite .env.local:
#   NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
#   NEXT_PUBLIC_FIREBASE_* = mesmos valores do backend (.env)

# 3. Servidor de desenvolvimento (Turbopack)
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

> O frontend depende do backend de dev para conteúdo (desafios, capítulos) e auth.
> Suba o backend antes: `cd ../sql-challenge-backend && bash scripts/db-dev.sh up && npm run dev`.

## Fluxo completo de dev (ordem)

```bash
# Terminal 1 — banco + API
cd ../sql-challenge-backend
bash scripts/db-dev.sh up     # PostgreSQL de dev (db_gestao_dev)
npm run dev                   # API em http://localhost:3002

# Terminal 2 — frontend
cd ../sql-challenge-frontend
npm run dev                   # UI em http://localhost:3000
```

## Variáveis de ambiente

| Variável | Valor local | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3002` | URL da API backend |
| `NEXT_PUBLIC_BASE_PATH` | *(vazio)* | Base path (só no deploy) |
| `NEXT_PUBLIC_API_PORT` | `3002` | Porta da API (uso interno dos serviços) |
| `NEXT_PUBLIC_FIREBASE_*` | projeto `sqlmystery` | Client SDK (mesmos valores do backend) |

## Portas

| Serviço | Porta |
|---------|-------|
| Frontend (Next.js) | `3000` |
| Backend (Express) | `3002` |
| PostgreSQL de dev | `5432` (`db_gestao_dev`) |

## Scripts úteis

```bash
npm run dev      # servidor de desenvolvimento (Turbopack)
npm run build    # build de produção
npm run lint     # ESLint
npx tsc --noEmit # checagem de tipos
```

## Troubleshooting

| Sintoma | Causa provável / solução |
|---------|--------------------------|
| Login falha / dados vazios | Backend não está rodando ou `.env.local` aponta para outra URL |
| `NEXT_PUBLIC_FIREBASE_*` inválidos | Copie os mesmos valores do `.env` do backend |
| Porta 3000 ocupada | Encerre o processo antigo (`lsof -ti :3000 \| xargs kill`) |
| Conteúdo do jogo desatualizado | Reseed no backend: `bash scripts/db-dev.sh reseed` |
