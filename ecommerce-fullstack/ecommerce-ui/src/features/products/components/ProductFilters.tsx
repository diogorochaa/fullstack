import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getCategoryVisual } from '@/lib/category-icons'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/category'
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

type ProductFiltersProps = {
  categories: Category[]
  totalPages: number
  currentPage: number
  total?: number
}

export function ProductFilters({
  categories,
  totalPages,
  currentPage,
  total,
}: ProductFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryId = searchParams.get('categoryId') ?? ''
  const selectedCategoryName = categories.find((c) => c.id === categoryId)?.name

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== 'page') params.delete('page')
    setSearchParams(params)
  }

  function changePage(page: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    setSearchParams(params)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Select
          value={categoryId || 'all'}
          onValueChange={(value) =>
            updateParam('categoryId', value === 'all' ? '' : value)
          }
        >
          <SelectTrigger className="w-56">
            <SelectValue>
              <span className="flex items-center gap-2">
                {categoryId ? (
                  (() => {
                    const category = categories.find((c) => c.id === categoryId)
                    const visual = category
                      ? getCategoryVisual(category.slug)
                      : null
                    const Icon = visual?.icon
                    return (
                      <>
                        {Icon && (
                          <Icon
                            className={cn('size-4', visual?.iconClassName)}
                          />
                        )}
                        {selectedCategoryName ?? 'Categoria'}
                      </>
                    )
                  })()
                ) : (
                  <>
                    <LayoutGrid className="size-4 text-brand" />
                    Todas as categorias
                  </>
                )}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <LayoutGrid className="size-4 text-brand" />
                Todas as categorias
              </span>
            </SelectItem>
            {categories.map((category) => {
              const visual = getCategoryVisual(category.slug)
              const Icon = visual.icon

              return (
                <SelectItem key={category.id} value={category.id}>
                  <span className="flex items-center gap-2">
                    <Icon className={cn('size-4', visual.iconClassName)} />
                    {category.name}
                  </span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage <= 1}
            onClick={() => changePage(currentPage - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
            {total !== undefined ? ` · ${total} itens` : ''}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage >= totalPages}
            onClick={() => changePage(currentPage + 1)}
            aria-label="Próxima página"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
