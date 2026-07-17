import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)} {...props}>
      <div>
        <h1 className="font-display text-[26px] font-bold tracking-[-0.02em] text-[#141B2E]/92">{title}</h1>
        {description && <p className="mt-1 text-[13.5px] text-[#141B2E]/45">{description}</p>}
      </div>
      {action}
    </div>
  );
}

PageHeader.displayName = "CaleadPageHeader";

export function EmptyState({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-[#141B2E]/[0.16] bg-[#141B2E]/[0.02] px-4 py-10 text-center text-sm text-[#141B2E]/45",
        className
      )}
    >
      {children}
    </div>
  );
}

EmptyState.displayName = "CaleadEmptyState";

export function CodeBlock({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <pre
      className={cn(
        "overflow-x-auto rounded-[11px] border border-[#141B2E]/[0.10] bg-[#141B2E]/[0.04] px-[15px] py-[15px] font-mono text-[11.5px] leading-[1.7] text-[#141B2E]/75",
        className
      )}
    >
      <code>{children}</code>
    </pre>
  );
}

CodeBlock.displayName = "CaleadCodeBlock";

export interface AppShellProps {
  brand?: ReactNode;
  onLogout?: () => void;
  children: ReactNode;
}

export function AppShell({ brand = "agente-wazai", onLogout, children }: AppShellProps) {
  return (
    <div className="calead-bg">
      <header className="sticky top-0 z-20 border-b border-[#141B2E]/[0.07] bg-[rgba(238,241,245,0.75)] backdrop-blur-[16px]">
        <div className="mx-auto flex max-w-[940px] items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2.5">
            {typeof brand === "string" ? (
              <>
                <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-[#14B8A6] font-display text-sm font-bold text-white">
                  W
                </span>
                <span className="font-display text-base font-bold tracking-[-0.01em] text-[#141B2E]/92">
                  {brand}
                </span>
              </>
            ) : (
              brand
            )}
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="text-[13px] text-[#141B2E]/45 transition hover:text-[#141B2E]/80"
            >
              Sair
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-[940px] px-8 py-9 pb-20">{children}</main>
    </div>
  );
}

AppShell.displayName = "CaleadAppShell";
