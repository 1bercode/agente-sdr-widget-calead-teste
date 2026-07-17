-- Calead — tabela de agentes (multi-tenant, MVP de demo)
-- Cada linha é um "agente SDR" criado no dashboard: tem um site, um prompt
-- customizado de como agir, e o conhecimento extraído do site (RAG
-- simplificado v1 — texto puro da home, sem embeddings/busca vetorial
-- ainda).

create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text unique not null,           -- usado como agentId no snippet de embed
  name text not null,                  -- nome interno, só pro dashboard
  company_name text not null,          -- nome mostrado ao visitante no widget
  site_url text,
  custom_prompt text,                  -- instruções de como esse agente deve agir
  site_knowledge text,                 -- texto extraído do site (contexto pro modelo)
  crawl_status text not null default 'pending' check (crawl_status in ('pending', 'done', 'failed'))
);

create index if not exists agents_slug_idx on agents(slug);

-- RLS ligado, sem policy nenhuma: só a service_role key (usada nas API
-- routes do servidor) acessa. O dashboard é protegido por senha única na
-- própria aplicação (MVP de demonstração, não é multi-usuário ainda).
alter table agents enable row level security;
