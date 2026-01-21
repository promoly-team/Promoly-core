# Promoly

Promoly é uma plataforma de automação orientada a agentes para escalar campanhas de marketing de afiliados de forma inteligente, controlada e reutilizável.

O sistema é projetado para orquestrar agentes autônomos responsáveis pela distribuição periódica de mensagens promocionais com links de afiliado em canais de mensageria, respeitando regras de frequência, estratégia e expansão futura para múltiplos canais.

---

## 👥 Colaboradores

* Leandro Baldan  
* Eduardo Coutinho  

---

## 🧠 Visão geral do projeto

O Promoly nasce para resolver um problema comum no marketing de afiliados:  
promoções manuais, pouco escaláveis e difíceis de manter.

A proposta é transformar esse processo em um **sistema automatizado**, **configurável** e **orientado a agentes**, permitindo:

- Reuso de estratégias
- Controle de frequência (anti-spam)
- Escalabilidade horizontal
- Evolução futura para decisões inteligentes baseadas em dados

---

## 🧩 Arquitetura (alto nível)

- Núcleo de automação (engine)
- Agentes autônomos de envio
- Camada de regras e agendamento
- Integração com plataformas de mensageria
- Base preparada para múltiplos canais

---

## 📂 Arquivos `_example`

Arquivos com `_example` no nome servem como **templates** e **não devem ser usados diretamente** em produção.

O sistema sempre buscará o arquivo **sem** o sufixo `_example`.

Exemplos:

- `.env.example` → `.env`
- `agent_config_example.json` → `agent_config.json`

---

## 🔁 Padrão de rotina de desenvolvimento

Antes de iniciar qualquer tarefa, **sempre atualize sua branch local** com a branch base (`dev` ou `main`).

```bash
git fetch origin
git checkout dev
git pull origin dev
git checkout feature/sua-branch
git rebase dev

# se houver conflitos
git add <arquivos>
git rebase --continue


---

## ✅ Boas práticas de desenvolvimento

Para manter o projeto organizado, escalável e fácil de colaborar, seguimos os padrões abaixo.

---

### 🌿 Padronização de branches

Utilizamos branches curtas, objetivas e orientadas a propósito.

Formato:
tipo/descricao-curta

Tipos permitidos:
feat/        → nova funcionalidade
fix/         → correção de bug
refactor/    → refatoração sem mudança de comportamento
chore/       → tarefas técnicas (configs, deps, ajustes internos)
docs/        → documentação

Exemplos:
feat/agent-scheduler
fix/whatsapp-rate-limit
refactor/engine-core
docs/update-readme

---

### 📝 Padronização de commits

Adotamos um padrão inspirado no Conventional Commits, com mensagens claras e rastreáveis.

Formato:
tipo: descrição objetiva no imperativo

Tipos:
feat:       nova funcionalidade
fix:        correção de bug
refactor:   melhoria estrutural
docs:       documentação
test:       testes
chore:      tarefas técnicas

Exemplos:
feat: adiciona agente de envio por categoria
fix: corrige controle de frequência por grupo
refactor: reorganiza engine de agendamento
docs: documenta fluxo de agentes

Evite commits genéricos como:
update
ajustes
corrigindo coisas

---

### 🔀 Pull Requests (PRs)

- PRs devem ser pequenos e focados
- Um PR deve resolver um problema ou funcionalidade
- Descreva claramente o que foi feito e por quê
- Relacione o PR com a issue ou contexto quando possível

---

### 🔐 Configurações sensíveis

- Nunca versionar arquivos reais de configuração
- Não versionar:
  .env
  agent_config.json
- Utilize sempre arquivos *_example como base
- Dados sensíveis devem ser definidos via variáveis de ambiente

---

### 🧪 Qualidade e manutenção

- Priorize código legível e previsível
- Evite lógica mágica sem documentação
- Prefira composições simples e reutilizáveis
- Refatorações são bem-vindas quando melhoram clareza ou extensibilidade

---

### 🧠 Filosofia do projeto

O Promoly é pensado para:
- Crescer sem reescrita
- Permitir novos agentes sem impacto no núcleo
- Manter automação controlada, não caótica
- Priorizar decisões claras e arquitetura evolutiva
