import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "px-[18px] py-[15px]",
  md: "p-[22px]",
  lg: "p-[28px]",
};

export function Card({ children, padding = "md", className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.09] bg-[rgba(23,24,28,0.72)] backdrop-blur-[20px] backdrop-saturate-[1.3] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)]",
        "transition hover:border-white/[0.16]",
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

Card.displayName = "CaleadCard";

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.05em] text-white/40 font-sans",
        className
      )}
    >
      {children}
    </h2>
  );
}

CardTitle.displayName = "CaleadCardTitle";
