import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  ShellAccountCarousel,
  type ShellAccountCard,
} from "./account-carousel";
import { ShellBalanceSection } from "./balance-section";
import { ShellMainPanel } from "./main-panel";
import { shellThemeClasses, type ShellTheme } from "./theme";

export type AccountCard = ShellAccountCard;

type ShellProps = {
  title: string;
  balance: string;
  accountCards: AccountCard[];
  children: ReactNode;
  actions?: ReactNode;
  theme?: ShellTheme;
  onAccountCardClick?: (cardId: string) => void;
};

export function Shell({
  title,
  balance,
  accountCards,
  children,
  actions,
  theme = "transactions",
  onAccountCardClick,
}: ShellProps) {
  const currentTheme = shellThemeClasses[theme];
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const shownBalance = useMemo(() => {
    if (balanceHidden) {
      return "R$ •••••";
    }

    return balance;
  }, [balance, balanceHidden]);

  return (
    <section className="grid min-h-170 overflow-hidden rounded-2xl border border-slate-200 bg-white lg:grid-cols-[1fr_1fr]">
      <aside
        className={[
          "flex flex-col justify-between p-7",
          currentTheme.sidebar,
        ].join(" ")}
      >
        <ShellBalanceSection
          title={title}
          shownBalance={shownBalance}
          balanceHidden={balanceHidden}
          onToggleBalance={() => setBalanceHidden((value) => !value)}
          themeClass={currentTheme}
        />

        <ShellAccountCarousel
          accountCards={accountCards}
          activeCardIndex={activeCardIndex}
          onChangeActiveIndex={setActiveCardIndex}
          onCardClick={onAccountCardClick}
          carouselRef={carouselRef}
        />
      </aside>

      <ShellMainPanel actions={actions}>{children}</ShellMainPanel>
    </section>
  );
}
