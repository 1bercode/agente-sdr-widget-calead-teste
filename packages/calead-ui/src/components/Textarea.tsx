import type { TextareaHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-[11px] border border-[#141B2E]/[0.12] bg-white px-3.5 py-[11px] text-[13.5px] text-[#141B2E]/90 outline-none transition font-sans",
        "placeholder:text-[#141B2E]/35 focus:border-[#14B8A6]/50 focus:bg-white disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

Textarea.displayName = "CaleadTextarea";
