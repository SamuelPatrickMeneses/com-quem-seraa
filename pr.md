# feat: implementar fluxo de autenticação (signup, login, dashboard)

**Branch de origem:** `fix/feat/user-signup`
**Branch de destino:** `develop`

**Issues relacionadas:** Closes #6, Closes #7, Closes #15

---

## 📋 Descrição

Implementação completa do fluxo de autenticação de usuários: registro, login e dashboard (meus grupos).

### Commits incluídos (9)

| Hash | Descrição |
|------|-----------|
| `9c3771c` | Config multi-ambiente (Docker, Nginx, env, package.json) |
| `230e7a1` | Correção de dependências no docker-compose |
| `5432d48` | Página de registro com formulário reativo e integração PocketBase |
| `9ef5422` | Páginas de login e dashboard com navegação e autenticação |
| `4f3d19f` | Redirecionamento automático para dashboard após registro |
| `9fb0170` | Ajustes visuais, auth guard, segregação da lógica de login |
| `0ed79ff` | Remove import não utilizado de NgFor |
| `cee71e9` | Estrutura de pastas do PocketBase (db/pb_public/.gitkeep) |
| `665261e` | Regra de estilização: Tailwind global sem CSS próprio por componente |

### ✨ O que foi feito

- **AuthService** com integração PocketBase (login, registro, logout, editar perfil)
- **AuthGuard** para proteção de rotas (redireciona não autenticados para /login)
- **Página de Login** (`/login`) com formulário reativo, validação e loading state
- **Página de Registro** (`/register`) com validação cruzada de senha e integração PocketBase
- **Página My Groups** (`/my-groups`) como dashboard pós-login com informações do usuário
- **Rotas** configuradas com lazy loading, guards e redirect padrão (`/` → `/my-groups`)
- **SDD.md** atualizado com regra de estilização obrigatória
- **Estilização** migrada para Tailwind exclusivamente (arquivos CSS próprios removidos)
- **Infraestrutura** Docker com Nginx e suporte multi-ambiente (dev/prod)

### 🔧 Arquivos modificados

```
 apps/web/Dockerfile                                |   9 ++
 apps/web/src/app/app.component.html                |  15 +--
 apps/web/src/app/app.component.ts                  |   3 +-
 apps/web/src/app/app.routes.ts                     |  12 ++-
 apps/web/src/app/core/guards/auth.guard.ts         |  35 +++++++
 apps/web/src/app/core/services/auth.service.ts     |  57 ++++++++++++
 apps/web/src/app/pages/login/login.component.html  |  84 +++++++++++++++++
 .../src/app/pages/login/login.component.spec.ts    |  23 +++++
 apps/web/src/app/pages/login/login.component.ts    |  52 +++++++++++
 .../app/pages/my-groups/my-groups.component.html   | 102 ++++++++++++++++++
 .../pages/my-groups/my-groups.component.spec.ts    |  23 +++++
 .../src/app/pages/my-groups/my-groups.component.ts |  35 +++++++
 .../src/app/pages/register/register.component.html | 102 ++++++++++++++++++
 .../app/pages/register/register.component.spec.ts  |  23 +++++
 .../src/app/pages/register/register.component.ts   |  69 ++++++++++++++
 apps/web/src/index.html                            |   5 +-
 apps/web/src/styles.css                            |  37 ++++++--
 apps/web/tailwind.config.js                        |  42 ++++++---
 db/pb_hooks/seed.pb.js                             |   2 +-
 docker-compose.yml                                 |  25 +++--
 docs/sdd.md                                        |   1 +
 example.env                                        |   1 +
 package.json                                       |   4 +-
 server/nginx.conf → server/default.conf.template   |   8 +-
 24 files changed, 714 insertions(+), 55 deletions(-)
```

### 🧪 Como testar

```bash
# Subir ambiente completo
docker compose up -d

# Ou apenas o frontend em dev:
npm run dev:web
```

### 🏷️ Tipo de mudança

- [x] Nova funcionalidade (feat)
- [x] Refatoração (refactor)
- [x] Configuração/infraestrutura
