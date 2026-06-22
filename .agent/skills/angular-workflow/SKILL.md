---
name: angular-workflow
description: Audita a arquitetura Angular — Feature-Driven (core/shared/features), standalone-only, Tailwind-only, rotas
---
# Angular Architecture Inspector

You are a Senior Quality Inspector.

## Escopo
Validar se `apps/web/src/app/` segue fielmente a arquitetura Feature-Driven (core, shared, features) definida em `docs/sdd.md` §5.1 e as diretrizes técnicas do `docs/prd.md`.

## Checklist

### 1. Camadas Feature-Driven (SDD §5.1)
Use Glob + Grep para contar arquivos fonte em cada camada:
- `core/` — deve conter services, guards, models
- `shared/` — deve conter componentes reutilizáveis (bottom-nav, group-card, search-filter)
- `features/` — deve conter page components (auth, my-groups, create-group, profile, etc.)

Reporte quantos arquivos `.ts` (não spec) existem em cada camada.

### 2. Standalone-only (PRD §8.6 / ID4)
- `grep -r 'NgModule' apps/web/src/app/ --include='*.ts' -l`
- Se encontrar, reporte como ❌ com os paths

### 3. Tailwind-only (SDD §2)
- `grep -r 'styleUrl' apps/web/src/app/ --include='*.ts' -l`
- Se encontrar styleUrls ou styleUrl, reporte como ❌

### 4. Mapa de Rotas (SDD §5.2)
Leia `apps/web/src/app/app.routes.ts` e confirme que TODAS as rotas existem:
- `/login` → auth/login
- `/register` → auth/register
- `/my-groups` → my-groups
- `/create` → create-group
- `/group/:groupId` → group-dashboard
- `/profile` → profile

### 5. Signal-based State (SDD §5.3)
Verifique se services usam `inject()` (não constructor DI):
- Leia `apps/web/src/app/core/services/auth.service.ts`, `group.service.ts`, `participant.service.ts`
- Reporte se usar `constructor(`

Verifique se páginas usam `signal()` / `computed()` (não propriedades simples):
- Leia `apps/web/src/app/features/my-groups/my-groups.page.ts`
- Reporte se houver `: string =` ou `: number =` sem signal()

### 6. Testes
Execute `npm run docker:test` e reporte o resultado.

### 7. Stitch Alignment (Design → Code)
Use `stitch_list_projects` + `stitch_list_screens` para listar as telas do Stitch.

Compare cada tela Stitch (título + deviceType) com os componentes implementados em `features/`:
- Para cada tela MOBILE e DESKTOP, verifique se existe um componente Angular correspondente.
- Reporte telas sem componente (`❌`), componentes que só cobrem 1 viewport (`⚠️`), e telas com diferenças visuais relevantes.
- Verifique especialmente se os breakpoints responsivos do Stitch (390px mobile, 1280px desktop) estão cobertos.

Lista esperada:
- `Login / Cadastro` → `login.page.ts` (mobile + desktop)
- `Cadastro de Usuário` → `register.page.ts` (mobile)
- `Dashboard de Grupos` → `my-groups.page.ts` (mobile + desktop)
- `Criar Novo Grupo` → `create-group.page.ts` (mobile + desktop)
- `Meu Perfil` → `profile.page.ts` (mobile + desktop)
- `Detalhes do Grupo` → _(não implementado)_
- `Revelação` → _(não implementado)_

## Output
Relatório em markdown com seção por check, ✅/❌, paths e linhas relevantes.
