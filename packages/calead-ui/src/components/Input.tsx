import type { InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type InputShape = "default" | "pill";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  shape?: InputShape;
}

const shapeClasses: Record<InputShape, string> = {
  default: "rounded-[11px] px-3.5 py-[11px]",
  pill: "rounded-full px-4 py-2.5",
};

export function Input({ shape = "default", className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full border border-white/10 bg-white/[0.04] text-[13.5px] text-white/90 outline-none transition font-sans",
        "placeholder:text-white/40 focus:border-white/25 focus:bg-white/[0.06] disabled:opacity-50",
        shapeClasses[shape],
        className
      )}
      {...props}
    />
  );
}

Input.displayName = "CaleadInput";
