import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Filter,
  AlertTriangle,
  Radio,
  Smartphone,
  Eye,
  Pencil,
  Power,
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
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import AddScannerModal from "./AddScannerModal";
import ScannerStatusModal from "./ScannerStatusModal";
import { useSortableTableData } from "../../../Hooks/useSortableTableData";

const ITEMS_PER_PAGE = 10;

const ScannerTable = () => {
  const navigate = useNavigate();
  const [scannerRows, setScannerRows] = useState(scannersData);
  const [searchValue, setSearchValue] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [statusModalState, setStatusModalState] = useState({
    isOpen: false,
    action: null,
    scanner: null,
  });
  const [editScannerState, setEditScannerState] = useState({
    isOpen: false,
    scanner: null,
  });

  const filteredScanners = useMemo(() => {
    return scannerRows.filter((scanner) => {
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
  }, [scannerRows, searchValue, typeFilter, modeFilter, locationFilter, statusFilter]);

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

  const handleStatusConfirm = ({ scanner, action }) => {
    const nextStatus = action === "deactivate" ? "Inactive" : "Active";

    setScannerRows((current) =>
      current.map((item) =>
        item.id === scanner.id
          ? {
              ...item,
              status: nextStatus,
            }
          : item,
      ),
    );
    resetCurrentPage();
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
        assignedOperator: scanner.operator === "Unassigned" ? null : scanner.operator,
        customNotes: "",
      },
    });
  };

  const closeEditScannerModal = () => {
    setEditScannerState({
      isOpen: false,
      scanner: null,
    });
  };

  const handleEditScannerSubmit = (updatedScanner) => {
    if (!editScannerState.scanner) return;

    setScannerRows((current) =>
      current.map((item) =>
        item.id === editScannerState.scanner.id
          ? {
              ...item,
              ...updatedScanner,
            }
          : item,
      ),
    );
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
      render: (_, row) => (
        <ActionDropdown
          align="right"
          items={[
            {
              label: "View Details",
              icon: Eye,
              onClick: () => navigate(`/business/scanners/${row.id}`),
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

      <ScannerStatusModal
        actionData={statusModalState.scanner ? statusModalState : null}
        isOpen={statusModalState.isOpen}
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
