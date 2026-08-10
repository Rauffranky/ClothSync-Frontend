import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  LogIn,
  MapPin,
  PackageCheck,
  RefreshCw,
  Timer,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import IconWrapper from "../../../Components/UI/IconWrapper";
import Input from "../../../Components/UI/Input";
import Pagination from "../../../Components/UI/Pagination";
import ProgressBar from "../../../Components/UI/ProgressBar";
import Table from "../../../Components/UI/Table";
import Tabs from "../../../Components/UI/Tabs";
import { useDebouncedSearch } from "../../../Hooks/useDebouncedSearch";
import { useSocketEvents } from "../../../Hooks/useSocketEvent";
import {
  getIncomingBatchDetails as fetchIncomingBatchDetails,
  getIncomingBatches,
} from "../../../axios/batches/laundryBatches";
import { toast } from "../../../Utils/toast";
import { SOCKET_EVENTS } from "../../../socket/events";
import BatchDetailsModal from "./BatchDetailsModal";
import {
  getIncomingBatchCollection,
  getIncomingBatchDetails,
  getLaundryBatchErrorMessage,
} from "./data";

const ITEMS_PER_PAGE = 10;
const LIVE_SCAN_EVENTS = [
  SOCKET_EVENTS.SCANNER_SCAN_BULK,
  SOCKET_EVENTS.SCAN_SESSION_UPDATED,
  SOCKET_EVENTS.SCAN_ENTRIES_UPDATED,
  SOCKET_EVENTS.SCAN_SESSION_FINISHED,
];
const batchTabs = [
  { label: "Incoming", value: "incoming" },
  { label: "Received", value: "received" },
  { label: "Delayed", value: "delayed" },
];
const stats = [
  {
    id: "expected",
    key: "expected",
    label: "Expected",
    variant: "neutral",
    Icon: Clock3,
  },
  {
    id: "arrived",
    key: "arrived",
    label: "Arrived",
    variant: "info",
    Icon: CheckCircle2,
  },
  {
    id: "partial",
    key: "partiallyCheckedIn",
    label: "Partially Checked In",
    variant: "warning",
    Icon: LogIn,
  },
  {
    id: "checked",
    key: "checkedInToday",
    label: "Checked In Today",
    variant: "success",
    Icon: PackageCheck,
  },
  {
    id: "delayed",
    key: "delayed",
    label: "Delayed",
    variant: "danger",
    Icon: Timer,
  },
];

const columns = [
  {
    key: "id",
    label: "Batch ID",
    render: (value) => (
      <span className="font-mono font-black text-(--color-sky-blue)">
        {value}
      </span>
    ),
  },
  {
    key: "business",
    label: "Business Name",
    render: (value) => (
      <span className="flex items-center gap-1.5 font-semibold text-(--theme-text-primary)">
        <Building2 size={13} />
        {value}
      </span>
    ),
  },
  {
    key: "location",
    label: "Dispatch Location",
    render: (value) => (
      <span className="flex items-center gap-1.5">
        <MapPin size={13} />
        {value}
      </span>
    ),
  },
  { key: "dispatchAt", label: "Dispatch Date & Time" },
  {
    key: "total",
    label: "Total Items",
    render: (value) => (
      <Badge
        leftIcon={<Box size={12} />}
        rounded="rounded-md"
        size="sm"
        variant="neutral"
      >
        {value}
      </Badge>
    ),
  },
  {
    key: "checkedIn",
    label: "Check-In Progress",
    sortable: false,
    render: (_, row) => (
      <div className="flex min-w-32 items-center gap-3">
        <ProgressBar
          className="min-w-16"
          heightClass="h-1.5"
          max={row.total}
          value={row.checkedIn}
          variant="info"
        />
        <span className="font-mono text-xs">
          {row.checkedIn}/{row.total}
        </span>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (_, row) => (
      <Badge dot size="sm" variant={row.statusVariant}>
        {row.status}
      </Badge>
    ),
  },
  {
    key: "delayed",
    label: "Delayed",
    align: "center",
    render: (value) => (
      <span
        className={
          value
            ? "font-black text-(--color-overdue)"
            : "text-(--theme-text-muted)"
        }
      >
        {value || "—"}
      </span>
    ),
  },
  { key: "lastActivity", label: "Last Activity" },
];

const IncomingBatches = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = batchTabs.some((tab) => tab.value === requestedTab)
    ? requestedTab
    : "incoming";
  const statusFilter = activeTab === "incoming" ? "dispatched" : activeTab;
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedSearch(searchValue);
  const [currentPage, setCurrentPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const refreshFromLiveScan = useCallback(() => {
    setRefreshKey((value) => value + 1);
    if (!selectedBatch?.apiId) return;

    fetchIncomingBatchDetails(selectedBatch.apiId)
      .then((response) => {
        setSelectedBatch(getIncomingBatchDetails(response));
        setDetailError("");
      })
      .catch((error) => {
        setDetailError(
          getLaundryBatchErrorMessage(
            error,
            "Unable to refresh the live batch details",
          ),
        );
      });
  }, [selectedBatch?.apiId]);

  useSocketEvents(LIVE_SCAN_EVENTS, refreshFromLiveScan);

  useEffect(() => {
    let isActive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    getIncomingBatches({
      status: statusFilter,
      page: currentPage + 1,
      limit: ITEMS_PER_PAGE,
      ...(debouncedSearch ? { keywords: debouncedSearch } : {}),
    })
      .then((response) => {
        if (!isActive) return;
        const collection = getIncomingBatchCollection(response, ITEMS_PER_PAGE);
        setRows(collection.rows);
        setCounts(collection.counts);
        setTotalItems(collection.totalItems);
        setTotalPages(collection.totalPages);
        setLoadError("");
      })
      .catch((error) => {
        if (!isActive) return;
        setRows([]);
        setLoadError(
          getLaundryBatchErrorMessage(error, "Unable to load incoming batches"),
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [currentPage, debouncedSearch, refreshKey, statusFilter]);

  const handleTabChange = (nextTab) => {
    setCurrentPage(0);
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        if (nextTab === "incoming") nextParams.delete("tab");
        else nextParams.set("tab", nextTab);
        return nextParams;
      },
      { replace: true },
    );
  };

  const openBatchDetails = async (batch) => {
    setSelectedBatch(batch);
    setIsDetailLoading(true);
    setDetailError("");
    try {
      const response = await fetchIncomingBatchDetails(batch.apiId);
      const details = getIncomingBatchDetails(response);
      setSelectedBatch(details);
    } catch (error) {
      const message = getLaundryBatchErrorMessage(
        error,
        "Unable to load batch details",
      );
      setDetailError(message);
      toast.error(message);
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="m-0 text-2xl font-black text-(--theme-text-primary)">
          Batches
        </h1>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map(({ Icon, ...stat }) => (
          <Card key={stat.id} bodyClassName="flex min-h-38 flex-col gap-4">
            <IconWrapper
              icon={Icon}
              iconSize={18}
              roundedClassName="rounded-xl"
              sizeClassName="h-10 w-10"
              variant={stat.variant}
            />
            <div>
              <p className="m-0 text-3xl font-black text-(--theme-text-primary)">
                {counts?.[stat.key] ?? "—"}
              </p>
              <p className="m-0 mt-1 text-sm font-semibold text-(--theme-text-muted)">
                {stat.label}
              </p>
            </div>
          </Card>
        ))}
      </div>
      {loadError && (
        <Alert variant="danger">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{loadError}</span>
            <Button
              leftIcon={<RefreshCw size={14} />}
              onClick={() => setRefreshKey((value) => value + 1)}
              size="sm"
              variant="secondary"
            >
              Try Again
            </Button>
          </div>
        </Alert>
      )}
      <div className="w-full md:w-max">
        <Tabs items={batchTabs} onChange={handleTabChange} value={activeTab} />
      </div>
      <div className="w-full sm:w-120 md:w-96 lg:w-80 xl:w-96">
        <Input
          onChange={(value) => {
            setSearchValue(value);
            setCurrentPage(0);
          }}
          placeholder="Search by batch..."
          value={searchValue}
        />
      </div>
      <Table
        actions={(row) => (
          <Button
            leftIcon={<Eye size={13} />}
            onClick={() => openBatchDetails(row)}
            size="sm"
            variant="outline"
          >
            View
          </Button>
        )}
        columns={columns}
        compact
        data={rows}
        emptyText={
          activeTab === "received"
            ? "No received batches found"
            : activeTab === "delayed"
              ? "No delayed batches found"
              : "No incoming batches found"
        }
        loading={isLoading}
        rowKey="apiId"
      />
      <Pagination
        forcePage={currentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={({ selected }) => setCurrentPage(selected)}
        pageCount={totalPages}
        totalItems={totalItems}
      />
      <BatchDetailsModal
        batch={selectedBatch}
        error={detailError}
        isLoading={isDetailLoading}
        onClose={() => setSelectedBatch(null)}
      />
    </div>
  );
};

export default IncomingBatches;
