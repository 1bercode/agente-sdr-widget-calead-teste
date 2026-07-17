import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-white/[0.92] text-[#141519] hover:bg-white disabled:opacity-40",
  secondary:
    "border border-white/[0.18] bg-white/[0.04] text-white/90 hover:bg-white/[0.08] disabled:opacity-40",
  ghost: "text-white/70 hover:bg-white/[0.06] hover:text-white/90 disabled:opacity-40",
  link: "text-white/60 underline underline-offset-4 decoration-white/25 hover:text-white/85 p-0 h-auto",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-[9px]",
  md: "px-[18px] py-[11px] text-[13.5px] rounded-[11px]",
  lg: "px-6 py-3 text-sm rounded-[12px]",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold font-sans transition disabled:cursor-not-allowed",
        variant !== "link" && sizeClasses[size],
        variantClasses[variant],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

Button.displayName = "CaleadButton";
