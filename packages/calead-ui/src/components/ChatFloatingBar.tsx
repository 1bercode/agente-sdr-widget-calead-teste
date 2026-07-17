"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";

const DEFAULT_TYPEWRITER =
  "Digite uma Dúvida ou Aperte para Falar com nosso Agente";

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
  suggestions?: string[];
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onSubmit?: () => void;
  onSuggestionSelect?: (text: string) => void;
  disabled?: boolean;
  /** @deprecated */
  onActivate?: () => void;
  onFocus?: () => void;
  placeholder?: string;
}

export function ChatFloatingBar({
  typewriterText = DEFAULT_TYPEWRITER,
  suggestions = [],
  inputValue = "",
  onInputChange,
  onSubmit,
  onSuggestionSelect,
  disabled = false,
}: ChatFloatingBarProps) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const leaveTimerRef = useRef<number>();

  const showInput = editing || inputValue.length > 0;
  const displayed = useTypewriter(typewriterText, !disabled && !showInput && !hovered);
  const showSuggestions = hovered && suggestions.length > 0 && !disabled;

  useEffect(() => {
    if (showInput) inputRef.current?.focus();
  }, [showInput]);

  function handleMouseEnter() {
    window.clearTimeout(leaveTimerRef.current);
    setHovered(true);
  }

  function handleMouseLeave() {
    leaveTimerRef.current = window.setTimeout(() => setHovered(false), 150);
  }

  function handleBarClick() {
    if (disabled) return;
    setEditing(true);
  }

  function handleSubmit() {
    if (disabled || !inputValue.trim()) return;
    onSubmit?.();
  }

  function handleSuggestion(text: string) {
    if (disabled) return;
    onSuggestionSelect?.(text);
  }

  return (
    <div
      className="flex w-full max-w-[680px] flex-col items-stretch gap-2.5"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cn(
          "flex flex-wrap justify-center gap-2 px-1 transition-all duration-200 ease-out",
          showSuggestions
            ? "max-h-24 translate-y-0 opacity-100"
            : "pointer-events-none max-h-0 -translate-y-1 overflow-hidden opacity-0"
        )}
      >
        {suggestions.map((text) => (
          <button
            key={text}
            type="button"
            onClick={() => handleSuggestion(text)}
            className={cn(glassChip, "rounded-full px-4 py-2 text-sm text-white/85")}
          >
            {text}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex min-w-0 flex-1 items-center gap-3 rounded-[18px] bg-[#2a2a2e] px-4 py-3.5",
            "border border-white/[0.06] transition hover:bg-[#323238]",
            disabled && "opacity-50"
          )}
        >
          <span
            className="calead-live-dot h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400"
            aria-hidden
          />

          {showInput ? (
            <>
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => onInputChange?.(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                onBlur={() => {
                  if (!inputValue.trim()) setEditing(false);
                }}
                disabled={disabled}
                placeholder="Pergunte qualquer coisa..."
                className="min-w-0 flex-1 bg-transparent text-[13px] text-white/90 outline-none placeholder:text-white/40 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={disabled || !inputValue.trim()}
                aria-label="Enviar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#1a1a1c] transition hover:bg-white/90 disabled:opacity-40"
              >
                <ArrowUpIcon />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleBarClick}
              disabled={disabled}
              aria-label={typewriterText}
              className="min-w-0 flex-1 truncate text-left text-[13px] leading-snug text-white/55"
            >
              {displayed}
              <span
                className="calead-type-cursor ml-0.5 inline-block h-[14px] w-[2px] translate-y-[2px] bg-emerald-400"
                aria-hidden
              />
            </button>
          )}
        </div>

        <button
          type="button"
          disabled
          title="Conversa por voz chega em breve"
          aria-label="Falar com agente (em breve)"
          className="calead-mic-glow flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[16px] bg-[#2a2a2e] text-emerald-400 transition hover:bg-[#323238] disabled:cursor-default"
        >
          <MicIcon />
        </button>
      </div>
    </div>
  );
}

ChatFloatingBar.displayName = "CaleadChatFloatingBar";
