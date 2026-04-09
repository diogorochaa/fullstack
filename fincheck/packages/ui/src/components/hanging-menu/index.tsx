import { HangingMenuItem } from "./item";
import { HangingMenuRoot } from "./root";

export type { HangingMenuOption, MenuOptionTone } from "./types";

export const HangingMenuCompound = Object.assign(HangingMenuRoot, {
  Item: HangingMenuItem,
});

type HangingMenuProps = {
  triggerLabel: string;
  options: import("./types").HangingMenuOption[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function HangingMenu(props: HangingMenuProps) {
  return <HangingMenuCompound {...props} />;
}
