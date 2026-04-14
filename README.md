# Secretário — Plataforma de Inteligência Financeira com IA

Ambiente completo com backend, frontend, banco de dados e agentes de Inteligência Artificial, orquestrados com Docker para análise inteligente de pagamentos.

---

## 🌐 Visão Geral

O **Secretário** é uma plataforma que combina:

* Backend (API)
* Frontend (interface web)
* Banco de dados (PostgreSQL)
* Agentes de IA (OpenClaw)
* Automação e orquestração com Docker

O objetivo é transformar dados financeiros complexos em informações claras e acessíveis para tomada de decisão.

---

## 📸 Demonstração

### 📊 Dashboard

![Dashboard](./docs/dashboard.png)

### 💰 Tela de Pagamentos

![Pagamentos](./docs/pagamentos.png)

### 🤖 Chat com IA

![Chat IA](./docs/chat.png)

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

* Dashboard financeiro com indicadores
* Listagem e busca de pagamentos
* Leitura de dados via CSV
* Geração de descrições automáticas com IA
* Chat inteligente para consultas financeiras
* Ambiente totalmente containerizado

---

## 🧠 Inteligência Artificial

O sistema utiliza IA para:

* Interpretar dados financeiros
* Gerar descrições automáticas de pagamentos
* Responder perguntas em linguagem natural
* Apoiar tomada de decisão

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

```bash
secretario/
├── backend/
├── frontend/
├── docker-compose.yml
├── .env.example
├── README.md
└── docs/
```

---

## ⚙️ Como executar o projeto

### Pré-requisitos

* Docker
* Docker Compose

---

### 1. Clonar o repositório

```bash
git clone https://github.com/Guilherme-FDS/Secretario.git
cd Secretario
```

---

### 2. Configurar variáveis de ambiente

Crie o arquivo `.env`:

```env
DATABASE_URL=postgres://admin:admin123@postgres:5432/secretario
OPENROUTER_API_KEY=sua_chave_aqui
SECRET_KEY=sua_chave_secreta
```

---

### 3. Subir todos os serviços

```bash
docker compose up --build
```

---

## 🌐 Serviços disponíveis

| Serviço     | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| PostgreSQL  | localhost:5432        |

---

## 📊 Fonte de Dados

* Arquivos CSV
* Dados financeiros estruturados
* Integração futura com ERP

---

## 🔐 Segurança

* Variáveis sensíveis via `.env`
* Tokens protegidos
* Banco isolado em container

---

## 🔮 Evoluções Futuras

* Integração com ERP
* Chat IA em tempo real
* Automação com agentes
* Dashboards avançados
* Integração com WhatsApp

---

## 📌 Status do Projeto

Em desenvolvimento 🚀

---

## 👨‍💻 Autor

Guilherme Silva
