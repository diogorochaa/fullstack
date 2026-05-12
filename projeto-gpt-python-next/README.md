# DocMind AI

Um sistema inteligente de processamento de documentos e chat com IA, composto por um backend robusto em Python e um frontend moderno em React/TypeScript.

---

## 📋 Visão Geral do Projeto

Este é um projeto full-stack que combina:

- **Backend**: API REST com FastAPI para autenticação, processamento de documentos, embeddings, histórico de mensagens e chat com IA
- **Frontend**: Aplicação web moderna com Next.js, React e Mantine UI para interação com usuários

O sistema permite que usuários criem conta, façam login, enviem documentos (PDFs) e façam perguntas sobre o conteúdo através de um chat com IA.

---

## 🖥️ Telas Principais

- `/login` - Tela de acesso com e-mail e senha
- `/register` - Tela de cadastro de novos usuários
- `/` - Dashboard principal com chat, histórico de conversas, upload de arquivos e status da API

---

## 📁 Estrutura do Projeto

```
projeto-teste/
├── backend/              # Servidor da API (Python/FastAPI)
├── frontend/             # Aplicação web (Next.js/React)
└── README.md             # Este arquivo
```

---

## 🔙 Backend

Localização: `./backend/`

### 🛠️ Tecnologias

- **FastAPI**: Framework web moderno e rápido para criar APIs
- **Python 3.11+**: Linguagem principal
- **PostgreSQL**: Banco de dados para histórico de mensagens
- **FAISS**: Vector store para embeddings de documentos
- **LangChain**: Framework para aplicações com LLM
- **OpenAI API**: Embeddings e modelos de linguagem
- **PyPDF**: Extração de texto de arquivos PDF

### 📦 Dependências Principais

```
fastapi              # Framework web
uvicorn              # Servidor ASGI
pydantic             # Validação de dados
langchain-openai     # Integração com OpenAI
pypdf                # Processamento de PDFs
faiss-cpu            # Vector search
sqlalchemy           # ORM para banco de dados
psycopg              # Driver PostgreSQL
```

### 📂 Estrutura de Pastas

```
backend/
├── src/
│   ├── main.py                          # Entrada principal da aplicação
│   ├── api/
│   │   ├── routes/                      # Rotas da API (health, chat, upload, AI)
│   │   ├── schemas/                     # Schemas Pydantic para validação
│   │   └── error_handlers.py            # Tratamento de erros
│   ├── application/
│   │   └── use_cases/                   # Lógica de negócio (casos de uso)
│   ├── core/
│   │   ├── config.py                    # Configurações da aplicação
│   │   └── dependencies.py              # Injeção de dependências
│   ├── domain/
│   │   ├── exceptions.py                # Exceções customizadas
│   │   ├── message.py                   # Entidade de mensagem
│   │   └── ports.py                     # Interfaces (portas)
│   ├── infrastructure/
│   │   ├── adapters/                    # Implementações de adapters
│   │   ├── gateways/                    # Serviços externos (PDF, Embeddings, DB)
│   │   └── vectorstore/                 # Configuração FAISS
│   └── __init__.py
├── tests/                               # Testes automatizados
├── pyproject.toml                       # Configuração do projeto
├── docker-compose.yml                   # Orquestração de containers
├── Makefile                             # Comandos úteis
└── api.http                             # Requisições HTTP para testes

```

### 🚀 Como Rodar

#### Pré-requisitos

- Python 3.11+
- Docker e Docker Compose (para PostgreSQL)
- Variáveis de ambiente configuradas (.env)

#### Instalação

```bash
cd backend

# Instalar dependências (usando uv)
make install

# Ou com pip
pip install -e ".[dev]"
```

#### Variáveis de Ambiente

Criar arquivo `.env` no diretório `backend/`:

```env
# Banco de dados
DATABASE_URL=postgresql://user:password@localhost:5432/docmind

# OpenAI
OPENAI_API_KEY=sua_chave_api

# Aplicação
ENV=development
DEBUG=true
```

#### Iniciar Banco de Dados

```bash
# Subir PostgreSQL com Docker
make db-up

# Ver logs
make db-logs

# Descer banco
make db-down
```

#### Executar Servidor

```bash
# Modo desenvolvimento local (com reload automático)
make dev

# Ou diretamente
uv run uvicorn src.main:app --reload --port 8001

# Ver logs da API quando estiver usando Docker
make run

# Aplicar migrations manualmente
make migrate

# Gerar uma nova migration
make generate m="nome_da_migration"
```

A API estará disponível em `http://localhost:8001`

#### Testes

```bash
# Rodar todos os testes
make test

# Ou com pytest
pytest -v
```

#### Qualidade de Código

```bash
# Verificar formatação (Black)
make check

# Formatar código
make format

# Lint (Ruff)
make lint

# Corrigir issues automáticas
make fix
```

### 📡 Endpoints Principais

- `GET /health` - Status da aplicação
- `POST /auth/register` - Criação de conta
- `POST /auth/login` - Login e emissão de token
- `GET /messages/` - Listar mensagens salvas
- `POST /messages/` - Criar uma mensagem no histórico
- `DELETE /messages/` - Limpar o histórico de mensagens
- `POST /ai` - Gerar resposta com base no contexto recuperado
- `POST /upload/` - Indexar um documento enviado

---

## 🎨 Frontend

Localização: `./frontend/`

### 🛠️ Tecnologias

- **Next.js 16**: Framework React com Server Components
- **React 19**: Biblioteca UI
- **TypeScript**: Tipagem estática
- **Mantine**: Biblioteca de componentes UI moderna
- **Tailwind CSS**: Utilitários CSS
- **Lucide React**: Ícones

### 📦 Dependências Principais

```
next                # Framework React
react               # Biblioteca UI
@mantine/core       # Componentes UI
@mantine/hooks      # Hooks do Mantine
tailwindcss         # Utilitários CSS
lucide-react        # Ícones
```

### 📂 Estrutura de Pastas

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Layout raiz
│   │   ├── page.tsx                     # Dashboard/chat principal
│   │   ├── login/page.tsx               # Tela de login
│   │   ├── register/page.tsx            # Tela de cadastro
│   │   ├── globals.css                  # Estilos globais
│   │   └── providers.tsx                # Provedores (Mantine, auth)
│   ├── config/
│   │   └── env.ts                       # Configurações de ambiente
│   ├── features/
│   │   ├── auth/                        # Autenticação e sessão
│   │   ├── chat/                        # Feature de chat
│   │   │   ├── actions.ts               # Server actions
│   │   │   ├── components/              # Componentes React
│   │   │   └── hooks/                   # Hooks customizados
│   │   └── system/
│   │       ├── components/              # Componentes de sistema
│   │       └── hooks/                   # Hooks de sistema
│   ├── server/
│   │   ├── auth-api.ts                  # Cliente API de autenticação
│   │   └── chat-api.ts                  # Cliente API do backend
│   ├── services/
│   │   └── api/                         # Serviços de API
│   └── types/
│       └── chat.ts                      # Tipos TypeScript
├── public/                              # Arquivos estáticos
├── package.json                         # Dependências
├── tsconfig.json                        # Configuração TypeScript
├── next.config.ts                       # Configuração Next.js
├── postcss.config.mjs                   # Configuração PostCSS
├── tailwind.config.js                   # Configuração Tailwind
├── eslint.config.mjs                    # Configuração ESLint
└── README.md                            # Documentação específica

```

### 🚀 Como Rodar

#### Pré-requisitos

- Node.js 18+
- npm ou yarn

#### Instalação

```bash
cd frontend

# Instalar dependências
npm install

# Ou com yarn
yarn install
```

#### Variáveis de Ambiente

Criar arquivo `.env.local` no diretório `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

#### Desenvolvimento

```bash
# Rodar servidor de desenvolvimento
npm run dev

# Ou com yarn
yarn dev
```

A aplicação estará disponível em `http://localhost:3000`

#### Build para Produção

```bash
# Criar build otimizado
npm run build

# Iniciar servidor de produção
npm run start
```

#### Linting

```bash
# Verificar código
npm run lint
```

### 📄 Páginas Principais

- `/login` - Entrada de usuários
- `/register` - Cadastro de usuários
- `/` - Dashboard principal com chat, sidebar de conversas e upload

---

## 🔧 Setup Completo

### 1. Clonar/Preparar Projeto

```bash
cd /home/desenvolvedor23/projetos/projeto-teste
```

### 2. Backend

```bash
cd backend

# Instalar dependências
make install

# Configurar variáveis de ambiente
# Editar .env com suas credenciais

# Rodar servidor
make dev
```

### 3. Frontend (em outro terminal)

```bash
cd frontend

# Instalar dependências
npm install

# Rodar aplicação
npm run dev
```

### 4. Acessar

- Backend: http://localhost:8001
- Frontend: http://localhost:3000
- Docs da API: http://localhost:8001/docs

---

## 🔄 Fluxo da Aplicação

1. **Upload**: Usuário faz upload de PDF via frontend
2. **Processamento**: Backend extrai texto e cria embeddings
3. **Armazenamento**: Embeddings são salvos em FAISS, texto em PostgreSQL
4. **Chat**: Usuário envia pergunta via frontend
5. **Busca**: Backend busca documentos relevantes usando embeddings
6. **Resposta**: LLM gera resposta baseada no contexto dos documentos
7. **Histórico**: Conversas são salvas no PostgreSQL

---

## 📚 Recursos Adicionais

- **FastAPI Docs**: http://localhost:8001/docs (Swagger UI)
- **FastAPI ReDoc**: http://localhost:8001/redoc
- **Next.js Docs**: https://nextjs.org/docs
- **Mantine Docs**: https://mantine.dev
- **LangChain Docs**: https://python.langchain.com

---

## 🤝 Contribuindo

Ao fazer alterações:

1. **Backend**: Use `make check` para validar código
2. **Frontend**: Use `npm run lint` para verificar linting
3. Mantenha commits pequenos e descritivos
4. Escreva testes para novas funcionalidades

---

## 📝 Licença

Projeto em desenvolvimento.

---

## ❓ Suporte

Para dúvidas ou issues, verifique:

- Logs do backend: `make db-logs`
- Console do navegador (Frontend)
- Documentação interativa em `/docs` (backend)
