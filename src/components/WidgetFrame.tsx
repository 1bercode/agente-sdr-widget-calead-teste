"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Bridge mínimo do iframe: transparência no first paint + handshake ready.
 * A geometria do chrome fica no host (embed.js) — sem ResizeObserver.
 */
export default function WidgetFrame({ children }: { children: ReactNode }) {
  const readySent = useRef(false);

  useEffect(() => {
    if (readySent.current) return;
    readySent.current = true;

    // Dois rAFs: espera layout/paint do React antes de revelar no host.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.parent.postMessage({ type: "calead:ready" }, "*");
      });
    });
  }, []);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              height: 100% !important;
              overflow: hidden !important;
              background: transparent !important;
              background-color: transparent !important;
              color-scheme: dark;
            }
          `,
        }}
      />
      <div
        id="calead-widget-root"
        data-calead-widget
        className="h-full w-full bg-transparent"
      >
        {children}
      </div>
    </>
  );
}
