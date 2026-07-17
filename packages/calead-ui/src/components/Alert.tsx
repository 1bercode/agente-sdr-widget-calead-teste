import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type AlertVariant = "info" | "warning" | "error" | "success";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

const variantClasses: Record<AlertVariant, string> = {
  info: "bg-white/[0.05] border-white/[0.11] text-white/75",
  warning: "bg-amber-400/10 border-amber-400/25 text-amber-100",
  error: "bg-red-400/10 border-red-400/25 text-red-100",
  success: "bg-emerald-400/[0.09] border-emerald-400/[0.22] text-emerald-100",
};

const dotClasses: Record<AlertVariant, string> = {
  info: "bg-white/55",
  warning: "bg-amber-300",
  error: "bg-red-300",
  success: "bg-emerald-400",
};

export function Alert({ variant = "info", className, children, ...props }: AlertProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-[11px] border px-3.5 py-[11px] text-[12.5px] font-sans",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClasses[variant])} aria-hidden />
      <div>{children}</div>
    </div>
  );
}

Alert.displayName = "CaleadAlert";
