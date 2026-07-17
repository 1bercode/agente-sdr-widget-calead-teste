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
        "rounded-2xl border border-[#141B2E]/[0.07] bg-white shadow-[0_16px_40px_-24px_rgba(20,27,46,0.25)]",
        "transition hover:border-[#141B2E]/[0.14]",
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
        "text-[11px] font-semibold uppercase tracking-[0.05em] text-[#141B2E]/40 font-sans",
        className
      )}
    >
      {children}
    </h2>
  );
}

CardTitle.displayName = "CaleadCardTitle";
