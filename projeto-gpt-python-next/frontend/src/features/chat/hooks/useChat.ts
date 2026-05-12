"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/context";
import {
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

function createConversation(
  messages: ChatMessage[] = [],
  id = crypto.randomUUID(),
  updatedAt = new Date().toISOString(),
): ChatConversation {
  return {
    id,
    title: getConversationTitle(messages),
    updatedAt,
    messages,
  };
}

function mapHistoryMessage(
  conversationId: string,
  createdAt: string,
  role: string,
  content: string,
): ChatMessage {
  return {
    conversationId,
    createdAt,
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
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  function upsertConversation(conversationId: string, messages: ChatMessage[]) {
    setConversations((previous) =>
      sortByNewest(
        previous.map((conversation) => {
          if (conversation.id !== conversationId) return conversation;

          return {
            ...conversation,
            title: getConversationTitle(messages),
            updatedAt: new Date().toISOString(),
            messages,
          };
        }),
      ),
    );
  }

  useEffect(() => {
    if (!ready) return;

    if (!session?.accessToken) {
      setConversations([]);
      setActiveConversationId(null);
      setInput("");
      setSelectedFile(null);
      setFeedbackMessage(null);
      return;
    }

    let cancelled = false;

    async function loadHistory() {
      try {
        const history = await requestMessages(session.accessToken);
        if (cancelled) return;

        const grouped = history.reduce<Record<string, ChatMessage[]>>(
          (accumulator, message) => {
            const conversationId = message.conversation_id;
            if (!accumulator[conversationId]) {
              accumulator[conversationId] = [];
            }

            accumulator[conversationId].push(
              mapHistoryMessage(
                conversationId,
                message.created_at,
                message.role,
                message.content,
              ),
            );
            return accumulator;
          },
          {},
        );

        const loadedConversations = Object.entries(grouped).map(
          ([conversationId, messages]) => ({
            id: conversationId,
            title: getConversationTitle(messages),
            updatedAt: messages.at(-1)?.createdAt ?? new Date().toISOString(),
            messages,
          }),
        );

        const conversationsToSet =
          loadedConversations.length > 0
            ? sortByNewest(loadedConversations)
            : [createConversation()];

        setConversations(conversationsToSet);
        setActiveConversationId(conversationsToSet[0]?.id ?? null);
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
    const conversation = createConversation();
    setConversations((previous) => sortByNewest([conversation, ...previous]));
    setActiveConversationId(conversation.id);
    setInput("");
    setSelectedFile(null);
    setFeedbackMessage(null);
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
        const fallbackConversation = next[0] ?? createConversation();
        setActiveConversationId(fallbackConversation.id);

        if (next.length === 0) {
          return [fallbackConversation];
        }
      }

      return next;
    });
  }

  async function sendMessage() {
    const question = input.trim();
    if (!question && !selectedFile) return;
    if (!session?.accessToken) return;

    setFeedbackMessage(null);

    const conversationId = activeConversationId ?? createConversation().id;

    const userMessage: ChatMessage = {
      conversationId,
      createdAt: new Date().toISOString(),
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
    if (!activeConversationId) {
      setConversations((previous) =>
        sortByNewest([
          {
            id: conversationId,
            title: getConversationTitle(nextMessages),
            updatedAt: new Date().toISOString(),
            messages: nextMessages,
          },
          ...previous,
        ]),
      );
      setActiveConversationId(conversationId);
    } else {
      upsertConversation(conversationId, nextMessages);
    }

    setInput("");
    setLoading(true);

    try {
      if (selectedFile) {
        await requestDocumentUpload(selectedFile, session.accessToken);
      }

      await postMessage(
        session.accessToken,
        conversationId,
        userMessage.role,
        userMessage.content,
      );

      if (question) {
        const answer = await requestAiAnswer(question, session.accessToken);
        const assistantMessage: ChatMessage = {
          conversationId,
          createdAt: new Date().toISOString(),
          role: "assistant",
          content: answer,
        };

        upsertConversation(conversationId, [...nextMessages, assistantMessage]);
        await postMessage(
          session.accessToken,
          conversationId,
          assistantMessage.role,
          answer,
        );
      }
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error
          ? error.message
          : "Falha ao enviar arquivo para a API.";
      setFeedbackMessage(message);
      upsertConversation(conversationId, [
        ...nextMessages,
        {
          conversationId,
          createdAt: new Date().toISOString(),
          role: "assistant",
          content: message,
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
    feedbackMessage,
    setInput,
    setSelectedFile,
    createConversation: createNewConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
  };
}
