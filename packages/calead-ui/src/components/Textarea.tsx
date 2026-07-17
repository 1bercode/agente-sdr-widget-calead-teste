import type { TextareaHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition",
        "placeholder:text-slate-400 focus:border-calead-accent disabled:bg-slate-50",
        className
      )}
      {...props}
    />
  );
}

Textarea.displayName = "CaleadTextarea";
