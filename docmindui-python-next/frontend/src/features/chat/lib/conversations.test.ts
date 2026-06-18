import { describe, expect, it } from "vitest"

import { filterConversationsByQuery, getConversationTitle } from "@/features/chat/lib/conversations"
import type { ChatConversation } from "@/features/chat/types"

describe("conversations", () => {
  it("filtra conversas pelo título", () => {
    const list: ChatConversation[] = [
      {
        id: "1",
        title: "Ideias para projeto",
        updatedAt: new Date().toISOString(),
        messages: [],
      },
      {
        id: "2",
        title: "Plano de estudos",
        updatedAt: new Date().toISOString(),
        messages: [],
      },
    ]

    expect(filterConversationsByQuery(list, "ideias")).toHaveLength(1)
    expect(filterConversationsByQuery(list, "")).toHaveLength(2)
  })

  it("gera título a partir da primeira mensagem do usuário", () => {
    const title = getConversationTitle([
      {
        conversationId: "x",
        role: "user",
        content: "Como indexar PDF?",
        createdAt: new Date().toISOString(),
      },
    ])
    expect(title).toBe("Como indexar PDF?")
  })
})
