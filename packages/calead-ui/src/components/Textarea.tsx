import type { TextareaHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-[11px] border border-white/10 bg-white/[0.04] px-3.5 py-[11px] text-[13.5px] text-white/90 outline-none transition font-sans",
        "placeholder:text-white/40 focus:border-white/25 focus:bg-white/[0.06] disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

Textarea.displayName = "CaleadTextarea";
