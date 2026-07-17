export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-calead-widget className="h-screen overflow-hidden bg-transparent">
      {children}
    </div>
  );
}
