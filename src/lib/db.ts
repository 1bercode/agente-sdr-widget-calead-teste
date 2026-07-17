import { supabaseServer } from "@/lib/supabase";
import type { ChatMessage } from "@/lib/types";

// Helpers de persistência — sempre usados a partir de rotas de servidor
// (API routes), nunca do browser, porque usam a service_role key.

export interface ConversationParams {
  conversationId?: string | null;
  agentId: string;
  companyName: string;
  visitorSessionId?: string | null;
}

// Busca a conversa pelo id, ou cria uma nova se não existir / não foi
// passado id ainda (primeira mensagem da sessão).
export async function getOrCreateConversation(params: ConversationParams) {
  const db = supabaseServer();
  const { conversationId, agentId, companyName, visitorSessionId } = params;

  if (conversationId) {
    const { data, error } = await db
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .maybeSingle();
    if (!error && data) return data;
    // Se não achou (id inválido/expirado), cai pro fluxo de criar nova.
  }

  const { data, error } = await db
    .from("conversations")
    .insert({
      agent_id: agentId,
      company_name: companyName,
      visitor_session_id: visitorSessionId ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(`Falha ao criar conversa: ${error.message}`);
  return data;
}

export async function insertMessage(conversationId: string, role: ChatMessage["role"], content: string) {
  const db = supabaseServer();
  const { error } = await db.from("messages").insert({
    conversation_id: conversationId,
    role,
    content,
  });
  if (error) {
    // Não derruba a resposta ao usuário por causa de um erro de log —
    // só registra no servidor.
    console.error("[db] falha ao salvar mensagem:", error.message);
  }
}

export interface QualificationPatch {
  empresa_ou_papel?: string | null;
  o_que_busca?: string | null;
  momento?: string | null;
  fit?: "alto" | "medio" | "baixo" | "indefinido";
  resumo_para_humano?: string | null;
}

export async function updateQualification(
  conversationId: string,
  patch: QualificationPatch,
  opts: { wantsHuman?: boolean } = {}
) {
  const db = supabaseServer();

  const { data: current } = await db
    .from("conversations")
    .select("qualification")
    .eq("id", conversationId)
    .maybeSingle();

  const mergedQualification = { ...(current?.qualification ?? {}), ...patch };

  const update: Record<string, unknown> = {
    qualification: mergedQualification,
    updated_at: new Date().toISOString(),
  };
  if (patch.resumo_para_humano) update.context_summary = patch.resumo_para_humano;
  if (typeof opts.wantsHuman === "boolean") {
    update.wants_human = opts.wantsHuman;
    if (opts.wantsHuman) update.status = "handoff_requested";
  } else if (patch.fit === "alto") {
    update.status = "qualified";
  }

  const { error } = await db.from("conversations").update(update).eq("id", conversationId);
  if (error) console.error("[db] falha ao atualizar qualificação:", error.message);
}

export async function markHandoffRequested(conversationId: string) {
  const db = supabaseServer();
  const { error } = await db
    .from("conversations")
    .update({ wants_human: true, status: "handoff_requested", updated_at: new Date().toISOString() })
    .eq("id", conversationId);
  if (error) throw new Error(`Falha ao marcar handoff: ${error.message}`);
}

// --- Agentes ---------------------------------------------------------------

export interface Agent {
  id: string;
  created_at: string;
  updated_at: string;
  slug: string;
  name: string;
  company_name: string;
  site_url: string | null;
  custom_prompt: string | null;
  site_knowledge: string | null;
  crawl_status: "pending" | "done" | "failed";
}

export async function listAgents(): Promise<Agent[]> {
  const db = supabaseServer();
  const { data, error } = await db.from("agents").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(`Falha ao listar agentes: ${error.message}`);
  return data as Agent[];
}

export async function getAgentBySlug(slug: string): Promise<Agent | null> {
  const db = supabaseServer();
  const { data, error } = await db.from("agents").select("*").eq("slug", slug).maybeSingle();
  if (error) {
    console.error("[db] falha ao buscar agente por slug:", error.message);
    return null;
  }
  return data as Agent | null;
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const db = supabaseServer();
  const { data, error } = await db.from("agents").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("[db] falha ao buscar agente por id:", error.message);
    return null;
  }
  return data as Agent | null;
}

export interface CreateAgentParams {
  slug: string;
  name: string;
  companyName: string;
  siteUrl?: string | null;
  customPrompt?: string | null;
}

export async function createAgent(params: CreateAgentParams): Promise<Agent> {
  const db = supabaseServer();
  const { data, error } = await db
    .from("agents")
    .insert({
      slug: params.slug,
      name: params.name,
      company_name: params.companyName,
      site_url: params.siteUrl ?? null,
      custom_prompt: params.customPrompt ?? null,
      crawl_status: "pending",
    })
    .select("*")
    .single();
  if (error) throw new Error(`Falha ao criar agente: ${error.message}`);
  return data as Agent;
}

export async function listConversationsByAgent(agentSlug: string, limit = 20) {
  const db = supabaseServer();
  const { data, error } = await db
    .from("conversations")
    .select("*")
    .eq("agent_id", agentSlug)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[db] falha ao listar conversas do agente:", error.message);
    return [];
  }
  return data;
}

export async function updateAgentKnowledge(
  id: string,
  siteKnowledge: string,
  status: "done" | "failed"
) {
  const db = supabaseServer();
  const { error } = await db
    .from("agents")
    .update({ site_knowledge: siteKnowledge, crawl_status: status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("[db] falha ao atualizar conhecimento do agente:", error.message);
}

export async function deleteAgent(id: string): Promise<boolean> {
  const db = supabaseServer();
  const agent = await getAgentById(id);
  if (!agent) return false;

  const { data: conversations, error: listConvError } = await db
    .from("conversations")
    .select("id")
    .in("agent_id", [agent.slug, agent.id]);
  if (listConvError) throw new Error(`Falha ao listar conversas: ${listConvError.message}`);

  const conversationIds = (conversations ?? []).map((c) => c.id);
  if (conversationIds.length > 0) {
    const { error: msgError } = await db.from("messages").delete().in("conversation_id", conversationIds);
    if (msgError) throw new Error(`Falha ao apagar mensagens: ${msgError.message}`);
  }

  const { error: convError } = await db.from("conversations").delete().in("agent_id", [agent.slug, agent.id]);
  if (convError) throw new Error(`Falha ao apagar conversas: ${convError.message}`);

  const { data: deleted, error } = await db.from("agents").delete().eq("id", id).select("id");
  if (error) throw new Error(`Falha ao apagar agente: ${error.message}`);
  if (!deleted?.length) throw new Error("Agente não foi removido — verifique a service role do Supabase");
  return true;
}
