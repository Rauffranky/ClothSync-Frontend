import { Folder, MapPin } from "lucide-react";
import Badge from "../../../Components/UI/Badge";
import Pagination from "../../../Components/UI/Pagination";
import Table from "../../../Components/UI/Table";
import SelectionCheckbox from "./components/SelectionCheckbox";
import useTagSelection from "./components/useTagSelection";
import { BULK_SCAN_GROUPS, BULK_SCAN_PAGE_LIMIT } from "./data";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
};

const getName = (value, fallback = "-") =>
  value?.assetName ??
  value?.title ??
  value?.name ??
  value?.translations?.en?.assetName ??
  value?.translations?.en?.title ??
  fallback;

const BulkScanEntriesTable = ({
  group,
  loading,
  onPageChange,
  pagination,
  rows,
}) => {
  const { allSelected, selectedIds, someSelected, toggleAll, toggleRow } =
    useTagSelection(rows);

  const selectionColumn = {
    key: "checkbox",
    label: (
      <SelectionCheckbox
        checked={allSelected}
        indeterminate={someSelected}
        label="Select all tags on this page"
        onChange={toggleAll}
      />
    ),
    sortable: false,
    width: 48,
    render: (_, row) => (
      <SelectionCheckbox
        checked={selectedIds.has(row.id)}
        label={`Select tag ${row.epc}`}
        onChange={(checked) => toggleRow(row.id, checked)}
      />
    ),
  };

  const commonColumns = [
    ...(group === BULK_SCAN_GROUPS.NEW_UNLINKED ? [] : [selectionColumn]),
    {
      key: "epc",
      label: "Tag EPC",
      sortable: false,
      render: (_, row) => (
        <span className="font-mono text-sm font-bold text-(--theme-text-primary)">
          {row.epc}
        </span>
      ),
    },
  ];

  const newUnlinkedColumns = [
    ...commonColumns,
    {
      key: "scannedAt",
      label: "Scan Time",
      sortable: false,
      render: (_, row) => <span>{formatDateTime(row.scannedAt)}</span>,
    },
    {
      key: "location",
      label: "Scanner Location",
      sortable: false,
      render: (_, row) => (
        <span className="flex items-center gap-1.5">
          <MapPin aria-hidden="true" size={15} /> {row.location}
        </span>
      ),
    },
  ];

  const existingLinkedColumns = [
    ...commonColumns,
    {
      key: "assetName",
      label: "Asset Name",
      sortable: false,
      render: (_, row) => <span>{getName(row.asset)}</span>,
    },
    {
      key: "assetId",
      label: "Asset ID",
      sortable: false,
      render: (_, row) => <span>{row.asset?.assetCode ?? row.asset?.id ?? "-"}</span>,
    },
    {
      key: "category",
      label: "Category",
      sortable: false,
      render: (_, row) => (
        <Badge size="sm" variant="neutral">
          <Folder aria-hidden="true" size={13} /> {getName(row.category)}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: false,
      render: (_, row) => (
        <Badge size="sm" variant="info">
          {row.asset?.statusLabel ?? row.asset?.status ?? row.tagStatus ?? "-"}
        </Badge>
      ),
    },
    {
      key: "scannedAt",
      label: "Last Scan",
      sortable: false,
      render: (_, row) => <span>{formatDateTime(row.scannedAt)}</span>,
    },
  ];

  const detachedColumns = [
    ...commonColumns,
    {
      key: "previousAsset",
      label: "Previous Asset",
      sortable: false,
      render: (_, row) => (
        <span>{getName(row.previousAssignment?.asset ?? row.previousAssignment?.previousAsset)}</span>
      ),
    },
    {
      key: "previousCategory",
      label: "Previous Category",
      sortable: false,
      render: (_, row) => (
        <Badge size="sm" variant="neutral">
          <Folder aria-hidden="true" size={13} />
          {getName(
            row.previousAssignment?.category ??
              row.previousAssignment?.previousCategory,
          )}
        </Badge>
      ),
    },
    {
      key: "linkedAt",
      label: "Linked At",
      sortable: false,
      render: (_, row) => (
        <span>{formatDateTime(row.previousAssignment?.linkedAt)}</span>
      ),
    },
    {
      key: "detachedAt",
      label: "Detached At",
      sortable: false,
      render: (_, row) => (
        <span>{formatDateTime(row.previousAssignment?.detachedAt)}</span>
      ),
    },
  ];

  const columns =
    group === BULK_SCAN_GROUPS.DETACHED
      ? detachedColumns
      : group === BULK_SCAN_GROUPS.EXISTING_LINKED
        ? existingLinkedColumns
        : newUnlinkedColumns;
  const activePage = Math.max((pagination?.page ?? 1) - 1, 0);

  return (
    <div className="px-4 pb-4 pt-4">
      <Table
        columns={columns}
        data={rows}
        emptyText="No tags found in this scan group"
        loading={loading}
        rowKey="id"
        skeletonRows={8}
      />
      <Pagination
        forcePage={activePage}
        itemsPerPage={pagination?.limit ?? BULK_SCAN_PAGE_LIMIT}
        onPageChange={onPageChange}
        pageCount={pagination?.totalPages ?? 0}
        totalItems={pagination?.totalItems ?? 0}
      />
    </div>
  );
};

export default BulkScanEntriesTable;
