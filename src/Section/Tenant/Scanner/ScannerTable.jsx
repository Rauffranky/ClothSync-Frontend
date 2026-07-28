import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  AlertTriangle,
  Radio,
  Smartphone,
  Eye,
  Pencil,
  Power,
  RefreshCw,
} from "lucide-react";
import {
  scannerTypeOptions,
  scannerModeOptions,
  scannerStatusOptions,
  scannerStatusVariantMap,
  getScannerPaginatedCollection,
  normalizeScanner,
} from "./data";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import IconWrapper from "../../../Components/UI/IconWrapper";
import Input from "../../../Components/UI/Input";
import Card from "../../../Components/UI/Card";
import Dropdown from "../../../Components/UI/Dropdown";
import Table from "../../../Components/UI/Table";
import Pagination from "../../../Components/UI/Pagination";
import Badge from "../../../Components/UI/Badge";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import AddScannerModal from "./AddScannerModal";
import ScannerStatusModal from "./ScannerStatusModal";
import {
  getSearchQuery,
  useDebouncedSearch,
} from "../../../Hooks/useDebouncedSearch";
import { useSortableTableData } from "../../../Hooks/useSortableTableData";
import { getApiErrorMessage } from "../../../axios/api";
import { getTenantStaff } from "../../../axios/staff/tenantStaff";
import {
  getTenantScanners,
  updateTenantScanner,
  updateTenantScannerStatus,
} from "../../../axios/scanners/tenantScanners";
import { toast } from "../../../Utils/toast";
import {
  getStaffPaginatedCollection,
  normalizeStaffMember,
} from "../Staff/data";

const ITEMS_PER_PAGE = 10;

const ScannerTable = ({
  onCollectionStateChange,
  onScannerUpdated,
  refreshKey = 0,
  detailRoutePrefix = "/business/scanners",
  getScanners = getTenantScanners,
  updateScanner = updateTenantScanner,
  updateScannerStatus = updateTenantScannerStatus,
  getStaffMembers = getTenantStaff,
}) => {
  const navigate = useNavigate();
  const [scannerRows, setScannerRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [localRefreshKey, setLocalRefreshKey] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedSearch(searchValue);
  const [typeFilter, setTypeFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [operatorFilter, setOperatorFilter] = useState("all");
  const [operatorOptions, setOperatorOptions] = useState([
    { label: "All Operators", value: "all" },
  ]);
  const [isOperatorLoading, setIsOperatorLoading] = useState(true);
  const [operatorLoadError, setOperatorLoadError] = useState("");
  const [operatorLoadKey, setOperatorLoadKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [statusModalState, setStatusModalState] = useState({
    isOpen: false,
    action: null,
    scanner: null,
  });
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false);
  const [editScannerState, setEditScannerState] = useState({
    isOpen: false,
    scanner: null,
  });

  useEffect(() => {
    let isActive = true;

    getStaffMembers({ page: 1, limit: 100, status: "active" })
      .then((response) => {
        if (!isActive) return;

        const activeOperators = getStaffPaginatedCollection(response, 1, 100)
          .rows.map(normalizeStaffMember)
          .filter((staff) => staff.apiId && staff.status === "Active")
          .map((staff) => ({
            label: staff.name,
            searchLabel: `${staff.name} ${staff.email}`,
            value: staff.apiId,
          }));

        setOperatorOptions([
          { label: "All Operators", value: "all" },
          ...activeOperators,
        ]);
        setOperatorLoadError("");
      })
      .catch((error) => {
        if (!isActive) return;
        setOperatorOptions([{ label: "All Operators", value: "all" }]);
        setOperatorFilter("all");
        setOperatorLoadError(
          getApiErrorMessage(error, "Unable to load operators"),
        );
      })
      .finally(() => {
        if (isActive) setIsOperatorLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [operatorLoadKey, getStaffMembers]);

  useEffect(() => {
    let isActive = true;

    onCollectionStateChange?.({ status: "loading" });

    getScanners({
      page: currentPage + 1,
      limit: ITEMS_PER_PAGE,
      ...(debouncedSearch ? { keywords: debouncedSearch } : {}),
      ...(typeFilter !== "all" ? { scannerType: typeFilter } : {}),
      ...(modeFilter !== "all" ? { scannerMode: modeFilter } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      ...(operatorFilter !== "all"
        ? { assignedOperatorId: operatorFilter }
        : {}),
    })
      .then((response) => {
        if (!isActive) return;
        const collection = getScannerPaginatedCollection(
          response,
          ITEMS_PER_PAGE,
        );
        setScannerRows(collection.rows.map(normalizeScanner));
        setTotalItems(collection.totalItems);
        setTotalPages(collection.totalPages);
        setLoadError("");
        onCollectionStateChange?.({
          status: "success",
          summary: collection.summary,
        });
      })
      .catch((error) => {
        if (!isActive) return;
        const message = getApiErrorMessage(error, "Unable to load scanners");
        setScannerRows([]);
        setTotalItems(0);
        setTotalPages(0);
        setLoadError(message);
        onCollectionStateChange?.({ status: "error", error: message });
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [
    currentPage,
    debouncedSearch,
    localRefreshKey,
    modeFilter,
    onCollectionStateChange,
    operatorFilter,
    refreshKey,
    statusFilter,
    typeFilter,
    getScanners,
  ]);

  const { handleSort, sortedData, sortBy, sortDirection } =
    useSortableTableData(scannerRows);
  const activePage = totalPages > 0 ? Math.min(currentPage, totalPages - 1) : 0;

  const resetCurrentPage = () => setCurrentPage(0);

  const handleSearchChange = (value) => {
    if (getSearchQuery(value) !== debouncedSearch) setIsLoading(true);
    setSearchValue(value);
    resetCurrentPage();
  };

  const handleTableSort = (nextSortBy, nextSortDirection) => {
    handleSort(nextSortBy, nextSortDirection);
    resetCurrentPage();
  };

  const handleFilterChange = (setter, value) => {
    setIsLoading(true);
    setter(value || "all");
    resetCurrentPage();
  };

  const retryLoad = () => {
    setIsLoading(true);
    setLoadError("");
    setLocalRefreshKey((current) => current + 1);
  };

  const retryOperators = () => {
    setIsOperatorLoading(true);
    setOperatorLoadError("");
    setOperatorLoadKey((current) => current + 1);
  };

  const openStatusModal = (scanner, action) => {
    setStatusModalState({
      isOpen: true,
      action,
      scanner,
    });
  };

  const closeStatusModal = () => {
    setStatusModalState({
      isOpen: false,
      action: null,
      scanner: null,
    });
  };

  const handleStatusConfirm = async ({ scanner, action }) => {
    const nextStatus = action === "deactivate" ? "inactive" : "active";

    try {
      setIsStatusSubmitting(true);
      const response = await updateScannerStatus(
        scanner.apiId,
        nextStatus,
      );
      toast.success(
        response?.message ||
          `Scanner ${nextStatus === "active" ? "activated" : "deactivated"} successfully`,
      );
      setIsLoading(true);
      if (onScannerUpdated) onScannerUpdated();
      else setLocalRefreshKey((current) => current + 1);
      return response;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update scanner status"));
      throw error;
    } finally {
      setIsStatusSubmitting(false);
    }
  };

  const openEditScannerModal = (scanner) => {
    setEditScannerState({
      isOpen: true,
      scanner: {
        ...scanner,
        scannerName: scanner.name,
        scannerId: scanner.id,
        scannerType: scanner.type,
        scannerMode: scanner.mode,
        zoneName: scanner.location,
        assignedOperatorId: scanner.assignedOperatorId,
        customNotes: scanner.customNotes,
      },
    });
  };

  const closeEditScannerModal = () => {
    setEditScannerState({
      isOpen: false,
      scanner: null,
    });
  };

  const handleEditScannerSubmit = async (updatedScanner) => {
    if (!editScannerState.scanner) return;
    if (!editScannerState.scanner.apiId) {
      const error = new Error("Scanner backend ID is missing");
      toast.error(error.message);
      throw error;
    }

    const payload = {
      scannerId: updatedScanner.scannerId,
      scannerType: updatedScanner.scannerType.toLowerCase(),
      scannerMode: updatedScanner.scannerMode.toLowerCase(),
      ...(updatedScanner.assignedOperatorId
        ? { assignedOperatorId: updatedScanner.assignedOperatorId }
        : {}),
      status: updatedScanner.status.toLowerCase(),
      translations: {
        en: {
          name: updatedScanner.scannerName,
          zoneName: updatedScanner.zoneName,
          notes: updatedScanner.customNotes,
        },
        ar: {
          name: updatedScanner.scannerName,
          zoneName: updatedScanner.zoneName,
          notes: updatedScanner.customNotes,
        },
      },
    };

    try {
      const response = await updateScanner(
        editScannerState.scanner.apiId,
        payload,
      );
      toast.success(response?.message || "Scanner updated successfully");
      setIsLoading(true);
      if (onScannerUpdated) onScannerUpdated();
      else setLocalRefreshKey((current) => current + 1);
      return response;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update scanner"));
      throw error;
    }
  };

  const columns = [
    {
      key: "name",
      label: "Scanner Name / ID",
      sortable: true,
      render: (_, row) => (
        <div className="flex min-w-0 items-center gap-3">
          <IconWrapper
            icon={row.type === "Fixed" ? Radio : AlertTriangle}
            variant={
              row.status === "Inactive"
                ? "danger"
                : row.status === "Warning"
                  ? "warning"
                  : "purple"
            }
            sizeClassName="h-8 w-8 shrink-0"
            roundedClassName="rounded-lg"
            iconSize={14}
          />
          <div className="min-w-0">
            <p className="m-0 truncate font-black text-sm text-(--theme-text-primary)">
              {row.name}
            </p>
            <p className="m-0 mt-0.5 font-mono text-[11px] font-semibold text-(--theme-text-muted)">
              {row.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      width: 132,
      render: (_, row) => (
        <Badge
          className=""
          leftIcon={
            row.type === "Fixed" ? (
              <Radio size={12} />
            ) : (
              <Smartphone size={12} />
            )
          }
          size="sm"
          variant={row.type === "Fixed" ? "purple" : "warning"}
        >
          {row.type}
        </Badge>
      ),
    },
    {
      key: "mode",
      label: "Mode",
      sortable: true,
      render: (_, row) => (
        <Badge
          variant={
            row.mode === "Entry"
              ? "info"
              : row.mode === "Exit"
                ? "success"
                : "neutral"
          }
          size="sm"
          className="bg-opacity-10 text-(--theme-text-primary)"
        >
          {row.mode}
        </Badge>
      ),
    },
    {
      key: "location",
      label: "Zone",
      sortable: true,
      render: (_, row) => (
        <span
          className={`text-sm font-medium ${row.location === "Roaming" ? "italic text-(--theme-text-muted)" : "text-(--theme-text-secondary)"}`}
        >
          {row.location}
        </span>
      ),
    },
    {
      key: "operator",
      label: "Operator",
      sortable: true,
      render: (_, row) => (
        <span
          className={`text-sm font-medium ${row.operator ? "text-(--theme-text-secondary)" : "text-(--color-overdue) flex items-center gap-1.5"}`}
        >
          {!row.operator && <AlertTriangle size={14} />}
          {row.operator || "Unassigned"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (_, row) => {
        return (
          <Badge variant={scannerStatusVariantMap[row.status]} size="sm">
            {row.status}
          </Badge>
        );
      },
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
    {
      key: "reads",
      label: "Reads",
      align: "center",
      sortable: true,
      render: (_, row) => (
        <span className="font-mono text-sm font-bold text-(--theme-text-primary)">
          {row.reads || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (_, row) => (
        <ActionDropdown
          align="right"
          items={[
            {
              label: "View Details",
              icon: Eye,
              onClick: () => navigate(`${detailRoutePrefix}/${row.apiId}`),
            },
            {
              label: "Edit Scanner",
              icon: Pencil,
              onClick: () => openEditScannerModal(row),
            },
            {
              label: row.status === "Inactive" ? "Activate" : "Deactivate",
              icon: Power,
              danger: row.status !== "Inactive",
              onClick: () =>
                openStatusModal(
                  row,
                  row.status === "Inactive" ? "activate" : "deactivate",
                ),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <Card padding="0" rounded="18px">
      <div className=" grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <div className="">
          <Input
            leftIcon={<Search size={16} />}
            onChange={handleSearchChange}
            placeholder="Search scanners..."
            value={searchValue}
          />
        </div>
        <div className="w-full ">
          <Dropdown
            leftIcon={
              <Filter size={14} className="text-(--theme-text-muted)" />
            }
            onChange={(value) => handleFilterChange(setTypeFilter, value)}
            options={scannerTypeOptions}
            value={typeFilter}
          />
        </div>
        <div className="w-full ">
          <Dropdown
            onChange={(value) => handleFilterChange(setModeFilter, value)}
            options={scannerModeOptions}
            value={modeFilter}
          />
        </div>
        <div className="w-full ">
          <Dropdown
            onChange={(value) => handleFilterChange(setStatusFilter, value)}
            options={scannerStatusOptions}
            value={statusFilter}
          />
        </div>
        <div className="w-full ">
          <Dropdown
            disabled={isOperatorLoading || Boolean(operatorLoadError)}
            onChange={(value) => handleFilterChange(setOperatorFilter, value)}
            options={
              isOperatorLoading
                ? [{ label: "Loading operators...", value: "all" }]
                : operatorLoadError
                  ? [{ label: "Operators unavailable", value: "all" }]
                  : operatorOptions
            }
            search
            value={operatorFilter}
          />
        </div>
      </div>

      <div className="px-4 pb-4">
        {operatorLoadError && (
          <Alert
            className="mb-4 justify-between"
            leftIcon={<AlertTriangle size={18} />}
            variant="warning"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{operatorLoadError}</span>
              <Button
                leftIcon={<RefreshCw size={14} />}
                onClick={retryOperators}
                size="xs"
                variant="secondary"
              >
                Try Again
              </Button>
            </div>
          </Alert>
        )}
        {loadError && (
          <Alert
            className="mb-4 justify-between"
            leftIcon={<AlertTriangle size={18} />}
            variant="danger"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{loadError}</span>
              <Button
                leftIcon={<RefreshCw size={14} />}
                onClick={retryLoad}
                size="xs"
                variant="secondary"
              >
                Try Again
              </Button>
            </div>
          </Alert>
        )}
        <Table
          columns={columns}
          data={sortedData}
          emptyText="No scanners found matching criteria"
          loading={isLoading}
          onSort={handleTableSort}
          rowKey={(row) => row.apiId || row.id}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
        <Pagination
          forcePage={activePage}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={({ selected }) => {
            setIsLoading(true);
            setCurrentPage(selected);
          }}
          pageCount={totalPages}
          totalItems={totalItems}
        />
      </div>

      <ScannerStatusModal
        actionData={statusModalState.scanner ? statusModalState : null}
        isOpen={statusModalState.isOpen}
        isSubmitting={isStatusSubmitting}
        onClose={closeStatusModal}
        onConfirm={handleStatusConfirm}
      />

      <AddScannerModal
        initialValues={editScannerState.scanner || undefined}
        isOpen={editScannerState.isOpen}
        mode="edit"
        onClose={closeEditScannerModal}
        onSubmit={handleEditScannerSubmit}
      />
    </Card>
  );
};

export default ScannerTable;
