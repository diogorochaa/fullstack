"use client";

import { useEffect, useState } from "react";

import { askAiAction, uploadDocumentAction } from "@/features/chat/actions";
import type { ChatConversation, ChatMessage } from "@/types/chat";

const STORAGE_KEY = "docmind:conversations";

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

function createConversation(): ChatConversation {
  return {
    id: crypto.randomUUID(),
    title: "Nova conversa",
    updatedAt: new Date().toISOString(),
    messages: [],
  };
}

export function useChat() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        setHasHydrated(true);
        return;
      }

      try {
        const parsed = sortByNewest(JSON.parse(raw) as ChatConversation[]);
        setConversations(parsed);
        setActiveConversationId(parsed[0]?.id ?? null);
      } catch {
        setConversations([]);
        setActiveConversationId(null);
      } finally {
        setHasHydrated(true);
      }
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations, hasHydrated]);

  const activeConversation =
    conversations.find((item) => item.id === activeConversationId) ?? null;

  const messages = activeConversation?.messages ?? [];

  function applyConversationUpdate(
    conversationId: string,
    update: (messages: ChatMessage[]) => ChatMessage[],
  ) {
    setConversations((previous) =>
      sortByNewest(
        previous.map((conversation) => {
          if (conversation.id !== conversationId) return conversation;

          const nextMessages = update(conversation.messages);
          const firstUserMessage = nextMessages.find(
            (msg) => msg.role === "user",
          );
          const fallbackTitleFromAttachment = firstUserMessage?.attachment?.name
            ?.replace(/\.[^/.]+$/, "")
            .slice(0, 40);

          return {
            ...conversation,
            title:
              firstUserMessage?.content.slice(0, 40) ||
              fallbackTitleFromAttachment ||
              "Nova conversa",
            updatedAt: new Date().toISOString(),
            messages: nextMessages,
          };
        }),
      ),
    );
  }

  function ensureActiveConversationId(): string {
    if (activeConversationId) return activeConversationId;

    const newConversation = createConversation();
    setConversations((previous) =>
      sortByNewest([newConversation, ...previous]),
    );
    setActiveConversationId(newConversation.id);
    return newConversation.id;
  }

  async function createNewConversation() {
    const newConversation = createConversation();
    setConversations((previous) =>
      sortByNewest([newConversation, ...previous]),
    );
    setActiveConversationId(newConversation.id);
    setInput("");
    setSelectedFile(null);
  }

  function selectConversation(conversationId: string) {
    setActiveConversationId(conversationId);
  }

  async function deleteConversation(conversationId: string) {
    setConversations((previous) => {
      const next = previous.filter(
        (conversation) => conversation.id !== conversationId,
      );

      if (activeConversationId === conversationId) {
        setActiveConversationId(next[0]?.id ?? null);
      }

      return next;
    });
  }

  async function sendMessage() {
    const question = input.trim();
    if (!question && !selectedFile) return;

    const conversationId = ensureActiveConversationId();

    const userMessage: ChatMessage = {
      role: "user",
      content: question,
      attachment: selectedFile
        ? {
            name: selectedFile.name,
            mimeType: selectedFile.type || "application/octet-stream",
            kind: getFileKind(selectedFile),
          }
        : undefined,
    };
    applyConversationUpdate(conversationId, (previous) => [
      ...previous,
      userMessage,
    ]);
    setInput("");
    setLoading(true);

    try {
      if (selectedFile) {
        await uploadDocumentAction(selectedFile);
      }

      if (question) {
        const answer = await askAiAction(question);
        applyConversationUpdate(conversationId, (previous) => [
          ...previous,
          { role: "assistant", content: answer },
        ]);
      }
    } catch (error) {
      console.error(error);
      applyConversationUpdate(conversationId, (previous) => [
        ...previous,
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
