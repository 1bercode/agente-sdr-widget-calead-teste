export type ChatRole = "assistant" | "user" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}

// Config que o snippet de embed injeta no widget via querystring/postMessage.
export interface WidgetConfig {
  agentId: string;
  companyName: string;
  primaryColor?: string;
}
