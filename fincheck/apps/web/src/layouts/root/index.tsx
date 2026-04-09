import { useRootLayoutActions } from "./actions";
import { RootLayoutView } from "./view";

export function RootLayout() {
  const ui = useRootLayoutActions();

  return <RootLayoutView ui={ui} />;
}
