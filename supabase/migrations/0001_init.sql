-- Calead — schema inicial (Fase 1)
-- Guarda o histórico de conversas do widget + o que foi entendido na
-- qualificação, pra alimentar o handoff pro humano e, no futuro, o
-- dashboard de insights (Fase 3).

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  agent_id text not null,          -- identifica o widget/cliente embutido (multi-tenant)
  company_name text not null,
  visitor_session_id text,         -- id anônimo gerado no browser, sem PII
  status text not null default 'open' check (status in ('open', 'qualified', 'handoff_requested', 'closed')),
  wants_human boolean not null default false,
  qualification jsonb not null default '{}'::jsonb, -- respostas leves de qualificação (o que faz, momento, etc.)
  context_summary text            -- resumo gerado pro humano no momento do handoff
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx on messages(conversation_id);
create index if not exists conversations_agent_id_idx on conversations(agent_id);

-- RLS: por padrão, ninguém acessa. As leituras/escritas do widget passam
-- sempre pela API route do Next.js, que usa a service_role key (que ignora
-- RLS). Isso evita que qualquer transcrição fique exposta via a anon key
-- exposta no browser — alinhado com LGPD e isolamento multi-tenant.
alter table conversations enable row level security;
alter table messages enable row level security;
