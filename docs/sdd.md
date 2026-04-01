# 🛠️ Software Design Document (SDD)

**Projeto:** [Nome do Projeto]
**Versão:** 1.0.0  
**Status:** ⚪ Aguardando Geração de Especificações.

## 🤖 1. Orquestração e Contexto de IA (MCP)
> Configuração dos servidores Model Context Protocol para a IDE Agêntica.

* **Figma/Stitch MCP:** `[LINK DO ARQUIVO]` (Ler design tokens, cores e hierarquia visual).
* **Supabase MCP:** Contexto do banco de dados real e políticas de RLS.
* **GitHub MCP:** Leitura das Issues do Kanban para orientar a implementação (Spec-Driven).

## 📦 2. Stack Tecnológica e Bibliotecas
> Definição estrita das tecnologias permitidas (package.json). Nenhuma dependência externa deve ser instalada sem refletir aqui.

* **Core:** Angular 21+ (Standalone / Signals).
* **BaaS & Auth:** Supabase-js.
* **Estilização & UI:** Tailwind CSS, Spartan UI (HLM), Lucide Angular (Ícones).
* **Utilitários:** [Ex: date-fns para datas, zod para schemas].

## 🗄️ 3. Arquitetura de Dados

### 📖 3.1. Glossário Técnico (Mapeamento)
| Termo PRD (PT-BR) | Entidade Técnica (EN) | Atributos Principais |
| :--- | :--- | :--- |
| Ex: Sorteio | `draw` | `id`, `group_id`, `drawer_id` |

### 📊 3.2. Diagrama ER (Mermaid)
> [O Código do Diagrama Mermaid será inserido aqui no próximo passo]

## 📑 4. Contratos Globais (Interfaces & Types)
> Tipagem TypeScript baseada no banco de dados.

> [Interfaces TypeScript globais serão inseridas aqui]

## 🏗️ 5. Scaffolding Macro (Arquitetura Frontend)

### 📂 5.1. Estrutura de Pastas Base
* **`src/app/core/`**: Services globais singleton, Interceptors, Functional Guards.
* **`src/app/features/`**: Smart Components (Páginas) que gerenciam rotas e consomem services.
* **`src/app/shared/`**: UI Components (Dumb), pipes e diretivas puros e reutilizáveis.

### 🚦 5.2. Mapa de Rotas e Páginas (Features)
| Rota | Page Component | Functional Guard |
| :--- | :--- | :--- |
| `/login` | `src/app/features/login/login.page.ts` | Público |

### 🧠 5.3. Core Services (Singleton)
| Service | Arquivo | Responsabilidade Macro |
| :--- | :--- | :--- |
| `AuthService` | `core/services/auth.service.ts` | Gerenciar sessão Supabase e estado do usuário logado. |

## 🛡️ 6. Segurança (Supabase RLS)
> Políticas de acesso a nível de banco de dados.

| Tabela | Política (RLS) |
| :--- | :--- |
| `[tabela]` | [Regra de acesso] |
