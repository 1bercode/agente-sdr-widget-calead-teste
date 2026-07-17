"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function WidgetFrame({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.style.background = "transparent";
    html.style.backgroundColor = "transparent";
    body.style.background = "transparent";
    body.style.backgroundColor = "transparent";
    html.style.colorScheme = "dark";
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    function contentEl(): HTMLElement {
      // Shell (filho) costuma ser h-full; o conteúdo real (barra/painel)
      // é o neto — é ele que muda de altura no hover das chips.
      const shell = root!.firstElementChild as HTMLElement | null;
      const inner = shell?.firstElementChild as HTMLElement | null;
      return inner ?? shell ?? root!;
    }

    function publishHeight() {
      const height = Math.ceil(contentEl().getBoundingClientRect().height);
      window.parent.postMessage({ type: "calead:height", height }, "*");
    }

    publishHeight();

    const observer = new ResizeObserver(publishHeight);
    observer.observe(root);

    const shell = root.firstElementChild;
    if (shell instanceof HTMLElement) {
      observer.observe(shell);
      const inner = shell.firstElementChild;
      if (inner instanceof HTMLElement) observer.observe(inner);
    }

    window.addEventListener("resize", publishHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", publishHeight);
    };
  }, []);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html, body {
              background: transparent !important;
              background-color: transparent !important;
            }
          `,
        }}
      />
      <div
        ref={rootRef}
        id="calead-widget-root"
        data-calead-widget
        className="h-full w-full bg-transparent"
      >
        {children}
      </div>
    </>
  );
}
