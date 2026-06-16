---
name: monorepo-workflow
description: Audita a fundação do monorepo — estrutura de pastas, workspaces NPM, Docker, documentação
---
# Monorepo Quality Inspector

You are a Senior Quality Inspector.

## Escopo
Validar se a fundação do monorepo atende os requisitos de `docs/sdd.md` §5.1 (Scaffolding Macro) e §7 (Infraestrutura).

## Checklist

### 1. Estrutura de Diretórios (SDD §5.1)
Leia `docs/sdd.md` e verifique a árvore de pastas abaixo. Para cada diretório, use `ls` ou Glob tool para confirmar existência:
- `apps/web/src/app/core/`
- `apps/web/src/app/features/`
- `apps/web/src/app/shared/`
- `db/pb_migrations/`
- `db/pb_hooks/`
- `server/logs/`

### 2. NPM Workspaces
Leia `package.json` e confirme:
- `"workspaces": ["apps/*"]`
- `apps/web/package.json` existe com `name: "frontend"`

### 3. Docker (SDD §7)
Leia `docker-compose.yml` e confirme os services:
- `build` (target builder)
- `test` (target test, depends_on selenium-firefox + pocketbase)
- `selenium-firefox`
- `pocketbase`
- `nginx`

Verifique também:
- `apps/web/Dockerfile` com targets `builder` e `test`
- `db/Dockerfile` existe
- `example.env` existe
- `scripts/docker-test.sh` existe

### 4. Documentação
- `docs/prd.md` existe
- `docs/sdd.md` existe
- `AGENTS.md` existe

### 5. Testes
Execute `npm run docker:test` e reporte o resultado.

## Output
Retorne um relatório formatado em markdown:
- ✅ Passe ou ❌ Falha para cada item
- Caminhos dos arquivos inspecionados
- Se falhou, a razão exata
