import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  status?: "online" | "offline" | "busy";
  size?: "sm" | "md";
  glow?: boolean;
}

const statusClasses = {
  online: "bg-emerald-400",
  offline: "bg-white/20",
  busy: "bg-amber-400",
};

const glowClasses = {
  online: "shadow-[0_0_0_3px_rgba(74,222,128,0.16)]",
  offline: "",
  busy: "shadow-[0_0_0_3px_rgba(251,191,36,0.16)]",
};

const sizeClasses = {
  sm: "h-1.5 w-1.5",
  md: "h-[7px] w-[7px]",
};

export function StatusDot({
  status = "online",
  size = "md",
  glow = false,
  className,
  ...props
}: StatusDotProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block shrink-0 rounded-full",
        statusClasses[status],
        sizeClasses[size],
        glow && glowClasses[status],
        className
      )}
      {...props}
    />
  );
}

StatusDot.displayName = "CaleadStatusDot";
