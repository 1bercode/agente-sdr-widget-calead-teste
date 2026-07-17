import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type BadgeVariant = "default" | "success" | "warning" | "error" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-white/[0.06] border border-white/10 text-white/80",
  success: "bg-emerald-400/10 border border-emerald-400/25 text-emerald-200",
  warning: "bg-white/[0.05] border border-white/10 text-white/80",
  error: "bg-red-400/10 border border-red-400/25 text-red-200",
  neutral: "bg-white/[0.03] border border-white/[0.09] text-white/45",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-[13px] py-[6px] text-[12.5px] font-medium font-sans",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

Badge.displayName = "CaleadBadge";
