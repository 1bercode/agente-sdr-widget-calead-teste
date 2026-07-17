"use client";

import { useEffect, useState } from "react";
import { ChatBubble } from "@calead/ui";

const CHAR_DELAY_MS = 28;
const INITIAL_DELAY_MS = 500;

export default function TypewriterBubble({
  text,
  onComplete,
  onTick,
}: {
  text: string;
  onComplete?: () => void;
  onTick?: () => void;
}) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setStarted(false);

    const startTimer = window.setTimeout(() => setStarted(true), INITIAL_DELAY_MS + Math.random() * 350);

    return () => window.clearTimeout(startTimer);
  }, [text]);

  useEffect(() => {
    if (!started) return;

    if (displayed.length >= text.length) {
      onComplete?.();
      return;
    }

    const timer = window.setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
      onTick?.();
    }, CHAR_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [started, displayed, text, onComplete, onTick]);

  if (!started) {
    return <ChatBubble role="typing">digitando...</ChatBubble>;
  }

  return <ChatBubble role="assistant">{displayed}</ChatBubble>;
}
