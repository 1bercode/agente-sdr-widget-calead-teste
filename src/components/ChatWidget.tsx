"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, WidgetConfig } from "@/lib/types";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const OPENING_MESSAGE = (companyName: string) =>
  `Oi, tudo bem? Sou o assistente de IA da ${companyName}. Posso responder dúvidas rápidas e, quando fizer sentido, te conectar com uma pessoa de verdade. Como posso te ajudar?`;

export default function ChatWidget({ config }: { config: WidgetConfig }) {
  const { companyName } = config;
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function pushMessage(role: ChatMessage["role"], content: string) {
    setMessages((prev) => [...prev, { id: uid(), role, content, createdAt: Date.now() }]);
  }

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    pushMessage("user", text);
    setInput("");

    // Placeholder: sem LLM conectado ainda (isso entra na Fase 1, passo 2).
    // Por enquanto só confirmamos que a UI e o fluxo de mensagens funcionam.
    setTimeout(() => {
      pushMessage(
        "assistant",
        "Recebi sua mensagem. Ainda estou sem o cérebro de IA conectado (isso vem no próximo passo) — mas a interface já está funcionando de ponta a ponta."
      );
    }, 500);
  }

  function handleTalkToHuman() {
    setHandoffRequested(true);
    pushMessage(
      "system",
      "Combinado — vamos te conectar com uma pessoa. (O agendamento real entra em um passo futuro; por enquanto isso é só a confirmação visual do botão.)"
    );
  }

  function handleClose() {
    window.parent.postMessage({ type: "calead:close" }, "*");
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-white">
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
          onClick={handleClose}
          aria-label="Fechar"
          className="rounded-full p-1 text-slate-300 hover:bg-white/10 hover:text-white"
        >
          ✕
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
          className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm outline-none focus:border-calead-accent"
        />
        <button
          onClick={handleSend}
          className="rounded-full bg-calead-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
