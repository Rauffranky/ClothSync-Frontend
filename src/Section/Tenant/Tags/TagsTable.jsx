import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Link,
  Search,
  Tag,
  AlertCircle,
  Eye,
  History,
  Ban,
} from "lucide-react";

import {
  tagsData,
  allTagsOptions,
  categoryOptions,
  assetStatusOptions,
  statusOptions,
} from "./data";
import IconWrapper from "../../../Components/UI/IconWrapper";
import Badge from "../../../Components/UI/Badge";
import Input from "../../../Components/UI/Input";
import Dropdown from "../../../Components/UI/Dropdown";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import Table from "../../../Components/UI/Table";
import Pagination from "../../../Components/UI/Pagination";
import { useSortableTableData } from "../../../Hooks/useSortableTableData";

const ITEMS_PER_PAGE = 10;

const TagsTable = () => {
  const [searchValue, setSearchValue] = useState("");
  const [mappingFilter, setMappingFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [assetStatusFilter, setAssetStatusFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  const filteredTags = useMemo(() => {
    return tagsData.filter((tag) => {
      const search = searchValue.trim().toLowerCase();
      const matchesSearch =
        !search ||
        [tag.id, tag.epc, tag.assignedAsset]
          .join(" ")
          .toLowerCase()
          .includes(search);
      const matchesMapping =
        mappingFilter === "all" || tag.mapping === mappingFilter;
      const matchesCategory =
        categoryFilter === "all" || tag.category === categoryFilter;
      const matchesAssetStatus =
        assetStatusFilter === "all" || tag.assetStatus === assetStatusFilter;
      const matchesStatus =
        statusFilter === "all" || tag.tagStatus === statusFilter;

      return (
        matchesSearch &&
        matchesMapping &&
        matchesCategory &&
        matchesAssetStatus &&
        matchesStatus
      );
    });
  }, [
    searchValue,
    mappingFilter,
    categoryFilter,
    assetStatusFilter,
    statusFilter,
  ]);

  const { handleSort, sortedData, sortBy, sortDirection } =
    useSortableTableData(filteredTags);
  const pageCount = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const activePage = pageCount > 0 ? Math.min(currentPage, pageCount - 1) : 0;
  const paginatedTags = useMemo(() => {
    const startIndex = activePage * ITEMS_PER_PAGE;
    return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [activePage, sortedData]);

  const resetCurrentPage = () => setCurrentPage(0);

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
      key: "assetStatus",
      label: "ASSET STATUS",
      sortable: true,
      render: (_, row) => {
        if (row.assetStatus === "—")
          return <span className="text-(--theme-text-muted)">—</span>;

        let variant = "neutral";
        if (row.assetStatus === "In Laundry") variant = "purple";
        else if (row.assetStatus === "Sent to Laundry") variant = "pending";
        else if (row.assetStatus === "In Business") variant = "ready";
        else if (row.assetStatus === "Delayed") variant = "overdue";

        return (
          <Badge variant={variant} size="sm">
            {row.assetStatus}
          </Badge>
        );
      },
    },
    {
      key: "tagStatus",
      label: "TAG STATUS",
      sortable: true,
      render: (_, row) => {
        const isActive = String(row.tagStatus).toLowerCase() === "active";

        return (
          <Badge size="sm" variant={isActive ? "success" : "neutral"}>
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
            { label: "Inactive Tag", icon: Ban, danger: true },
          ]}
          width={180}
        />
      ),
    },
  ];

  return (
    <div className="">
      <div className=" grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <div>
          <Input
            leftIcon={<Search size={16} />}
            onChange={handleSearchChange}
            placeholder="Search by EPC, Tag ID, asset..."
            value={searchValue}
          />
        </div>
        <div>
          <Dropdown
            leftIcon={<Link size={14} className="text-(--theme-text-muted)" />}
            onChange={(val) => {
              setMappingFilter(val);
              resetCurrentPage();
            }}
            options={allTagsOptions}
            value={mappingFilter}
          />
        </div>
        <div>
          <Dropdown
            leftIcon={<Tag size={14} className="text-(--theme-text-muted)" />}
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
        <div>
          <Dropdown
            leftIcon={<Tag size={14} className="text-(--theme-text-muted)" />}
            onChange={(val) => {
              setStatusFilter(val);
              resetCurrentPage();
            }}
            options={statusOptions}
            value={statusFilter}
          />
        </div>
      </div>

      <div className="px-4 pb-4">
        <Table
          columns={columns}
          data={paginatedTags}
          emptyText="No tags found"
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
          totalItems={sortedData.length}
        />
      </div>

      {/* <div className="px-4 py-3 border-t border-(--theme-border-soft) flex items-center justify-between text-xs font-semibold text-(--theme-text-muted)">
                <div>Showing {sortedData.length} tags</div>
                <div className="flex gap-4">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-(--color-ready)"></span> Mapped</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-(--color-slate)"></span> Unmapped</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-(--tenant-primary)"></span> Active</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-(--color-overdue)"></span> Unlinked</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-(--color-ocean-gray)"></span> History</span>
                </div>
            </div> */}
    </div>
  );
};

export default TagsTable;
