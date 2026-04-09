const BRL_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const MONTH_SHORT_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
});

export function formatCurrency(value: number) {
  return BRL_FORMATTER.format(value);
}

export function formatDate(value: string | Date) {
  return DATE_FORMATTER.format(new Date(value));
}

export function formatMonthShortLabel(date: Date) {
  const short = MONTH_SHORT_FORMATTER.format(date).replace(".", "");
  return short.charAt(0).toUpperCase() + short.slice(1);
}
