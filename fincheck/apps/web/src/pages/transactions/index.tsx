import { useTransactionsPageActions } from "./actions";
import { TransactionsPageView } from "./view";

export function TransactionsPage() {
  const actions = useTransactionsPageActions();

  return <TransactionsPageView actions={actions} />;
}
