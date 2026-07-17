import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  ChatPanel,
  ChatHeader,
  ChatBubble,
  ChatComposer,
  ChatFloatingBar,
  ChatWidgetShell,
} from "../src/components/Chat";

const meta: Meta = {
  title: "Calead/Chat",
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "site-light", values: [{ name: "site-light", value: "#f0f0f0" }] },
  },
};

export default meta;

export const FloatingBar: StoryObj = {
  render: function Render() {
    const [input, setInput] = useState("");
    return (
      <div className="relative h-[420px] w-full bg-[#f0f0f0]">
        <ChatWidgetShell className="absolute inset-x-0 bottom-0">
          <ChatFloatingBar
            inputValue={input}
            onInputChange={setInput}
            suggestions={[
              "O que a nomo studio faz?",
              "Quanto custa um projeto?",
              "Como funciona o processo?",
            ]}
            onSuggestionSelect={setInput}
          />
        </ChatWidgetShell>
      </div>
    );
  },
};

export const ExpandedPanel: StoryObj = {
  render: function Render() {
    const [input, setInput] = useState("");
    return (
      <div className="h-[560px] w-[680px] bg-[#f0f0f0] p-4">
        <ChatPanel className="h-full">
          <ChatHeader companyName="NomoStudio" onCollapse={() => undefined} />
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <ChatBubble role="assistant">
              Oi! Sou o consultor comercial de IA da NomoStudio. Como posso te ajudar?
            </ChatBubble>
            <ChatBubble role="user">Quero saber sobre preços</ChatBubble>
            <ChatBubble role="assistant">
              Claro! Trabalhamos com projetos sob medida. Me conta: você busca branding, site ou campanha?
            </ChatBubble>
          </div>
          <ChatComposer
            value={input}
            onChange={setInput}
            onSend={() => setInput("")}
            meetingCta={
              <button type="button" className="w-full text-center text-xs text-white/45 hover:text-white/75">
                Prefere agendar uma reunião com um especialista?
              </button>
            }
          />
        </ChatPanel>
      </div>
    );
  },
};

export const MessageVariants: StoryObj = {
  render: () => (
    <div className="w-[380px] space-y-3 rounded-2xl border border-white/10 bg-[rgba(24,24,28,0.92)] p-4 backdrop-blur-xl">
      <ChatBubble role="assistant">Mensagem do consultor</ChatBubble>
      <ChatBubble role="user">Mensagem do visitante</ChatBubble>
      <ChatBubble role="system">Interesse em reunião registrado ✓</ChatBubble>
      <ChatBubble role="typing">digitando...</ChatBubble>
    </div>
  ),
};
