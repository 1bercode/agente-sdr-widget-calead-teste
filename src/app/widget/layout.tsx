import WidgetFrame from "@/components/WidgetFrame";

/**
 * Layout mínimo do iframe do widget.
 * Host (embed.js) controla geometria; aqui só transparência + conteúdo.
 */
export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return <WidgetFrame>{children}</WidgetFrame>;
}
