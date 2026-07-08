import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Cpu, Gauge, Logs, ShieldAlert } from "lucide-react";
import {
  scannerDetailsData,
  scannerLogRows,
  scannerSummaryCards,
} from "./data";
import Badge from "../../../../Components/UI/Badge";
import HeaderCard from "./HeaderCard";
import Card from "../../../../Components/UI/Card";
import Table from "../../../../Components/UI/Table";
import Pagination from "../../../../Components/UI/Pagination";

const ITEMS_PER_PAGE = 2;

const summaryIconMap = {
  lastScan: Logs,
  recentReads: Gauge,
  location: Cpu,
  operator: ShieldAlert,
};

const ScannerDetailsIndex = () => {
  const { id } = useParams();
  const data = scannerDetailsData[id] || scannerDetailsData["SCN-PRT-003"];
  const [currentPage, setCurrentPage] = useState(0);

  const pageCount = Math.ceil(scannerLogRows.length / ITEMS_PER_PAGE);
  const activePage = pageCount > 0 ? Math.min(currentPage, pageCount - 1) : 0;
  const paginatedLogs = useMemo(() => {
    const startIndex = activePage * ITEMS_PER_PAGE;
    return scannerLogRows.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [activePage]);

  const scanLogColumns = useMemo(
    () => [
      {
        key: "tagId",
        label: "Tag ID",
        sortable: true,
        render: (_, row) => (
          <div>
            <p className="m-0 font-mono text-sm font-black text-(--theme-text-primary)">
              {row.tagId}
            </p>
            <p className="m-0 mt-0.5 font-mono text-[11px] font-semibold text-(--theme-text-muted)">
              {row.assetId}
            </p>
          </div>
        ),
      },
      {
        key: "asset",
        label: "Assets",
        sortable: true,
        render: (_, row) => (
          <div>
            <p className="m-0 font-semibold text-(--theme-text-primary)">
              {row.asset}
            </p>
            <p className="m-0 mt-0.5 text-[11px] font-medium text-(--theme-text-muted)">
              {row.assetId}
            </p>
          </div>
        ),
      },
      {
        key: "zone",
        label: "Zone",
        sortable: true,
        render: (_, row) => (
          <span className="text-sm font-semibold text-(--theme-text-secondary)">
            {row.zone}
          </span>
        ),
      },
      {
        key: "mode",
        label: "Mode",
        sortable: true,
        render: (_, row) => (
          <Badge
            size="sm"
            variant={
              row.mode === "Automatic"
                ? "info"
                : row.mode === "Check Out"
                  ? "danger"
                  : "neutral"
            }
          >
            {row.mode}
          </Badge>
        ),
      },
      {
        key: "batch",
        label: "Batch",
        sortable: true,
        render: (_, row) => (
          <span className="font-mono text-sm font-bold text-(--color-aurora-teal)">
            {row.batch}
          </span>
        ),
      },
      {
        key: "items",
        label: "Items",
        align: "center",
        sortable: true,
        render: (_, row) => (
          <span className="font-mono text-sm font-black text-(--theme-text-primary)">
            {row.items}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (_, row) => (
          <Badge size="sm" variant={row.statusVariant}>
            {row.status}
          </Badge>
        ),
      },
      {
        key: "lastActivity",
        label: "Last Activity",
        sortable: true,
        render: (_, row) => (
          <span className="font-mono text-xs font-semibold text-(--theme-text-muted)">
            {row.lastActivity}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <HeaderCard data={data} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {scannerSummaryCards.map((item) => {
          const Icon = summaryIconMap[item.key];
          const value = data[item.key];

          return (
            <Card key={item.key} padding="16px 18px" rounded="16px">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-(--theme-border-soft) bg-(--button-ghost-bg)">
                  <Icon size={16} className="text-(--color-aurora-teal)" />
                </div>
                <div className="min-w-0">
                  <p className="m-0 text-[11px] font-black uppercase tracking-[0.12em] text-(--theme-text-muted)">
                    {item.label}
                  </p>
                  <p className="m-0 mt-1 text-sm font-bold text-(--theme-text-primary)">
                    {value}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mb-4">
        <h2 className="m-0 text-lg font-bold text-(--theme-text-primary)">
          Scan Logs
        </h2>
      </div>

      <Table
        columns={scanLogColumns}
        data={paginatedLogs}
        emptyText="No scan logs found"
        rowKey="id"
      />

      <Pagination
        forcePage={activePage}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={({ selected }) => setCurrentPage(selected)}
        pageCount={pageCount}
        totalItems={scannerLogRows.length}
      />
    </div>
  );
};

export default ScannerDetailsIndex;
