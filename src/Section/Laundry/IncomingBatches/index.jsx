import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Building2,
  CalendarDays,
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
import Dropdown from "../../../Components/UI/Dropdown";
import IconWrapper from "../../../Components/UI/IconWrapper";
import Input from "../../../Components/UI/Input";
import Pagination from "../../../Components/UI/Pagination";
import ProgressBar from "../../../Components/UI/ProgressBar";
import Table from "../../../Components/UI/Table";
import Tabs from "../../../Components/UI/Tabs";
import GlobalUndoBanners from "../../../Components/Layout/Dashboard/GlobalUndoBanners";
import { useDebouncedSearch } from "../../../Hooks/useDebouncedSearch";
import { useSocketEvents } from "../../../Hooks/useSocketEvent";
import {
  getIncomingBatchDetails as fetchIncomingBatchDetails,
  getCompletedLaundryDispatchBatches,
  getIncomingBatches,
} from "../../../axios/batches/laundryBatches";
import { toast } from "../../../Utils/toast";
import { getLaundryTenants } from "../../../axios/laundryTenants/laundryTenants";
import { SOCKET_EVENTS } from "../../../socket/events";
import {
  captureLaundryScanEvent,
  getActiveLaundryScan,
} from "../../../Utils/laundryScanSession";
import BatchDetailsModal from "./BatchDetailsModal";
import {
  getIncomingBatchCollection,
  getIncomingBatchDetails,
  getCompletedBatchCollection,
  getLaundryBatchErrorMessage,
} from "./data";

const ITEMS_PER_PAGE = 10;
const INCOMING_BATCH_STATUSES = ["dispatched", "partially_completed"];
const LIVE_SCAN_EVENTS = [
  SOCKET_EVENTS.SCANNER_SCAN_BULK,
  SOCKET_EVENTS.SCAN_SESSION_UPDATED,
  SOCKET_EVENTS.SCAN_ENTRIES_UPDATED,
  SOCKET_EVENTS.SCAN_SESSION_FINISHED,
];
const batchTabs = [
  { label: "Incoming", value: "incoming" },
  { label: "Received", value: "received" },
  { label: "Completed", value: "completed" },
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
        <span className="whitespace-nowrap font-mono text-xs">
          {row.checkedIn} of {row.total} tags
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

const completedColumns = [
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
    label: "Business",
    render: (value, row) => (
      <div>
        <p className="m-0 font-semibold text-(--theme-text-primary)">{value}</p>
        <p className="m-0 text-xs text-(--theme-text-muted)">{row.businessEmail}</p>
      </div>
    ),
  },
  {
    key: "total",
    label: "Total Items",
    render: (value) => <Badge variant="neutral">{value}</Badge>,
  },
  { key: "returnedCount", label: "Returned" },
  {
    key: "missingCount",
    label: "Missing",
    render: (value) => (
      <span className={value ? "font-black text-(--color-overdue)" : "text-(--theme-text-muted)"}>
        {value}
      </span>
    ),
  },
  {
    key: "progressPercent",
    label: "Return Progress",
    render: (value, row) => (
      <div className="flex min-w-36 items-center gap-3">
        <ProgressBar className="min-w-20" max={100} value={value} variant="success" />
        <span className="whitespace-nowrap font-mono text-xs">
          {row.returnedCount}/{row.total} ({value}%)
        </span>
      </div>
    ),
  },
  {
    key: "status",
    label: "Batch Status",
    render: (_, row) => <Badge variant={row.statusVariant}>{row.status}</Badge>,
  },
  {
    key: "completionStatus",
    label: "Completion",
    render: (_, row) => (
      <Badge variant={row.completionStatusVariant}>{row.completionStatus}</Badge>
    ),
  },
  { key: "lastActivity", label: "Last Return Activity" },
];

const IncomingBatches = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const tenantIdFilter = searchParams.get("tenantId") || "";
  const dateFromFilter = searchParams.get("dateFrom") || "";
  const dateToFilter = searchParams.get("dateTo") || "";
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
  const [liveScan, setLiveScan] = useState(getActiveLaundryScan);
  const [businessOptions, setBusinessOptions] = useState([
    { label: "All Businesses", value: "all" },
  ]);
  const [isBusinessFilterLoading, setIsBusinessFilterLoading] = useState(false);
  const openedLiveBatchRef = useRef(null);

  const refreshFromLiveScan = useCallback((payload) => {
    setLiveScan(captureLaundryScanEvent(payload));
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
  }, [selectedBatch]);

  useSocketEvents(LIVE_SCAN_EVENTS, refreshFromLiveScan);

  useEffect(() => {
    const handleUndoSuccess = (event) => {
      if (event.detail?.portal !== "laundry") return;
      refreshFromLiveScan();
    };
    window.addEventListener("bulk-scan-undo-success", handleUndoSuccess);
    return () =>
      window.removeEventListener("bulk-scan-undo-success", handleUndoSuccess);
  }, [refreshFromLiveScan]);

  useEffect(() => {
    if (activeTab !== "completed") return undefined;
    let isActive = true;
    // Loading synchronizes the filter with the linked-business API request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsBusinessFilterLoading(true);
    getLaundryTenants({ page: 1, limit: 100, status: "active" })
      .then((response) => {
        if (!isActive) return;
        const payload = response?.data ?? response ?? {};
        const records = payload.items || payload.tenants || payload.businesses || [];
        const options = Array.isArray(records)
          ? records.map((record) => {
              const tenant =
                (record.tenant && typeof record.tenant === "object"
                  ? record.tenant
                  : null) ||
                (record.tenantId && typeof record.tenantId === "object"
                  ? record.tenantId
                  : null) ||
                record.business ||
                {};
              return {
                label:
                  record.businessName ||
                  record.tenantName ||
                  tenant.businessName ||
                  tenant.name ||
                  "Unnamed Business",
                value:
                  tenant.id ||
                  tenant._id ||
                  (typeof record.tenantId === "string" ? record.tenantId : null) ||
                  record.businessId ||
                  record.id,
              };
            }).filter((option) => option.value)
          : [];
        setBusinessOptions([
          { label: "All Businesses", value: "all" },
          ...new Map(options.map((option) => [option.value, option])).values(),
        ]);
      })
      .catch(() => {
        if (isActive) {
          setBusinessOptions([{ label: "All Businesses", value: "all" }]);
        }
      })
      .finally(() => {
        if (isActive) setIsBusinessFilterLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [activeTab]);

  useEffect(() => {
    const affectedBatchIds = liveScan?.affectedBatchIds || [];
    const batchId =
      affectedBatchIds.length === 1 ? affectedBatchIds[0] : liveScan?.batchId;
    if (affectedBatchIds.length > 1) return;
    if (!batchId || openedLiveBatchRef.current === batchId) return;
    openedLiveBatchRef.current = batchId;
    setIsDetailLoading(true);
    fetchIncomingBatchDetails(batchId)
      .then((response) => {
        setSelectedBatch(getIncomingBatchDetails(response));
        setDetailError("");
      })
      .catch((error) => {
        setDetailError(
          getLaundryBatchErrorMessage(
            error,
            "Unable to open the batch selected on the scanner",
          ),
        );
      })
      .finally(() => setIsDetailLoading(false));
  }, [liveScan?.affectedBatchIds, liveScan?.batchId]);

  useEffect(() => {
    let isActive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    const completedRequestParams = {
      page: currentPage + 1,
      limit: 20,
      ...(debouncedSearch ? { keywords: debouncedSearch } : {}),
      ...(tenantIdFilter ? { tenantId: tenantIdFilter } : {}),
      ...(dateFromFilter ? { dateFrom: dateFromFilter } : {}),
      ...(dateToFilter ? { dateTo: dateToFilter } : {}),
    };
    if (activeTab === "completed") {
      getCompletedLaundryDispatchBatches(completedRequestParams)
        .then((response) => {
          if (!isActive) return;
          const collection = getCompletedBatchCollection(response, 20);
          setRows(collection.rows);
          setCounts({});
          setTotalItems(collection.totalItems);
          setTotalPages(collection.totalPages);
          setLoadError("");
        })
        .catch((error) => {
          if (!isActive) return;
          setRows([]);
          setLoadError(
            getLaundryBatchErrorMessage(
              error,
              "Unable to load completed batches",
            ),
          );
        })
        .finally(() => {
          if (isActive) setIsLoading(false);
        });

      return () => {
        isActive = false;
      };
    }

    const requestParams = {
      page: currentPage + 1,
      limit: ITEMS_PER_PAGE,
      ...(debouncedSearch ? { keywords: debouncedSearch } : {}),
    };
    const requests =
      activeTab === "incoming"
        ? INCOMING_BATCH_STATUSES.map((status) =>
            getIncomingBatches({ ...requestParams, status }),
          )
        : [getIncomingBatches({ ...requestParams, status: statusFilter })];

    Promise.all(requests)
      .then((responses) => {
        if (!isActive) return;
        const collections = responses.map((response) =>
          getIncomingBatchCollection(response, ITEMS_PER_PAGE),
        );
        const uniqueRows = [
          ...new Map(
            collections
              .flatMap((collection) => collection.rows)
              .map((batch) => [batch.apiId, batch]),
          ).values(),
        ];
        setRows(uniqueRows);
        setCounts(collections.find((collection) =>
          Object.keys(collection.counts || {}).length > 0,
        )?.counts || {});
        setTotalItems(
          collections.reduce(
            (total, collection) => total + collection.totalItems,
            0,
          ),
        );
        setTotalPages(
          Math.max(
            0,
            ...collections.map((collection) => collection.totalPages),
          ),
        );
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
  }, [
    activeTab,
    currentPage,
    dateFromFilter,
    dateToFilter,
    debouncedSearch,
    refreshKey,
    statusFilter,
    tenantIdFilter,
  ]);

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

  const setCompletedFilter = (key, value) => {
    setCurrentPage(0);
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        if (!value || value === "all") nextParams.delete(key);
        else nextParams.set(key, value);
        return nextParams;
      },
      { replace: true },
    );
  };

  const clearCompletedFilters = () => {
    setSearchValue("");
    setCurrentPage(0);
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        ["tenantId", "dateFrom", "dateTo"].forEach((key) =>
          nextParams.delete(key),
        );
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
      <GlobalUndoBanners inline portal="laundry" />
      <div className="w-full md:w-max">
        <Tabs items={batchTabs} onChange={handleTabChange} value={activeTab} />
      </div>
      <div
        className={
          activeTab === "completed"
            ? "grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_240px_190px_190px_auto]"
            : "w-full sm:w-120 md:w-96 lg:w-80 xl:w-96"
        }
      >
        <Input
          onChange={(value) => {
            setSearchValue(value);
            setCurrentPage(0);
          }}
          placeholder="Search by batch..."
          value={searchValue}
        />
        {activeTab === "completed" && (
          <>
            <Dropdown
              disabled={isBusinessFilterLoading}
              onChange={(value) => setCompletedFilter("tenantId", value)}
              options={businessOptions}
              placeholder={
                isBusinessFilterLoading ? "Loading businesses..." : "All Businesses"
              }
              search
              value={tenantIdFilter || "all"}
            />
            <Input
              leftIcon={<CalendarDays size={16} />}
              max={dateToFilter || undefined}
              onChange={(value) => setCompletedFilter("dateFrom", value)}
              placeholder="Date from"
              type="date"
              value={dateFromFilter}
            />
            <Input
              leftIcon={<CalendarDays size={16} />}
              min={dateFromFilter || undefined}
              onChange={(value) => setCompletedFilter("dateTo", value)}
              placeholder="Date to"
              type="date"
              value={dateToFilter}
            />
            <Button
              disabled={
                !searchValue && !tenantIdFilter && !dateFromFilter && !dateToFilter
              }
              onClick={clearCompletedFilters}
              variant="outline"
            >
              Clear Filters
            </Button>
          </>
        )}
      </div>
      <Table
        actions={
          activeTab === "completed"
            ? undefined
            : (row) => (
                <Button
                  leftIcon={<Eye size={13} />}
                  onClick={() => openBatchDetails(row)}
                  size="sm"
                  variant="outline"
                >
                  View
                </Button>
              )
        }
        columns={activeTab === "completed" ? completedColumns : columns}
        compact
        data={rows}
        emptyText={
          activeTab === "completed"
            ? "No completed batches found"
            : activeTab === "received"
            ? "No received batches found"
            : "No incoming batches found"
        }
        loading={isLoading}
        rowKey="apiId"
      />
      <Pagination
        forcePage={currentPage}
        itemsPerPage={activeTab === "completed" ? 20 : ITEMS_PER_PAGE}
        onPageChange={({ selected }) => setCurrentPage(selected)}
        pageCount={totalPages}
        totalItems={totalItems}
      />
      <BatchDetailsModal
        batch={selectedBatch}
        error={detailError}
        isLoading={isDetailLoading}
        liveScan={liveScan}
        onClose={() => setSelectedBatch(null)}
        onReceived={(receipt) => {
          setSelectedBatch(receipt.batch);
          setLiveScan(null);
          setRefreshKey((value) => value + 1);
        }}
      />
    </div>
  );
};

export default IncomingBatches;
