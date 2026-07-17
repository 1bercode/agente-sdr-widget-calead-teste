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

    function publishHeight() {
      // Mede o conteúdo real (filho), não o wrapper h-full — senão o
      // iframe entra em feedback e cresce até o teto (~160px), deixando
      // a barra "flutuando" longe do fundo da viewport.
      const content = root!.firstElementChild as HTMLElement | null;
      const height = Math.ceil((content ?? root!).getBoundingClientRect().height);
      window.parent.postMessage({ type: "calead:height", height }, "*");
    }

    publishHeight();
    const observer = new ResizeObserver(publishHeight);
    observer.observe(root);
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
