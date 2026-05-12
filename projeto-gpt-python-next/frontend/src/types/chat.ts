export type MessageRole = "user" | "assistant";

export type ChatMessage = {
  conversationId?: string;
  createdAt?: string;
  role: MessageRole;
  content: string;
  attachment?: {
    name: string;
    mimeType: string;
    kind: "pdf" | "image" | "file";
  };
};

export type ChatConversation = {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
};
