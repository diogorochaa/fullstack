import { ChatMarkdown } from '@/components/chat/ChatMarkdown'
import { ProductImage } from '@/components/product/ProductImage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  IMAGE_SEARCH_SUGGESTION,
  buildChatSuggestions,
  useIaStatus,
} from '@/features/assistant/hooks/useIaStatus'
import { chatSendSchema } from '@/features/assistant/schemas/chat.schema'
import {
  type PreparedChatImage,
  readImageFile,
  readImageFromClipboard,
} from '@/features/assistant/utils/image-upload'
import { useAddToCart } from '@/features/cart/hooks/useCart'
import { useCategories } from '@/features/products/hooks/useCategories'
import { useProduct } from '@/features/products/hooks/useProducts'
import { type AppErrorDetails, parseAppError } from '@/lib/api-error'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { sendChatMessage } from '@/services/ia.service'
import type { ChatImagePayload, ChatSource } from '@/types/ia'
import {
  AlertCircle,
  Bot,
  ImagePlus,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  ShoppingBag,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  imagePreview?: string
  sources?: ChatSource[]
}

type PendingSend = {
  text?: string
  image?: ChatImagePayload
  imagePreview?: string
}

type ChatProductPreviewProps = {
  productId: string
}

function ChatProductPreview({ productId }: ChatProductPreviewProps) {
  const { data: product, isLoading } = useProduct(productId)
  const { data: categoriesData } = useCategories()
  const addToCart = useAddToCart()

  const categoryName = categoriesData?.data.find(
    (category) => category.id === product?.categoryId,
  )?.name
  const outOfStock = product?.stock === 0
  const isAdding =
    addToCart.isPending && addToCart.variables?.productId === product?.id

  if (isLoading) {
    return (
      <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-background/80">
        <div className="aspect-16/10 animate-pulse bg-muted" />
        <div className="space-y-3 p-4">
          <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
          <div className="h-5 w-3/4 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-5/6 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-9 w-28 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  function handleAddToCart(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()

    if (outOfStock || isAdding) return

    addToCart.mutate({
      productId: product.id,
      quantity: 1,
      productName: product.name,
    })
  }

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-background transition-transform hover:-translate-y-0.5 hover:border-brand/40">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative">
          <div className="aspect-16/10 overflow-hidden bg-muted">
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              className="size-full"
              fallbackTextClassName="text-4xl font-bold text-brand/20"
            />
          </div>
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <Badge className="bg-brand text-white hover:bg-brand">
              Produto encontrado
            </Badge>
            {categoryName && (
              <Badge variant="secondary" className="bg-background/90">
                {categoryName}
              </Badge>
            )}
          </div>
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold leading-tight text-foreground">
              {product.name}
            </p>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>
          <p className="shrink-0 text-lg font-bold text-brand">
            {formatPrice(product.price)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs">
          {outOfStock ? (
            <Badge variant="destructive">Esgotado</Badge>
          ) : (
            <span className="text-muted-foreground">
              {product.stock} em estoque
            </span>
          )}
          <span className="text-muted-foreground">Toque para ver detalhes</span>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 flex-1 rounded-full"
            onClick={handleAddToCart}
            disabled={outOfStock || isAdding}
          >
            {isAdding ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <ShoppingBag className="mr-2 size-4" />
            )}
            Adicionar
          </Button>
          <Button
            type="button"
            asChild
            className="h-10 flex-1 rounded-full bg-brand text-white hover:bg-brand/90"
          >
            <Link to={`/products/${product.id}`}>Ver produto</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function ChatSourcePreviews({ sources }: { sources: ChatSource[] }) {
  const productSources = sources.filter((source) => source.type === 'product')

  if (productSources.length === 0) return null

  return (
    <div className="mt-2 space-y-2 border-t border-border/40 pt-2">
      {productSources.map((source) => (
        <ChatProductPreview key={source.id} productId={source.id} />
      ))}
    </div>
  )
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const { data: iaStatus } = useIaStatus(open)
  const suggestions = buildChatSuggestions(iaStatus?.capabilities)
  const [input, setInput] = useState('')
  const [selectedImage, setSelectedImage] = useState<PreparedChatImage | null>(
    null,
  )
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Olá! Sou o assistente shopmax. Posso ajudar a encontrar produtos ou tirar dúvidas sobre frete e trocas.',
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AppErrorDetails | null>(null)
  const [inputError, setInputError] = useState<string | null>(null)
  const lastSendRef = useRef<PendingSend | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollKey = `${messages.length}-${loading ? '1' : '0'}`

  useEffect(() => {
    if (!open) return

    void scrollKey
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [open, scrollKey])

  async function sendMessage(
    payload: PendingSend,
    options?: { appendUser?: boolean },
  ) {
    const appendUser = options?.appendUser ?? true
    const text = payload.text?.trim()
    const image = payload.image

    setInputError(null)
    setError(null)
    lastSendRef.current = payload

    if (appendUser) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: text || (image ? 'Foto enviada' : ''),
          imagePreview: payload.imagePreview,
        },
      ])
    }

    setLoading(true)

    try {
      const response = await sendChatMessage({
        message: text || undefined,
        session_id: sessionId,
        image,
      })
      setSessionId(response.session_id)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.reply,
          sources: response.sources,
        },
      ])
    } catch (err) {
      setError(parseAppError(err, 'ia'))
    } finally {
      setLoading(false)
    }
  }

  async function handleSend(event: React.FormEvent) {
    event.preventDefault()
    if (loading) return

    const parsed = chatSendSchema.safeParse({
      message: input,
      image: selectedImage ?? undefined,
    })
    if (!parsed.success) {
      setInputError(parsed.error.issues[0]?.message ?? 'Mensagem inválida')
      return
    }

    const text = parsed.data.message
    const imagePayload = parsed.data.image
      ? {
          data: parsed.data.image.data,
          mime_type: parsed.data.image.mime_type,
        }
      : undefined

    setInput('')
    setSelectedImage(null)

    await sendMessage({
      text,
      image: imagePayload,
      imagePreview: parsed.data.image?.previewUrl,
    })
  }

  function handleSuggestion(text: string) {
    if (loading) return

    if (text === IMAGE_SEARCH_SUGGESTION) {
      fileInputRef.current?.click()
      return
    }

    setInput('')
    void sendMessage({ text })
  }

  function handleRetry() {
    if (!lastSendRef.current || loading) return
    void sendMessage(lastSendRef.current, { appendUser: false })
  }

  async function attachImage(file: File) {
    setInputError(null)
    setError(null)

    try {
      const prepared = await readImageFile(file)
      setSelectedImage(prepared)
    } catch (err) {
      setInputError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar a imagem.',
      )
    }
  }

  async function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return
    await attachImage(file)
  }

  async function handlePaste(event: React.ClipboardEvent) {
    if (loading) return

    try {
      const prepared = await readImageFromClipboard(event)
      if (!prepared) return

      event.preventDefault()
      setSelectedImage(prepared)
      setInputError(null)
      setError(null)
    } catch (err) {
      event.preventDefault()
      setInputError(
        err instanceof Error ? err.message : 'Não foi possível colar a imagem.',
      )
    }
  }

  const canSend = Boolean(input.trim() || selectedImage)
  const showSuggestions = messages.length === 1 && !loading && !error

  return (
    <>
      <Button
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'fixed right-6 bottom-6 z-50 size-14 rounded-full bg-brand text-white shadow-lg hover:bg-brand/90',
          open && 'hidden',
        )}
        size="icon-lg"
        aria-label="Abrir assistente virtual"
      >
        <MessageCircle className="size-6" />
      </Button>

      {open && (
        <div
          className="fixed right-4 bottom-4 z-50 flex h-[min(520px,80vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          onPaste={handlePaste}
        >
          <div className="flex items-center justify-between bg-foreground px-4 py-3 text-primary-foreground">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Bot className="size-5" />
                <span className="font-semibold">Assistente shopmax</span>
              </div>
              {iaStatus && (
                <span className="text-xs text-primary-foreground/70">
                  {iaStatus.capabilities.product_search
                    ? iaStatus.capabilities.live_catalog
                      ? 'Catálogo ao vivo conectado'
                      : `Catálogo indexado (${iaStatus.catalog_indexed} produtos)`
                    : 'Modo FAQ — catálogo indisponível'}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-primary-foreground hover:bg-white/10"
              onClick={() => setOpen(false)}
              aria-label="Fechar assistente"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div
            className="flex-1 space-y-3 overflow-y-auto p-4"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  'max-w-[90%] rounded-2xl px-3 py-2 text-sm',
                  message.role === 'user'
                    ? 'ml-auto bg-brand text-white'
                    : 'bg-muted text-foreground',
                )}
              >
                {message.imagePreview && (
                  <img
                    src={message.imagePreview}
                    alt="Imagem enviada pelo cliente"
                    className="mb-2 max-h-40 w-full rounded-lg object-cover"
                  />
                )}
                {message.role === 'assistant' ? (
                  <ChatMarkdown content={message.content} />
                ) : (
                  message.content && (
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  )
                )}
                {message.sources && message.sources.length > 0 && (
                  <>
                    <ChatSourcePreviews sources={message.sources} />
                    <div className="mt-2">
                      {message.sources.map((source) => (
                        <Link
                          key={source.id}
                          to={`/products/${source.id}`}
                          className="block text-xs underline opacity-90"
                          onClick={() => setOpen(false)}
                        >
                          Ver produto
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}

            {showSuggestions && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestion(suggestion)}
                    className="rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand/90"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Pensando...
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="max-w-[95%] rounded-2xl border border-destructive/25 bg-destructive/5 px-3 py-3 text-sm"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="font-medium text-destructive">
                        {error.title}
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        {error.message}
                      </p>
                    </div>
                    {error.retryable && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full"
                        onClick={handleRetry}
                        disabled={loading}
                      >
                        <RefreshCw className="mr-1.5 size-3.5" />
                        Tentar novamente
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {inputError && (
              <p className="text-sm text-destructive" role="alert">
                {inputError}
              </p>
            )}

            <div ref={messagesEndRef} />
          </div>

          {selectedImage && (
            <div className="flex items-center gap-2 border-t border-border px-3 py-2">
              <img
                src={selectedImage.previewUrl}
                alt="Pré-visualização da imagem selecionada"
                className="size-12 rounded-lg object-cover"
              />
              <span className="flex-1 truncate text-xs text-muted-foreground">
                Imagem pronta — envie ou cole outra
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setSelectedImage(null)}
                aria-label="Remover imagem"
              >
                <X className="size-4" />
              </Button>
            </div>
          )}

          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageSelect}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-full"
              disabled={loading}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Anexar imagem"
            >
              <ImagePlus className="size-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                if (inputError) setInputError(null)
              }}
              placeholder="Pergunte ou cole um print (Ctrl+V)..."
              className="rounded-full"
              disabled={loading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !canSend}
              className="rounded-full bg-brand text-white hover:bg-brand/90"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  )
}
