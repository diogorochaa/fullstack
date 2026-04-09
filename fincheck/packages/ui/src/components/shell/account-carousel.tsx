import { ChevronLeft, ChevronRight, Landmark } from "lucide-react";
import type { ReactNode, RefObject } from "react";
import { wrapIndex } from "./theme";

export type ShellAccountCard = {
  id: string;
  name: string;
  balance: string;
  subtitle?: string;
  accentClassName?: string;
  icon?: ReactNode;
};

type ShellAccountCarouselProps = {
  accountCards: ShellAccountCard[];
  activeCardIndex: number;
  onChangeActiveIndex: (index: number) => void;
  onCardClick?: (cardId: string) => void;
  carouselRef: RefObject<HTMLDivElement | null>;
};

export function ShellAccountCarousel({
  accountCards,
  activeCardIndex,
  onChangeActiveIndex,
  onCardClick,
  carouselRef,
}: ShellAccountCarouselProps) {
  const safeActiveCardIndex = accountCards.length
    ? wrapIndex(activeCardIndex, accountCards.length)
    : 0;

  function scrollToIndex(index: number) {
    const target = carouselRef.current?.children[index] as
      | HTMLElement
      | undefined;
    target?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  }

  function onNavigate(step: 1 | -1) {
    if (!accountCards.length || !carouselRef.current) {
      return;
    }

    const nextIndex = wrapIndex(
      safeActiveCardIndex + step,
      accountCards.length,
    );
    onChangeActiveIndex(nextIndex);
    scrollToIndex(nextIndex);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-3xl font-semibold text-white">Minhas Contas</p>
        <div className="flex items-center gap-3 text-violet-100">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white"
            onClick={() => onNavigate(-1)}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white"
            onClick={() => onNavigate(1)}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={carouselRef}
        onScroll={(event) => {
          const container = event.currentTarget;
          const firstCard = container.children[0] as HTMLElement | undefined;

          if (!firstCard || !accountCards.length) {
            return;
          }

          const styles = window.getComputedStyle(container);
          const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");
          const cardStep = firstCard.offsetWidth + gap;
          const nextIndex = Math.round(container.scrollLeft / cardStep);
          const safeIndex = wrapIndex(nextIndex, accountCards.length);

          if (safeIndex !== safeActiveCardIndex) {
            onChangeActiveIndex(safeIndex);
          }
        }}
        className="-mr-2 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pr-2 scroll-smooth touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {accountCards.map((card) => (
          <article
            key={card.id}
            className={[
              "flex min-h-59 w-[78%] shrink-0 snap-start flex-col rounded-[18px] bg-white px-5 py-4 text-slate-700 shadow-[0_8px_20px_-18px_rgba(15,23,42,0.45)] transition-all duration-200 hover:-translate-y-0.5 sm:w-[46%]",
              onCardClick ? "cursor-pointer" : "",
            ].join(" ")}
            role={onCardClick ? "button" : undefined}
            tabIndex={onCardClick ? 0 : undefined}
            onClick={onCardClick ? () => onCardClick(card.id) : undefined}
            onKeyDown={
              onCardClick
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onCardClick(card.id);
                    }
                  }
                : undefined
            }
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-500">
              {card.icon ?? <Landmark size={17} />}
            </div>

            <p className="min-h-14.5 text-[22px] font-medium leading-[1.08] text-slate-700 sm:text-[20px]">
              {card.name}
            </p>

            <p className="mt-auto text-[30px] font-semibold leading-none text-slate-700 sm:text-[34px]">
              {card.balance}
            </p>
            <p className="mt-1 text-[18px] leading-none text-slate-400 sm:text-[16px]">
              {card.subtitle ?? "Saldo atual"}
            </p>
            <div
              className={[
                "mt-4 h-1.5 rounded-full",
                card.accentClassName ?? "bg-violet-500",
              ].join(" ")}
            />
          </article>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        {accountCards.map((card, index) => (
          <button
            key={card.id}
            type="button"
            onClick={() => {
              onChangeActiveIndex(index);
              scrollToIndex(index);
            }}
            className={[
              "h-2 rounded-full transition-all",
              index === safeActiveCardIndex
                ? "w-6 bg-white"
                : "w-2 bg-white/40 hover:bg-white/60",
            ].join(" ")}
            aria-label={`Ir para conta ${card.name}`}
          />
        ))}
      </div>
    </div>
  );
}
