/**
 * Contrato host ↔ iframe do widget Calead.
 * Host (embed.js) é a fonte da verdade da geometria do chrome.
 * Guest (iframe) só anuncia modo e ready — não empurra altura pixel a pixel.
 */
export const WIDGET_BAR = {
  /** Altura fixa do iframe em modo barra (chips reservadas + barra + folga glow) */
  iframeHeight: 112,
  chipsSlot: 44,
  barRow: 52,
  safePad: 8,
} as const;

export const WIDGET_PANEL = {
  desktopHeight: "min(560px, 80vh)",
  mobileHeight: "90vh",
} as const;

export type WidgetChromeMode = "bar" | "panel";

export type CaleadReadyMessage = {
  type: "calead:ready";
};

export type CaleadChromeMessage = {
  type: "calead:chrome";
  mode: WidgetChromeMode;
};

export type CaleadHostMessage = CaleadReadyMessage | CaleadChromeMessage;

export function isCaleadHostMessage(data: unknown): data is CaleadHostMessage {
  if (!data || typeof data !== "object") return false;
  const type = (data as { type?: string }).type;
  return type === "calead:ready" || type === "calead:chrome";
}
