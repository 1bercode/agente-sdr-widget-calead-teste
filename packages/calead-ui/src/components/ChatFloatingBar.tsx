"use client";

import { useEffect, useState } from "react";
import { cn } from "../lib/cn";

const DEFAULT_TYPEWRITER =
  "Digite uma Dúvida ou Aperte para Falar com nosso Agente";

function MicIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 11a7 7 0 0014 0M12 18v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function useTypewriter(text: string, active = true) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    let index = 0;
    let deleting = false;

    function tick() {
      if (cancelled) return;

      if (!deleting) {
        index += 1;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) {
          deleting = true;
          window.setTimeout(tick, 2400);
          return;
        }
        window.setTimeout(tick, 46);
        return;
      }

      index -= 1;
      setDisplayed(text.slice(0, index));
      if (index <= 0) {
        deleting = false;
        window.setTimeout(tick, 700);
        return;
      }
      window.setTimeout(tick, 22);
    }

    tick();
    return () => {
      cancelled = true;
    };
  }, [text, active]);

  return displayed;
}

export interface ChatFloatingBarProps {
  typewriterText?: string;
  onActivate?: () => void;
  disabled?: boolean;
  /** @deprecated Barra inicial não usa input — mantido por compatibilidade Storybook */
  placeholder?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onSubmit?: () => void;
  onFocus?: () => void;
  suggestions?: string[];
  onSuggestionSelect?: (text: string) => void;
}

export function ChatFloatingBar({
  typewriterText = DEFAULT_TYPEWRITER,
  onActivate,
  disabled = false,
  onFocus,
}: ChatFloatingBarProps) {
  const displayed = useTypewriter(typewriterText, !disabled);

  function handleActivate() {
    if (disabled) return;
    onActivate?.();
    onFocus?.();
  }

  return (
    <div className="flex w-full max-w-[680px] items-center gap-2.5">
      <button
        type="button"
        onClick={handleActivate}
        disabled={disabled}
        aria-label={typewriterText}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-3 rounded-[18px] bg-[#2a2a2e] px-4 py-3.5 text-left transition hover:bg-[#323238] disabled:opacity-50",
          "border border-white/[0.06]"
        )}
      >
        <span
          className="calead-live-dot h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400"
          aria-hidden
        />
        <span className="min-w-0 flex-1 truncate text-[13px] leading-snug text-white/55">
          {displayed}
          <span
            className="calead-type-cursor ml-0.5 inline-block h-[14px] w-[2px] translate-y-[2px] bg-emerald-400"
            aria-hidden
          />
        </span>
      </button>

      <button
        type="button"
        disabled
        onClick={handleActivate}
        title="Conversa por voz chega em breve"
        aria-label="Falar com agente (em breve)"
        className="calead-mic-glow flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[16px] bg-[#2a2a2e] text-emerald-400 transition hover:bg-[#323238] disabled:cursor-default"
      >
        <MicIcon />
      </button>
    </div>
  );
}

ChatFloatingBar.displayName = "CaleadChatFloatingBar";
