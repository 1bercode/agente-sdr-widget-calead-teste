"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChatBubble,
  ChatComposer,
  ChatFloatingBar,
  ChatHeader,
  ChatPanel,
  ChatWidgetShell,
} from "@calead/ui";
import type { ChatMessage, WidgetConfig } from "@/lib/types";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const OPENING_MESSAGE = (companyName: string) =>
  `Oi! Sou o consultor comercial de IA da ${companyName}. Posso te explicar nossos serviços, entender o que você precisa e, se fizer sentido, marcar uma conversa com um especialista. Como posso te ajudar?`;

function defaultSuggestions(companyName: string) {
  return [
    `O que a ${companyName} faz?`,
    "Quanto custa um projeto?",
    "Como funciona o processo?",
  ];
}

type WidgetMode = "bar" | "panel";

function getVisitorSessionId() {
  if (typeof window === "undefined") return null;
  const key = "calead_visitor_session_id";
  let id = window.sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    window.sessionStorage.setItem(key, id);
  }
  return id;
}

export default function ChatWidget({ config }: { config: WidgetConfig }) {
  const { companyName, agentId } = config;
  const [mode, setMode] = useState<WidgetMode>("bar");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: "assistant",
      content: OPENING_MESSAGE(companyName),
      createdAt: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [handoffRequested, setHandoffRequested] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const conversationIdRef = useRef<string | null>(null);
  const visitorSessionIdRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    visitorSessionIdRef.current = getVisitorSessionId();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    window.parent.postMessage({ type: "calead:mode", mode }, "*");
  }, [mode]);

  function pushMessage(role: ChatMessage["role"], content: string) {
    setMessages((prev) => [...prev, { id: uid(), role, content, createdAt: Date.now() }]);
  }

  function expand() {
    setMode("panel");
  }

  function collapse() {
    setMode("bar");
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    if (mode === "bar") expand();

    const nextHistory = [
      ...messages,
      { id: uid(), role: "user" as const, content: trimmed, createdAt: Date.now() },
    ];
    pushMessage("user", trimmed);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextHistory,
          agentId,
          conversationId: conversationIdRef.current,
          visitorSessionId: visitorSessionIdRef.current,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        pushMessage(
          "assistant",
          data.error === "Agente não encontrado"
            ? "Este assistente não está mais disponível. Confere com quem te enviou o link."
            : "Ops, não consegui processar agora. Pode repetir? Me conta também o que você está buscando — quero te ajudar da melhor forma."
        );
        return;
      }
      if (data.conversationId) conversationIdRef.current = data.conversationId;
      pushMessage("assistant", data.reply as string);
    } catch {
      pushMessage(
        "assistant",
        "Ops, não consegui processar agora. Pode repetir? Me conta também o que você está buscando — quero te ajudar da melhor forma."
      );
    } finally {
      setIsSending(false);
    }
  }

  function handleSend() {
    void sendMessage(input);
  }

  async function handleTalkToHuman() {
    if (handoffRequested) return;
    setHandoffRequested(true);
    pushMessage(
      "system",
      "Perfeito — anotei seu interesse em falar com um especialista. Em breve alguém da equipe entra em contato para agendar a reunião."
    );
    try {
      const res = await fetch("/api/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversationIdRef.current,
          agentId,
          visitorSessionId: visitorSessionIdRef.current,
        }),
      });
      const data = await res.json();
      if (data.conversationId) conversationIdRef.current = data.conversationId;
    } catch (err) {
      console.error("falha ao registrar pedido de handoff:", err);
    }
  }

  if (mode === "bar") {
    return (
      <ChatWidgetShell>
        <ChatFloatingBar
          suggestions={defaultSuggestions(companyName)}
          inputValue={input}
          onInputChange={setInput}
          onSubmit={handleSend}
          onSuggestionSelect={(text) => void sendMessage(text)}
          disabled={isSending}
        />
      </ChatWidgetShell>
    );
  }

  return (
    <ChatWidgetShell className="h-full min-h-[560px]">
      <ChatPanel className="flex h-full min-h-0 w-full max-w-[680px] flex-col">
        <ChatHeader companyName={companyName} onCollapse={collapse} />

        <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((m) => (
            <ChatBubble
              key={m.id}
              role={m.role === "system" ? "system" : m.role === "user" ? "user" : "assistant"}
            >
              {m.content}
            </ChatBubble>
          ))}
          {isSending && <ChatBubble role="typing">digitando...</ChatBubble>}
        </div>

        <ChatComposer
          value={input}
          onChange={setInput}
          onSend={handleSend}
          disabled={isSending}
          meetingCta={
            <button
              type="button"
              onClick={handleTalkToHuman}
              disabled={handoffRequested}
              className="w-full text-center text-xs text-white/45 transition hover:text-white/75 disabled:cursor-default disabled:opacity-50"
            >
              {handoffRequested
                ? "Interesse em reunião registrado ✓"
                : "Prefere agendar uma reunião com um especialista?"}
            </button>
          }
        />
      </ChatPanel>
    </ChatWidgetShell>
  );
}
