
import { ChevronLeft, ChevronRight } from "lucide-react";

const DOTS = "...";

const range = (start, end) =>
  Array.from({ length: end - start + 1 }, (_, index) => start + index);

const getPageItems = (pageCount, currentPage) => {
  if (pageCount <= 7) return range(0, pageCount - 1);

  const leftSibling = Math.max(currentPage - 1, 1);
  const rightSibling = Math.min(currentPage + 1, pageCount - 2);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < pageCount - 3;

  if (!showLeftDots && showRightDots) {
    return [...range(0, 4), DOTS, pageCount - 1];
  }

  if (showLeftDots && !showRightDots) {
    return [0, DOTS, ...range(pageCount - 5, pageCount - 1)];
  }

  return [0, DOTS, ...range(leftSibling, rightSibling), DOTS, pageCount - 1];
};

const Pagination = ({
  pageCount = 0,
  onPageChange = () => {},
  forcePage = 0,
  totalItems = 0,
  itemsPerPage = 10,
  className = "",
  showInfo = true,
}) => {
  const currentPage = Math.min(Math.max(forcePage, 0), Math.max(pageCount - 1, 0));
  const startItem = totalItems === 0 ? 0 : currentPage * itemsPerPage + 1;
  const endItem =
    totalItems === 0 ? 0 : Math.min((currentPage + 1) * itemsPerPage, totalItems);
  const pageItems = getPageItems(pageCount, currentPage);

  const handlePageChange = (selected) => {
    if (selected < 0 || selected >= pageCount || selected === currentPage) return;
    onPageChange({ selected });
  };

  if (!pageCount || pageCount <= 1) return null;

  return (
    <div
      className={[
        "mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showInfo ? (
        <div className="text-sm font-medium text-(--theme-text-secondary)">
          Showing{" "}
          <span className="font-black text-(--theme-text-primary)">{startItem}</span>
          {" to "}
          <span className="font-black text-(--theme-text-primary)">{endItem}</span>
          {" of "}
          <span className="font-black text-(--theme-text-primary)">{totalItems}</span>
          {" results"}
        </div>
      ) : (
        <div />
      )}

      <nav aria-label="Pagination" className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={currentPage === 0}
          onClick={() => handlePageChange(currentPage - 1)}
          className="grid h-9 min-w-9 cursor-pointer place-items-center rounded-xl border border-(--theme-border-soft) bg-(--button-ghost-bg) text-(--theme-text-secondary) shadow-(--button-ghost-shadow) transition duration-200 hover:-translate-y-0.5 hover:border-(--color-aurora-teal) hover:bg-(--button-ghost-bg-hover) hover:text-(--theme-text-primary) disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:border-(--theme-border-soft) disabled:hover:text-(--theme-text-secondary)"
        >
          <ChevronLeft size={16} />
        </button>

        {pageItems.map((item, index) =>
          item === DOTS ? (
            <span
              key={`${item}-${index}`}
              className="grid h-9 min-w-9 place-items-center rounded-xl text-sm font-bold text-(--theme-text-muted)"
            >
              {DOTS}
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === currentPage ? "page" : undefined}
              onClick={() => handlePageChange(item)}
              className={[
                "grid h-9 min-w-9 cursor-pointer place-items-center rounded-xl border px-2 text-sm font-black transition duration-200",
                item === currentPage
                  ? "border-(--color-aurora-teal) bg-[linear-gradient(135deg,var(--color-aurora-teal),var(--color-deep-teal))] text-white shadow-[0_12px_24px_rgba(20,184,166,0.28)]"
                  : "border-(--theme-border-soft) bg-(--button-ghost-bg) text-(--theme-text-secondary) shadow-(--button-ghost-shadow) hover:-translate-y-0.5 hover:border-(--color-aurora-teal) hover:bg-(--button-ghost-bg-hover) hover:text-(--theme-text-primary)",
              ].join(" ")}
            >
              {item + 1}
            </button>
          ),
        )}

        <button
          type="button"
          aria-label="Next page"
          disabled={currentPage === pageCount - 1}
          onClick={() => handlePageChange(currentPage + 1)}
          className="grid h-9 min-w-9 cursor-pointer place-items-center rounded-xl border border-(--theme-border-soft) bg-(--button-ghost-bg) text-(--theme-text-secondary) shadow-(--button-ghost-shadow) transition duration-200 hover:-translate-y-0.5 hover:border-(--color-aurora-teal) hover:bg-(--button-ghost-bg-hover) hover:text-(--theme-text-primary) disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:border-(--theme-border-soft) disabled:hover:text-(--theme-text-secondary)"
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
