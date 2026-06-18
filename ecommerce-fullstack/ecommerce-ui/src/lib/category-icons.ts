import type { LucideIcon } from 'lucide-react'
import {
  Baby,
  Footprints,
  Gem,
  Home,
  Shirt,
  Smartphone,
  Sparkles,
  Tag,
  Watch,
} from 'lucide-react'

type CategoryVisual = {
  icon: LucideIcon
  iconClassName: string
  tileClassName: string
}

const categoryVisuals: Record<string, CategoryVisual> = {
  tenis: {
    icon: Footprints,
    iconClassName: 'text-orange-600',
    tileClassName: 'bg-orange-50 dark:bg-orange-950/40',
  },
  roupas: {
    icon: Shirt,
    iconClassName: 'text-sky-600',
    tileClassName: 'bg-sky-50 dark:bg-sky-950/40',
  },
  acessorios: {
    icon: Watch,
    iconClassName: 'text-violet-600',
    tileClassName: 'bg-violet-50 dark:bg-violet-950/40',
  },
  eletronicos: {
    icon: Smartphone,
    iconClassName: 'text-slate-700 dark:text-slate-300',
    tileClassName: 'bg-slate-100 dark:bg-slate-800/60',
  },
  masculino: {
    icon: Shirt,
    iconClassName: 'text-sky-700',
    tileClassName: 'bg-sky-50 dark:bg-sky-950/40',
  },
  feminino: {
    icon: Sparkles,
    iconClassName: 'text-pink-600',
    tileClassName: 'bg-pink-50 dark:bg-pink-950/40',
  },
  infantil: {
    icon: Baby,
    iconClassName: 'text-amber-600',
    tileClassName: 'bg-amber-50 dark:bg-amber-950/40',
  },
  casa: {
    icon: Home,
    iconClassName: 'text-emerald-600',
    tileClassName: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  beleza: {
    icon: Gem,
    iconClassName: 'text-rose-600',
    tileClassName: 'bg-rose-50 dark:bg-rose-950/40',
  },
}

const fallbackVisual: CategoryVisual = {
  icon: Tag,
  iconClassName: 'text-muted-foreground',
  tileClassName: 'bg-muted',
}

export function getCategoryVisual(slug: string): CategoryVisual {
  return categoryVisuals[slug] ?? fallbackVisual
}
