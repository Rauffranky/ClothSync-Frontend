import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Link,
  Search,
  Tag,
  AlertCircle,
  Eye,
  History,
  Ban,
  RefreshCw,
} from "lucide-react";

import {
  allTagsOptions,
  assetStatusOptions,
  getTenantTagCollection,
  statusOptions,
} from "./data";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import IconWrapper from "../../../Components/UI/IconWrapper";
import Input from "../../../Components/UI/Input";
import Badge from "../../../Components/UI/Badge";
import Dropdown from "../../../Components/UI/Dropdown";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import Table from "../../../Components/UI/Table";
import Pagination from "../../../Components/UI/Pagination";
import { useSortableTableData } from "../../../Hooks/useSortableTableData";
import { useDebouncedSearch } from "../../../Hooks/useDebouncedSearch";
import { getApiErrorMessage } from "../../../axios/api";
import { getTenantCategories } from "../../../axios/categories/tenantCategories";
import { getTenantTags } from "../../../axios/tags/tenantTags";
import InactiveTagModal from "./InactiveTagModal";

const ITEMS_PER_PAGE = 10;

const getCategoryOptions = (response) => {
  const payload = response?.data ?? response ?? {};
  const items = payload.items ?? payload.categories ?? payload.docs ?? [];
  return [
    { label: "All Categories", value: "all" },
    ...(Array.isArray(items) ? items : []).map((category) => ({
      label:
        category.title ??
        category.name ??
        category.translations?.en?.title ??
        "Unnamed Category",
      value: category.id ?? category._id,
    })).filter((option) => option.value),
  ];
};

const TagsTable = ({ onCountsChange }) => {
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedSearch(searchValue);
  const [mappingFilter, setMappingFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [assetStatusFilter, setAssetStatusFilter] = useState("all");
  const [tagStatusFilter, setTagStatusFilter] = useState("all");
  const [categoryOptions, setCategoryOptions] = useState([
    { label: "All Categories", value: "all" },
  ]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [inactiveTagModalOpen, setInactiveTagModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const requestIdRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    getTenantCategories({ page: 1, limit: 100, status: "active" })
      .then((response) => {
        if (isActive) setCategoryOptions(getCategoryOptions(response));
      })
      .catch(() => {
        if (isActive) {
          setCategoryOptions([{ label: "All Categories", value: "all" }]);
        }
      })
      .finally(() => {
        if (isActive) setIsLoadingCategories(false);
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

    const params = {
      page: currentPage + 1,
      limit: ITEMS_PER_PAGE,
      ...(debouncedSearch ? { keywords: debouncedSearch } : {}),
      ...(mappingFilter !== "all" ? { mappingStatus: mappingFilter } : {}),
      ...(categoryFilter !== "all" ? { categoryId: categoryFilter } : {}),
      ...(assetStatusFilter !== "all"
        ? { assetStatus: assetStatusFilter }
        : {}),
      ...(tagStatusFilter !== "all" ? { tagStatus: tagStatusFilter } : {}),
    };

    getTenantTags(params)
      .then((response) => {
        if (requestId !== requestIdRef.current) return;
        const collection = getTenantTagCollection(response, ITEMS_PER_PAGE);
        setRows(collection.rows);
        setTotalItems(collection.pagination.totalItems);
        setPageCount(collection.pagination.totalPages);
        onCountsChange?.(collection.counts);
        setLoadError("");
      })
      .catch((error) => {
        if (requestId !== requestIdRef.current) return;
        setRows([]);
        setTotalItems(0);
        setPageCount(0);
        setLoadError(getApiErrorMessage(error, "Unable to load tags"));
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setIsLoading(false);
      });

    return () => {
      requestIdRef.current += 1;
    };
  }, [
    assetStatusFilter,
    categoryFilter,
    currentPage,
    debouncedSearch,
    mappingFilter,
    onCountsChange,
    retryKey,
    tagStatusFilter,
  ]);

  const { handleSort, sortedData, sortBy, sortDirection } =
    useSortableTableData(rows);
  const activePage = pageCount > 0 ? Math.min(currentPage, pageCount - 1) : 0;

  const resetCurrentPage = () => setCurrentPage(0);

  const openInactiveTagModal = (tag) => {
    setSelectedTag(tag);
    setInactiveTagModalOpen(true);
  };

  const closeInactiveTagModal = () => {
    setInactiveTagModalOpen(false);
    setSelectedTag(null);
  };

  const handleTableSort = (nextSortBy, nextSortDirection) => {
    handleSort(nextSortBy, nextSortDirection);
    resetCurrentPage();
  };

  const columns = [
    {
      key: "id",
      label: "RFID TAG ID / EPC",
      sortable: true,
      render: (_, row) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative">
            <IconWrapper
              icon={Tag}
              variant="primary"
              sizeClassName="h-8 w-8 shrink-0"
              roundedClassName="rounded-md"
              iconSize={16}
            />
            {row.hasAlert && (
              <div className="absolute -top-1 -left-1 text-(--color-overdue) bg-white rounded-full">
                <AlertCircle
                  size={12}
                  fill="currentColor"
                  className="text-white"
                />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="m-0 truncate font-black text-sm text-(--theme-text-primary)">
              {row.id}
            </p>
            <p className="m-0 mt-0.5 font-mono text-[11px] font-semibold text-(--theme-text-muted)">
              {row.epc}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "mapping",
      label: "MAPPING",
      sortable: true,
      render: (_, row) => (
        <div
          className={`flex items-center gap-1 text-xs font-bold ${row.mapping === "Linked" ? "text-(--color-ready)" : "text-(--theme-text-muted)"}`}
        >
          <Link size={14} />
          {row.mapping}
        </div>
      ),
    },
    {
      key: "assignedAsset",
      label: "ASSIGNED ASSET",
      sortable: true,
      render: (_, row) => {
        if (!row.assetId) {
          return (
            <span className="text-sm italic font-medium text-(--theme-text-muted)">
              {row.assignedAsset}
            </span>
          );
        }
        return (
          <div className="min-w-0">
            <p className="m-0 truncate text-sm font-semibold text-(--theme-text-primary)">
              {row.assignedAsset}
            </p>
            <p className="m-0 mt-0.5 font-mono text-[10px] text-(--color-sky-blue)">
              {row.assetId}
            </p>
          </div>
        );
      },
    },
    {
      key: "category",
      label: "CATEGORY",
      sortable: true,
      render: (_, row) => {
        if (row.category === "—")
          return <span className="text-(--theme-text-muted)">—</span>;
        return <span className="font-semibold">{row.category}</span>;
      },
    },
    {
      align: "center",
      key: "assetStatus",
      label: "ASSET STATUS",
      sortable: true,
      render: (_, row) => {
        if (row.assetStatus === "—")
          return <span className="text-(--theme-text-muted)">—</span>;

        return (
          <Badge variant={row.assetStatusVariant} size="sm">
            {row.assetStatus}
          </Badge>
        );
      },
    },
    {
      align: "center",
      key: "tagStatus",
      label: "TAG STATUS",
      sortable: true,
      render: (_, row) => {
        const isActive = String(row.tagStatus).toLowerCase() === "active";

        return (
          <Badge size="sm" variant={isActive ? "success" : "danger"}>
            {row.tagStatus}
          </Badge>
        );
      },
    },
    {
      key: "lastScanTime",
      label: "LAST SCANNED",
      sortable: true,
      render: (_, row) => {
        if (row.lastScanTime === "Never") {
          return (
            <span className="text-sm italic font-medium text-(--theme-text-muted)">
              Never
            </span>
          );
        }
        return (
          <div className="min-w-0">
            <p className="m-0 truncate font-mono text-[13px] font-semibold text-(--theme-text-primary)">
              {row.lastScanTime}
            </p>
            <p className="truncate text-[10px] text-(--theme-text-muted)">
              {row.location}
            </p>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      label: "CREATED",
      sortable: true,
      render: (_, row) => (
        <div className="font-mono text-[13px] font-semibold text-(--theme-text-primary)">
          {row.createdAt}
        </div>
      ),
    },
    {
      key: "actions",
      label: "ACTIONS",
      align: "center",
      render: (_, row) => (
        <ActionDropdown
          items={[
            {
              label: "View Details",
              icon: Eye,
              onClick: () => navigate(`/business/tags/${row.id}`),
            },
            { label: "View History", icon: History },
            {
              label: "Inactive Tag",
              icon: Ban,
              danger: true,
              onClick: () => openInactiveTagModal(row),
            },
          ]}
          width={180}
        />
      ),
    },
  ];

  return (
    <div className="">
      <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <Input
          leftIcon={<Search size={16} />}
          onChange={(value) => {
            setSearchValue(value);
            resetCurrentPage();
          }}
          placeholder="Search by EPC, Tag ID, asset..."
          value={searchValue}
        />
        <Dropdown
          leftIcon={<Link size={14} className="text-(--theme-text-muted)" />}
          onChange={(value) => {
            setMappingFilter(value);
            resetCurrentPage();
          }}
          options={allTagsOptions}
          value={mappingFilter}
        />
        <Dropdown
          disabled={isLoadingCategories}
          leftIcon={<Tag size={14} className="text-(--theme-text-muted)" />}
          onChange={(value) => {
            setCategoryFilter(value);
            resetCurrentPage();
          }}
          options={categoryOptions}
          placeholder={isLoadingCategories ? "Loading categories..." : "Categories"}
          search
          value={categoryFilter}
        />
        <div>
          <Dropdown
            leftIcon={
              <AlertCircle size={14} className="text-(--theme-text-muted)" />
            }
            onChange={(val) => {
              setAssetStatusFilter(val);
              resetCurrentPage();
            }}
            options={assetStatusOptions}
            value={assetStatusFilter}
          />
        </div>
        <Dropdown
          leftIcon={<Tag size={14} className="text-(--theme-text-muted)" />}
          onChange={(value) => {
            setTagStatusFilter(value);
            resetCurrentPage();
          }}
          options={statusOptions}
          value={tagStatusFilter}
        />
      </div>

      <div className="px-4 pb-4">
        {loadError && (
          <Alert className="mb-4" variant="danger">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{loadError}</span>
              <Button
                leftIcon={<RefreshCw size={15} />}
                onClick={() => {
                  setIsLoading(true);
                  setRetryKey((current) => current + 1);
                }}
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
          emptyText="No tags found"
          loading={isLoading}
          onSort={handleTableSort}
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

      <InactiveTagModal
        isOpen={inactiveTagModalOpen}
        onClose={closeInactiveTagModal}
        tag={selectedTag}
      />
    </div>
  );
};

export default TagsTable;
