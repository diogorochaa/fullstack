"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/context";
import {
  clearMessageHistory,
  postMessage,
  requestAiAnswer,
  requestDocumentUpload,
  requestMessages,
} from "@/server/chat-api";
import type { ChatConversation, ChatMessage } from "@/types/chat";

function sortByNewest(conversations: ChatConversation[]) {
  return [...conversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function getFileKind(file: File): "pdf" | "image" | "file" {
  if (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  ) {
    return "pdf";
  }

  if (file.type.startsWith("image/")) {
    return "image";
  }

  return "file";
}

function getConversationTitle(messages: ChatMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === "user");
  const attachmentTitle = firstUserMessage?.attachment?.name
    ?.replace(/\.[^/.]+$/, "")
    .slice(0, 40);

  return (
    firstUserMessage?.content.slice(0, 40) || attachmentTitle || "Nova conversa"
  );
}

function createConversation(messages: ChatMessage[] = []): ChatConversation {
  return {
    id: crypto.randomUUID(),
    title: getConversationTitle(messages),
    updatedAt: new Date().toISOString(),
    messages,
  };
}

function mapHistoryMessage(role: string, content: string): ChatMessage {
  return {
    role: role === "assistant" ? "assistant" : "user",
    content,
  };
}

function getUserMessageContent(question: string, selectedFile: File | null) {
  if (question) {
    return question;
  }

  return selectedFile?.name ?? "";
}

export function useChat() {
  const { session, ready } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  function updateConversation(messages: ChatMessage[]) {
    const conversation = createConversation(messages);
    setConversations([conversation]);
    setActiveConversationId(conversation.id);
  }

  useEffect(() => {
    if (!ready) return;

    if (!session?.accessToken) {
      setConversations([]);
      setActiveConversationId(null);
      setInput("");
      setSelectedFile(null);
      return;
    }

    let cancelled = false;

    async function loadHistory() {
      try {
        const history = await requestMessages(session.accessToken);
        if (cancelled) return;

        const messages = history.map((message) =>
          mapHistoryMessage(message.role, message.content),
        );
        const conversation = createConversation(messages);

        setConversations([conversation]);
        setActiveConversationId(conversation.id);
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          const conversation = createConversation();
          setConversations([conversation]);
          setActiveConversationId(conversation.id);
        }
      }
    }

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [ready, session?.accessToken]);

  const activeConversation =
    conversations.find((item) => item.id === activeConversationId) ?? null;

  const messages = activeConversation?.messages ?? [];

  async function createNewConversation() {
    if (session?.accessToken) {
      try {
        await clearMessageHistory(session.accessToken);
      } catch (error) {
        console.error(error);
      }
    }

    const conversation = createConversation();
    setConversations([conversation]);
    setActiveConversationId(conversation.id);
    setInput("");
    setSelectedFile(null);
  }

  function selectConversation(conversationId: string) {
    setActiveConversationId(conversationId);
  }

  async function deleteConversation(conversationId: string) {
    if (conversationId !== activeConversationId) return;
    await createNewConversation();
  }

  async function sendMessage() {
    const question = input.trim();
    if (!question && !selectedFile) return;
    if (!session?.accessToken) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: getUserMessageContent(question, selectedFile),
      attachment: selectedFile
        ? {
            name: selectedFile.name,
            mimeType: selectedFile.type || "application/octet-stream",
            kind: getFileKind(selectedFile),
          }
        : undefined,
    };

    const nextMessages = [...messages, userMessage];
    updateConversation(nextMessages);
    setInput("");
    setLoading(true);

    try {
      if (selectedFile) {
        await requestDocumentUpload(selectedFile, session.accessToken);
      }

      await postMessage(
        session.accessToken,
        userMessage.role,
        userMessage.content,
      );

      if (question) {
        const answer = await requestAiAnswer(question, session.accessToken);
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: answer,
        };

        updateConversation([...nextMessages, assistantMessage]);
        await postMessage(session.accessToken, assistantMessage.role, answer);
      }
    } catch (error) {
      console.error(error);
      updateConversation([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "Nao consegui conectar com a API local. Verifique se ela esta rodando em http://localhost:8001 ou defina NEXT_PUBLIC_API_URL.",
        },
      ]);
    } finally {
      setLoading(false);
      setSelectedFile(null);
    }
  }

  return {
    conversations,
    activeConversationId,
    messages,
    input,
    selectedFile,
    loading,
    setInput,
    setSelectedFile,
    createConversation: createNewConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
  };
}
