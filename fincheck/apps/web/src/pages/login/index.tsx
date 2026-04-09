import { useLoginPageActions } from "./actions";
import { LoginPageView } from "./view";

export function LoginPage() {
  const ui = useLoginPageActions();

  return <LoginPageView ui={ui} />;
}
