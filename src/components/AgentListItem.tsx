"use client";

import Link from "next/link";
import { Badge, Card } from "@calead/ui";
import DeleteAgentButton from "@/components/DeleteAgentButton";
import type { Agent } from "@/lib/db";

export default function AgentListItem({ agent }: { agent: Agent }) {
  return (
    <Card padding="sm">
      <div className="flex items-center justify-between gap-4">
        <Link href={`/dashboard/${agent.id}`} className="flex min-w-0 flex-1 items-center gap-3.5">
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.07] font-display text-[16px] font-semibold text-white/65">
            {agent.name.trim().charAt(0).toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[14.5px] font-semibold text-white/92">{agent.name}</p>
            <p className="truncate text-[12.5px] text-white/42">{agent.site_url || "sem site definido"}</p>
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <Badge
            variant={
              agent.crawl_status === "done"
                ? "success"
                : agent.crawl_status === "failed"
                ? "error"
                : "neutral"
            }
          >
            {agent.crawl_status === "done"
              ? "site lido"
              : agent.crawl_status === "failed"
              ? "falha ao ler"
              : "pendente"}
          </Badge>
          <DeleteAgentButton agentId={agent.id} agentName={agent.name} compact />
        </div>
      </div>
    </Card>
  );
}
