# Handoff — Calead (continuar no Cursor)

Cole isto no chat/agente do Cursor pra ele ter contexto completo.

## O que é o projeto

Calead: plataforma onde alguém cria um "agente SDR" de IA (dashboard →
informa o site da empresa + um prompt de como o agente deve agir), recebe
um snippet de embed, e cola no site do cliente. O widget aparece como uma
barra fixa no rodapé do site (estilo Handhold), que expande pra um chat
quando alguém interage. O agente responde dúvidas usando o conteúdo lido do
site, qualifica a pessoa de forma conversacional (nunca em formato de
formulário), salva tudo no Supabase, e sempre oferece "falar com uma pessoa
agora" — filosofia "Human First": a IA nunca finge ser humana, nunca prende
ninguém num loop de bot, nunca pressiona.

Stack: Next.js 14 (App Router, TypeScript, Tailwind), Supabase (banco +
service role key, sem Auth de verdade ainda), Google Gemini (`gemini-2.0-flash`,
free tier) como LLM.

## Estado atual (tudo já implementado e com build passando)

- Dashboard com login de senha única (`DASHBOARD_PASSWORD` +
  `DASHBOARD_SESSION_SECRET` no `.env.local`) protegendo `/dashboard/*` via
  `src/middleware.ts`.
- `/dashboard/new` cria um agente: nome, nome da empresa, site (lido
  automaticamente na criação — `src/lib/crawler.ts`, texto puro da home via
  cheerio, ainda não é RAG vetorial de verdade) e prompt customizado.
- `/dashboard/[id]` mostra o snippet de embed, o que foi extraído do site, e
  as conversas recentes daquele agente.
- Widget (`src/components/ChatWidget.tsx` + `public/embed.js`) no formato
  barra-embaixo: recolhido é uma barra fina, expande pra painel de chat.
  Ícone de microfone já reservado (desabilitado) pra voz, que é a Fase 2.
- `/api/chat` busca o agente pelo `agentId` (slug) no Supabase, monta o
  system prompt (regras Human First fixas + prompt customizado +
  conhecimento do site — nessa ordem de prioridade), chama o Gemini, salva
  a conversa e roda uma extração de qualificação (silenciosa) que atualiza
  a linha da conversa no banco.
- `/api/handoff` marca `wants_human = true` quando clicam em "falar com uma
  pessoa agora".
- Migrations `supabase/migrations/0001_init.sql` (conversations + messages)
  e `0002_agents.sql` (agents) **já rodadas** no projeto Supabase
  `AGENTE-SDR-CALEAD-TESTE` (org AIMEI).
- `.env.local` já tem todas as chaves preenchidas (Supabase, Gemini,
  DASHBOARD_PASSWORD=`calead-demo-2026`).

## Arquivo obsoleto — pode apagar

`middleware.ts` na raiz do projeto não faz nada (o Next.js só lê middleware
de `src/middleware.ts`, que é onde está a versão real). Ficou órfão porque
a sandbox onde eu trabalho não conseguiu apagá-lo por um bug de permissão
do mount. Pode deletar sem medo.

## O que fazer agora

1. **Testar local primeiro** (se ainda não testou): `npm install && npm run dev`,
   abrir `/login` (senha `calead-demo-2026`), criar um agente em
   `/dashboard/new`, testar em `/test-site?agentId=SEU_ID`.
2. **Commitar e subir pro GitHub**:
   ```bash
   git add -A
   git commit -m "dashboard multi-agente, widget barra-embaixo, RAG simplificado v1"
   git push
   ```
   (repositório: `git@github.com:1bercode/agente-sdr-widget-calead-teste.git`)
3. **Deploy na Vercel**: importar o repositório em vercel.com → Add New →
   Project. Na aba de variáveis de ambiente, colar o conteúdo inteiro do
   `.env.local` (a Vercel aceita colar em formato `.env` de uma vez). Não
   precisa mudar nada no build, é Next.js padrão.
4. Depois do deploy, testar `/login` e `/dashboard/new` na URL da Vercel, e
   trocar o snippet de embed pra apontar pra esse domínio real (em vez de
   `localhost`) antes de colar no site de produção.

## Próximos passos depois disso (não urgente)

- Ler mais páginas do site além da home (RAG melhor).
- Cal.com de verdade no lugar do handoff que só grava no banco.
- Se abrir cadastro público, trocar a senha única por Supabase Auth
  multi-usuário.
- Fase 2: voz no widget.
