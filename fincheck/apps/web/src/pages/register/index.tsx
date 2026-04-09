import { useRegisterPageActions } from "./actions";
import { RegisterPageView } from "./view";

export function RegisterPage() {
  const ui = useRegisterPageActions();

  return <RegisterPageView ui={ui} />;
}
