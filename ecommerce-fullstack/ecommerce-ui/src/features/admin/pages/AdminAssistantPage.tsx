import { ChatMarkdown } from '@/components/chat/ChatMarkdown'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type AppErrorDetails, parseAppError } from '@/lib/api-error'
import { adminService } from '@/services/admin.service'
import { sendAdminChatMessage } from '@/services/ia.service'
import { useAuthStore } from '@/stores/auth.store'
import { useQuery } from '@tanstack/react-query'
import { Bot, Loader2, Send, Sparkles } from 'lucide-react'
import { useState } from 'react'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Resuma o desempenho da loja neste mês',
  'Quais produtos mais vendem e o que isso indica?',
  'Há alertas nos pedidos por status?',
  'Sugira 3 ações para aumentar a receita',
]

export function AdminAssistantPage() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Sou o assistente do painel admin. Posso analisar vendas, usuários e histórico da plataforma com base nos dados atuais.',
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AppErrorDetails | null>(null)

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStats(accessToken ?? ''),
    enabled: Boolean(accessToken),
  })

  async function sendMessage(text: string) {
    if (!text.trim() || !stats || !accessToken) return

    setError(null)
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)

    try {
      const response = await sendAdminChatMessage(
        {
          message: text,
          session_id: sessionId,
          context: stats,
        },
        accessToken,
      )
      setSessionId(response.session_id)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.reply },
      ])
    } catch (err) {
      setError(parseAppError(err, 'ia'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col gap-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Bot className="size-6" />
          Assistente IA
        </h1>
        <p className="text-sm text-muted-foreground">
          Análise inteligente com base nas métricas e histórico da plataforma.
        </p>
      </div>

      {!stats ? (
        <p className="text-sm text-muted-foreground">
          Carregando dados da plataforma...
        </p>
      ) : null}

      {error ? <ErrorAlert error={error} /> : null}

      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={
                message.role === 'user'
                  ? 'ml-auto max-w-[85%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground'
                  : 'max-w-[90%] rounded-2xl bg-muted px-4 py-3 text-sm'
              }
            >
              {message.role === 'assistant' ? (
                <ChatMarkdown content={message.content} />
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
              )}
            </div>
          ))}
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Analisando dados...
            </div>
          ) : null}
        </div>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                disabled={loading || !stats}
                onClick={() => void sendMessage(suggestion)}
              >
                <Sparkles className="size-3.5" />
                {suggestion}
              </Button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              void sendMessage(input)
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre vendas, usuários ou tendências..."
              disabled={loading || !stats}
            />
            <Button type="submit" disabled={loading || !stats || !input.trim()}>
              <Send />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
