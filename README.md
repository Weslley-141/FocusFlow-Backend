# 🎯 FocusFlow — Backend

API REST do **FocusFlow**, uma aplicação de organização e acompanhamento de estudos.

O backend foi reconstruído a partir do material preservado do projeto original e mantém o contrato utilizado pelo frontend: rotas, formatos de resposta e regras principais necessárias para a aplicação funcionar.

> **Contexto do repositório:** este projeto faz parte da reconstrução do FocusFlow após a perda do repositório original. O serviço online original foi preservado e utilizado como referência durante a recuperação.

---

## ✨ Funcionalidades

A API fornece os recursos utilizados pelo FocusFlow:

- 🔐 **Autenticação e usuários**
  - Cadastro
  - Login com JWT
  - Verificação de e-mail
  - Consulta do usuário autenticado
  - Atualização de perfil e senha
- 📚 **Matérias e tópicos**
  - Criação, edição, consulta e remoção
  - Organização de tópicos por matéria
  - Estatísticas de matérias
- 🧠 **Flashcards**
  - CRUD de flashcards
  - Revisões com **SM-2**
  - Histórico de revisões
  - Cards pendentes, novos e dominados
- ⏱️ **Pomodoro**
  - Sessões configuráveis
  - Registro de sessões ativas e concluídas
  - Estatísticas de tempo estudado
  - Associação opcional a tópicos
- 🎯 **Metas de estudo**
  - Metas diárias, semanais, mensais e personalizadas
  - Progresso em minutos
  - Conclusão e falha de metas
  - Estatísticas de progresso
- 🗺️ **Mapas mentais**
  - Criação e gerenciamento de mapas
  - Nós hierárquicos
  - Posição e cores dos nós
  - Relacionamento entre nós compatível com React Flow

---

## 🛠️ Tecnologias

- **Node.js**
- **TypeScript**
- **Express**
- **TypeORM**
- **MySQL / TiDB Cloud**
- **JWT** para autenticação
- **bcryptjs** para hash de senhas
- **Nodemailer** para envio de e-mails de verificação
- **CORS** para comunicação com o frontend

---

## 🏗️ Arquitetura

O projeto segue uma organização separada por responsabilidades:

```text
src/
├── config/         # Configuração de ambiente e banco de dados
├── controllers/    # Entrada e saída das requisições HTTP
├── entities/       # Entidades e mapeamento TypeORM
├── middleware/     # Autenticação e tratamento de erros
├── routes/         # Rotas da API
├── services/       # Regras de negócio
└── utils/          # Validações, respostas, e-mail e utilitários
```

A API é disponibilizada sob o prefixo `/api`.

---

## 🔐 Autenticação

As rotas protegidas utilizam **Bearer Token** com JWT.

Após o login, o frontend envia o token no cabeçalho:

```http
Authorization: Bearer <token>
```

As senhas dos usuários são armazenadas utilizando `bcryptjs` e nunca são retornadas pela API.

---

## 🧠 Sistema de repetição espaçada

Os flashcards utilizam uma implementação baseada no algoritmo **SM-2**.

O frontend apresenta quatro opções de revisão:

- **Novamente**
- **Difícil**
- **Bom**
- **Fácil**

Essas opções são convertidas pelo backend para a escala utilizada pelo SM-2. O sistema mantém fatores como intervalo, repetições, fator de facilidade e próxima revisão.

Um flashcard é considerado **dominado** quando seu intervalo de revisão atinge pelo menos 21 dias.

---

## 🌎 Datas e fuso horário

O projeto utiliza a variável `APP_TIMEZONE` para cálculos relacionados ao dia atual, como revisões de flashcards e metas.

O valor utilizado no projeto é:

```env
APP_TIMEZONE=America/Recife
```

Isso evita que operações baseadas em "hoje" mudem de data por causa da conversão para UTC.

---

## 🚀 Executando localmente

### Pré-requisitos

- Node.js 18 ou superior
- MySQL local ou uma instância compatível, como TiDB Cloud
- npm

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Depois configure principalmente:

```env
PORT=3000
FRONTEND_URL=http://localhost:3001
JWT_SECRET=sua-chave-secreta

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=focusflow
DB_SSL=false
DB_SYNCHRONIZE=true

EMAIL_USER=
EMAIL_PASS=
AUTO_VERIFY=true

APP_TIMEZONE=America/Recife
```

> Em produção, use uma chave JWT forte e mantenha credenciais de banco e e-mail somente nas variáveis de ambiente do serviço de hospedagem.

### 3. Inicie em desenvolvimento

```bash
npm run dev
```

A API ficará disponível, por padrão, em:

```text
http://localhost:3000
```

Health check:

```text
GET /api/health
```

Resposta esperada:

```json
{
  "success": true,
  "status": "ok"
}
```

---

## 📦 Build de produção

```bash
npm run build
npm start
```

Os arquivos compilados são gerados em `dist/`.

Também existem os comandos:

```bash
npm run typecheck
```

para verificar os tipos TypeScript sem gerar arquivos.

---

## 🌐 Endpoints principais

Todas as rotas abaixo são relativas a `/api`.

| Módulo | Principais endpoints |
|---|---|
| 🔐 Auth | `POST /auth/register` · `POST /auth/login` · `GET /auth/verify-email` · `GET /auth/me` · `PUT /auth/profile` |
| 📚 Subjects | `GET/POST /subjects` · `GET /subjects/stats` · `GET/PUT/DELETE /subjects/:id` |
| 📝 Topics | `GET /topics/subject/:subjectId` · `POST /topics` · `GET/PUT/DELETE /topics/:id` |
| 🧠 Flashcards | `GET/POST /flashcards` · `GET /flashcards/review/due` · `GET /flashcards/stats` · `GET/PUT/DELETE /flashcards/:id` · `POST /flashcards/:id/review` · `GET /flashcards/:id/history` |
| ⏱️ Pomodoro | `GET/POST /pomodoro` · `GET /pomodoro/completed` · `GET /pomodoro/active` · `GET /pomodoro/stats` · `PUT /pomodoro/:id/complete` · `GET/DELETE /pomodoro/:id` |
| 🎯 Goals | `GET/POST /goals` · `GET /goals/active` · `GET /goals/stats` · `GET/PUT/DELETE /goals/:id` · `POST /goals/:id/progress` · `POST /goals/:id/fail` |
| 🗺️ Mind Maps | `GET/POST /mindmaps` · `GET/PUT/DELETE /mindmaps/:id` · `GET/POST /mindmaps/:id/nodes` · `PUT/DELETE /mindmaps/nodes/:nodeId` · `PATCH /mindmaps/nodes/:nodeId/position` |

Respostas de sucesso seguem o formato:

```json
{
  "success": true,
  "data": {},
  "message": "..."
}
```

Erros seguem o formato:

```json
{
  "success": false,
  "message": "..."
}
```

---

## 🗄️ Banco de dados

O projeto utiliza **MySQL** através do TypeORM e também pode ser executado com **TiDB Cloud**.

As principais entidades são:

```text
User
├── Subject
│   └── Topic
│       ├── Flashcard
│       ├── PomodoroSession
│       └── MindMap
│           └── MindMapNode
│
└── FlashcardReview

StudyGoal
```

O `DB_SYNCHRONIZE=true` permite que o TypeORM crie/atualize automaticamente as tabelas. Em produção, depois da criação inicial do schema, é recomendado manter essa opção desativada.

---

## 🔗 Relação com o frontend

Este backend é consumido pelo repositório separado:

**FocusFlow — Frontend**

O frontend utiliza Axios para acessar a API e envia o JWT automaticamente nas requisições autenticadas.

---

## ☁️ Deploy

A versão online do projeto utiliza **Render** para a API e **TiDB Cloud** para o banco de dados.

As instruções específicas para reaproveitar a infraestrutura existente estão documentadas em [`DEPLOY.md`](./DEPLOY.md).

---

## 📚 Contexto do projeto

O FocusFlow foi desenvolvido como um projeto completo para centralizar diferentes ferramentas de estudo em uma única aplicação.

A recuperação deste backend também serviu como exercício de reconstrução e manutenção de uma aplicação existente, preservando seu contrato com o frontend e sua infraestrutura online.

---

## 👨‍💻 Autor

**Weslley Eugênio**

GitHub: [@Weslley-141](https://github.com/Weslley-141)

