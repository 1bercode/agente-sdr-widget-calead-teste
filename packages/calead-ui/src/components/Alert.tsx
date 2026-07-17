import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type AlertVariant = "info" | "warning" | "error" | "success";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

const variantClasses: Record<AlertVariant, string> = {
  info: "bg-calead-accentSoft text-slate-800 border-calead-accent/20",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

export function Alert({ variant = "info", className, children, ...props }: AlertProps) {
  return (
    <div
      className={cn("rounded-lg border px-4 py-3 text-sm", variantClasses[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}

Alert.displayName = "CaleadAlert";
