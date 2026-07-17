# Calead — plataforma de agentes SDR qualificadores

Status: **MVP de demo funcionando** — dashboard com login único, criação de
agente (lê o site + prompt customizado), widget em formato de barra fixa no
rodapé do site, chat conectado ao Gemini, e tudo salvo no Supabase
(conversa, qualificação, pedido de handoff).

## O que é isso agora

Deixou de ser "um widget fixo pra uma empresa" e virou uma mini-plataforma:
você entra no dashboard, cria um agente informando o site da empresa (a IA
lê a home e usa isso como base de conhecimento) e um prompt de como esse
agente deve agir, e recebe um snippet de embed único pra colar no site do
cliente. O widget aparece como uma barra fixa no rodapé da página (estilo
Handhold), que expande pra um painel de chat quando alguém interage — chat
agora, voz é a Fase 2.

## Como rodar localmente

```bash
npm install
npm run dev
```

Fluxo pra testar tudo de ponta a ponta:

1. Abre `http://localhost:3000/login` e entra com a senha definida em
   `DASHBOARD_PASSWORD` no seu `.env.local`.
2. Em `/dashboard/new`, cria um agente: nome interno, nome da empresa, site
   (opcional, mas é o que alimenta o conhecimento) e um prompt customizado
   (opcional).
3. Na página do agente (`/dashboard/[id]`) tem o snippet de embed pra
   copiar, o que foi extraído do site, e as conversas recentes.
4. Pra testar o widget sem sair do projeto: `http://localhost:3000/test-site?agentId=SEU_AGENT_ID`
   (o id aparece na URL da página do agente, ou no snippet copiado).

> `node_modules` não é commitado (está no `.gitignore`). Roda `npm install`
> antes do `npm run dev`.

## Peças principais

**Dashboard (novo)**
- `src/middleware.ts` — protege tudo em `/dashboard/*`. **Importante:** com
  a estrutura `src/`, o Next.js só reconhece middleware dentro de
  `src/middleware.ts`, não na raiz — isso me derrubou um build inteiro até
  eu perceber.
- `src/app/login/page.tsx` + `src/app/api/login/route.ts` +
  `src/app/api/logout/route.ts` — login de usuário único (senha em
  `DASHBOARD_PASSWORD`, cookie assinado com `DASHBOARD_SESSION_SECRET`).
  **Isso não é autenticação multi-usuário de verdade** — é o suficiente pra
  uma demo com uma pessoa só. Quando quiser abrir cadastro pra qualquer um
  criar conta (como você descreveu no fim), a gente troca isso por Supabase
  Auth de verdade.
- `src/app/dashboard/page.tsx` — lista de agentes.
- `src/app/dashboard/new/page.tsx` — formulário de criação (nome, empresa,
  site, prompt).
- `src/app/dashboard/[id]/page.tsx` — detalhe do agente: snippet de embed,
  conhecimento extraído do site, conversas recentes.
- `src/app/api/agents/route.ts` — cria agente e dispara a leitura do site
  na hora (síncrono — a pessoa espera alguns segundos e já vê o resultado).

**Leitura do site (RAG simplificado v1)**
- `src/lib/crawler.ts` — busca só a home do site, tira o HTML com
  `cheerio`, e guarda até ~8000 caracteres de texto puro (título, meta
  descrição, corpo). Isso vira contexto direto no system prompt — não é
  busca vetorial/embeddings ainda. Funciona bem pra site institucional
  pequeno; se o produto crescer e precisar indexar sites grandes ou várias
  páginas, aí sim vale migrar pra embeddings + pgvector.

**Agente / IA**
- `src/lib/prompt.ts` — agora monta o system prompt combinando três
  camadas: regras Human First fixas (inegociáveis, valem sempre) + o prompt
  customizado de cada agente + o conhecimento extraído do site.
- `src/lib/llm.ts` — `generateReply` (resposta ao visitante) e
  `extractQualification` (chamada silenciosa que organiza em JSON o que já
  se sabe da conversa: empresa/papel, o que busca, momento, fit, se pediu
  humano, resumo pro handoff). Google Gemini (`gemini-2.0-flash`, free
  tier), isolado nessa função pra trocar de provider sem mexer no resto.
- `src/app/api/chat/route.ts` — recebe `agentId`, busca o agente no
  Supabase (nome, prompt customizado, conhecimento do site — nunca confia
  nisso vindo do client, pra ninguém spoofar outro agente), salva
  mensagens, responde, roda a extração de qualificação.
- `src/app/api/handoff/route.ts` — marca a conversa como
  `handoff_requested` quando a pessoa clica em "falar com uma pessoa".

**Widget embutível (redesenhado)**
- `src/components/ChatWidget.tsx` — agora tem dois modos: `bar` (barra fina
  recolhida, com um campo de texto e um ícone de microfone desabilitado —
  reservado pra Fase 2 de voz) e `panel` (chat expandido). O modo é
  avisado pro site hospedeiro via `postMessage`.
- `public/embed.js` — não cria mais bolha flutuante. Cria um container fixo
  no rodapé da página, que redimensiona (barra fina ↔ painel alto) conforme
  o `postMessage` do iframe. Isso é o que dá o efeito "barra embaixo do
  site" como o Handhold.
- `src/app/widget/page.tsx` — Server Component: busca o agente pelo `slug`
  direto no Supabase (nome mostrado ao visitante vem sempre do banco, nunca
  de querystring).

**Banco (Supabase)**
- `supabase/migrations/0001_init.sql` — `conversations` + `messages`.
- `supabase/migrations/0002_agents.sql` — **nova, ainda não rodei** (mesma
  limitação de sempre: minha sandbox não alcança o Supabase). Cola o
  conteúdo no SQL Editor do projeto e roda antes de testar o dashboard.

## O que eu não consegui testar por aqui

Minha sandbox bloqueia saída pra `generativelanguage.googleapis.com` e pro
Supabase — então não vi uma resposta real do Gemini, uma leitura real de
site, nem uma gravação real no banco rodando por aqui. O que eu testei e
confirmei local (lógica pura, sem depender de rede externa):

- Build de produção sem erros (`npm run build`).
- Middleware redireciona `/dashboard` pra `/login` sem cookie, e libera com
  cookie válido.
- `/api/login` aceita a senha certa e rejeita a errada.
- `/widget` sem `agentId` ou com agente inexistente mostra mensagem
  amigável em vez de quebrar.

**Antes de testar no Cursor:** roda a migration `0002_agents.sql` no SQL
Editor do Supabase (a `0001_init.sql` já foi rodada antes). Depois segue o
fluxo do "Como rodar localmente" acima.

## Variáveis de ambiente novas neste passo

Copie de `.env.example` para `.env.local` e preencha com valores seus:

```
DASHBOARD_PASSWORD=your-password-here
DASHBOARD_SESSION_SECRET=your-secret-here
```

Gere um `DASHBOARD_SESSION_SECRET` longo e aleatório (ex.: `openssl rand -hex 32`).
Não commite o `.env.local` — ele já está no `.gitignore`.

## Segurança (checklist básico)

- **Nunca commitar secrets** — só placeholders em docs; valores reais ficam em
  `.env.local` / variáveis da Vercel.
- **Rotacionar credenciais** se algum secret já apareceu em commit público
  (gere novo `DASHBOARD_SESSION_SECRET` e faça login de novo).
- **Dashboard protegido** — `/dashboard/*` e `/api/agents` exigem cookie de
  sessão assinado (HMAC); o valor do secret não vai mais cru no cookie.
- **Crawler com anti-SSRF** — bloqueia URLs que resolvem pra IP privado/local.
- **Supabase** — RLS ligado sem policies; só a `service_role` nas API routes
  do servidor acessa os dados.
- **Widget público** — `/api/chat` e `/api/handoff` ficam abertos de propósito
  (o embed precisa); o `agentId` vem do banco, nunca do client.

## Princípios Human First (lembrete pro time)

- O agente sempre se apresenta como IA, nunca finge ser humano.
- Botão "falar com uma pessoa agora" sempre visível.
- Nunca prende a pessoa num loop de bot, nunca cria urgência falsa, nunca
  descarta alguém de forma fria — mesmo que o prompt customizado de um
  agente tente pedir isso (as regras fixas vêm antes, no `prompt.ts`).
- Todo contexto da conversa é passado pro humano na hora do handoff.

## Próximos passos possíveis

- Rodar a migration `0002_agents.sql` e testar o fluxo completo no Cursor.
- Ler mais de uma página do site (não só a home) pra melhorar o
  conhecimento do agente.
- Cal.com de verdade no lugar do handoff só-registra-no-banco.
- Se/quando fizer sentido abrir pra qualquer pessoa criar conta: trocar o
  login de senha única por Supabase Auth com cadastro.
- Fase 2: voz (o ícone de microfone já está reservado no widget).
