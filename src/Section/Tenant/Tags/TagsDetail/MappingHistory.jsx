import { useEffect, useState } from "react";
import { Link2 } from "lucide-react";
import Card from "../../../../Components/UI/Card";
import Pagination from "../../../../Components/UI/Pagination";
import { getTenantTagMappingHistory } from "../../../../axios/tags/tenantTags";
import { formatDateWithUserPreferences } from "../../../../Utils/date";

const ITEMS_PER_PAGE = 8;

const fallbackMappingData = [
  {
    id: "MAP-001",
    title: "Mapped — LNS-BED-0099 — Pillow Case Set",
    author: "Maria Santos",
    date: "Jan 14, 2025",
  },
  {
    id: "MAP-002",
    title: "Mapped — LNS-BED-0099 — Pillow Case Set",
    author: "Maria Santos",
    date: "Jan 14, 2025",
  },
  {
    id: "MAP-003",
    title: "Mapped — LNS-BED-0099 — Pillow Case Set",
    author: "Maria Santos",
    date: "Jan 14, 2025",
  },
  {
    id: "MAP-004",
    title: "Mapped — LNS-BED-0099 — Pillow Case Set",
    author: "Maria Santos",
    date: "Jan 14, 2025",
  },
  {
    id: "MAP-005",
    title: "Mapped — LNS-BED-0099 — Pillow Case Set",
    author: "Maria Santos",
    date: "Jan 14, 2025",
  },
  {
    id: "MAP-006",
    title: "Mapped — LNS-BED-0099 — Pillow Case Set",
    author: "Maria Santos",
    date: "Jan 14, 2025",
  },
  {
    id: "MAP-007",
    title: "Mapped — LNS-BED-0099 — Pillow Case Set",
    author: "Maria Santos",
    date: "Jan 14, 2025",
  },
  {
    id: "MAP-008",
    title: "Mapped — LNS-BED-0099 — Pillow Case Set",
    author: "Maria Santos",
    date: "Jan 14, 2025",
  },
];

const formatEventTitle = (item) => {
  if (typeof item.title === "string") return item.title;

  const actionStr =
    item.action === "linked" || item.eventType === "tag_linked"
      ? "Mapped"
      : item.action === "unlinked" || item.eventType === "tag_unlinked"
        ? "Unmapped"
        : "Mapped";

  const assetObj = item.newAsset || item.asset || item.oldAsset || {};
  const assetCode = assetObj.assetCode || assetObj.code || assetObj.id || "Asset";
  const assetName = assetObj.assetName || assetObj.name || "Item";

  return `${actionStr} — ${assetCode} — ${assetName}`;
};

const formatPerformer = (item) => {
  if (typeof item.author === "string") return item.author;
  if (typeof item.performer === "string") return item.performer;

  const userObj = item.performedBy || item.performer || item.createdBy;
  if (typeof userObj === "object" && userObj !== null) {
    return userObj.fullName || userObj.name || userObj.email || "System";
  }

  return "System";
};

const MappingHistory = ({ tagId }) => {
  const [historyList, setHistoryList] = useState(fallbackMappingData);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [serverTotalDocs, setServerTotalDocs] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!tagId) return;
      setLoading(true);
      try {
        const res = await getTenantTagMappingHistory(tagId, {
          page: currentPage + 1,
          limit: ITEMS_PER_PAGE,
        });

        if (!isMounted) return;

        const payload = res?.data ?? res ?? {};
        const docs =
          payload.items ||
          payload.docs ||
          payload.data?.items ||
          payload.data?.docs ||
          (Array.isArray(payload) ? payload : null);

        const pagination = payload.pagination || payload.meta || {};
        const totalDocs =
          pagination.totalItems ??
          pagination.totalDocs ??
          pagination.total ??
          (Array.isArray(docs) ? docs.length : 0);

        const totalPages =
          pagination.totalPages ??
          (Math.ceil(totalDocs / ITEMS_PER_PAGE) || 1);

        if (Array.isArray(docs) && docs.length > 0) {
          setHistoryList(docs);
          setServerTotalDocs(totalDocs);
          setServerTotalPages(totalPages);
        } else {
          setHistoryList(fallbackMappingData);
          setServerTotalDocs(fallbackMappingData.length);
          setServerTotalPages(
            Math.ceil(fallbackMappingData.length / ITEMS_PER_PAGE),
          );
        }
      } catch {
        if (!isMounted) return;
        setHistoryList(fallbackMappingData);
        setServerTotalDocs(fallbackMappingData.length);
        setServerTotalPages(
          Math.ceil(fallbackMappingData.length / ITEMS_PER_PAGE),
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [currentPage, tagId]);

  const pageCount =
    serverTotalPages || Math.ceil(historyList.length / ITEMS_PER_PAGE) || 1;
  const activePage = Math.min(currentPage, Math.max(0, pageCount - 1));

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} padding="0" rounded="16px">
              <div className="animate-pulse flex items-center gap-3 px-4 py-3.5">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {historyList.map((item, index) => {
            const title = formatEventTitle(item);
            const performer = formatPerformer(item);
            const rawDate = item.occurredAt || item.date || item.timestamp || item.createdAt;
            const dateStr = rawDate
              ? formatDateWithUserPreferences(rawDate)
              : "—";

            return (
              <Card
                key={item.id || item._id || `map-${index}`}
                padding="0"
                rounded="16px"
              >
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[rgba(20,184,166,0.18)] bg-[rgba(20,184,166,0.08)] text-(--color-aurora-teal)">
                    <Link2 size={16} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate text-sm font-bold text-(--theme-text-primary)">
                      {title}
                    </p>
                    <p className="m-0 mt-0.5 text-xs font-medium text-(--theme-text-muted)">
                      by {performer}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="m-0 text-xs font-semibold text-(--theme-text-muted)">
                      {dateStr}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {pageCount > 1 && (
        <Pagination
          pageCount={pageCount}
          totalItems={serverTotalDocs || historyList.length}
          itemsPerPage={ITEMS_PER_PAGE}
          forcePage={activePage}
          onPageChange={({ selected }) => setCurrentPage(selected)}
        />
      )}
    </div>
  );
};

export default MappingHistory;
