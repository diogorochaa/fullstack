import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HeroSection() {
  const featuredProductImage =
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200'

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-6">
          <p className="text-sm font-semibold tracking-widest text-brand uppercase">
            Nova coleção
          </p>
          <h1 className="text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Estilo que te <span className="text-brand">acompanha</span>
          </h1>
          <p className="max-w-md text-muted-foreground">
            Descubra as últimas tendências em moda, eletrônicos e casa com
            qualidade e preços que cabem no seu bolso.
          </p>
          <Link
            to="/?page=1"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Comprar agora
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-3xl bg-muted">
            <img
              src={featuredProductImage}
              alt="Jaqueta Corta-Vento em destaque"
              className="h-[320px] w-full object-cover sm:h-[420px]"
            />
          </div>
          <div className="absolute right-4 bottom-4 hidden rounded-2xl border border-border bg-background p-4 shadow-lg sm:block">
            <p className="text-xs text-muted-foreground">Destaque</p>
            <p className="font-semibold">Jaqueta Corta-Vento</p>
            <p className="text-sm font-bold text-brand">R$ 199,90</p>
          </div>
        </div>
      </div>
    </section>
  )
}
