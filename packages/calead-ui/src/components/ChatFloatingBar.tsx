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

/**
 * Typewriter que não reinicia ao pausar (hover).
 * Começa com o texto completo para evitar flash vazio no first paint.
 */
function useTypewriter(text: string, paused = false) {
  const [displayed, setDisplayed] = useState(text);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    let cancelled = false;
    let index = text.length;
    let deleting = true;
    let timer = 0;

    function schedule(fn: () => void, ms: number) {
      timer = window.setTimeout(fn, ms);
    }

    function tick() {
      if (cancelled) return;
      if (pausedRef.current) {
        schedule(tick, 120);
        return;
      }

      if (!deleting) {
        index += 1;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) {
          deleting = true;
          schedule(tick, 2400);
          return;
        }
        schedule(tick, 46);
        return;
      }

      index -= 1;
      setDisplayed(text.slice(0, Math.max(index, 0)));
      if (index <= 0) {
        deleting = false;
        schedule(tick, 700);
        return;
      }
      schedule(tick, 22);
    }

    schedule(tick, 1800);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [text]);

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
  onMicClick?: () => void;
  isRecording?: boolean;
  isTranscribing?: boolean;
}

export function ChatFloatingBar({
  typewriterText = DEFAULT_TYPEWRITER,
  suggestions = [],
  inputValue = "",
  onInputChange,
  onSubmit,
  onSuggestionSelect,
  disabled = false,
  onMicClick,
  isRecording = false,
  isTranscribing = false,
}: ChatFloatingBarProps) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const leaveTimerRef = useRef<number>();

  const showInput = editing || inputValue.length > 0;
  const displayed = useTypewriter(typewriterText, disabled || showInput || hovered);
  const showSuggestions = hovered && suggestions.length > 0 && !disabled;
  const hasSuggestions = suggestions.length > 0;

  useEffect(() => {
    if (showInput) inputRef.current?.focus();
  }, [showInput]);

  useEffect(() => {
    return () => window.clearTimeout(leaveTimerRef.current);
  }, []);

  function handleMouseEnter() {
    window.clearTimeout(leaveTimerRef.current);
    setHovered(true);
  }

  function handleMouseLeave() {
    leaveTimerRef.current = window.setTimeout(() => setHovered(false), 180);
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
      data-calead-bar
      className="flex h-full w-full flex-col justify-end"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="mx-auto flex w-full max-w-[680px] flex-col justify-end pb-1">
        {/* Slot sempre reservado: hover só muda opacity — sem reflow / sem resize do iframe */}
        {hasSuggestions && (
          <div
            className={cn(
              "mb-2.5 flex h-11 items-end justify-center gap-2 px-1 transition-opacity duration-200 ease-out",
              showSuggestions ? "opacity-100" : "pointer-events-none opacity-0"
            )}
            aria-hidden={!showSuggestions}
          >
            {suggestions.map((text) => (
              <button
                key={text}
                type="button"
                tabIndex={showSuggestions ? 0 : -1}
                onClick={() => handleSuggestion(text)}
                className={cn(glassChip, "rounded-full px-4 py-2 text-sm text-white/85")}
              >
                {text}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3 rounded-[18px] bg-[#2a2a2e] px-4 py-3.5",
              "border border-white/[0.06] transition-colors hover:bg-[#323238]",
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
            onClick={onMicClick}
            disabled={disabled || isTranscribing}
            title={isRecording ? "Parar gravação" : "Falar com o agente"}
            aria-label={isRecording ? "Parar gravação" : "Falar com o agente"}
            className={cn(
              "flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[16px] transition disabled:cursor-default disabled:opacity-50",
              isRecording
                ? "bg-red-500/90 text-white animate-pulse"
                : "calead-mic-glow bg-[#2a2a2e] text-emerald-400 hover:bg-[#323238]"
            )}
          >
            <MicIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

ChatFloatingBar.displayName = "CaleadChatFloatingBar";
