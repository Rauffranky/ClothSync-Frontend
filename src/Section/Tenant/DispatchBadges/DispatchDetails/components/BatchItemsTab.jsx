import { useState } from "react";
import { Eye, Folder, MapPin, Search, Tag, X } from "lucide-react";
import Badge from "../../../../../Components/UI/Badge";
import Button from "../../../../../Components/UI/Button";
import Card from "../../../../../Components/UI/Card";
import Dropdown from "../../../../../Components/UI/Dropdown";
import Input from "../../../../../Components/UI/Input";
import Pagination from "../../../../../Components/UI/Pagination";
import Table from "../../../../../Components/UI/Table";

const categoryFilterOptions = [
  { label: "Category", value: "all" },
  { label: "Towels", value: "Towels" },
  { label: "Uniforms", value: "Uniforms" },
  { label: "Bedsheets", value: "Bedsheets" },
  { label: "Pillow Covers", value: "Pillow Covers" },
];

const statusFilterOptions = [
  { label: "Status", value: "all" },
  { label: "Sent to Laundry", value: "Sent to Laundry" },
  { label: "In Laundry", value: "In Laundry" },
  { label: "Sent to Business", value: "Sent to Business" },
  { label: "Returned", value: "Returned" },
  { label: "Delayed", value: "Delayed" },
];

const PROGRESS_BADGE_VARIANTS = {
  "Sent to Laundry": "pending",
  "In Laundry": "purple",
  "Sent to Business": "ready",
  "Returned": "completed",
  "Delayed": "overdue",
};

const BatchItemsTab = ({ items = [] }) => {
  const [searchValue, setSearchValue] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const hasActiveFilters =
    searchValue.trim() !== "" ||
    categoryFilter !== "all" ||
    statusFilter !== "all";

  const handleReset = () => {
    setSearchValue("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setCurrentPage(0);
  };

  const filteredItems = items.filter((item) => {
    const searchLower = searchValue.toLowerCase().trim();
    const matchesSearch =
      !searchLower ||
      item.epc.toLowerCase().includes(searchLower) ||
      item.assetName.toLowerCase().includes(searchLower) ||
      item.assetId.toLowerCase().includes(searchLower);

    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      item.currentStatus === statusFilter ||
      item.itemProgress === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalItems = filteredItems.length;
  const pageCount = Math.ceil(totalItems / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  const columns = [
    {
      label: "TAG EPC",
      accessor: "epc",
      render: (val) => (
        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
          {val}
        </span>
      ),
    },
    {
      label: "ASSET NAME",
      accessor: "assetName",
      render: (val) => (
        <span className="font-bold text-(--theme-text-primary)">{val}</span>
      ),
    },
    {
      label: "ASSET ID",
      accessor: "assetId",
      render: (val) => (
        <span className="text-xs font-semibold text-(--theme-text-secondary)">
          {val}
        </span>
      ),
    },
    {
      label: "CATEGORY",
      accessor: "category",
      render: (val) => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-(--theme-surface-strong) border border-(--theme-border) text-xs font-semibold text-(--theme-text-secondary)">
          <Folder size={13} className="text-(--theme-text-secondary)" />
          <span>{val}</span>
        </div>
      ),
    },
    {
      label: "CURRENT STATUS",
      accessor: "currentStatus",
      render: (val) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {val}
        </span>
      ),
    },
    {
      label: "LAST SCAN",
      accessor: "lastScan",
      render: (val) => (
        <span className="text-xs text-(--theme-text-secondary) font-medium">
          {val}
        </span>
      ),
    },
    {
      label: "LAST LOCATION",
      accessor: "lastLocation",
      render: (val) => (
        <div className="flex items-center gap-1 text-xs text-(--theme-text-secondary) font-medium">
          <MapPin size={13} className="shrink-0 text-(--theme-text-secondary)" />
          <span>{val}</span>
        </div>
      ),
    },
    {
      label: "ITEM PROGRESS",
      accessor: "itemProgress",
      render: (val) => {
        const variant = PROGRESS_BADGE_VARIANTS[val] || "neutral";
        return (
          <Badge variant={variant} size="md">
            {val}
          </Badge>
        );
      },
    },
    {
      label: "ACTIONS",
      key: "actions",
      sortable: false,
      align: "center",
      render: () => (
        <div className="flex items-center gap-1.5 justify-center">
          <Button
            variant="outline"
            leftIcon={<Eye size={13} />}
            size={{ minHeight: 30, padding: "0 10px" }}
            className="rounded-lg text-xs font-semibold text-cyan-600 border-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
          >
            Asset
          </Button>
          <Button
            variant="outline"
            leftIcon={<Tag size={13} />}
            size={{ minHeight: 30, padding: "0 10px" }}
            className="rounded-lg text-xs font-semibold text-purple-600 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30"
          >
            Tag
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card className="space-y-4 p-4 mt-4" rounded="20px">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="w-full sm:w-60">
            <Input
              placeholder="Search Asset ID or EPC..."
              value={searchValue}
              onChange={(val) => {
                setSearchValue(val);
                setCurrentPage(0);
              }}
              leftIcon={<Search size={16} className="text-(--theme-text-secondary)" />}
              height="38px"
              rounded="12px"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full sm:w-40">
            <Dropdown
              options={categoryFilterOptions}
              value={categoryFilter}
              onChange={(val) => {
                setCategoryFilter(val);
                setCurrentPage(0);
              }}
              placeholder="Category"
              width="w-full"
              triggerClassName="!min-h-[38px] !h-[38px] !py-0"
              rounded="12px"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-40">
            <Dropdown
              options={statusFilterOptions}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(0);
              }}
              placeholder="Status"
              width="w-full"
              triggerClassName="!min-h-[38px] !h-[38px] !py-0"
              rounded="12px"
            />
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleReset}
              leftIcon={<X size={15} />}
              size={{ minHeight: 38, padding: "0 14px" }}
              className="rounded-xl text-xs font-semibold border-(--theme-border) text-(--theme-text-secondary)"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Items Total Count Label */}
        <div className="text-xs font-bold text-(--theme-text-secondary) self-end sm:self-auto">
          {totalItems}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-(--theme-border) overflow-hidden">
        <Table columns={columns} data={paginatedItems} emptyText="No items in this batch" />
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <Pagination
          pageCount={pageCount}
          forcePage={currentPage}
          onPageChange={({ selected }) => setCurrentPage(selected)}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}
    </Card>
  );
};

export default BatchItemsTab;
