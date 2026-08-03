import { useEffect, useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import Badge from "../../../../Components/UI/Badge";
import IconWrapper from "../../../../Components/UI/IconWrapper";
import Pagination from "../../../../Components/UI/Pagination";
import Table from "../../../../Components/UI/Table";

import { getTenantTagScanLogs } from "../../../../axios/tags/tenantTags";
import { useSortableTableData } from "../../../../Hooks/useSortableTableData";
import { formatDateWithUserPreferences } from "../../../../Utils/date";
import { formatStatusLabel } from "../../../../Utils/status";

const ITEMS_PER_PAGE = 10;

const fallbackLogsData = [
  {
    id: "1",
    tagId: { icon: Building2, name: "CleanFlow Solutions", sub: "LND-001" },
    assets: { name: "King Duvet Cover", sub: "LNS-BED-0041" },
    location: "Chicago, IL",
    mode: "Automatic",
    batch: "10",
    itemsSent: "229",
    delayed: "8",
    lastActivity: "2 min ago",
  },
  {
    id: "2",
    tagId: { icon: Building2, name: "CleanFlow Solutions", sub: "LND-002" },
    assets: { name: "Sarah Okafor", sub: "sarah@cleanflow.io" },
    location: "Evanston, IL",
    mode: "Manual",
    batch: "1",
    itemsSent: "88",
    delayed: "1",
    lastActivity: "1 hr ago",
  },
  {
    id: "3",
    tagId: { icon: Building2, name: "Metro Linen Services", sub: "LND-003" },
    assets: { name: "Tom Hayashi", sub: "tom@metrolinen.com" },
    location: "Oak Park, IL",
    hasSet: true,
    mode: "Automatic",
    batch: "2",
    itemsSent: "65",
    delayed: "—",
    lastActivity: "3 hrs ago",
  },
  {
    id: "4",
    tagId: { icon: Building2, name: "Riverside Linen Works", sub: "LND-006" },
    assets: { name: "Lisa Petrov", sub: "lisa@riverlinens.net" },
    location: "Joliet, IL",
    hasSet: true,
    mode: "Manual",
    batch: "0",
    itemsSent: "0",
    delayed: "—",
    lastActivity: "Suspended",
  },
];

const columns = [
  {
    key: "tagId",
    label: "TAG ID / LAUNDRY",
    sortable: true,
    render: (_, row) => {
      if (typeof row.tagId === "string") {
        return (
          <span className="font-mono text-sm font-black text-(--theme-text-primary)">
            {row.tagId}
          </span>
        );
      }

      let name = "—";
      let sub = "—";

      if (row.tagId && typeof row.tagId === "object") {
        if (row.tagId.text) {
          return (
            <span className="font-mono text-sm font-black text-(--theme-text-primary)">
              {row.tagId.text}
            </span>
          );
        }
        name = row.tagId.name || "—";
        sub = row.tagId.sub || "—";
      } else if (row.laundry && typeof row.laundry === "object") {
        name = row.laundry.name || row.laundry.title || "—";
        sub = row.laundry.code || "—";
      } else if (row.scanner && typeof row.scanner === "object") {
        const enTranslation = Array.isArray(row.scanner.translations)
          ? row.scanner.translations.find((t) => t.locale === "en")
          : null;
        name = row.scanner.name || enTranslation?.name || "Scanner Unit";
        sub = row.scanner.scannerCode || row.scanner.scannerId || row.epc || "—";
      } else if (typeof row.laundryName === "string") {
        name = row.laundryName;
        sub = row.laundryCode || "—";
      }

      return (
        <div className="flex min-w-0 items-start gap-3">
          <IconWrapper
            icon={row.tagId?.icon || Building2}
            variant="info"
            sizeClassName="h-9 w-9 shrink-0"
            roundedClassName="rounded-xl"
            iconSize={16}
          />
          <div className="min-w-0 leading-tight">
            <p className="m-0 text-sm font-bold text-(--theme-text-primary)">
              {name}
            </p>
            <p className="m-0 mt-0.5 font-mono text-[11px] font-semibold text-(--theme-text-muted)">
              {sub}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    key: "assets",
    label: "ASSETS / OPERATOR",
    sortable: true,
    render: (_, row) => {
      let assetName = "—";
      let assetSub = "—";

      if (row.assets && typeof row.assets === "object" && row.assets.name) {
        assetName = row.assets.name;
        assetSub = row.assets.sub || "—";
      } else if (row.asset && typeof row.asset === "object") {
        assetName = row.asset.assetName || row.asset.name || "—";
        assetSub = row.asset.assetCode || row.asset.code || "—";
      } else if (typeof row.assetName === "string") {
        assetName = row.assetName;
        assetSub = row.assetCode || "—";
      }

      if (assetName === "—" && row.operator && typeof row.operator === "object") {
        assetName =
          row.operator.fullName || row.operator.user?.fullName || row.operator.name || "—";
        assetSub =
          row.operator.email || row.operator.user?.email || "—";
      }

      const isEmail = typeof assetSub === "string" && assetSub.includes("@");

      return (
        <div className="min-w-0 leading-tight">
          <p className="m-0 text-sm font-bold text-(--theme-text-primary)">
            {assetName}
          </p>
          <p
            className={`m-0 mt-0.5 font-mono text-[11px] font-semibold ${
              isEmail ? "text-(--theme-text-muted)" : "text-(--color-sky-blue)"
            }`}
          >
            {assetSub}
          </p>
        </div>
      );
    },
  },
  {
    key: "location",
    label: "LOCATION",
    sortable: true,
    render: (_, row) => {
      let locText = "—";
      if (typeof row.location === "string" && row.location) {
        locText = row.location;
      } else if (row.scanner && typeof row.scanner === "object") {
        const enTranslation = Array.isArray(row.scanner.translations)
          ? row.scanner.translations.find((t) => t.locale === "en")
          : null;
        locText = enTranslation?.zoneName || row.scanner.zoneName || "—";
      } else if (typeof row.translatedLocation === "string") {
        locText = row.translatedLocation;
      }

      return (
        <div className="text-sm font-medium text-(--theme-text-secondary)">
          {locText}
        </div>
      );
    },
  },
  {
    align: "center",
    key: "mode",
    label: "MODE / DIRECTION",
    sortable: true,
    render: (_, row) => {
      let modeVal =
        row.scannerMode ||
        row.scanner?.scannerMode ||
        row.scanDirection ||
        row.mode ||
        "entry";

      const formattedLabel = formatStatusLabel(modeVal);

      return (
        <div className="flex items-center justify-center gap-3">
          <Badge
            variant={
              modeVal === "entry" ||
              modeVal === "Automatic" ||
              modeVal === "going_to_laundry"
                ? "info"
                : "neutral"
            }
            size="sm"
          >
            {formattedLabel}
          </Badge>
        </div>
      );
    },
  },
  {
    align: "center",
    key: "batch",
    label: "BATCH",
    sortable: true,
    render: (_, row) => {
      let batchVal = "—";
      if (typeof row.batch === "string" || typeof row.batch === "number") {
        batchVal = String(row.batch);
      } else if (row.batch && typeof row.batch === "object") {
        batchVal = row.batch.batchCode || row.batch.code || row.batch.name || "—";
      } else if (row.batchCode) batchVal = String(row.batchCode);
      else if (row.batchId) batchVal = String(row.batchId);

      return (
        <div className="text-sm font-bold whitespace-nowrap text-(--color-sky-blue)">
          {batchVal}
        </div>
      );
    },
  },
  {
    key: "itemsSent",
    align: "center",
    label: "ITEMS SENT",
    sortable: true,
    render: (_, row) => {
      const val = row.itemsSent ?? row.itemCount ?? (row.asset ? 1 : 0);
      return (
        <span className="text-sm font-black text-(--theme-text-primary)">
          {typeof val === "object" ? "0" : String(val)}
        </span>
      );
    },
  },
  {
    key: "delayed",
    align: "center",
    label: "DELAYED",
    sortable: true,
    render: (_, row) => {
      const rawVal = row.delayedCount ?? row.delayed ?? "—";
      const val = typeof rawVal === "object" ? "—" : String(rawVal);
      const isDelayed = val !== "—" && val !== 0 && val !== "0";
      return (
        <span
          className={`text-sm font-bold ${
            isDelayed ? "text-(--color-overdue)" : "text-(--theme-text-muted)"
          }`}
        >
          {val}
        </span>
      );
    },
  },
  {
    align: "center",
    key: "lastActivity",
    label: "LAST ACTIVITY",
    sortable: true,
    render: (_, row) => {
      const rawDate = row.lastActivity || row.scannedAt || row.timestamp || row.createdAt;
      const text = rawDate
        ? formatDateWithUserPreferences(rawDate)
        : "—";

      return (
        <span className="text-xs font-bold text-(--theme-text-muted)">
          {text}
        </span>
      );
    },
  },
];

const ScanLogsTable = ({ tagId }) => {
  const [logsList, setLogsList] = useState(fallbackLogsData);
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
        const res = await getTenantTagScanLogs(tagId, {
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
          (Array.isArray(docs) ? docs.length : 0);

        const totalPages =
          pagination.totalPages ??
          (Math.ceil(totalDocs / ITEMS_PER_PAGE) || 1);

        if (Array.isArray(docs) && docs.length > 0) {
          setLogsList(docs);
          setServerTotalDocs(totalDocs);
          setServerTotalPages(totalPages);
        } else {
          setLogsList(fallbackLogsData);
          setServerTotalDocs(fallbackLogsData.length);
          setServerTotalPages(Math.ceil(fallbackLogsData.length / ITEMS_PER_PAGE));
        }
      } catch {
        if (!isMounted) return;
        setLogsList(fallbackLogsData);
        setServerTotalDocs(fallbackLogsData.length);
        setServerTotalPages(Math.ceil(fallbackLogsData.length / ITEMS_PER_PAGE));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [currentPage, tagId]);

  const { handleSort, sortedData, sortBy, sortDirection } =
    useSortableTableData(logsList);

  const pageCount =
    serverTotalPages || Math.ceil(sortedData.length / ITEMS_PER_PAGE) || 1;
  const activePage = Math.min(currentPage, Math.max(0, pageCount - 1));

  const paginatedData = useMemo(() => {
    if (serverTotalPages > 0) return sortedData;
    const startIndex = activePage * ITEMS_PER_PAGE;
    return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [activePage, serverTotalPages, sortedData]);

  const handleTableSort = (nextSortBy, nextSortDirection) => {
    handleSort(nextSortBy, nextSortDirection);
    setCurrentPage(0);
  };

  return (
    <div>
      <Table
        columns={columns}
        data={paginatedData}
        emptyText={loading ? "Loading scan logs..." : "No scan logs found"}
        rowKey={(r, index) => r.id || r._id || `log-${index}`}
        onSort={handleTableSort}
        sortBy={sortBy}
        sortDirection={sortDirection}
        loading={loading}
      />

      <Pagination
        pageCount={pageCount}
        totalItems={serverTotalDocs || sortedData.length}
        itemsPerPage={ITEMS_PER_PAGE}
        forcePage={activePage}
        onPageChange={({ selected }) => setCurrentPage(selected)}
      />
    </div>
  );
};

export default ScanLogsTable;
