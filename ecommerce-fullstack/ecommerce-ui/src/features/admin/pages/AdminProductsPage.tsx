import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { ErrorState } from '@/components/feedback/ErrorState'
import { ProductImage } from '@/components/product/ProductImage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProductFormDialog } from '@/features/admin/components/ProductFormDialog'
import { parseAppError } from '@/lib/api-error'
import { formatPrice } from '@/lib/format'
import { adminService } from '@/services/admin.service'
import { categoriesService } from '@/services/categories.service'
import { productsService } from '@/services/products.service'
import { useAuthStore } from '@/stores/auth.store'
import type { CreateProductPayload } from '@/types/admin'
import type { Product } from '@/types/product'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'

export function AdminProductsPage() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.list(),
  })

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-products', search],
    queryFn: () =>
      productsService.list({ search: search || undefined, limit: 50 }),
  })

  const saveMutation = useMutation({
    mutationFn: async (
      payload: CreateProductPayload & { active?: boolean },
    ) => {
      if (editingProduct) {
        const { active, ...rest } = payload
        return adminService.updateProduct(
          accessToken ?? '',
          editingProduct.id,
          { ...rest, active },
        )
      }
      return adminService.createProduct(accessToken ?? '', payload)
    },
    onSuccess: () => {
      setActionError(null)
      setDialogOpen(false)
      setEditingProduct(null)
      void queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (err) => {
      setActionError(parseAppError(err, 'api').message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (productId: string) =>
      adminService.deleteProduct(accessToken ?? '', productId),
    onSuccess: () => {
      setActionError(null)
      void queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
    onError: (err) => {
      setActionError(parseAppError(err, 'api').message)
    },
  })

  const categories = categoriesData?.data ?? []
  const products = data?.data ?? []

  if (isError) {
    return (
      <ErrorState
        error={parseAppError(error, 'api')}
        onRetry={() => void refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre, edite e remova itens do catálogo.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null)
            setDialogOpen(true)
          }}
        >
          <Plus />
          Novo produto
        </Button>
      </div>

      {actionError ? <ErrorAlert error={actionError} /> : null}

      <div className="relative max-w-md">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto..."
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando produtos...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Preço</th>
                <th className="px-4 py-3 font-medium">Estoque</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProductImage
                        src={product.imageUrl}
                        alt={product.name}
                        className="size-10 rounded-md object-cover"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3">
                    <Badge variant={product.active ? 'default' : 'outline'}>
                      {product.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => {
                          setEditingProduct(product)
                          setDialogOpen(true)
                        }}
                        aria-label={`Editar ${product.name}`}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Excluir "${product.name}"? Esta ação não pode ser desfeita.`,
                            )
                          ) {
                            deleteMutation.mutate(product.id)
                          }
                        }}
                        aria-label={`Excluir ${product.name}`}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        product={editingProduct}
        loading={saveMutation.isPending}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />
    </div>
  )
}
