import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { CreateProductPayload } from '@/types/admin'
import type { Category } from '@/types/category'
import type { Product } from '@/types/product'
import { useEffect, useState } from 'react'

type ProductFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  product?: Product | null
  onSubmit: (payload: CreateProductPayload & { active?: boolean }) => void
  loading?: boolean
}

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  imageUrl: '',
  categoryId: '',
  active: true,
}

export function ProductFormDialog({
  open,
  onOpenChange,
  categories,
  product,
  onSubmit,
  loading,
}: ProductFormDialogProps) {
  const [form, setForm] = useState(emptyForm)
  const selectedCategoryName =
    categories.find((category) => category.id === form.categoryId)?.name ??
    'Selecione'

  useEffect(() => {
    if (!open) return

    if (product) {
      setForm({
        name: product.name,
        description: product.description,
        price: String(product.price),
        stock: String(product.stock),
        imageUrl: product.imageUrl ?? '',
        categoryId: product.categoryId,
        active: product.active,
      })
      return
    }

    setForm({
      ...emptyForm,
      categoryId: categories[0]?.id ?? '',
    })
  }, [open, product, categories])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      imageUrl: form.imageUrl.trim() || undefined,
      categoryId: form.categoryId,
      active: form.active,
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-2xl lg:max-w-3xl"
      >
        <div className="flex flex-col gap-6 p-6">
          <SheetHeader className="p-0">
            <SheetTitle>
              {product ? 'Editar produto' : 'Novo produto'}
            </SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Nome</Label>
              <Input
                id="product-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                minLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-description">Descrição</Label>
              <textarea
                id="product-description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                required
                minLength={10}
                rows={4}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-price">Preço (R$)</Label>
                <Input
                  id="product-price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-stock">Estoque</Label>
                <Input
                  id="product-stock"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stock: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-image">URL da imagem</Label>
              <Input
                id="product-image"
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={form.categoryId}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, categoryId: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <span className="truncate">{selectedCategoryName}</span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {product ? (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, active: e.target.checked }))
                  }
                />
                Produto ativo na loja
              </label>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : product ? 'Salvar' : 'Criar produto'}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
