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
