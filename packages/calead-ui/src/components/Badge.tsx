import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type BadgeVariant = "default" | "success" | "warning" | "error" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[#141B2E]/[0.05] border border-[#141B2E]/10 text-[#141B2E]/75",
  success: "bg-emerald-500/10 border border-emerald-500/25 text-emerald-700",
  warning: "bg-amber-400/10 border border-amber-400/25 text-amber-700",
  error: "bg-red-500/10 border border-red-500/25 text-red-700",
  neutral: "bg-[#141B2E]/[0.03] border border-[#141B2E]/[0.08] text-[#141B2E]/40",
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
