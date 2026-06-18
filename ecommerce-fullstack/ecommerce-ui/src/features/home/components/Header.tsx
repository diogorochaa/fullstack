import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { UserMenu } from '@/features/account/components/UserMenu'
import { useCartSummary } from '@/features/cart/hooks/useCart'
import { useFavoritesCount } from '@/features/favorites/hooks/useFavorites'
import { useCategories } from '@/features/products/hooks/useCategories'
import { getCategoryVisual } from '@/lib/category-icons'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { useCartUiStore } from '@/stores/cart-ui.store'
import { Heart, Menu, Search, ShoppingBag, Tag, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const { data: categoriesData } = useCategories()

  useEffect(() => {
    setSearch(searchParams.get('search') ?? '')
  }, [searchParams])
  const { isAuthenticated } = useAuthStore()
  const { itemCount, subtotal } = useCartSummary()
  const favoritesCount = useFavoritesCount()
  const openCart = useCartUiStore((s) => s.open)

  const categories = categoriesData?.data ?? []

  const isPromoActive =
    location.pathname === '/produtos' &&
    searchParams.get('search')?.toLowerCase() === 'promo'
  const isCategoriesActive =
    !isPromoActive &&
    (location.pathname === '/' || location.pathname === '/produtos')

  function navItemClass(active: boolean) {
    return cn(
      'font-medium transition-colors hover:text-brand',
      active ? 'text-brand' : 'text-foreground',
    )
  }

  function scrollToCategories() {
    document
      .getElementById('categorias')
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  function handleCategoriesNav() {
    if (location.pathname === '/') {
      scrollToCategories()
      return
    }

    navigate('/')
    window.setTimeout(scrollToCategories, 100)
  }

  function handlePromoNav() {
    navigate('/produtos?search=promo')
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }
    params.delete('page')
    navigate(`/produtos?${params.toString()}`)
  }

  function handleCategoryClick(categoryId?: string) {
    const params = new URLSearchParams()
    if (categoryId) {
      params.set('categoryId', categoryId)
    }
    navigate(`/produtos?${params.toString()}`)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="size-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="text-left text-xl font-bold">
                shopmax
              </SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSearch} className="mt-4 px-1">
              <div className="relative">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="h-11 rounded-full pr-12"
                  aria-label="Buscar produtos"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute top-1/2 right-1 size-9 -translate-y-1/2 rounded-full bg-foreground text-background hover:bg-foreground/90"
                  aria-label="Buscar"
                >
                  <Search className="size-4" />
                </Button>
              </div>
            </form>
            <nav className="mt-6 flex flex-col gap-1">
              <button
                type="button"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-muted"
                onClick={() => handleCategoryClick()}
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-brand/10">
                  <Tag className="size-4 text-brand" />
                </span>
                Todas as categorias
              </button>
              {categories.map((category) => {
                const visual = getCategoryVisual(category.slug)
                const Icon = visual.icon

                return (
                  <button
                    key={category.id}
                    type="button"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-muted"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <span
                      className={cn(
                        'flex size-8 items-center justify-center rounded-lg',
                        visual.tileClassName,
                      )}
                    >
                      <Icon className={cn('size-4', visual.iconClassName)} />
                    </span>
                    {category.name}
                  </button>
                )
              })}
              <Link
                to="/produtos?search=promo"
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent',
                  isPromoActive ? 'text-brand' : 'text-foreground',
                )}
              >
                Promoções
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="shrink-0 text-2xl font-bold tracking-tight">
          shopmax
        </Link>

        <form
          onSubmit={handleSearch}
          className="mx-auto hidden max-w-xl flex-1 items-center md:flex"
        >
          <div className="relative w-full">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produtos..."
              className="h-11 rounded-full pr-12"
              aria-label="Buscar produtos"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute top-1/2 right-1 size-9 -translate-y-1/2 rounded-full bg-foreground text-background hover:bg-foreground/90"
              aria-label="Buscar"
            >
              <Search className="size-4" />
            </Button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Link
              to="/login"
              className="hidden items-center gap-1.5 text-sm font-medium hover:text-brand sm:flex"
            >
              <User className="size-4" />
              Entrar
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Favoritos"
            render={<Link to="/favoritos" />}
          >
            <Heart
              className={cn(
                'size-5',
                favoritesCount > 0 && 'fill-rose-500 text-rose-500',
              )}
            />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {favoritesCount > 9 ? '9+' : favoritesCount}
              </span>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="relative gap-2 px-2"
            aria-label="Carrinho"
            onClick={openCart}
          >
            <ShoppingBag className="size-5" />
            <span className="hidden text-sm font-medium sm:inline">
              {formatPrice(subtotal)}
            </span>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      <nav className="hidden border-t border-border lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 text-sm">
          <button
            type="button"
            className={navItemClass(isCategoriesActive)}
            onClick={handleCategoriesNav}
          >
            Categorias
          </button>
          <button
            type="button"
            className={navItemClass(isPromoActive)}
            onClick={handlePromoNav}
          >
            Promoções
          </button>
        </div>
      </nav>
    </header>
  )
}
