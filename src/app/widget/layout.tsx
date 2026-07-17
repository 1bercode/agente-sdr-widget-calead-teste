import WidgetFrame from "@/components/WidgetFrame";

export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return <WidgetFrame>{children}</WidgetFrame>;
}
