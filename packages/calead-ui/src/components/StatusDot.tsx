import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  status?: "online" | "offline" | "busy";
  size?: "sm" | "md";
}

const statusClasses = {
  online: "bg-emerald-400",
  offline: "bg-slate-300",
  busy: "bg-amber-400",
};

const sizeClasses = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
};

export function StatusDot({ status = "online", size = "md", className, ...props }: StatusDotProps) {
  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0 rounded-full", statusClasses[status], sizeClasses[size], className)}
      {...props}
    />
  );
}

StatusDot.displayName = "CaleadStatusDot";
