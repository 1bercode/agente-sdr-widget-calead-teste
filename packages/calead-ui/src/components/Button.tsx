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
  primary: "bg-[#14B8A6] text-white hover:bg-[#0FA592] disabled:opacity-40",
  secondary:
    "border border-[#141B2E]/[0.12] bg-white text-[#141B2E]/90 hover:bg-[#141B2E]/[0.04] disabled:opacity-40",
  ghost: "text-[#141B2E]/65 hover:bg-[#141B2E]/[0.06] hover:text-[#141B2E]/90 disabled:opacity-40",
  link: "text-[#141B2E]/60 underline underline-offset-4 decoration-[#141B2E]/25 hover:text-[#141B2E]/85 p-0 h-auto",
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
