## 📄 Product Requirements Document (PRD) - Seção 8 Atualizada

# 📄 Product Requirements Document (PRD)

**Projeto:** Com Quem Será (Amigo Secreto)  
**Versão:** 1.0.0  
**Status:** 🟡 Em Definição (MVP)

## 🎯 1. Visão Geral e Objetivo
O "Com Quem Será" é um sistema de amigo secreto que resolve o problema de organizar sorteios de forma justa e anônima. O objetivo principal é permitir que um usuário autenticado crie um grupo, convide outros usuários, realize o sorteio aleatório e que cada participante descubra apenas a pessoa que deve presentear, sem saber quem o tirou. O projeto é focado no desenvolvimento frontend, utilizando Pocketbase como backend acadêmico com autenticação nativa.

## 📖 2. Glossário Ubíquo
- **Usuário:** Pessoa cadastrada no sistema com email e senha.
- **Grupo:** Espaço virtual que agrega um conjunto de participantes para um sorteio de amigo secreto.
- **Organizador:** Usuário que cria o grupo e possui permissões administrativas.
- **Participante:** Usuário convidado que faz parte de um grupo de amigo secreto (representado pelo registro em `group_participant`).
- **Sorteio:** Processo automático que preenche os campos `giver_id` e `receiver_id` na tabela `group_participant`, formando um ciclo fechado onde ninguém tira a si mesmo.
- **Revelação:** Momento em que o participante descobre qual é o seu "amigo secreto" (seu `receiver_id`).
- **Convite:** Link ou código único gerado para adicionar participantes a um grupo.

## 👤 3. Atores e Permissões
- **Organizador (Admin):**
  - Criar e deletar grupos.
  - Definir nome e descrição do grupo.
  - Iniciar o sorteio (apenas uma vez por grupo).
  - Remover participantes do grupo.
  - Visualizar todos os participantes e resultados (em modo debug/administrativo).
- **Participante Comum:**
  - Acessar o grupo via link de convite.
  - Visualizar apenas seu próprio amigo secreto (seu `receiver_id`) após o sorteio.
  - Sair do grupo (remover a si mesmo).

## 📝 4. Escopo Funcional (User Stories)
| ID | Como um... | Eu quero... | Para que... | Prioridade |
|----|------------|--------------|---------------|-------------|
| US01 | Usuário | Me cadastrar no sistema com email e senha | Ter uma identidade única no sistema | Must |
| US02 | Usuário | Fazer login no sistema | Acessar meus grupos e participar de sorteios | Must |
| US03 | Organizador | Criar um novo grupo de amigo secreto | Gerar um link de convite único | Must |
| US04 | Participante | Entrar em um grupo usando um link de convite | Fazer parte do sorteio | Must |
| US05 | Organizador | Iniciar o sorteio do grupo | Distribuir os amigos secretos aleatoriamente | Must |
| US06 | Participante | Visualizar meu amigo secreto (receiver_id) | Saber quem devo presentear | Must |
| US07 | Organizador | Remover um participante antes do sorteio | Gerenciar a lista de pessoas válidas | Could |
| US08 | Participante | Sair de um grupo antes do sorteio | Não participar mais da brincadeira | Should |
| US09 | Organizador | Ver todos os pares gerados no sorteio | Validar que ninguém tirou a si mesmo | Should |
| US10 | Usuário | Visualizar todos os grupos que participo | Ter uma visão geral das brincadeiras ativas | Must |
| US11 | Usuário | Editar meu nome e senha | Manter meus dados atualizados e protegidos | Should |

## 🛡️ 5. Regras de Negócio (Constraints)
- **RN01:** Um grupo deve ter no mínimo 3 participantes para que o sorteio seja realizado.
- **RN02:** O sorteio não pode ser realizado mais de uma vez no mesmo grupo (verificar se todos os `group_participant` já possuem `giver_id` e `receiver_id` preenchidos).
- **RN03:** Nenhum participante pode ser sorteado para presentear a si mesmo (impedir que `giver_id = receiver_id`).
- **RN04:** O resultado do sorteio (quem tirou quem) deve ser visível apenas para o organizador.
- **RN05:** O participante só pode ver seu `receiver_id` após o sorteio ser concluído.
- **RN06:** O link de convite deve expirar ou ser invalidado após o sorteio para evitar novas entradas.
- **RN07:** O organizador não pode ser removido do grupo.
- **RN08:** Um usuário só pode participar uma única vez do mesmo grupo (unicidade de `user_id + group_id` em `group_participant`).

## 🚫 6. Fora de Escopo (Non-goals)
- Envio automático de e-mails ou SMS com o resultado.
- Sistema de notificações push.
- Chat interno entre os participantes.
- Personalização de avatar ou foto de perfil.
- Suporte a múltiplos idiomas (apenas PT-BR).
- Integração com pagamentos ou validação de endereço.
- Recuperação de senha via email (MVP usa Pocketbase com email sem envio real).
- Sorteio com restrições personalizadas (ex: evitar pares específicos).

## ⚙️ 7. Requisitos Não Funcionais (Qualidade)
- **Responsividade:** Interface mobile-first, funcionando perfeitamente em celulares e tablets.
- **Performance:** O sorteio deve ser processado em menos de 2 segundos para grupos de até 50 participantes.
- **Usabilidade:** Fluxo claro e intuitivo, com feedbacks visuais e mensagens de erro amigáveis.
- **Manutenibilidade:** Código estruturado com componentes reutilizáveis e uso intensivo de RxJS para estado reativo.
- **Consistência:** UI consistente com o tema "amigo secreto" (cores suaves, tons de presente, celebração).
- **Segurança:** As regras de acesso do Pocketbase devem impedir que usuários vejam dados de outros.
- **Disponibilidade:** A aplicação deve estar disponível via containerização com Docker, permitindo fácil deploy em qualquer ambiente.
- **Portabilidade:** Todo o ambiente (frontend + backend + proxy) deve subir com um único comando (`docker-compose up`).

## 🛠️ 8. Tech Stack Principal (Diretrizes)

### 8.1. Frontend
| Categoria | Tecnologia | Versão | Finalidade |
| :--- | :--- | :--- | :--- |
| **Framework** | Angular | 19 (Standalone Components) | Estrutura principal da SPA |
| **Linguagem** | TypeScript | 5.x | Tipagem estática e manutenibilidade |
| **Estilização** | Tailwind CSS | 3.x | Utilitário CSS para UI responsiva |
| **Gerenciamento de Estado** | RxJS | 7.x | Reatividade e streams de dados |
| **Ícones** | Lucide Angular | ^0.x | Ícones vetoriais leves e customizáveis |
| **Build Tool** | Angular CLI | 19.x | Compilação, bundling e desenvolvimento |

### 8.2. Backend (BaaS Acadêmico)
| Categoria | Tecnologia | Versão | Finalidade |
| :--- | :--- | :--- | :--- |
| **Backend as a Service** | Pocketbase | ^0.22.x | API REST, autenticação nativa, banco SQLite |
| **SDK Cliente** | Pocketbase JS SDK | ^0.21.x | Comunicação frontend ↔ Pocketbase |
| **Banco de Dados** | SQLite (embutido) | 3.x | Persistência de dados (via Pocketbase) |

### 8.3. Infraestrutura e Deploy
| Categoria | Tecnologia | Versão | Finalidade |
| :--- | :--- | :--- | :--- |
| **Containerização** | Docker | 24.x+ | Empacotamento da aplicação |
| **Orquestração** | Docker Compose | 2.x+ | Multi-container (Nginx + Pocketbase) |
| **Servidor Web / Proxy** | Nginx | Alpine (latest) | Servir SPA e proxy reverso para API |
| **Rede Virtual** | Bridge Network (Docker) | - | Isolamento e comunicação entre containers |
| **Volumes Persistentes** | Bind mounts | - | Logs (`./server/`) e dados (`./db/`) |
| **Workspace Manager** | NPM Workspaces | ^10.x | Orquestração de subprojetos (Monorepo) |

### 8.4. Ambiente de Desenvolvimento
| Categoria | Tecnologia | Finalidade |
| :--- | :--- | :--- |
| **IDE** | Antigravity | Ambiente acadêmico de desenvolvimento |
| **Controle de Versão** | Git | Versionamento do código-fonte |
| **API Client** | Pocketbase Admin UI (via `/_/`) | Gerenciamento visual do banco e regras |

### 8.5. Comunicação Entre Camadas

```mermaid
flowchart LR
    subgraph Navegador
        A[Angular SPA]
    end
    
    subgraph Docker Host
        subgraph "Container: Nginx (:80)"
            N[Proxy Reverso]
        end
        
        subgraph "Container: Pocketbase (:8090)"
            P[API + Auth + SQLite]
        end
        
        N -->|"/api/*"| P
        N -->|"/* (SPA)"| A
    end
    
    A -->|"HTTP via Nginx"| N
    P -->|"Respostas JSON"| N
```

### 8.6. Diretrizes Técnicas Obrigatórias
- **IDE:** Antigravity (ambientação acadêmica) - todo desenvolvimento deve ser feito nesta IDE.
- **Frontend:** Angular 19 com Standalone Components (módulos não são obrigatórios).
- **Backend:** Pocketbase será executado via Docker, não como binário local.
- **Estilização:** Tailwind CSS exclusivamente (sem CSS customizado ou pré-processadores).
- **Estado Global:** RxJS (BehaviorSubjects para estado reativo compartilhado).
- **Build:** Produção deve gerar artefatos estáticos otimizados via `ng build --configuration production`.
- **Deploy:** A aplicação completa (Angular + Nginx + Pocketbase) deve subir com `docker-compose up -d`.
- **Organização:** Arquitetura Monorepo utilizando a pasta `apps/` para aplicações.
- **Portas Expostas:** Apenas a porta 80 do Nginx deve estar acessível ao host.
- **Persistência:** Dados do Pocketbase (`pb_data`) e logs do Nginx (`server/logs`) devem persistir fora dos containers.

## 🖥️ 9. Descrição Funcional das Telas

> **Nota:** Esta seção descreve o comportamento e fluxo de cada tela, sem especificar cores, fontes ou posicionamento visual. O foco está na experiência do usuário e nas ações possíveis.

### 9.1. Tela de Login (`/login`)

**Acesso:** Rota pública. Usuários não autenticados são direcionados automaticamente para esta tela ao tentar acessar rotas protegidas. Usuários já autenticados que tentarem acessar esta rota são redirecionados para `/my-groups`.

**Comportamento esperado:**
- A tela apresenta um formulário com dois campos obrigatórios:
  - **Email** (formato válido de e-mail)
  - **Senha** (campo mascarado)
- Um botão principal **"Entrar"** submete o formulário.
- Um link ou botão secundário **"Criar conta"** redireciona para `/register`.
- Opcionalmente, um link **"Esqueci minha senha"** pode ser exibido (fora de escopo no MVP, mas pode ser desabilitado com mensagem informativa).

**Fluxos possíveis:**
| Cenário | Ação do Sistema |
| :--- | :--- |
| ✅ Credenciais válidas | Autentica o usuário via Pocketbase, armazena o token de sessão, redireciona para `/my-groups`. |
| ❌ Email não cadastrado | Exibe mensagem de erro: "Usuário não encontrado". |
| ❌ Senha incorreta | Exibe mensagem de erro: "Senha inválida". Limpa o campo senha mantendo o email preenchido. |
| ❌ Campos vazios | Desabilita o botão "Entrar" até que ambos os campos estejam preenchidos. Exibe validação em tempo real. |
| ❌ Email mal formatado | Exibe mensagem de erro: "Digite um email válido". |

**Feedback visual (semântico):**
- Durante o envio do formulário, o botão "Entrar" deve mostrar um estado de "carregando" (spinner ou texto "Entrando...") e ficar desabilitado para evitar múltiplos envios.
- Após erro, o campo correspondente deve ser destacado e receber foco automaticamente (quando aplicável).
- Em caso de erro de rede/ servidor, exibir mensagem genérica: "Erro de conexão. Tente novamente mais tarde."

**Transições:**
- Login bem-sucedido → `/my-groups`
- Clique em "Criar conta" → `/register`

---

### 9.2. Tela de Cadastro de Usuário (`/register`)

**Acesso:** Rota pública. Acessível via link da tela de login ou diretamente pela URL. Usuários já autenticados são redirecionados para `/my-groups`.

**Comportamento esperado:**
- A tela apresenta um formulário com os seguintes campos obrigatórios:
  - **Nome** (texto livre, mínimo 2 caracteres, máximo 100)
  - **Email** (formato válido, não pode existir outro usuário com o mesmo email)
  - **Senha** (mínimo 8 caracteres, campo mascarado)
  - **Confirmar senha** (deve ser idêntico ao campo senha)
- Um botão principal **"Cadastrar"** submete o formulário.
- Um link ou botão secundário **"Já tenho conta"** redireciona para `/login`.

**Regras de validação:**
| Campo | Regra | Mensagem de erro |
| :--- | :--- | :--- |
| Nome | Obrigatório, 2-100 caracteres | "Digite seu nome completo" |
| Email | Obrigatório, formato válido, único | "Email inválido" ou "Este email já está cadastrado" |
| Senha | Obrigatório, mínimo 8 caracteres | "A senha deve ter pelo menos 8 caracteres" |
| Confirmar Senha | Deve corresponder exatamente à Senha | "As senhas não coincidem" |

**Fluxos possíveis:**
| Cenário | Ação do Sistema |
| :--- | :--- |
| ✅ Dados válidos | Cria o usuário no Pocketbase, realiza login automático (ou redireciona para login com mensagem de sucesso), direciona para `/my-groups`. |
| ❌ Email já cadastrado | Exibe mensagem de erro no campo email: "Este email já está cadastrado". Mantém os demais campos preenchidos (exceto senhas). |
| ❌ Senhas não coincidem | Exibe mensagem de erro abaixo do campo "Confirmar senha". Limpa ambos os campos de senha. |
| ❌ Campos vazios ou inválidos | Desabilita o botão "Cadastrar" até que todos os campos estejam válidos. Exibe validação em tempo real (após o primeiro toque/ blur). |

**Feedback visual (semântico):**
- Durante o envio, o botão "Cadastrar" deve mostrar estado de "carregando" ("Cadastrando...") e ficar desabilitado.
- Validação em tempo real: campos inválidos são indicados imediatamente após o usuário sair do campo (evento blur).
- Após sucesso no cadastro, opcionalmente exibir um toast/mensagem: "Conta criada com sucesso! Bem-vindo(a) ao Com Quem Será".

**Transições:**
- Cadastro bem-sucedido → `/my-groups`
- Clique em "Já tenho conta" → `/login`

---

### 9.3. Tela Meus Grupos (`/my-groups`)

**Acesso:** Rota protegida por autenticação (`authGuard`). É a tela inicial após login bem-sucedido. Usuários não autenticados são redirecionados para `/login`.

**Layout Funcional:**
- A tela é dividida em duas áreas principais:
  1. **Cabeçalho:** Saudação ao usuário (ex: "Olá, [Nome]") e um botão "Criar novo grupo".
  2. **Área de conteúdo:** Lista paginada de cards, cada um representando um grupo do qual o usuário participa ou é organizador.

**Comportamento esperado:**

#### 9.3.1. Lista de Grupos (Paginada)
- Os grupos são carregados da API do Pocketbase, combinando:
  - Grupos onde o usuário é `created_by` (organizador)
  - Grupos onde o usuário possui um registro em `group_participant`
- A lista deve ser paginada com:
  - **Itens por página:** Configuração padrão (ex: 10 grupos por página)
  - **Controles de navegação:** Botões "Anterior", "Próximo" e indicador de página atual
  - **Total de registros:** Exibir "Mostrando X de Y grupos"
- Enquanto os dados são carregados, exibir um indicador de carregamento (spinner ou skeleton cards)
- Em caso de erro no carregamento, exibir mensagem amigável e botão "Tentar novamente"

#### 9.3.2. Card do Grupo (Estrutura)
Cada card deve conter as seguintes informações e ações:

| Elemento | Descrição | Origem dos Dados |
| :--- | :--- | :--- |
| **Nome do grupo** | Título principal do card | `group.name` |
| **Data de criação** | Exibir "Criado em dd/mm/aaaa" | `group.created_at` |
| **Data do sorteio** | Se `has_been_drawn = true`, exibir "Sorteio realizado em dd/mm/aaaa". Caso contrário, exibir "Sorteio não realizado" ou similar. | `group.has_been_drawn` e `draw.drawn_at` (se disponível) |
| **Número de participantes** | Exibir "X participantes" | `group.participants_count` ou cálculo via `group_participant` |
| **Indicador de administrador** | Se o usuário logado é o `created_by` do grupo, exibir um selo/ícone "Admin" ou "Organizador" | Comparar `group.created_by` com `currentUser.id` |
| **Botão de ação principal** | **"Acessar grupo"** → Redireciona para `/group/:groupId` | - |

**Comportamento do Card:**
- Ao clicar em qualquer área do card (exceto botões), redirecionar para o dashboard do grupo.
- O card inteiro deve ter um efeito de hover (feedback visual de que é clicável).
- Se o grupo já teve o sorteio realizado (`has_been_drawn = true`), o card pode ter um indicador visual diferente (ex: borda verde, ícone de presente).

#### 9.3.3. Estado "Nenhum grupo encontrado"
- Quando o usuário não participa de nenhum grupo e não criou nenhum grupo:
  - Exibir mensagem amigável: "Você ainda não participa de nenhum grupo de amigo secreto."
  - Exibir ilustração ou ícone temático (presente, envelope, etc.)
  - Destacar o botão "Criar novo grupo" (pode ser visualmente enfatizado)

#### 9.3.4. Botão "Criar novo grupo"
- Posicionado no cabeçalho da tela, sempre visível.
- Ao clicar, redireciona para `/create`.
- Deve ser acessível via teclado e leitores de tela.

**Fluxos possíveis:**
| Cenário | Ação do Sistema |
| :--- | :--- |
| ✅ Carregamento bem-sucedido | Exibe os cards dos grupos paginados. |
| ✅ Usuário clica em "Acessar grupo" | Redireciona para `/group/:groupId`. |
| ✅ Usuário clica em "Criar novo grupo" | Redireciona para `/create`. |
| ✅ Usuário navega entre páginas | Recarrega a lista com os grupos da página solicitada. Mantém o estado de scroll (opcional). |
| ❌ Sessão expirada durante uso | Redireciona para `/login` com mensagem "Sua sessão expirou. Faça login novamente." |
| ❌ Erro de rede ao carregar grupos | Exibe mensagem de erro e botão "Tentar novamente". |

**Feedback visual (semântico):**
- **Carregamento inicial:** Spinner centralizado ou skeleton cards (recomendado para melhor experiência).
- **Mudança de página:** Desabilitar controles de paginação durante o carregamento, exibir spinner pequeno ou skeleton nos cards.
- **Sem grupos:** Mensagem centralizada com botão de criação destacado.
- **Card com admin:** Selo/ícone discreto mas perceptível (ex: "Admin" ou estrela/escudo).

**Paginação (Detalhes Técnicos Comportamentais):**
- A paginação deve ser baseada em **offset/limit** ou **cursor** (conforme suporte do Pocketbase).
- Parâmetros de consulta na URL (opcional, mas recomendado para compartilhamento):
  - `?page=1&limit=10`
- Ao navegar para outra página, a URL deve ser atualizada para permitir voltar/avançar no histórico do navegador.
- O número total de páginas é calculado com base no total de grupos ÷ limite por página.

**Transições:**
- Clique em "Criar novo grupo" → `/create`
- Clique em "Acessar grupo" → `/group/:groupId`
- Sessão expirada → `/login`
- Logout (ação do usuário, via botão de sair) → `/login`

---

### 9.4. Tela Criar Grupo (`/create`)

**Acesso:** Rota protegida por autenticação (`authGuard`). Acessível via botão "Criar novo grupo" na tela `/my-groups` ou diretamente pela URL. Usuários não autenticados são redirecionados para `/login`.

**Comportamento esperado:**
- A tela apresenta um formulário com os seguintes elementos:
  - **Campo: Nome do grupo** (obrigatório, texto livre, mínimo 3 caracteres, máximo 100 caracteres)
  - **Checkbox: "Participar do grupo"** (opcional, texto sugestivo como "Quero participar deste grupo" ou "Incluir-me no grupo")
  - **Botão principal: "Criar grupo"** (submete o formulário)
  - **Link ou botão secundário: "Cancelar"** (retorna para `/my-groups`)

**Regras de validação:**
| Campo | Regra | Mensagem de erro |
| :--- | :--- | :--- |
| Nome do grupo | Obrigatório, 3-100 caracteres, não pode conter apenas espaços | "Digite um nome para o grupo (mínimo 3 caracteres)" |

**Fluxo de criação (detalhado):**

| Passo | Ação do Sistema |
| :--- | :--- |
| 1 | Usuário preenche o nome do grupo. |
| 2 | Usuário decide se marca ou não o checkbox "Participar do grupo". |
| 3 | Usuário clica em "Criar grupo". |
| 4 | Sistema valida o nome do grupo. |
| 5 | Sistema cria o registro na tabela `group` com: <br> - `name` = valor do campo <br> - `description` = null (ou vazio) <br> - `created_by` = `currentUser.id` <br> - `has_been_drawn` = false <br> - `participants_count` = 0 (inicial) |
| 6 | **Se o checkbox "Participar do grupo" estiver marcado:** <br> Sistema cria um registro em `group_participant` com: <br> - `group_id` = ID do grupo recém-criado <br> - `giver_id` = null <br> - `receiver_id` = null <br> - `joined_at` = data atual <br> E incrementa `participants_count` do grupo para 1. |
| 7 | **Se o checkbox NÃO estiver marcado:** <br> O grupo é criado sem participantes. O organizador (criador) não participa do sorteio. |
| 8 | Sistema redireciona o usuário para a tela de dashboard do grupo (`/group/:groupId`). |
| 9 | Opcionalmente, exibir mensagem de sucesso: "Grupo [nome] criado com sucesso!" |

**Fluxos possíveis:**
| Cenário | Ação do Sistema |
| :--- | :--- |
| ✅ Dados válidos + checkbox marcado | Cria o grupo, adiciona o criador como participante, redireciona para `/group/:groupId`. |
| ✅ Dados válidos + checkbox desmarcado | Cria o grupo sem adicionar o criador como participante, redireciona para `/group/:groupId`. |
| ❌ Nome do grupo já existe (opcional, se houver restrição de unicidade) | Exibe mensagem de erro: "Já existe um grupo com este nome. Escolha outro nome." |
| ❌ Nome inválido (vazio ou muito curto) | Exibe mensagem de erro específica. Mantém o checkbox no estado escolhido. |
| ❌ Erro de rede ou servidor | Exibe mensagem: "Erro ao criar grupo. Tente novamente." Mantém os dados preenchidos. |

**Feedback visual (semântico):**
- **Durante o envio:** Botão "Criar grupo" mostra estado de "carregando" ("Criando...") e fica desabilitado. O campo nome e o checkbox também ficam desabilitados.
- **Validação em tempo real:** O campo nome é validado enquanto o usuário digita (após o primeiro caractere, ou apenas no blur). Exibir mensagem de erro abaixo do campo quando inválido.
- **Checkbox:** Deve ter label clara e associada corretamente (acessibilidade). Valor padrão = desmarcado.
- **Cancelar:** Botão secundário que retorna para `/my-groups` sem criar nada. Não exige confirmação.

**Comportamento do checkbox em detalhe:**
- **Texto sugerido:** "Incluir-me como participante do grupo" ou "Quero participar deste grupo"
- **Tooltip/info (opcional):** "Se marcado, você será adicionado automaticamente ao grupo como participante. Caso contrário, você será apenas o organizador, mas não participará do sorteio."
- **Impacto:** Apenas na criação do registro `group_participant`. Não afeta permissões de organizador (o criador sempre é organizador, independente de participar ou não).

**Edge Cases:**
| Situação | Comportamento |
| :--- | :--- |
| Usuário cria grupo sem participar | O organizador pode posteriormente se adicionar ao grupo? Sim, via link de convite ou botão "Participar" no dashboard (a ser definido). |
| Usuário cria grupo com checkbox marcado | O organizador já entra como participante. Não pode se remover enquanto for o único organizador (regra RN07). |
| Falha na criação do `group_participant` após criar o grupo | Sistema deve fazer rollback (deletar o grupo criado) ou tentar novamente. Exibir erro genérico. |

**Transições:**
- Clique em "Criar grupo" (sucesso) → `/group/:groupId`
- Clique em "Cancelar" → `/my-groups`
- Sessão expirada durante preenchimento → `/login` (após tentativa de submit)

---

### 9.5. Tela Dashboard do Grupo (`/group/:groupId`)

**Acesso:** Rota protegida por autenticação (`authGuard`) e por `groupExistsGuard` (verifica se o grupo existe). Usuários não autenticados são redirecionados para `/login`. Usuários autenticados que não pertencem ao grupo (não são `created_by` nem possuem registro em `group_participant`) devem ser redirecionados para `/my-groups` com mensagem de erro.

**Visões:** A tela possui comportamentos diferentes dependendo do papel do usuário no grupo:
- **Visão do Criador (Organizador):** Usuário que é `created_by` do grupo.
- **Visão do Participante Comum:** Usuário que possui registro em `group_participant` mas NÃO é o `created_by`.

```mermaid
flowchart TD
    A[Usuário acessa /group/:groupId] --> B{Está autenticado?}
    
    B -->|Não| C[Redireciona para /login<br>com parâmetro returnUrl]
    C --> D[Usuário faz login]
    D --> E[Redireciona de volta para<br>/group/:groupId]
    E --> B
    
    B -->|Sim| F{Usuário é membro<br>do grupo?}
    
    F -->|Sim - É created_by| G[Exibe Visão do Criador]
    F -->|Sim - É participante| H[Exibe Visão do Participante]
    
    F -->|Não| I[Exibe Tela de Convite<br>para participar do grupo]
    I --> J{Usuário aceita<br>participar?}
    
    J -->|Sim| K[Adiciona usuário ao grupo<br>como participante]
    K --> H
    
    J -->|Não| L[Redireciona para /my-groups<br>ou permanece na tela de convite]
```

---

#### 9.5.1. Visão do Criador (Organizador)

**Layout Funcional:**
- A tela exibe as seguintes seções/informações:
  1. **Cabeçalho do grupo:** Nome do grupo, data de criação, indicador de status do sorteio (realizado ou não).
  2. **Área de ações do organizador:** Botões para ações administrativas.
  3. **Lista de participantes:** Tabela ou grid com todos os participantes do grupo.
  4. **Área de compartilhamento:** Link de convite com botão para copiar.

**Comportamento esperado:**

##### 9.5.1.1. Status do Sorteio
| Situação | Exibição |
| :--- | :--- |
| Sorteio NÃO realizado (`has_been_drawn = false`) | Badge/indicador "Sorteio pendente" (ex: amarelo/laranja). Exibir contagem regressiva ou mínimo de participantes. |
| Sorteio realizado (`has_been_drawn = true`) | Badge/indicador "Sorteio realizado" (ex: verde). Exibir data do sorteio. |

##### 9.5.1.2. Ações do Organizador (Pré-sorteio)

| Ação | Condição | Comportamento |
| :--- | :--- | :--- |
| **"Tornar-se membro"** | Criador NÃO está na lista de participantes (`group_participant` não existe para este user no grupo) | Adiciona o criador como participante. Cria registro `group_participant` com `giver_id` = null, `receiver_id` = null. Incrementa `participants_count`. Exibe mensagem de sucesso. |
| **"Deixar de ser membro"** | Criador ESTÁ na lista de participantes E grupo tem mais de 1 participante (não é o único) | Remove o criador da lista de participantes. Deleta registro `group_participant`. Decrementa `participants_count`. Exibe mensagem de sucesso. |
| **"Deixar de ser membro" (bloqueado)** | Criador é o ÚNICO participante do grupo | Botão desabilitado com tooltip: "Você é o único participante. Adicione mais pessoas antes de sair." |
| **"Copiar link de convite"** | Sempre disponível | Copia o URL de convite para a área de transferência. Exibir feedback "Link copiado!". |
| **"Realizar sorteio"** | Mínimo 3 participantes E sorteio NÃO realizado | Executa o algoritmo de sorteio (via API custom). Preenche `giver_id` e `receiver_id` para todos os participantes. Marca `has_been_drawn = true`. Redireciona para `/group/:groupId/admin` (ou exibe resultados na mesma tela). |
| **"Realizar sorteio" (bloqueado)** | Menos de 3 participantes | Botão desabilitado com tooltip: "É necessário no mínimo 3 participantes para realizar o sorteio." |
| **"Realizar sorteio" (bloqueado)** | Sorteio já realizado | Botão oculto ou desabilitado com tooltip: "O sorteio deste grupo já foi realizado." |
| **"Excluir grupo"** | Sorteio NÃO realizado | Abre modal de confirmação: "Tem certeza que deseja excluir o grupo [nome]? Esta ação não pode ser desfeita." Após confirmação, deleta o grupo e todos os `group_participant` associados. Redireciona para `/my-groups`. |
| **"Excluir grupo" (bloqueado)** | Sorteio já realizado | Botão oculto ou desabilitado com tooltip: "Grupos com sorteio realizado não podem ser excluídos." |

##### 9.5.1.3. Ações do Organizador (Pós-sorteio)

| Ação | Comportamento |
| :--- | :--- |
| **"Ver resultado do sorteio"** | Redireciona para `/group/:groupId/admin` (painel administrativo com todos os pares). |
| **"Copiar link de convite"** | Disponível mas convites não devem funcionar mais (ou exibir aviso: "Sorteio já realizado, novos participantes não podem entrar"). |
| **"Excluir grupo"** | Desabilitado (ou oculto). |

##### 9.5.1.4. Lista de Participantes

| Elemento | Descrição |
| :--- | :--- |
| **Nome do participante** | Nome do usuário (campo `name` da tabela `user`). |
| **Indicador de organizador** | Se o participante é o `created_by`, exibir selo "Organizador" ou ícone de coroa/estrela. |
| **Botão "Remover"** | Apenas para participantes que NÃO são o organizador. Disponível apenas ANTES do sorteio. Após sorteio, ocultar ou desabilitar. |
| **Ação de remover** | Remove o participante do grupo. Deleta registro `group_participant`. Decrementa `participants_count`. Exibe mensagem: "[Nome] foi removido do grupo." |

**Comportamento da remoção:**
| Cenário | Ação do Sistema |
| :--- | :--- |
| ✅ Remoção bem-sucedida | Atualiza a lista de participantes. Se o grupo ficar com menos de 3 participantes, o botão "Realizar sorteio" é desabilitado. |
| ❌ Tentativa de remover organizador | Botão de remover NÃO é exibido para o organizador. (Protegido pela interface). |

##### 9.5.1.5. Link de Convite

| Elemento | Comportamento |
| :--- | :--- |
| **URL de convite** | Exibir o link completo ou um campo com o link (ex: `http://localhost/join?code=xxx`). |
| **Botão "Copiar"** | Copia o link para a área de transferência. Exibir feedback visual "Copiado!". |
| **Gerar novo código** | Opcional (MVP pode não ter). Se implementado, invalidar código antigo e gerar novo. |

---

#### 9.5.2. Visão do Participante Comum

**Layout Funcional:**
- A tela exibe as seguintes seções/informações:
  1. **Cabeçalho do grupo:** Nome do grupo, data de criação, indicador de status do sorteio.
  2. **Área de ações do participante:** Botões para ações disponíveis.
  3. **Lista de participantes:** Visualização limitada (apenas nomes, sem ações de remoção).
  4. **Revelação do amigo secreto** (exibido diretamente na tela, se sorteio já realizado).

**Comportamento esperado:**

##### 9.5.2.1. Status do Sorteio (para participante)

| Situação | Exibição e Ações |
| :--- | :--- |
| Sorteio NÃO realizado (`has_been_drawn = false`) | Badge "Aguardando sorteio". Botão "Sair do grupo" disponível. Área de revelação do amigo secreto oculta ou exibe "Aguardando sorteio...". |
| Sorteio realizado (`has_been_drawn = true`) | Badge "Sorteio realizado!". Área de revelação do amigo secreto **exibe o nome da pessoa que o participante deve presentear**. Botão "Sair do grupo" **NÃO é exibido** (participante não pode sair após sorteio). |

##### 9.5.2.2. Ações do Participante

| Ação | Condição | Comportamento |
| :--- | :--- | :--- |
| **"Sair do grupo"** | Sorteio NÃO realizado | Abre modal de confirmação: "Tem certeza que deseja sair do grupo [nome]?" Após confirmação, deleta o registro `group_participant` do usuário. Decrementa `participants_count`. Redireciona para `/my-groups`. |
| **"Sair do grupo"** | Sorteio já realizado | **Botão NÃO é exibido** (ou oculto). Participante não pode sair após o sorteio ser realizado. |
| **"Copiar link de convite"** | Apenas se o participante quiser convidar outros (opcional) | Copia o link de convite. Se sorteio já realizado, exibir aviso: "O sorteio já foi realizado. Novos participantes não podem entrar." |

##### 9.5.2.3. Revelação do Amigo Secreto (Área de Destaque)

**Pré-sorteio (sorteio não realizado):**
| Elemento | Comportamento |
| :--- | :--- |
| **Título** | "Seu amigo secreto" |
| **Conteúdo** | Exibir mensagem: "❓ O sorteio ainda não foi realizado. Aguarde o organizador realizar o sorteio." |
| **Ação** | Nenhuma. Botão ou área desabilitada/placeholder. |

**Pós-sorteio (sorteio realizado):**
| Elemento | Comportamento |
| :--- | :--- |
| **Título** | "🎁 Seu amigo secreto é..." |
| **Conteúdo** | Exibir o **nome** do usuário presente no campo `receiver_id` (buscando o `name` na tabela `user` via expand). |
| **Apresentação** | Nome em destaque (visualmente proeminente, tamanho maior). |
| **Mensagem adicional** | "Não conte para ninguém! 🤫" (opcional, mas recomendado para tom lúdico). |
| **Ação** | Nenhuma ação adicional. Apenas visualização informativa. |

---

### 9.7. Tela de Perfil do Usuário (`/profile`)

**Acesso:** Rota protegida por autenticação (`authGuard`). Acessível via um link ou botão no cabeçalho/avatar do usuário em qualquer tela (ex: ícone de perfil no canto superior direito). Usuários não autenticados são redirecionados para `/login` com `returnUrl=/profile`.

**Layout Funcional:**
- A tela é dividida em duas seções principais:
  1. **Seção de Informações Pessoais:** Exibe dados do usuário com opção de edição.
  2. **Seção de Segurança:** Permite alteração de senha.
- Opcionalmente, pode haver uma seção de "Sair da conta" (botão de logout).

**Comportamento esperado:**

#### 9.7.1. Seção de Informações Pessoais

| Elemento | Comportamento |
| :--- | :--- |
| **Email** | Exibido como texto apenas (campo não editável). O email é o identificador único e não pode ser alterado no MVP. |
| **Nome** | Exibido em um campo de texto editável. Valor atual pré-preenchido. |
| **Status de verificação** | Exibir "Email verificado" ou "Email não verificado" (baseado no campo `verified` do Pocketbase). Fora de escopo do MVP, apenas exibição informativa. |
| **Botão "Salvar alterações"** | Submete a alteração do nome. |
| **Botão "Cancelar"** | Reverte o campo nome para o valor original (sem fazer requisição). |

**Regras de validação (Nome):**
| Regra | Mensagem de erro |
| :--- | :--- |
| Obrigatório (não pode estar vazio) | "O nome é obrigatório." |
| Mínimo 2 caracteres | "O nome deve ter pelo menos 2 caracteres." |
| Máximo 100 caracteres | "O nome deve ter no máximo 100 caracteres." |
| Não pode conter apenas espaços | "Digite um nome válido." |

**Fluxos possíveis (alteração de nome):**
| Cenário | Ação do Sistema |
| :--- | :--- |
| ✅ Nome válido | Atualiza o campo `name` do usuário no Pocketbase. Exibe mensagem de sucesso: "Nome atualizado com sucesso!" |
| ❌ Nome inválido | Exibe mensagem de erro específica. Não envia requisição. Mantém o campo com o valor digitado (para correção). |
| ❌ Erro de rede/servidor | Exibe mensagem: "Erro ao atualizar nome. Tente novamente." Mantém o valor digitado. |
| ❌ Sessão expirada durante edição | Redireciona para `/login` com `returnUrl=/profile`. |

**Feedback visual (semântico):**
- Durante o envio, o botão "Salvar alterações" deve mostrar estado de "carregando" ("Salvando...") e ficar desabilitado.
- Validação em tempo real: campo nome é validado enquanto o usuário digita (após o primeiro caractere ou no blur).
- Após sucesso, o campo pode manter o novo valor e o botão volta ao estado normal.

---

#### 9.7.2. Seção de Segurança (Alteração de Senha)

**Layout Funcional:**
- A seção deve conter um formulário com três campos:
  1. **Senha atual** (campo mascarado, obrigatório)
  2. **Nova senha** (campo mascarado, obrigatório)
  3. **Confirmar nova senha** (campo mascarado, obrigatório)
- **Botão "Alterar senha"** (submete a alteração)
- **Botão "Cancelar"** (limpa os campos do formulário)

**Regras de validação:**
| Campo | Regra | Mensagem de erro |
| :--- | :--- | :--- |
| Senha atual | Obrigatório | "Digite sua senha atual." |
| Nova senha | Obrigatório, mínimo 8 caracteres | "A nova senha deve ter pelo menos 8 caracteres." |
| Confirmar nova senha | Deve corresponder exatamente à Nova senha | "As senhas não coincidem." |

**Fluxos possíveis (alteração de senha):**
| Cenário | Ação do Sistema |
| :--- | :--- |
| ✅ Dados válidos | Atualiza a senha do usuário no Pocketbase. Exibe mensagem de sucesso: "Senha alterada com sucesso!" Limpa os campos do formulário. |
| ❌ Senha atual incorreta | Exibe mensagem de erro: "Senha atual incorreta." Limpa apenas o campo "Senha atual". Mantém os campos "Nova senha" e "Confirmar nova senha". |
| ❌ Nova senha igual à senha atual | Exibe mensagem de erro: "A nova senha deve ser diferente da senha atual." |
| ❌ Campos inválidos (validação) | Exibe mensagem de erro específica. Não envia requisição. |
| ❌ Erro de rede/servidor | Exibe mensagem: "Erro ao alterar senha. Tente novamente." Mantém os campos preenchidos (exceto senha atual, por segurança). |
| ❌ Sessão expirada durante edição | Redireciona para `/login` com `returnUrl=/profile`. |

**Feedback visual (semântico):**
- Durante o envio, o botão "Alterar senha" deve mostrar estado de "carregando" ("Alterando...") e ficar desabilitado.
- Validação em tempo real: campos de nova senha e confirmação são validados enquanto o usuário digita.
- Após sucesso, os campos são limpos e o botão volta ao estado normal.
- O campo "Senha atual" deve ser limpo após erro (por segurança), mas os campos de nova senha podem ser mantidos para correção.

**Considerações de Segurança:**
- A alteração de senha deve ser feita via API do Pocketbase que exige a senha atual para validação.
- Após alteração bem-sucedida, o usuário NÃO deve ser deslogado (a sessão permanece ativa).
- Recomendação: exibir aviso "Você precisará fazer login novamente na próxima vez que sair" (opcional).

---

#### 9.7.3. Seção de Logout (opcional)

| Elemento | Comportamento |
| :--- | :--- |
| **Botão "Sair da conta"** | Realiza logout do usuário. Limpa o token de sessão local. Redireciona para `/login`. |

**Comportamento:**
- O botão deve estar visualmente separado das outras seções (ex: rodapé da tela ou linha divisória).
- Ao clicar, não é necessário modal de confirmação (mas pode ser implementado como boa prática).
- Após logout, o usuário é redirecionado para `/login`.

---

#### 9.7.4. Estados e Carregamento

**Carregamento inicial:**
| Situação | Comportamento |
| :--- | :--- |
| Carregando dados do usuário | Exibir spinner ou skeleton loading no lugar das informações. |
| Erro ao carregar dados | Exibir mensagem: "Erro ao carregar informações do perfil. Tente novamente." Botão "Tentar novamente". |
| Usuário não autenticado | Redirecionar para `/login` com `returnUrl=/profile`. |

**Feedback de ações:**
| Ação | Feedback de Sucesso | Feedback de Erro |
| :--- | :--- | :--- |
| Alterar nome | Toast/mensagem: "Nome atualizado!" | Mensagem inline no campo ou toast de erro |
| Alterar senha | Toast/mensagem: "Senha alterada com sucesso!" | Mensagem inline no campo ou toast de erro |
| Logout | Redirecionamento imediato (sem mensagem) | - |

---

#### 9.7.5. Diagrama de Fluxo da Tela de Perfil

```mermaid
flowchart TD
    A[Acessa /profile] --> B{Usuário autenticado?}
    
    B -->|Não| C[Redireciona para /login<br>com returnUrl=/profile]
    C --> D[Após login, volta para /profile]
    D --> B
    
    B -->|Sim| E[Carregar dados do usuário]
    E --> F[Exibir formulários]
    
    F --> G{Usuário altera nome?}
    G -->|Sim| H[Validar nome]
    H -->|Válido| I[Atualizar no Pocketbase]
    H -->|Inválido| J[Exibir erro]
    I --> K[Exibir sucesso]
    
    F --> L{Usuário altera senha?}
    L -->|Sim| M[Validar campos]
    M -->|Válido| N[Enviar para API do Pocketbase]
    M -->|Inválido| O[Exibir erro]
    N -->|Senha atual correta| P[Atualizar senha]
    N -->|Senha atual incorreta| Q[Exibir erro]
    P --> R[Exibir sucesso, limpar campos]
    
    F --> S{Usuário clica em Sair?}
    S -->|Sim| T[Realizar logout]
    T --> U[Redirecionar para /login]
```