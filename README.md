# 🎁 Com Quem Será (Amigo Secreto)

🔗 **Link em Produção:** *Pendente*
👨‍💻 **Autores:**
- Samuel Patrick Meneses
- Alan Gabriel Dos Santos Kuiawa

## 🎯 1. Visão Geral
Web app para organizar sorteios de Amigo Secreto de forma justa e anônima, permitindo a criação de grupos, convite de participantes e revelação individual segura.

## 📚 2. Documentação Oficial (Docs as Code)
Toda a especificação do sistema está versionada na pasta `/docs`:
* 📄 **[PRD (Product Requirements Document)](./docs/prd.md):** User Stories, escopo, regras de negócio e links do Figma.
* 📐 **[SDD (Software Design Document)](./docs/sdd.md):** Diagrama de banco de dados (Mermaid), arquitetura de pastas, APIs e contratos de dados.
* ✅ **[Checklist de Avaliação](./docs/checklist.md):** Controle de entrega dos requisitos da disciplina.

## 🛠 3. Stack Tecnológica
* **Frontend:** Angular 19 (Standalone, Signals)
* **Estilização:** Tailwind CSS + Lucide Angular
* **Backend (BaaS):** Pocketbase (API + Auth + SQLite)

## 🚀 4. Quick Start (Como Executar)
1. **Configurar variáveis de ambiente:**
   ```bash
   npm run setup:env
   ```
   Edite o `.env` gerado conforme necessário. Para detalhes sobre cada variável, veja o [SDD](./docs/sdd.md#🔐-8-variáveis-de-ambiente).
2. **Rodar o servidor de desenvolvimento:**
   ```bash
   npm run dev:web
   ```
3. **(Opcional) Executar testes:**
   ```bash
   npm run docker:test
   ```
   Os testes rodam em container Docker com Selenium Firefox. Requer Docker Compose instalado.
