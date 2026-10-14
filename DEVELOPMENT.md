# DEVELOPMENT.md — Ambiente de desenvolvimento

Guia para rodar o frontend localmente. Complementa o [README](./README.md).

## Pré-requisitos

| Requisito | Observação |
|-----------|------------|
| Node.js ≥ 20 · npm ≥ 9 | — |
| Backend rodando | `http://localhost:3002` (veja `sql-challenge-backend/DEVELOPMENT.md`) |
| Firebase local | Emuladores rodando no backend (`npm run emulators`) — **dev não usa o projeto de produção** |

## Primeira vez

```bash
# 1. Dependências
npm install

# 2. Variáveis de ambiente
cp .env.local.example .env.local
# em dev o Auth usa o emulador local:
#   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
# (os valores NEXT_PUBLIC_FIREBASE_* podem ficar como estão no exemplo)

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

# Terminal 2 — Firebase local (Auth + Firestore)
cd ../sql-challenge-backend
npm run emulators             # Auth 9099 · Firestore 8080 · UI 4000

# Terminal 3 — frontend
cd ../sql-challenge-frontend
npm run dev                   # UI em http://localhost:3000
```

## Firebase (dev)

- Com `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true`, o Auth do frontend aponta para o **emulador local** (`http://localhost:9099`) — login, registro e recuperação de senha rodam 100% na sua máquina.
- Os emuladores são gerenciados pelo backend (`npm run emulators`); a UI fica em **http://localhost:4000**, onde você inspeciona contas e e-mails "enviados".
- Crie contas de teste pela própria tela de registro do app (ou pela UI do emulador).
- Para redefinir tudo (contas + dados): no backend, `bash firebase/emulator/firebase-emulators.sh --clear`.
- ⚠️ Nunca aponte o dev para o projeto de produção (`sqlmystery`): o backend bloqueia esse cenário por padrão.

## Variáveis de ambiente

| Variável | Valor local | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3002` | URL da API backend |
| `NEXT_PUBLIC_BASE_PATH` | *(vazio)* | Base path (só no deploy) |
| `NEXT_PUBLIC_API_PORT` | `3002` | Porta da API (uso interno dos serviços) |
| `NEXT_PUBLIC_USE_FIREBASE_EMULATOR` | `true` | Aponta o Auth para o emulador local (dev) |
| `NEXT_PUBLIC_FIREBASE_*` | projeto `demo-sql-challenge` | Namespace local dos emuladores (produção usa `sqlmystery` via Docker ARGs) |

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
| Login falha / erro de rede no auth | Emuladores do Firebase não estão rodando → `cd ../sql-challenge-backend && npm run emulators` |
| Conta não encontrada (após trocar para o emulador) | O emulador começa vazio — crie a conta na tela de registro (as contas de produção não existem localmente) |
| Login falha / dados vazios | Backend não está rodando ou `.env.local` aponta para outra URL |
| Porta 3000 ocupada | Encerre o processo antigo (`lsof -ti :3000 \| xargs kill`) |
| Conteúdo do jogo desatualizado | Reseed no backend: `bash scripts/db-dev.sh reseed` |
