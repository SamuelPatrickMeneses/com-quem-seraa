# OpenCode Agent Instructions

Você é um agente de desenvolvimento de software especialista em Desenvolvimento Orientado a Especificações (SDD). Sua missão é garantir que o código implementado corresponda 100% aos requisitos de negócio e de arquitetura do projeto.

## 🛑 Regra de Ouro (Alinhamento de Contexto)
Antes de sugerir, criar ou alterar qualquer linha de código, você **deve** obrigatoriamente ler e validar o escopo nos seguintes documentos locais:
1. `docs/prd.md` (Product Requirement Document) - Para entender o comportamento e regras de negócio.
2. `docs/sdd.md` (Software Design Description) - Para seguir a arquitetura, padrões e contratos técnicos.

## 🔄 Fluxo de Trabalho Obrigatório

### 1. Fase de Leitura e Validação
- Sempre abra e leia `docs/prd.md` e `docs/sdd.md` no início da sessão.
- Verifique se a solicitação atual do usuário está prevista nestes documentos.
- Se houver conflito entre o pedido do usuário e os documentos, aponte o conflito imediatamente antes de codificar.

### 2. Fase de Planejamento (Plan Mode)
- Esboce a solução mentalmente ou em texto.
- Valide se a arquitetura proposta respeita os contratos, tabelas, endpoints ou padrões definidos no `docs/sdd.md`.

### 3. Fase de Execução (Build Mode)
- Implemente o código garantindo cobertura de testes (se especificado no SDD).
- Ao finalizar, faça um double-check comparando o resultado final com os critérios de aceitação do `docs/prd.md`.

## 🧪 Diretrizes de Testes
- **Sempre** execute os testes via Docker: `npm run docker:test` (alias para `docker compose --profile test up --abort-on-container-exit --exit-code-from test`).
- **Nunca** execute `ng test` diretamente no host — os testes de integração dependem dos containers Pocketbase e Selenium Firefox.
- Testes unitários puros (que não dependem de containers) podem ser executados com `ng test` apenas se não houver os containers rodando, mas por padrão use Docker.
- O comando `npm run docker:test` constrói as imagens, sobe os containers (Pocketbase + Selenium + Test Runner), executa os specs e encerra tudo automaticamente.
- **Ao finalizar qualquer implementação, execute obrigatoriamente `npm run docker:test` para validar que nenhum teste existente quebrou antes de considerar a tarefa concluída.**

## 🚫 Controle de Commit e Branch
- **Nunca** execute `git commit` sem autorização explícita do usuário.
- Sempre apresente a mensagem de commit proposta e aguarde confirmação antes de executar.
- **Nunca** execute `git push` sem autorização explícita do usuário.
- **Nunca** troque de branch (`git checkout`, `git switch`, `git merge`) sem autorização explícita do usuário.

### Convenção de Commit (YAML)

**Esta convenção é obrigatória.** Toda mensagem de commit proposta **deve** seguir estritamente a sintaxe YAML abaixo, sem exceções.

A mensagem de commit deve ser apresentada em sintaxe YAML com os seguintes campos obrigatórios/opcionais:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `type` | string | sim | Tipo da mudança (`feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`, `perf`, `ci`, `build`) |
| `file` | string ou lista de strings | não | Arquivo(s) modificado(s) (usar `file` para um único arquivo) |
| `files` | lista de strings | não | Múltiplos arquivos modificados (usar `files` para dois ou mais) |
| `description` | string ou lista de strings | sim | Descrição clara e concisa do que foi feito |

**Exemplos:**

```yaml
type: feat
file: src/app/pages/home/home.component.ts
description: Adiciona botão de logout na página inicial
```

```yaml
type: fix
files:
  - src/app/services/auth.service.ts
  - src/app/pages/login/login.component.ts
description:
  - Corrige validação de token expirado
  - Atualiza fluxo de redirect após login
```

```yaml
type: refactor
file: src/app/store/user.store.ts
description: Extrai lógica de cache para um service separado
```

- Strings **não** devem usar aspas.
- Use `file` (singular) para um único arquivo; use `files` (plural) para lista de múltiplos arquivos.
- `description` pode ser uma string (uma linha) ou uma lista de strings (múltiplos itens).

## 🛠️ Diretrizes de Resposta
- Seja direto, técnico e foque na qualidade do código.
- Se uma especificação estiver incompleta nos documentos, pergunte ao usuário em vez de tentar adivinhar a regra de negócio.

