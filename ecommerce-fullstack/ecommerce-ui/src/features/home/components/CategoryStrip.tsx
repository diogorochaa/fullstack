import { useCategories } from '@/features/products/hooks/useCategories'
import { getCategoryVisual } from '@/lib/category-icons'
import { cn } from '@/lib/utils'
import { LayoutGrid } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function CategoryStrip() {
  const navigate = useNavigate()
  const { data } = useCategories()
  const categories = data?.data ?? []

  function selectCategory(categoryId?: string) {
    const params = new URLSearchParams()
    if (categoryId) {
      params.set('categoryId', categoryId)
    }
    navigate(`/produtos?${params.toString()}`)
  }

  return (
    <section
      id="categorias"
      aria-label="Categorias de produtos"
      className="mx-auto max-w-7xl px-4 py-6"
    >
      <div className="flex gap-4 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => selectCategory()}
          aria-label="Ver todas as categorias"
          className="flex min-w-[88px] flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-muted"
        >
          <div className="flex size-14 items-center justify-center rounded-xl bg-muted">
            <LayoutGrid className="size-6 text-brand" />
          </div>
          <span className="text-xs font-medium">Ver todas</span>
        </button>

        {categories.map((category) => {
          const visual = getCategoryVisual(category.slug)
          const Icon = visual.icon
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => selectCategory(category.id)}
              aria-label={`Categoria ${category.name}`}
              className="flex min-w-[88px] flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-muted"
            >
              <div
                className={cn(
                  'flex size-14 items-center justify-center rounded-xl transition-colors',
                  visual.tileClassName,
                )}
              >
                <Icon className={cn('size-6', visual.iconClassName)} />
              </div>
              <span className="text-xs font-medium">{category.name}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
