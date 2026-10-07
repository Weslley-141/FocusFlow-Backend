# Deploy do FocusFlow (reaproveitando Vercel, Render e TiDB que já existem)

Os serviços online continuam os mesmos (mesmas URLs). O que muda é de onde vem o código: repositórios novos no GitHub novo.
Ordem: GitHub → banco → backend (Render) → front (Vercel) → CORS.

## 0. Local

Troque a senha do usuário do banco local (se ainda for `suasenha`):

```sql
-- sudo mariadb
ALTER USER 'focusflow'@'localhost' IDENTIFIED BY 'nova-senha';
FLUSH PRIVILEGES;
```

e atualize `DB_PASSWORD` no `.env` local.

## 1. GitHub (conta nova)

Um repositório por projeto (`focusflow-backend` e `focusflow-frontend`). Em cada pasta:

```bash
git init
git add .
git status          # confira que .env NÃO aparece na lista
git commit -m "FocusFlow: versão reconstruída"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPO.git
git push -u origin main
```

O `.gitignore` já ignora `.env`, `node_modules` e `dist`. Os segredos de produção ficam só no painel da Render/Vercel.
Guarde também um zip de cada projeto fora do GitHub (Drive, pendrive).

## 2. Banco: mesmo cluster do TiDB, banco novo

Reaproveite o cluster e as credenciais que já estão nas variáveis da Render (host, porta, usuário, senha),
mas use um **banco novo e vazio** dentro dele. As tabelas antigas foram criadas pelo código original, e este backend foi
reconstruído a partir da documentação: se o formato for um pouco diferente, o `DB_SYNCHRONIZE` pode apagar colunas
(e os dados delas) ao tentar igualar. Banco novo = zero risco, e o antigo fica intacto como backup.

Crie o banco (pelo SQL Editor do painel do TiDB Cloud, ou do terminal com o cliente do MariaDB):

```bash
mariadb -h SEU_HOST -P 4000 -u 'SEU_USUARIO' -p --ssl
```

```sql
CREATE DATABASE focusflow_v2;
```

## 3. Backend: serviço que já existe na Render

No painel do serviço → **Settings**:

1. **Build & Deploy → Repository**: troque para o repositório novo `focusflow-backend` (a Render pede para conectar o GitHub novo;
   se a conexão antiga aparecer quebrada, reconecte em Account Settings → Git providers).
2. **Build Command**: `npm install --include=dev && npm run build`
3. **Start Command**: `npm start`
4. **Health Check Path**: `/api/health`

Em **Environment**, confira os nomes das variáveis que já existem. O backend lê:

| Variável | Valor |
|---|---|
| `JWT_SECRET` | pode manter a atual (ou uma nova) |
| `DB_HOST` | host do TiDB |
| `DB_PORT` | `4000` |
| `DB_USER` (ou `DB_USERNAME`) | usuário do TiDB (`prefixo.root`) |
| `DB_PASSWORD` | senha do TiDB |
| `DB_NAME` (ou `DB_DATABASE`) | `focusflow_v2` |
| `DB_SSL` | `true` |
| `DB_SYNCHRONIZE` | `true` no primeiro deploy (cria as tabelas) |
| `AUTO_VERIFY` | `true` (ver "E-mail" abaixo) |
| `FRONTEND_URL` | URL da Vercel, sem barra no fim |
| `APP_TIMEZONE` | `America/Recife` |
| `NODE_VERSION` | `20` |

Se alguma variável antiga tiver outro nome, é só criar a equivalente com o nome da tabela acima (as antigas podem ficar).
Faça o deploy. Quando o log mostrar `✅ Banco de dados conectado`, mude `DB_SYNCHRONIZE` para `false`.
Teste: `https://SEU-SERVICO.onrender.com/api/health` → `{"success":true,"status":"ok"}`.

## 4. Front: projeto que já existe na Vercel

1. **Settings → Git**: desconecte o repositório antigo e conecte o novo `focusflow-frontend`
   (a Vercel pede para instalar o app dela no GitHub novo).
2. Faça o redeploy. Não precisa criar variável da API: o front traz um `.env.production` com a URL do backend
   (`https://focusflow-backend-zcel.onrender.com/api`, a mesma que o site original usava). Só mexa nisso se trocar de serviço
   (aí edite o arquivo ou crie `VITE_API_URL` nas variáveis da Vercel, que tem prioridade).

**Ordem:** faça o deploy do backend (passo 3) antes do front, para o site novo nunca falar com uma API antiga.

## 5. CORS

`FRONTEND_URL` na Render tem de ser exatamente a URL pública da Vercel (várias URLs separadas por vírgula).
Sem isso o login falha com erro de CORS no console do navegador.

## 6. Conta demo

O banco novo está vazio, então a conta de demonstração precisa ser recriada: cadastre-a pelo próprio site e confira
`VITE_DEMO_EMAIL` / `VITE_DEMO_PASSWORD` na Vercel (variáveis `VITE_` ficam visíveis no navegador: use uma conta descartável).

## E-mail de verificação

Desde 26/09/2025 os serviços **gratuitos** da Render bloqueiam as portas SMTP (25, 465 e 587), então o Gmail via Nodemailer
**não funciona** lá. Por isso `AUTO_VERIFY=true` em produção: a conta nasce verificada. Para ter e-mail de verdade é preciso
um serviço com API HTTPS (ex.: Brevo) ou uma instância paga.

## Primeira requisição lenta

No plano gratuito a Render "dorme" o serviço depois de um tempo sem uso, e a primeira requisição pode levar cerca de um minuto.
Um monitor gratuito (ex.: UptimeRobot) chamando `/api/health` a cada 5 minutos mantém o serviço acordado, útil quando você mandar o link para recrutadores.
