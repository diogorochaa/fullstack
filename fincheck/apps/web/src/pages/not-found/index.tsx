import { useNotFoundPageActions } from "./actions";
import { NotFoundPageView } from "./view";

export function NotFoundPage() {
  const ui = useNotFoundPageActions();

  return <NotFoundPageView ui={ui} />;
}
