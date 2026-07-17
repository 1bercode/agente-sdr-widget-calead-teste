import ChatWidget from "@/components/ChatWidget";
import { getAgentBySlug } from "@/lib/db";

// Server Component: busca o agente pelo slug direto no Supabase (com a
// service_role key, nunca exposta ao browser). O nome mostrado ao
// visitante vem sempre do banco, nunca de querystring — assim ninguém
// consegue "spoofar" outro agente só editando a URL.
export default async function WidgetPage({
  searchParams,
}: {
  searchParams: { agentId?: string };
}) {
  const agentId = searchParams.agentId;

  if (!agentId) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white p-4 text-center text-sm text-slate-500">
        Este widget precisa de um agentId no snippet de embed.
      </div>
    );
  }

  const agent = await getAgentBySlug(agentId);

  if (!agent) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white p-4 text-center text-sm text-slate-500">
        Agente não encontrado. Confere se o snippet de embed está com o
        agentId certo.
      </div>
    );
  }

  return <ChatWidget config={{ agentId: agent.slug, companyName: agent.company_name }} />;
}
