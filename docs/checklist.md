# ✅ Checklist de Avaliação - Com Quem Será

Este documento registra o progresso da implementação dos requisitos da disciplina, organizados por Resultados de Aprendizado (RA).

**Legenda:** ✅ Implementado | ❌ Não implementado | 🟡 Parcialmente implementado

---

## 🎨 RA1 - Design e Experiência do Usuário (UI/UX) com IA
- [x] **ID1:** Protótipos navegáveis (Stitch/Figma) com link público no repositório.
  > **✅** Protótipo navegável no Google Stitch: https://stitch.withgoogle.com/projects/8277683531406145894
- [x] **ID2:** Interface responsiva com abordagem *Mobile-First*.
  > **✅** Bottom nav, Tailwind responsive classes (`lg:flex`, `hidden`, `max-w-lg mx-auto`), testes responsivos com `setViewport`.
- [x] **ID3:** Experiência de aplicativo nativo (PWA) e comportamento offline.
  > **✅** `manifest.webmanifest` com icons 192x192 e 512x512, `ngsw-config.json` com cache de assets e app shell, service worker registrado via `provideServiceWorker('ngsw-worker.js')` no `app.config.ts` (habilitado apenas em produção).

## 🧱 RA2 - Componentização e UI Declarativa Moderna
- [x] **ID3:** Componentes estritamente *Standalone*.
  > **✅** Todos os componentes usam `standalone: true` (Profile, GroupDashboard, BottomNav, GroupCard, etc.).
- [x] **ID4:** Uso de Framework CSS moderno (Tailwind CSS).
  > **✅** Tailwind + daisyUI em todo o projeto. Config em `tailwind.config.js`.
- [x] **ID5:** Sintaxe de fluxo de controle `@if` / `@switch`.
  > **✅** `@if`/`@else` usado extensivamente (profile.page.ts, group-dashboard, group-card). `@switch` não foi necessário — todos os casos resolvidos com `@if/@else if`.
- [x] **ID6:** Sintaxe de fluxo de controle `@for` com `track`.
  > **✅** `@for (...; track item.id)` em my-groups, group-dashboard, bottom-nav, admin-dashboard.
- [x] **ID7:** Aplicação de *Pipes* para formatação de dados.
  > **✅** `DatePipe` (`date:'dd/MM/yyyy'`) em group-dashboard e group-card; `UpperCasePipe` (`uppercase`) em my-groups. Nenhum pipe customizado.
- [x] **ID8:** Uso de *Deferrable Views* (`@defer`) para performance.
  > **✅** Bloco `@defer (on immediate)` no `profile.page.ts` postergando o card "Sessão" (logout), com `@placeholder` para evitar layout shift.

## ⚡ RA3 - Reatividade e Gerenciamento de Estado (Signals)
- [x] **ID9:** Uso de **Signals** (`writable` e `computed`) para estado.
  > **✅** `signal()` usado em ProfileComponent (loading, error, success, visibilidade), GroupDashboard (participants, loading), MyGroups (groups, loading, currentPage).
- [x] **ID10:** Captura de interações via *event binding* `( )`.
  > **✅** `(click)`, `(ngSubmit)`, `(input)`, `(blur)` usados em todos os formulários e botões.
- [x] **ID11:** Sincronização bidirecional com a função `model()`.
  > **✅** `search-filter.component.ts:24` — `readonly search = model('')`.
- [x] **ID12:** Uso de `effect()` para efeitos colaterais reativos.
  > **✅** `my-groups.page.ts:53` — `effect(() => sessionStorage.setItem(...))` para persistir página atual.

## 🏗️ RA4 - Arquitetura de Software e Injeção de Dependências
- [x] **ID13:** Comunicação entre componentes via `input()` e `output()`.
  > **✅** `input()` em BottomNav (`items`), GroupCard (`group`, `isAdmin`), ConfirmModal (`title`, `message`), SearchFilter (`search`). `output()` em ConfirmModal (`confirm`, `cancel`).
- [x] **ID14:** Uso de *Services* com a função `inject()`.
  > **✅** `inject()` usado em ProfileComponent, GroupDashboard, MyGroups, AuthService, GroupService, etc.

## 🛣️ RA5 - Roteamento e Navegação SPA
- [x] **ID15:** Configuração de rotas com `provideRouter` e `withComponentInputBinding`.
  > **✅** `app.config.ts:7` — `provideRouter(routes, withComponentInputBinding())`.
- [x] **ID16:** Consumo de parâmetros de rota via `@Input()`.
  > **✅** `my-groups.page.ts:21` — `input<string>('', { alias: 'groupId' })`. `group-dashboard.page.ts:47` — `@Input() groupId = ''`.
- [x] **ID17:** Estrutura de navegação aninhada (rotas filhas).
  > **✅** `group/:groupId` agora é rota pai com `canActivate: [authGuard, groupExistsGuard]`, contendo filhas `''` (GroupDashboard) e `admin` (AdminDashboard, com `isOrganizerGuard` adicional). `AdminDashboardComponent` usa `@Input() groupId` em vez de `route.snapshot`.
- [x] **ID18:** Uso de *Functional Route Guards* e *Resolvers*.
  > **✅** `authGuard`, `guestGuard` (`CanActivateFn`), `groupExistsGuard`, `isOrganizerGuard` — todos funcionais. Nenhum class-based guard.

## 🌐 RA6 - Integração de APIs e Assincronismo (BaaS)
- [x] **ID19:** Requisições assíncronas (GET) para API.
  > **✅** PocketBase SDK (`pb.collection().getList()`, `getOne()`) e `fetch()` nativo em `api.service.ts`.
- [x] **ID20:** Autenticação e Gestão de Sessão (Pocketbase/Supabase).
  > **✅** `AuthService` com login, registro, logout, gerenciamento de token via PocketBase AuthStore.
- [x] **ID21:** Operações CRUD completas no BaaS.
  > **✅** `BaseCrudService` com `getList`, `getById`, `create`, `update`, `delete`. Estendido por `GroupService`, `ParticipantService`, `DrawService`.
- [x] **ID22:** Uso de *Functional Interceptors* para tokens e erros.
  > **✅** Dois interceptors funcionais criados e registrados via `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))`: `authInterceptor` injeta token do PocketBase (`Bearer`), `errorInterceptor` captura/loga erros HTTP. `ExternalApiService` com `HttpClient` para demonstração. Testes com `HttpTestingController` validam ambos.
- [x] **ID23:** Validações em Formulários Reativos.
  > **✅** `ReactiveFormsModule` + `Validators.required`, `minLength`, `maxLength`, `pattern`, validadores customizados (`notOnlyWhitespace`, `passwordMatchValidator`).
- [x] **ID24:** Integração RxJS + Signals via `toSignal()` / `toObservable()`.
  > **✅** `toSignal()` usado no `ProfileComponent` para converter `Router.events` em `currentRoute` (exibido no template). `toObservable()` usado para converter `nameSuccess` signal em observable (`nameSuccess$`). Ambos importados de `@angular/core/rxjs-interop`.

## 🛠️ RA7 - Engenharia de Software, Versionamento e DevOps
- [x] **ID25:** Gerenciamento de repositório via *Gitflow*.
  > **✅** Branches `main`, `develop`, `testing`, `feature/*`, `fix/*`. PRs sempre apontando para `develop`.
- [x] **ID26:** Colaboração via *Pull Requests* e resolução de conflitos.
  > **✅** Template de PR em `.github/PULL_REQUEST_TEMPLATE.md`. Revisões via GitHub Copilot (`request_copilot_review`).
- [x] **ID27:** Build moderno e deploy automatizado (Vercel/Render).
  > **✅** Build Docker multi-stage (`apps/web/Dockerfile` + nginx:alpine). CI via GitHub Actions (`.github/workflows/ci.yml`).

## 🤖 RA8 - Engenharia de Software Assistida por IA
- [x] **ID28:** Gestão Ágil com IA (User Stories e Kanban no GitHub).
  > **✅** Issues para cada US (US01-US11), milestones, labels, projeto Kanban.
- [x] **ID29:** Fundações (PRD) com Diagrama ER Mermaid e Design System.
  > **✅** `docs/prd.md` com flowcharts Mermaid (arquitetura, fluxo de grupo, invite, profile). `docs/sdd.md` com diagrama ER e container architecture.
- [x] **ID30:** Especificação Técnica rigorosa via `.spec.md` / SDD.
  > **✅** `docs/sdd.md` com arquitetura, tabelas, contratos de API, padrões de código.
- [x] **ID31:** Orquestração de Agentes via MCP e Skills.
  > **✅** Uso de MCP tools (GitHub) e skills (`customize-opencode`). Agendamento via `Task` tool com subagents.
- [x] **ID32:** Validação e Testes gerados/orientados por IA.
  > **✅** Testes Jasmine gerados/orientados por IA cobrindo componentes, serviços, guards e navegação. 268 testes passando em pipeline Docker.
