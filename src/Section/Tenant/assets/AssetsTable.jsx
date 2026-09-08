import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Shirt,
  Unlink,
  Bed,
  Bath,
  Waves,
  Utensils,
  Eye,
  Edit,
  Archive,
  RefreshCw,
} from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import IconWrapper from "../../../Components/UI/IconWrapper";
import Badge from "../../../Components/UI/Badge";
import ProgressBar from "../../../Components/UI/ProgressBar";
import Input from "../../../Components/UI/Input";
import Dropdown from "../../../Components/UI/Dropdown";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import Table from "../../../Components/UI/Table";
import Pagination from "../../../Components/UI/Pagination";
import { useDebouncedSearch } from "../../../Hooks/useDebouncedSearch";
import { useSortableTableData } from "../../../Hooks/useSortableTableData";
import {
  assetStatusOptions,
  getTenantAssetCollection,
} from "./data";
import { getApiErrorMessage } from "../../../axios/api";
import { getTenantAssets } from "../../../axios/assets/tenantAssets";
import { getTenantCategories } from "../../../axios/categories/tenantCategories";
import { getTenantLaundries } from "../../../axios/laundries/tenantLaundries";
import EditAssetModal from "./EditAssetModal";

const ITEMS_PER_PAGE = 20;

const getItems = (response, keys) => {
  const payload = response?.data ?? response ?? {};
  return keys.map((key) => payload?.[key]).find(Array.isArray) || [];
};

const getCategoryOptions = (response) => [
  { label: "All Categories", value: "all" },
  ...getItems(response, ["items", "categories", "docs"]).map((category) => ({
    label: category.title || category.name || category.translations?.en?.title || "Unnamed Category",
    value: category.id || category._id,
  })).filter((option) => option.value),
];

const getLaundryOptions = (response) => [
  { label: "All Laundries", value: "all" },
  ...getItems(response, ["items", "laundries", "docs"]).map((link) => {
    const laundry = (typeof link.laundry === "object" && link.laundry !== null) ? link.laundry : link;
    return {
      label:
        link.laundryName ||
        laundry.laundryName ||
        laundry.businessName ||
        laundry.companyName ||
        laundry.name ||
        laundry.translations?.en?.name ||
        "Unnamed Laundry",
      value: link.id || link._id,
    };
  }).filter((option) => option.value),
];

const categoryIcons = {
  "Bed Linen": Bed,
  "Bath Towels": Bath,
  "Staff Uniforms": Shirt,
  "Table Linen": Utensils,
  "Pool Towels": Waves,
};

const AssetsTable = ({ onCountsChange }) => {
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedSearch(searchValue);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [laundryFilter, setLaundryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [categoryOptions, setCategoryOptions] = useState([{ label: "All Categories", value: "all" }]);
  const [zoneOptions, setZoneOptions] = useState([{ label: "All Zones", value: "all" }]);
  const [laundryOptions, setLaundryOptions] = useState([{ label: "All Laundries", value: "all" }]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [editAssetModalOpen, setEditAssetModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const requestIdRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;
    Promise.all([
      getTenantCategories({ status: "active", optionsOnly: true }),
      getTenantLaundries({ optionsOnly: true }),
    ])
      .then(([categoriesResponse, laundriesResponse]) => {
        if (!isActive) return;
        setCategoryOptions(getCategoryOptions(categoriesResponse));
        setLaundryOptions(getLaundryOptions(laundriesResponse));
      })
      .catch(() => {
        if (!isActive) return;
        setCategoryOptions([{ label: "All Categories", value: "all" }]);
        setLaundryOptions([{ label: "All Laundries", value: "all" }]);
      })
      .finally(() => {
        if (isActive) setIsLoadingFilters(false);
      });
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    // Loading synchronizes this table with the external server collection.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);

    getTenantAssets({
      page: currentPage + 1,
      limit: ITEMS_PER_PAGE,
      ...(debouncedSearch ? { keywords: debouncedSearch } : {}),
      ...(categoryFilter !== "all" ? { categoryId: categoryFilter } : {}),
      ...(zoneFilter !== "all" ? { zoneName: zoneFilter } : {}),
      ...(laundryFilter !== "all" ? { laundryLinkId: laundryFilter } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    })
      .then((response) => {
        if (requestId !== requestIdRef.current) return;
        const collection = getTenantAssetCollection(response, ITEMS_PER_PAGE);
        setRows(collection.rows);
        setTotalItems(collection.pagination.totalItems);
        setPageCount(collection.pagination.totalPages);
        onCountsChange?.(collection.counts);
        const zones = collection.zones.length
          ? collection.zones
          : collection.rows.map((asset) => asset.zoneName).filter((zone) => zone && zone !== "—");
        setZoneOptions([
          { label: "All Zones", value: "all" },
          ...[...new Set(zones)].map((zone) => ({ label: zone, value: zone })),
        ]);
        setLoadError("");
      })
      .catch((error) => {
        if (requestId !== requestIdRef.current) return;
        setRows([]);
        setTotalItems(0);
        setPageCount(0);
        setLoadError(getApiErrorMessage(error, "Unable to load assets"));
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setIsLoading(false);
      });

    return () => {
      requestIdRef.current += 1;
    };
  }, [categoryFilter, currentPage, debouncedSearch, laundryFilter, onCountsChange, retryKey, statusFilter, zoneFilter]);

  const { handleSort, sortedData, sortBy, sortDirection } =
    useSortableTableData(rows);
  const activePage = pageCount > 0 ? Math.min(currentPage, pageCount - 1) : 0;

  const resetCurrentPage = () => setCurrentPage(0);

  const openEditAssetModal = (asset) => {
    setSelectedAsset(asset);
    setEditAssetModalOpen(true);
  };

  const closeEditAssetModal = () => {
    setEditAssetModalOpen(false);
    setSelectedAsset(null);
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);
    resetCurrentPage();
  };

  const handleTableSort = (nextSortBy, nextSortDirection) => {
    handleSort(nextSortBy, nextSortDirection);
    resetCurrentPage();
  };

  const columns = [
    {
      key: "name",
      label: "Asset ID / Name",
      sortable: true,
      render: (_, row) => {
        const CategoryIcon = categoryIcons[row.category] || Shirt;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <IconWrapper
              icon={CategoryIcon}
              variant={row.statusVariant}
              hasAlert={false}
              sizeClassName="h-10 w-10 shrink-0"
              roundedClassName="rounded-xl"
              iconSize={18}
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
        );
      },
    },
    {
      key: "tag",
      label: "RFID Tag",
      sortable: true,
      render: (_, row) => {
        const isNoTag = row.tag === "No Tag";
        return (
          <div
            className={`flex items-center gap-1.5 text-xs font-bold ${isNoTag ? "text-(--color-overdue)" : "text-(--color-sky-blue)"}`}
          >
            {isNoTag ? <Unlink size={14} /> : <Link size={14} />}
            {row.tag}
          </div>
        );
      },
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (_, row) => (
        <span className="text-sm font-medium text-(--theme-text-secondary)">
          {row.category}
        </span>
      ),
    },
    {
      align: "center",
      key: "status",
      label: "Status",
      sortable: true,
      render: (_, row) => (
        <Badge variant={row.statusVariant} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      key: "washCount",
      label: "Wash Count",
      sortable: true,
      render: (_, row) => {
        const isCritical = row.washCount >= row.maxWash * 0.9;
        return (
          <div className="min-w-16 max-w-20">
            <div className="flex items-end gap-1 mb-1.5">
              <span
                className={`text-sm font-black ${isCritical ? "text-(--color-overdue)" : "text-(--theme-text-primary)"}`}
              >
                {row.washCount}
              </span>
              <span className="text-xs font-semibold text-(--theme-text-muted)">
                / {row.maxWash}
              </span>
            </div>
            <ProgressBar
              value={row.washCount}
              max={row.maxWash}
              variant={isCritical ? "danger" : "success"}
              heightClass="h-1.5"
            />
          </div>
        );
      },
    },
    {
      key: "assignedLaundry",
      label: "Assigned Laundry",
      sortable: true,
      render: (_, row) => (
        <span className="text-[12px] font-medium text-(--theme-text-secondary)">
          {row.assignedLaundry}
        </span>
      ),
    },
    {
      key: "lastScan",
      label: "Last Scan",
      sortKey: "lastScanTime",
      sortable: true,
      render: (_, row) => (
        <div className="min-w-0">
          <p
            className={`m-0 truncate font-mono text-[13px] font-bold ${row.lastScanTime === "Never" ? "italic text-(--theme-text-muted)" : "text-(--theme-text-primary)"}`}
          >
            {row.lastScanTime}
          </p>
          {row.lastScanTime !== "Never" && (
            <p className="truncate text-[10px] font-medium text-(--theme-text-muted)">
              {row.location}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (_, row) => (
        <ActionDropdown
          items={[
            {
              label: "View Details",
              icon: Eye,
              onClick: () => navigate(`/business/assets/${row.apiId}`),
            },
            {
              label: "Edit Assets",
              icon: Edit,
              onClick: () => openEditAssetModal(row),
            },
            { label: "Retire Asset", icon: Archive, danger: true },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="">
      <div className="grid grid-cols-1 gap-2 px-4 py-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div>
          <Input
            leftIcon={<Search size={16} />}
            onChange={handleSearchChange}
            placeholder="Search by asset ID, name, tag..."
            value={searchValue}
          />
        </div>
        <div>
          <Dropdown
            disabled={isLoadingFilters}
            onChange={(val) => {
              setCategoryFilter(val);
              resetCurrentPage();
            }}
            options={categoryOptions}
            value={categoryFilter}
          />
        </div>
        <div>
          <Dropdown
            onChange={(val) => {
              setZoneFilter(val);
              resetCurrentPage();
            }}
            options={zoneOptions}
            value={zoneFilter}
          />
        </div>
        <div>
          <Dropdown
            disabled={isLoadingFilters}
            onChange={(val) => {
              setLaundryFilter(val);
              resetCurrentPage();
            }}
            options={laundryOptions}
            value={laundryFilter}
          />
        </div>
        <div>
          <Dropdown
            leftIcon={
              <Search size={14} className="text-(--theme-text-muted)" />
            }
            onChange={(val) => {
              setStatusFilter(val);
              resetCurrentPage();
            }}
            options={assetStatusOptions}
            value={statusFilter}
          />
        </div>
      </div>

      <div className="px-4 pb-4">
        {loadError && (
          <Alert className="mb-4" variant="danger">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{loadError}</span>
              <Button
                leftIcon={<RefreshCw size={15} />}
                onClick={() => setRetryKey((current) => current + 1)}
                size="sm"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </Alert>
        )}
        <Table
          columns={columns}
          data={sortedData}
          emptyText="No assets found"
          loading={isLoading}
          onSort={handleTableSort}
          onRowClick={(row) => navigate(`/business/assets/${row.apiId}`)}
          rowKey="id"
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
        <Pagination
          forcePage={activePage}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={({ selected }) => setCurrentPage(selected)}
          pageCount={pageCount}
          totalItems={totalItems}
        />
      </div>

      <EditAssetModal
        key={selectedAsset?.id || "edit-asset"}
        asset={selectedAsset}
        isOpen={editAssetModalOpen}
        onClose={closeEditAssetModal}
      />
    </div>
  );
};

export default AssetsTable;
