import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { parseUsageSteps } from '@/features/products/lib/parse-usage-steps'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

type HowToUseSheetProps = {
  productName: string
  description: string
  categorySlug?: string
}

export function HowToUseSheet({
  productName,
  description,
  categorySlug,
}: HowToUseSheetProps) {
  const steps = parseUsageSteps(description, categorySlug)
  const [step, setStep] = useState(0)

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" className="rounded-full">
            <BookOpen className="size-4" />
            Como usar
          </Button>
        }
      />
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Como usar — {productName}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-2">
            {steps.map((stepText, index) => (
              <div
                key={stepText}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  index <= step ? 'bg-brand' : 'bg-muted',
                )}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="min-h-32 rounded-2xl bg-muted/60 p-5"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-brand">
                Passo {step + 1} de {steps.length}
              </p>
              <p className="mt-3 text-base leading-relaxed">{steps[step]}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={step <= 0}
              onClick={() => setStep((value) => Math.max(0, value - 1))}
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>
            <Button
              type="button"
              size="sm"
              className="rounded-full bg-brand text-white hover:bg-brand/90"
              disabled={step >= steps.length - 1}
              onClick={() =>
                setStep((value) => Math.min(steps.length - 1, value + 1))
              }
            >
              Próximo
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
