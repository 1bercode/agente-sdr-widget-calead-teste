import type { ReactNode } from "react";
import { cn } from "../lib/cn";

const glassSurface =
  "border border-white/10 bg-[rgba(24,24,28,0.88)] shadow-glass backdrop-blur-[16px]";
const glassChip =
  "border border-white/10 bg-[rgba(38,38,44,0.78)] backdrop-blur-md transition hover:border-white/20 hover:bg-[rgba(48,48,54,0.85)]";

function ArrowUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 3v10M8 3l4 4M8 3L4 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="white" strokeWidth="1.5" />
      <path
        d="M5 11a7 7 0 0014 0M12 18v3"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface ChatSuggestionChipsProps {
  suggestions: string[];
  onSelect: (text: string) => void;
}

export function ChatSuggestionChips({ suggestions, onSelect }: ChatSuggestionChipsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 px-1">
      {suggestions.map((text) => (
        <button
          key={text}
          type="button"
          onClick={() => onSelect(text)}
          className={cn(
            glassChip,
            "rounded-full px-4 py-2 text-sm text-white/85"
          )}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

ChatSuggestionChips.displayName = "CaleadChatSuggestionChips";

export interface ChatFloatingBarProps {
  placeholder?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onSubmit?: () => void;
  onFocus?: () => void;
  suggestions?: string[];
  onSuggestionSelect?: (text: string) => void;
  disabled?: boolean;
}

export function ChatFloatingBar({
  placeholder = "Pergunte qualquer coisa...",
  inputValue = "",
  onInputChange,
  onSubmit,
  onFocus,
  suggestions = [],
  onSuggestionSelect,
  disabled = false,
}: ChatFloatingBarProps) {
  return (
    <div className="flex w-full max-w-[680px] flex-col gap-3">
      {suggestions.length > 0 && onSuggestionSelect && (
        <ChatSuggestionChips suggestions={suggestions} onSelect={onSuggestionSelect} />
      )}

      <div className="flex items-center gap-2">
        <div
          className={cn(
            glassSurface,
            "flex min-w-0 flex-1 items-center gap-2 rounded-full px-4 py-2.5"
          )}
        >
          <input
            value={inputValue}
            onChange={(e) => onInputChange?.(e.target.value)}
            onFocus={onFocus}
            onKeyDown={(e) => e.key === "Enter" && onSubmit?.()}
            placeholder={placeholder}
            disabled={disabled}
            className="min-w-0 flex-1 bg-transparent text-sm text-white/90 outline-none placeholder:text-white/40 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled || !inputValue.trim()}
            aria-label="Enviar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#1a1a1c] transition hover:bg-white/90 disabled:opacity-40"
          >
            <ArrowUpIcon />
          </button>
        </div>

        <button
          type="button"
          disabled
          title="Conversa por voz chega em breve"
          aria-label="Voz (em breve)"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2F4F44] shadow-glass transition hover:bg-[#3A6356] disabled:opacity-80"
        >
          <MicIcon />
        </button>
      </div>
    </div>
  );
}

ChatFloatingBar.displayName = "CaleadChatFloatingBar";

export interface ChatHeaderProps {
  companyName: string;
  subtitle?: string;
  onCollapse?: () => void;
  collapseLabel?: string;
}

export function ChatHeader({
  companyName,
  subtitle = "Consultor comercial · IA",
  onCollapse,
  collapseLabel = "Recolher",
}: ChatHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-white/90">{companyName}</p>
        <p className="flex items-center gap-1.5 text-xs text-white/50">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
          {subtitle}
        </p>
      </div>
      {onCollapse && (
        <button
          type="button"
          onClick={onCollapse}
          aria-label={collapseLabel}
          className="rounded-full p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white/80"
        >
          ▾
        </button>
      )}
    </div>
  );
}

ChatHeader.displayName = "CaleadChatHeader";

/** @deprecated Use ChatFloatingBar — mantido por compatibilidade Storybook antigo */
export interface ChatBarProps {
  companyName: string;
  placeholder?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onExpand?: () => void;
  onHide?: () => void;
  onSubmit?: () => void;
}

export function ChatBar({
  companyName,
  placeholder,
  inputValue,
  onInputChange,
  onExpand,
  onSubmit,
}: ChatBarProps) {
  const suggestions = [
    `O que a ${companyName} faz?`,
    "Quanto custa um projeto?",
    "Como funciona o processo?",
  ];
  return (
    <ChatFloatingBar
      placeholder={placeholder ?? "Pergunte qualquer coisa..."}
      inputValue={inputValue}
      onInputChange={onInputChange}
      onSubmit={onSubmit}
      onFocus={onExpand}
      suggestions={suggestions}
      onSuggestionSelect={(text) => {
        onInputChange?.(text);
        onExpand?.();
        onSubmit?.();
      }}
    />
  );
}

ChatBar.displayName = "CaleadChatBar";

export type ChatBubbleRole = "user" | "assistant" | "system" | "typing";

export interface ChatBubbleProps {
  role: ChatBubbleRole;
  children: ReactNode;
}

export function ChatBubble({ role, children }: ChatBubbleProps) {
  const align =
    role === "user" ? "justify-end" : role === "system" ? "justify-center" : "justify-start";

  const bubbleClass = {
    user: "max-w-[85%] rounded-2xl rounded-br-md border border-white/10 bg-white/14 px-3.5 py-2.5 text-sm text-white/90",
    assistant:
      "max-w-[85%] rounded-2xl rounded-bl-md border border-white/8 bg-white/8 px-3.5 py-2.5 text-sm text-white/85",
    system:
      "max-w-[90%] rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-center text-xs text-amber-100/90",
    typing:
      "max-w-[85%] rounded-2xl rounded-bl-md border border-white/8 bg-white/8 px-3.5 py-2.5 text-sm text-white/45",
  }[role];

  return (
    <div className={cn("flex", align)}>
      <div className={bubbleClass}>{children}</div>
    </div>
  );
}

ChatBubble.displayName = "CaleadChatBubble";

export interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  meetingCta?: ReactNode;
}

export function ChatComposer({
  value,
  onChange,
  onSend,
  placeholder = "Pergunte qualquer coisa...",
  disabled = false,
  meetingCta,
}: ChatComposerProps) {
  return (
    <div className="border-t border-white/10 px-3 py-3">
      {meetingCta && <div className="mb-2">{meetingCta}</div>}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 backdrop-blur-sm"
          )}
        >
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            placeholder={placeholder}
            disabled={disabled}
            className="min-w-0 flex-1 bg-transparent text-sm text-white/90 outline-none placeholder:text-white/40 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={disabled || !value.trim()}
            aria-label="Enviar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#1a1a1c] transition hover:bg-white/90 disabled:opacity-40"
          >
            <ArrowUpIcon />
          </button>
        </div>
        <button
          type="button"
          disabled
          title="Conversa por voz chega em breve"
          aria-label="Voz (em breve)"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2F4F44] disabled:opacity-80"
        >
          <MicIcon />
        </button>
      </div>
    </div>
  );
}

ChatComposer.displayName = "CaleadChatComposer";

export function ChatPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[rgba(24,24,28,0.92)] shadow-glass-lg backdrop-blur-[20px]",
        className
      )}
    >
      {children}
    </div>
  );
}

ChatPanel.displayName = "CaleadChatPanel";

export function ChatWidgetShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-end bg-transparent p-3 pb-4",
        className
      )}
    >
      {children}
    </div>
  );
}

ChatWidgetShell.displayName = "CaleadChatWidgetShell";
