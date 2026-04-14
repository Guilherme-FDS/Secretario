# Secretário — Plataforma de Inteligência Financeira com IA

Ambiente completo com backend, frontend, banco de dados e agentes de Inteligência Artificial, orquestrados com Docker para análise inteligente de pagamentos.

---

## 🧠 Visão Geral

O **Secretário** é uma plataforma que combina:

* Backend (API)
* Frontend (interface web)
* Banco de dados (PostgreSQL)
* Agentes de IA (OpenClaw)
* Automação e orquestração com Docker

O objetivo é transformar dados financeiros complexos em informações claras e acessíveis para tomada de decisão.

---

## ⚙️ Arquitetura do Sistema

O projeto é composto pelos seguintes serviços:

* **Backend (Node.js / Express)** → API de dados financeiros
* **Frontend (Vue.js)** → Interface do usuário
* **PostgreSQL** → Persistência de dados
* **OpenClaw (IA)** → Processamento inteligente e automação
* **Docker Compose** → Orquestração de todos os serviços

---

## 🚀 Funcionalidades

* Visualização de pagamentos
* Dashboard financeiro
* Leitura de dados via CSV
* Integração com IA para interpretação de dados
* Estrutura para chat com IA
* Ambiente totalmente containerizado

---

## 🧠 Inteligência Artificial (OpenClaw)

O sistema utiliza o OpenClaw para:

* Processar dados financeiros
* Automatizar tarefas
* Integrar com APIs de IA (OpenRouter / OpenAI)
* Permitir evolução para agentes autônomos

---

## 🏗️ Tecnologias Utilizadas

### Backend

* Node.js
* Express

### Frontend

* Vue.js (Vite)

### Banco de Dados

* PostgreSQL

### Inteligência Artificial

* OpenClaw
* OpenRouter / OpenAI

### Infraestrutura

* Docker
* Docker Compose

---

## 📁 Estrutura do Projeto

```bash id="jv3f0m"
secretario/
├── backend/
├── frontend/
├── openclaw_data/
├── docker-compose.yml
├── .env
├── .env.example
├── README.md
```

---

## ⚙️ Como executar o projeto

### Pré-requisitos

* Docker
* Docker Compose

---

### 1. Clonar o repositório

```bash id="m2k9y7"
git clone https://github.com/SEU-USUARIO/secretario.git
cd secretario
```

---

### 2. Configurar variáveis de ambiente

Crie o arquivo `.env`:

```env id="7n7m3w"
DATABASE_URL=postgres://admin:admin123@postgres:5432/secretario
OPENROUTER_API_KEY=sua_chave_aqui
SECRET_KEY=sua_chave_secreta
```

---

### 3. Subir todos os serviços

```bash id="k2m7f9"
docker compose up --build
```

---

## 🌐 Serviços disponíveis

| Serviço     | URL                     |
| ----------- | ----------------------- |
| Frontend    | http://localhost:5173   |
| Backend API | http://localhost:3000   |
| PostgreSQL  | localhost:5432          |
| OpenClaw    | interno (via container) |

---

## 📊 Fonte de Dados

O sistema pode trabalhar com:

* Arquivos CSV
* Dados financeiros estruturados
* Integração futura com ERP

---

## 🔐 Segurança

* Variáveis sensíveis via `.env`
* Tokens de IA protegidos
* Banco de dados isolado em container

---

## 🔮 Evoluções Futuras

* Integração direta com ERP (API)
* Chat com IA em tempo real
* Automação com agentes inteligentes
* Dashboards avançados
* Integração com WhatsApp

---

## 📌 Status do Projeto

Em desenvolvimento 🚀

---

## 👨‍💻 Autor

Guilherme Silva
