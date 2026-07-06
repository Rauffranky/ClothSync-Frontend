import { useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Pagination from "../../../Components/UI/Pagination";
import { pendingRequests } from "./data";

const ITEMS_PER_PAGE = 1;

const renderStatusBadge = (_, row) => (
  <Badge variant={row.statusVariant} size="sm">
    {row.status}
  </Badge>
);

const PendingRequest = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageCount = Math.ceil(pendingRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = useMemo(() => {
    const startIndex = currentPage * ITEMS_PER_PAGE;

    return pendingRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage]);

  return (
    <div className="px-4 py-4">
      <div className="overflow-hidden rounded-2xl border border-(--theme-border) bg-(--theme-surface)">
        {paginatedRequests.map((request) => (
          <div
            className="flex flex-col gap-4 border-b border-(--theme-border) px-5 py-5 last:border-b-0 md:flex-row md:items-center md:justify-between"
            key={request.id}
          >
            <div className="flex min-w-0 items-center gap-4">
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                style={{
                  color: "var(--color-sky-blue)",
                  background:
                    "color-mix(in srgb, var(--color-sky-blue) 13%, transparent)",
                }}
              >
                <Building2 size={18} />
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="m-0 truncate text-base font-bold text-(--theme-text-primary)">
                    {request.email}
                  </p>
                  {renderStatusBadge(null, request)}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 md:justify-end">
              <span className="text-sm font-semibold text-(--theme-text-muted)">
                {request.sentAt}
              </span>
              <Button
                size={{ minHeight: 36, padding: "0 14px", fontSize: "0.875rem" }}
              >
                Resend
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Pagination
        forcePage={currentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={({ selected }) => setCurrentPage(selected)}
        pageCount={pageCount}
        totalItems={pendingRequests.length}
      />
    </div>
  );
};

export default PendingRequest;
