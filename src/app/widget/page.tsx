import ChatWidget from "@/components/ChatWidget";

export default function WidgetPage({
  searchParams,
}: {
  searchParams: { agentId?: string; companyName?: string; primaryColor?: string };
}) {
  const config = {
    agentId: searchParams.agentId ?? "demo",
    companyName: searchParams.companyName ?? "Calead",
    primaryColor: searchParams.primaryColor,
  };

  return <ChatWidget config={config} />;
}
