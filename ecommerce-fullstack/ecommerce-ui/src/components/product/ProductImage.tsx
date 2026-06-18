import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useState } from 'react'

type ProductImageProps = {
  src: string | null | undefined
  alt: string
  className?: string
  fallbackClassName?: string
  fallbackTextClassName?: string
}

export function ProductImage({
  src,
  alt,
  className,
  fallbackClassName,
  fallbackTextClassName = 'text-4xl font-bold text-brand/30',
}: ProductImageProps) {
  const [loading, setLoading] = useState(Boolean(src))
  const [hasError, setHasError] = useState(false)

  const showFallback = !src || hasError
  const initial = alt.charAt(0).toUpperCase()

  return (
    <div className={cn('relative size-full', className)}>
      {loading && !showFallback && (
        <Skeleton className="absolute inset-0 size-full" />
      )}
      {showFallback ? (
        <div
          className={cn(
            'flex size-full items-center justify-center bg-gradient-to-br from-muted to-accent',
            fallbackClassName,
          )}
          aria-hidden={!alt}
        >
          <span className={fallbackTextClassName}>{initial}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={cn(
            'size-full object-cover transition-opacity duration-300',
            loading ? 'opacity-0' : 'opacity-100',
          )}
          onLoad={() => setLoading(false)}
          onError={() => {
            setHasError(true)
            setLoading(false)
          }}
        />
      )}
    </div>
  )
}
