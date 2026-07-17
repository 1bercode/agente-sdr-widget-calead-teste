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
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
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
        "rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500",
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
        "overflow-x-auto rounded-lg bg-slate-900 px-4 py-3 text-xs leading-relaxed text-slate-100",
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

export function AppShell({ brand = "Calead", onLogout, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>{typeof brand === "string" ? <span className="text-lg font-semibold text-slate-900">{brand}</span> : brand}</div>
        {onLogout && (
          <button type="button" onClick={onLogout} className="text-sm text-slate-500 hover:text-slate-800">
            Sair
          </button>
        )}
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}

AppShell.displayName = "CaleadAppShell";
