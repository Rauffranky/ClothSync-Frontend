import {
  Archive,
  ChevronDown,
  Folder,
  LogIn,
  LogOut,
  LoaderCircle,
  MapPin,
  RotateCcw,
} from "lucide-react";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import Badge from "../../../Components/UI/Badge";
import Pagination from "../../../Components/UI/Pagination";
import Table from "../../../Components/UI/Table";
import { formatDateTime } from "../../../Utils/date";
import { formatStatusLabel } from "../../../Utils/status";
import SelectionCheckbox from "./components/SelectionCheckbox";
import useTagSelection from "./components/useTagSelection";
import {
  BULK_SCAN_GROUPS,
  BULK_SCAN_PAGE_LIMIT,
  getSuggestedScanAction,
} from "./data";

const getName = (value, fallback = "-") =>
  value?.assetName ??
  value?.title ??
  value?.name ??
  value?.translations?.en?.assetName ??
  value?.translations?.en?.title ??
  fallback;

const isAutoMode = (mode) =>
  ["auto", "automatic"].includes(String(mode || "").trim().toLowerCase());

const BulkScanEntriesTable = ({
  group,
  loading,
  onExistingAction,
  onRetag,
  onStatusAction,
  onPageChange,
  pagination,
  previewLoading,
  rows,
  scannerMode,
}) => {
  const {
    allSelected,
    selectedIds,
    someSelected,
    toggleAll,
    toggleRow,
  } =
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
    headerInteractive: true,
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
      render: (_, row) => <span>{getName(row.category)}</span>,
    },
    {
      key: "status",
      label: "Status",
      sortable: false,
      render: (_, row) => (
        <Badge size="sm" variant="info">
          {formatStatusLabel(
            row.asset?.statusLabel ?? row.asset?.status ?? row.tagStatus,
          )}
        </Badge>
      ),
    },
    {
      key: "scannedAt",
      label: "Last Scan",
      sortable: false,
      render: (_, row) => <span>{formatDateTime(row.scannedAt)}</span>,
    },
    ...(isAutoMode(scannerMode)
      ? [{
          key: "suggestedAction",
          label: "Suggested Action",
          sortable: false,
          render: (_, row) => {
            const suggestion = getSuggestedScanAction([row]);
            return suggestion ? (
              <Badge size="sm" variant="info">
                {suggestion === "check_in" ? "Check In" : "Check Out"}
              </Badge>
            ) : <span>-</span>;
          },
        }]
      : []),
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
  const selectedRows = rows.filter((row) => selectedIds.has(row.id));
  const suggestedAction = getSuggestedScanAction(selectedRows.length ? selectedRows : rows);
  const selectedCount = selectedRows.length;
  const existingTagActions = [
    {
      disabled: selectedCount === 0 || previewLoading,
      icon: LogIn,
      label: `Check In${suggestedAction === "check_in" ? " — Suggested" : ""}`,
      onClick: () => onExistingAction?.("check_in", selectedRows),
    },
    {
      disabled: selectedCount === 0 || previewLoading,
      icon: LogOut,
      label: `Check Out${suggestedAction === "check_out" ? " — Suggested" : ""}`,
      onClick: () => onExistingAction?.("check_out", selectedRows),
    },
    { disabled: selectedCount !== 1 || previewLoading, icon: RotateCcw, label: "Re-Tag", onClick: () => onRetag?.(selectedRows[0]) },
    { danger: true, disabled: selectedCount !== 1 || previewLoading, icon: Archive, label: "Retire", onClick: () => onStatusAction?.("retire_discard", selectedRows[0]) },
    { danger: true, disabled: selectedCount !== 1 || previewLoading, icon: Archive, label: "Mark Lost", onClick: () => onStatusAction?.("mark_lost", selectedRows[0]) },
  ];
  const showExistingTagActions = group === BULK_SCAN_GROUPS.EXISTING_LINKED;

  return (
    <div className="px-4 pb-4 pt-4">
      {showExistingTagActions && (
        <div className="mb-3 flex justify-end">
          <ActionDropdown
            align="right"
            disabled={previewLoading}
            items={existingTagActions}
            placement="bottom"
            triggerAriaLabel="Open existing linked tag actions"
            triggerIcon={previewLoading
              ? <LoaderCircle aria-hidden="true" className="animate-spin" size={16} />
              : <ChevronDown aria-hidden="true" size={16} />}
            triggerLabel={previewLoading ? "Previewing..." : `Action${selectedCount ? ` (${selectedCount})` : ""}`}
            width={220}
          />
        </div>
      )}
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
