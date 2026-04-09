import { FloatingMenuItem } from "./item";
import { FloatingMenuRoot } from "./root";

export type { FloatingMenuOption } from "./types";

export const FloatingMenuCompound = Object.assign(FloatingMenuRoot, {
  Item: FloatingMenuItem,
});

type FloatingMenuProps = {
  options: import("./types").FloatingMenuOption[];
  onSelect: (optionId: string) => void;
};

export function FloatingMenu(props: FloatingMenuProps) {
  return <FloatingMenuCompound {...props} />;
}
