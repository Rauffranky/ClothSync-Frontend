import { useMemo, useState } from "react";
import {
  Link,
  Search,
  Shirt,
  Unlink,
  Bed,
  Bath,
  Waves,
  Utensils,
  Eye,
  Edit,
  RefreshCw,
  History,
  Archive,
} from "lucide-react";
import IconWrapper from "../../../Components/UI/IconWrapper";
import Badge from "../../../Components/UI/Badge";
import ProgressBar from "../../../Components/UI/ProgressBar";
import Input from "../../../Components/UI/Input";
import Dropdown from "../../../Components/UI/Dropdown";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import Table from "../../../Components/UI/Table";
import Pagination from "../../../Components/UI/Pagination";
import {
  assetsData,
  categoryOptions,
  zoneOptions,
  laundryFilterOptions,
} from "./data";

const ITEMS_PER_PAGE = 10;

const statusFilterOptions = [
  { label: "All Statuses", value: "all" },
  { label: "In Laundry", value: "In Laundry" },
  { label: "Sent to Laundry", value: "Sent to Laundry" },
  { label: "In Business", value: "In Business" },
  { label: "Delayed", value: "Delayed" },
  { label: "Washed", value: "Washed" },
  { label: "Retired", value: "Retired" },
];

const categoryIcons = {
  "Bed Linen": Bed,
  "Bath Towels": Bath,
  "Staff Uniforms": Shirt,
  "Table Linen": Utensils,
  "Pool Towels": Waves,
};

const AssetsTable = () => {
  const [searchValue, setSearchValue] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [laundryFilter, setLaundryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);

  const filteredAssets = useMemo(() => {
    return assetsData.filter((asset) => {
      const search = searchValue.trim().toLowerCase();
      const matchesSearch =
        !search ||
        [asset.name, asset.id, asset.tag]
          .join(" ")
          .toLowerCase()
          .includes(search);
      const matchesCategory =
        categoryFilter === "all" || asset.category === categoryFilter;
      const matchesZone =
        zoneFilter === "all" || asset.location.includes(zoneFilter);
      const matchesLaundry =
        laundryFilter === "all" || asset.assignedLaundry === laundryFilter;
      const matchesStatus =
        statusFilter === "all" || asset.status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesZone &&
        matchesLaundry &&
        matchesStatus
      );
    });
  }, [searchValue, categoryFilter, zoneFilter, laundryFilter, statusFilter]);

  const pageCount = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
  const activePage = pageCount > 0 ? Math.min(currentPage, pageCount - 1) : 0;
  const paginatedAssets = useMemo(() => {
    const startIndex = activePage * ITEMS_PER_PAGE;
    return filteredAssets.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [activePage, filteredAssets]);

  const resetCurrentPage = () => setCurrentPage(0);

  const handleSearchChange = (value) => {
    setSearchValue(value);
    resetCurrentPage();
  };

  const columns = [
    {
      key: "name",
      label: "Asset ID / Name",
      render: (_, row) => {
        const CategoryIcon = categoryIcons[row.category] || Shirt;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <IconWrapper
              icon={CategoryIcon}
              variant={row.statusVariant}
              hasAlert={row.status === "Delayed"}
              sizeClassName="h-10 w-10 shrink-0"
              roundedClassName="rounded-xl"
              iconSize={18}
            />
            <div className="min-w-0">
              <p className="m-0 truncate font-bold text-sm text-(--theme-text-primary)">
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
      render: (_, row) => (
        <span className="text-sm font-medium text-(--theme-text-secondary)">
          {row.category}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      render: (_, row) => (
        <Badge variant={row.statusVariant} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      key: "washCount",
      label: "Wash Count",
      render: (_, row) => {
        const isCritical = row.washCount >= row.maxWash * 0.9;
        return (
          <div className="min-w-25 max-w-30">
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
      render: (_, row) => (
        <span className="text-[12px] font-medium text-(--theme-text-secondary)">
          {row.assignedLaundry}
        </span>
      ),
    },
    {
      key: "lastScan",
      label: "Last Scan",
      render: (_, row) => (
        <div className="min-w-0">
          <p
            className={`m-0 truncate font-mono text-[13px] font-bold ${row.lastScanTime === "Never" ? "italic text-(--theme-text-muted)" : "text-(--theme-text-primary)"}`}
          >
            {row.lastScanTime}
          </p>
          {row.lastScanTime !== "Never" && (
            <p className=" truncate text-[10px] font-medium text-(--theme-text-muted)">
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
      render: () => (
        <ActionDropdown
          items={[
            { label: "View Details", icon: Eye },
            { label: "Edit Assets", icon: Edit },
            { label: "Re-Tag Asset", icon: RefreshCw },
            { label: "View History", icon: History },
            { label: "Retire Asset", icon: Archive, danger: true },
          ]}
          width={200}
        />
      ),
    },
  ];

  return (
    <div className="">
      <div className="grid gap-3 px-4 py-4 lg:flex lg:flex-wrap lg:items-center">
        <div className="w-full lg:w-70">
          <Input
            leftIcon={<Search size={16} />}
            onChange={handleSearchChange}
            placeholder="Search by asset ID, name, tag..."
            value={searchValue}
          />
        </div>
        <div className="w-full lg:w-45">
          <Dropdown
            onChange={(val) => {
              setCategoryFilter(val);
              resetCurrentPage();
            }}
            options={categoryOptions}
            value={categoryFilter}
          />
        </div>
        <div className="w-full lg:w-45">
          <Dropdown
            onChange={(val) => {
              setZoneFilter(val);
              resetCurrentPage();
            }}
            options={zoneOptions}
            value={zoneFilter}
          />
        </div>
        <div className="w-full lg:w-50">
          <Dropdown
            onChange={(val) => {
              setLaundryFilter(val);
              resetCurrentPage();
            }}
            options={laundryFilterOptions}
            value={laundryFilter}
          />
        </div>
        <div className="w-full lg:w-50">
          <Dropdown
            leftIcon={
              <Search size={14} className="text-(--theme-text-muted)" />
            }
            onChange={(val) => {
              setStatusFilter(val);
              resetCurrentPage();
            }}
            options={statusFilterOptions}
            value={statusFilter}
          />
        </div>
      </div>

      <div className="px-4 pb-4">
        <Table
          columns={columns}
          data={paginatedAssets}
          emptyText="No assets found"
          rowKey="id"
        />
        <Pagination
          forcePage={activePage}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={({ selected }) => setCurrentPage(selected)}
          pageCount={pageCount}
          totalItems={filteredAssets.length}
        />
      </div>
    </div>
  );
};

export default AssetsTable;
