import type { InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type InputShape = "default" | "pill";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  shape?: InputShape;
}

const shapeClasses: Record<InputShape, string> = {
  default: "rounded-lg",
  pill: "rounded-full",
};

export function Input({ shape = "default", className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition",
        "placeholder:text-slate-400 focus:border-calead-accent disabled:bg-slate-50 disabled:text-slate-400",
        shapeClasses[shape],
        className
      )}
      {...props}
    />
  );
}

Input.displayName = "CaleadInput";
