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
        "w-full border border-[#141B2E]/[0.12] bg-white text-[13.5px] text-[#141B2E]/90 outline-none transition font-sans",
        "placeholder:text-[#141B2E]/35 focus:border-[#14B8A6]/50 focus:bg-white disabled:opacity-50",
        shapeClasses[shape],
        className
      )}
      {...props}
    />
  );
}

Input.displayName = "CaleadInput";
