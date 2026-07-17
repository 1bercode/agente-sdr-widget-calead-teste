"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChatBubble,
  ChatComposer,
  ChatFloatingBar,
  ChatHeader,
  ChatPanel,
} from "@calead/ui";
import TypewriterBubble from "@/components/TypewriterBubble";
import type { ChatMessage, WidgetConfig } from "@/lib/types";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

type WidgetMessage = ChatMessage & { animate?: boolean };

const OPENING_MESSAGE = (companyName: string) =>
  `Oi! Sou o assistente de vendas de IA da ${companyName}. Me conta o que você está procurando que te ajudo a encontrar a melhor opção.`;

function defaultSuggestions(companyName: string) {
  return [
    `O que a ${companyName} vende?`,
    "Quanto custa?",
    "Qual a melhor opção pra mim?",
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ChatApiResponse {
  reply?: string;
  degraded?: boolean;
  conversationId?: string | null;
  error?: string;
}

async function requestChatReply(payload: {
  messages: ChatMessage[];
  agentId: string;
  conversationId: string | null;
  visitorSessionId: string | null;
}): Promise<{ ok: boolean; data: ChatApiResponse }> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as ChatApiResponse;
  return { ok: res.ok, data };
}

export default function ChatWidget({ config }: { config: WidgetConfig }) {
  const { companyName, agentId } = config;
  const [mode, setMode] = useState<WidgetMode>("bar");
  const [messages, setMessages] = useState<WidgetMessage[]>([
    {
      id: uid(),
      role: "assistant",
      content: OPENING_MESSAGE(companyName),
      createdAt: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTypingReply, setIsTypingReply] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const conversationIdRef = useRef<string | null>(null);
  const visitorSessionIdRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    visitorSessionIdRef.current = getVisitorSessionId();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, isTypingReply, scrollToBottom]);

  useEffect(() => {
    window.parent.postMessage({ type: "calead:chrome", mode }, "*");
  }, [mode]);

  function pushMessage(role: ChatMessage["role"], content: string, options?: { animate?: boolean }) {
    setMessages((prev) => [
      ...prev,
      { id: uid(), role, content, createdAt: Date.now(), animate: options?.animate },
    ]);
  }

  function expand() {
    setMode("panel");
  }

  function collapse() {
    setMode("bar");
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isSending || isTypingReply) return;

    if (mode === "bar") expand();

    const userMessage: ChatMessage = {
      id: uid(),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };
    const nextHistory = [...messages, userMessage];
    pushMessage("user", trimmed);
    setInput("");
    setIsSending(true);

    try {
      const payload = {
        messages: nextHistory,
        agentId,
        conversationId: conversationIdRef.current,
        visitorSessionId: visitorSessionIdRef.current,
      };

      let { ok, data } = await requestChatReply(payload);

      if (ok && data.degraded) {
        await sleep(900);
        ({ ok, data } = await requestChatReply(payload));
      }

      if (!ok) {
        pushMessage(
          "assistant",
          data.error === "Agente não encontrado"
            ? "Este assistente não está mais disponível. Confere com quem te enviou o link."
            : "Desculpa, não consegui processar agora. Pode repetir?"
        );
        return;
      }

      if (data.conversationId) conversationIdRef.current = data.conversationId;
      setIsTypingReply(true);
      pushMessage("assistant", data.reply ?? "", { animate: true });
    } catch {
      pushMessage("assistant", "Desculpa, não consegui processar agora. Pode repetir?");
    } finally {
      setIsSending(false);
    }
  }

  function handleSend() {
    void sendMessage(input);
  }

  async function transcribeAudio(blob: Blob): Promise<string | null> {
    try {
      const form = new FormData();
      form.append("audio", blob, "audio.webm");
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.text !== "string") return null;
      return data.text;
    } catch (err) {
      console.error("falha ao transcrever áudio:", err);
      return null;
    }
  }

  async function startRecording() {
    if (isRecording || isTranscribing) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : undefined;
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        audioChunksRef.current = [];

        if (blob.size === 0) return;

        setIsTranscribing(true);
        const text = await transcribeAudio(blob);
        setIsTranscribing(false);

        if (text && text.trim()) {
          if (mode === "bar") expand();
          void sendMessage(text);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("não consegui acessar o microfone:", err);
      pushMessage(
        "system",
        "Não consegui acessar seu microfone. Confere se o navegador tem permissão pra esse site."
      );
    }
  }

  function stopRecording() {
    if (!isRecording) return;
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  function handleMicClick() {
    if (isRecording) {
      stopRecording();
    } else {
      void startRecording();
    }
  }

  // Modo barra: um único nó visual — sem shell/h-full intermediário.
  if (mode === "bar") {
    return (
      <ChatFloatingBar
        suggestions={defaultSuggestions(companyName)}
        inputValue={input}
        onInputChange={setInput}
        onSubmit={handleSend}
        onSuggestionSelect={(text) => void sendMessage(text)}
        disabled={isSending || isTypingReply}
        onMicClick={handleMicClick}
        isRecording={isRecording}
        isTranscribing={isTranscribing}
      />
    );
  }

  return (
    <div className="flex h-full w-full items-end justify-center bg-transparent">
      <ChatPanel className="flex h-full min-h-0 w-full max-w-[680px] flex-col">
        <ChatHeader companyName={companyName} onCollapse={collapse} />

        <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((m, index) => {
            const isLastAssistant =
              m.role === "assistant" && m.animate && index === messages.length - 1;

            if (isLastAssistant) {
              return (
                <TypewriterBubble
                  key={m.id}
                  text={m.content}
                  onTick={scrollToBottom}
                  onComplete={() => {
                    setIsTypingReply(false);
                    setMessages((prev) =>
                      prev.map((msg) => (msg.id === m.id ? { ...msg, animate: false } : msg))
                    );
                  }}
                />
              );
            }

            return (
              <ChatBubble
                key={m.id}
                role={m.role === "system" ? "system" : m.role === "user" ? "user" : "assistant"}
              >
                {m.content}
              </ChatBubble>
            );
          })}
          {isSending && <ChatBubble role="typing">digitando...</ChatBubble>}
        </div>

        <ChatComposer
          value={input}
          onChange={setInput}
          onSend={handleSend}
          disabled={isSending || isTypingReply}
          onMicClick={handleMicClick}
          isRecording={isRecording}
          isTranscribing={isTranscribing}
        />
      </ChatPanel>
    </div>
  );
}
