import {
  CreditCard,
  Headphones,
  Percent,
  ShieldCheck,
  Truck,
} from 'lucide-react'

const benefits = [
  { icon: Truck, label: 'Frete grátis acima de R$ 199' },
  { icon: CreditCard, label: 'Parcele em até 12x' },
  { icon: Percent, label: 'Descontos exclusivos' },
  { icon: ShieldCheck, label: 'Compra segura' },
  { icon: Headphones, label: 'Atendimento 24h' },
]

export function BenefitsBar() {
  return (
    <section className="border-y border-border bg-muted/60">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-4 py-4 sm:gap-10">
        {benefits.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm"
          >
            <Icon className="size-4 shrink-0 text-foreground" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
