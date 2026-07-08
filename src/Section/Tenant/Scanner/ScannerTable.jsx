import { useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Filter,
  AlertTriangle,
  Radio,
  Smartphone,
  MoreHorizontal,
} from "lucide-react";
import {
  scannersData,
  scannerTypeOptions,
  scannerModeOptions,
  scannerLocationOptions,
  scannerStatusOptions,
  scannerStatusVariantMap,
} from "./data";
import IconWrapper from "../../../Components/UI/IconWrapper";
import Input from "../../../Components/UI/Input";
import Card from "../../../Components/UI/Card";
import Dropdown from "../../../Components/UI/Dropdown";
import Table from "../../../Components/UI/Table";
import Pagination from "../../../Components/UI/Pagination";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import { useSortableTableData } from "../../../Hooks/useSortableTableData";

const ITEMS_PER_PAGE = 10;

const ScannerTable = () => {
  const [searchValue, setSearchValue] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);

  const filteredScanners = useMemo(() => {
    return scannersData.filter((scanner) => {
      const search = searchValue.trim().toLowerCase();
      const matchesSearch =
        !search ||
        [scanner.name, scanner.id, scanner.operator, scanner.location]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search);
      const matchesType = typeFilter === "all" || scanner.type === typeFilter;
      const matchesMode = modeFilter === "all" || scanner.mode === modeFilter;
      const matchesLocation =
        locationFilter === "all" || scanner.location === locationFilter;
      const matchesStatus =
        statusFilter === "all" || scanner.status === statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesMode &&
        matchesLocation &&
        matchesStatus
      );
    });
  }, [searchValue, typeFilter, modeFilter, locationFilter, statusFilter]);

  const { handleSort, sortedData, sortBy, sortDirection } =
    useSortableTableData(filteredScanners);
  const pageCount = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const activePage = pageCount > 0 ? Math.min(currentPage, pageCount - 1) : 0;
  const paginatedScanners = useMemo(() => {
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
      key: "name",
      label: "Scanner Name / ID",
      sortable: true,
      render: (_, row) => (
        <div className="flex min-w-0 items-center gap-3">
          <IconWrapper
            icon={row.type === "Fixed" ? Radio : AlertTriangle}
            variant={
              row.status === "Inactive"
                ? "neutral"
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
      label: "Location",
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
      render: () => (
        <Button variant="secondary" size="sm" className="px-2">
          <MoreHorizontal size={14} />
        </Button>
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
            onChange={(val) => {
              setTypeFilter(val);
              resetCurrentPage();
            }}
            options={scannerTypeOptions}
            value={typeFilter}
          />
        </div>
        <div className="w-full ">
          <Dropdown
            onChange={(val) => {
              setModeFilter(val);
              resetCurrentPage();
            }}
            options={scannerModeOptions}
            value={modeFilter}
          />
        </div>
        <div className="w-full ">
          <Dropdown
            onChange={(val) => {
              setStatusFilter(val);
              resetCurrentPage();
            }}
            options={scannerStatusOptions}
            value={statusFilter}
          />
        </div>
        <div className="w-full ">
          <Dropdown
            leftIcon={
              <MapPin size={14} className="text-(--theme-text-muted)" />
            }
            onChange={(val) => {
              setLocationFilter(val);
              resetCurrentPage();
            }}
            options={scannerLocationOptions}
            value={locationFilter}
          />
        </div>
      </div>

      <div className="px-4 pb-4">
        <Table
          columns={columns}
          data={paginatedScanners}
          emptyText="No scanners found matching criteria"
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
    </Card>
  );
};

export default ScannerTable;
