"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, WidgetConfig } from "@/lib/types";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Id anônimo por sessão de navegador — não é PII, só evita criar uma
// conversa nova a cada mensagem/reload da mesma aba.
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

const OPENING_MESSAGE = (companyName: string) =>
  `Oi, tudo bem? Sou o assistente de IA da ${companyName}. Posso responder dúvidas rápidas e, quando fizer sentido, te conectar com uma pessoa de verdade. Como posso te ajudar?`;

type WidgetMode = "bar" | "panel";

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

  // Avisa a página que embutiu o widget (via embed.js) pra ela redimensionar
  // o container do iframe — barra fina quando recolhido, painel alto quando
  // expandido. Isso é o que faz o "barra embaixo do site" funcionar de
  // verdade: o iframe em si só ocupa o espaço que precisa a cada momento.
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

  function hide() {
    window.parent.postMessage({ type: "calead:hide" }, "*");
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || isSending) return;
    if (mode === "bar") expand();

    const nextHistory = [...messages, { id: uid(), role: "user" as const, content: text, createdAt: Date.now() }];
    pushMessage("user", text);
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
      const data = await res.json();
      if (data.conversationId) conversationIdRef.current = data.conversationId;
      pushMessage("assistant", data.reply as string);
    } catch (err) {
      pushMessage(
        "assistant",
        "Desculpa, não consegui te responder agora — problema de conexão. Quer falar direto com uma pessoa da equipe?"
      );
    } finally {
      setIsSending(false);
    }
  }

  async function handleTalkToHuman() {
    if (handoffRequested) return;
    setHandoffRequested(true);
    pushMessage(
      "system",
      "Combinado — vamos te conectar com uma pessoa. (O agendamento de verdade entra no próximo passo; por enquanto sua solicitação já fica registrada pra equipe ver.)"
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

  // --- Modo barra (recolhido) ----------------------------------------
  if (mode === "bar") {
    return (
      <div className="flex h-full w-full items-center gap-2 border-t border-slate-200 bg-white px-3 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] sm:px-4">
        <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-400" aria-hidden />
        <button
          onClick={expand}
          className="flex-1 truncate text-left text-sm text-slate-500 hover:text-slate-700"
        >
          Pergunte algo pra {companyName} · assistente de IA
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={expand}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Digite aqui..."
          className="hidden flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm outline-none focus:border-calead-accent sm:block"
        />
        <button
          disabled
          title="Conversa por voz chega em breve"
          aria-label="Voz (em breve)"
          className="shrink-0 rounded-full p-2 text-slate-300"
        >
          🎙️
        </button>
        <button
          onClick={hide}
          aria-label="Esconder"
          className="shrink-0 rounded-full p-2 text-slate-300 hover:text-slate-500"
        >
          ✕
        </button>
      </div>
    );
  }

  // --- Modo painel (expandido) ----------------------------------------
  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* Header — transparência total: deixa claro que é IA */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-calead-bg px-4 py-3 text-white">
        <div>
          <p className="text-sm font-semibold">{companyName}</p>
          <p className="flex items-center gap-1 text-xs text-slate-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Assistente de IA · não é uma pessoa
          </p>
        </div>
        <button
          onClick={collapse}
          aria-label="Recolher"
          className="rounded-full p-1 text-slate-300 hover:bg-white/10 hover:text-white"
        >
          ▾
        </button>
      </div>

      {/* Mensagens */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.role === "user"
                ? "flex justify-end"
                : m.role === "system"
                ? "flex justify-center"
                : "flex justify-start"
            }
          >
            <div
              className={
                m.role === "user"
                  ? "max-w-[80%] rounded-2xl rounded-br-sm bg-calead-accent px-3 py-2 text-sm text-white"
                  : m.role === "system"
                  ? "max-w-[90%] rounded-xl bg-amber-50 px-3 py-2 text-center text-xs text-amber-800"
                  : "max-w-[80%] rounded-2xl rounded-bl-sm bg-calead-accentSoft px-3 py-2 text-sm text-slate-800"
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-calead-accentSoft px-3 py-2 text-sm text-slate-500">
              digitando...
            </div>
          </div>
        )}
      </div>

      {/* Porta de saída sempre visível */}
      <div className="border-t border-slate-100 px-4 py-2">
        <button
          onClick={handleTalkToHuman}
          disabled={handoffRequested}
          className="w-full rounded-lg border border-calead-accent px-3 py-2 text-sm font-medium text-calead-accent hover:bg-calead-accentSoft disabled:cursor-default disabled:opacity-50"
        >
          {handoffRequested ? "Pessoa avisada ✓" : "Falar com uma pessoa agora"}
        </button>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-slate-100 px-3 py-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Escreva sua mensagem..."
          disabled={isSending}
          autoFocus
          className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm outline-none focus:border-calead-accent disabled:bg-slate-50"
        />
        <button
          onClick={handleSend}
          disabled={isSending}
          className="rounded-full bg-calead-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
