import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Building2, LogIn, LogOut, MapPin } from "lucide-react";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Table from "../../../Components/UI/Table";
import Pagination from "../../../Components/UI/Pagination";
import ProgressBar from "../../../Components/UI/ProgressBar";
import SelectionCheckbox from "../../Tenant/BulkScanning/components/SelectionCheckbox";
import useTagSelection from "../../Tenant/BulkScanning/components/useTagSelection";
import { formatDateTime } from "../../../Utils/date";
import { formatStatusLabel } from "../../../Utils/status";
import { toast } from "../../../Utils/toast";

const WashCount = ({ count, limit }) => {
  if (count == null) return <span>—</span>;
  if (limit == null || limit <= 0)
    return (
      <span className="font-bold text-(--theme-text-primary)">{count}</span>
    );
  const isCritical = count >= limit * 0.9;
  return (
    <div className="min-w-16 max-w-20">
      <div className="mb-1 flex items-end gap-1">
        <span
          className={`text-sm font-black ${isCritical ? "text-(--color-overdue)" : "text-(--theme-text-primary)"}`}
        >
          {count}
        </span>
        <span className="text-xs font-semibold text-(--theme-text-muted)">
          / {limit}
        </span>
      </div>
      <ProgressBar
        heightClass="h-1.5"
        max={limit}
        value={count}
        variant={isCritical ? "danger" : "success"}
      />
    </div>
  );
};

const BulkScanEntriesTable = ({
  rows = [],
  loading = false,
  pagination = {},
  onPageChange,
  onSelectionChange,
  onCreateComplaint,
  onCheckIn,
  onCheckOut,
  isActionInProgress = false,
  isManualMode = false,
  emptyText = "No scanned RFID tags detected yet. Start a scan to view live entries.",
}) => {
  const navigate = useNavigate();
  const { allSelected, selectedIds, someSelected, toggleAll, toggleRow } =
    useTagSelection(rows);

  useEffect(() => {
    onSelectionChange?.(selectedIds);
  }, [selectedIds, onSelectionChange]);

  const eligibleSelectedCount = useMemo(() => {
    return rows.filter(
      (r) =>
        selectedIds.has(r.id) &&
        !r.isUnassigned &&
        r.status !== "unassigned" &&
        r.status !== "unlinked" &&
        Boolean(r.tenantId || r.businessName) &&
        Boolean(r.activeBatchName || r.lastBatchName || r.resolvedBatchName),
    ).length;
  }, [rows, selectedIds]);

  const handleCreateComplaint = () => {
    const selectedRows = rows.filter((r) => selectedIds.has(r.id));
    if (onCreateComplaint) {
      onCreateComplaint(selectedRows);
      return;
    }

    if (selectedRows.length === 0) {
      toast.error("Please select at least one tag to file a complaint.");
      return;
    }

    const isTagLinked = (tag) =>
      !tag.isUnassigned &&
      tag.status !== "unassigned" &&
      tag.status !== "unlinked" &&
      Boolean(tag.tenantId || tag.businessName);

    const hasTagBatch = (tag) =>
      Boolean(
        tag.activeBatchName ||
        tag.lastBatchName ||
        tag.resolvedBatchName,
      );

    const eligibleTags = [];
    for (const tag of selectedRows) {
      if (isTagLinked(tag) && hasTagBatch(tag)) {
        const activeBatch =
          tag.activeBatchName ||
          (tag.batchType === "active" ? tag.resolvedBatchName : null);
        const lastBatch =
          tag.lastBatchName ||
          (tag.batchType === "last_linked" ? tag.resolvedBatchName : null) ||
          (!activeBatch ? tag.resolvedBatchName : null);

        if (activeBatch) {
          eligibleTags.push({
            ...tag,
            resolvedBatchName: activeBatch,
            batchType: "active",
          });
        } else if (lastBatch) {
          eligibleTags.push({
            ...tag,
            resolvedBatchName: lastBatch,
            batchType: "last_linked",
          });
        }
      }
    }

    if (eligibleTags.length === 0) {
      toast.error(
        "This tag is not linked to any business partner or batch, so a complaint cannot be filed.",
      );
      return;
    }

    const primaryTag = eligibleTags[0];
    const tenantId = eligibleTags.find((r) => r.tenantId)?.tenantId || "";
    const partnerName =
      eligibleTags.find((r) => r.businessName)?.businessName || "";

    const tagDetails = eligibleTags
      .map(
        (t, idx) =>
          `${idx + 1}. Tag EPC: ${t.epc}\n   Asset Name: ${t.assetName || "Standard Linen"}\n   Batch Name: ${t.resolvedBatchName} (${t.batchType === "active" ? "Active Batch" : "Last Linked Batch"})\n   Business Partner: ${t.businessName || partnerName || "N/A"}`,
      )
      .join("\n\n");

    navigate("/laundry/complaints/create", {
      state: {
        recipientId: tenantId,
        partnerName,
        batchName: primaryTag.resolvedBatchName,
        batchType: primaryTag.batchType,
        assetName: primaryTag.assetName || "Standard Linen",
        epc: primaryTag.epc,
        subject: `Tag Discrepancy - Batch ${primaryTag.resolvedBatchName} (${eligibleTags.length} Tag(s))`,
        description: `Complaint regarding scanned RFID tag(s) and batch discrepancy:\n\n${tagDetails}\n\nRemarks / Observed Issue:\n`,
        selectedTags: eligibleTags,
      },
    });
  };

  const columns = useMemo(
    () => [
      {
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
      },
      {
        key: "epc",
        label: "Tag EPC",
        render: (value) => (
          <span className="rounded bg-(--theme-surface-strong)/50 px-2 py-1 font-mono text-xs font-bold text-(--theme-text-primary)">
            {value || "—"}
          </span>
        ),
      },
      {
        key: "partner",
        label: "Business Partner",
        render: (_, row) => {
          const isUnassigned =
            row.isUnassigned ||
            row.status === "unassigned" ||
            row.status === "unlinked" ||
            !row.businessName ||
            row.businessName === "—" ||
            row.businessName === "Linked Business";

          if (isUnassigned || !row.businessName) {
            return (
              <span className="text-xs italic text-(--theme-text-muted)">
                —
              </span>
            );
          }

          const partnerName =
            row.businessName ||
            row.tenant?.businessName ||
            row.tenant?.fullName ||
            row.business;

          return (
            <div className="flex items-center gap-1.5 font-semibold text-(--theme-text-primary)">
              <Building2
                size={14}
                className="shrink-0 text-(--theme-text-muted)"
              />
              <span className="truncate max-w-42.5">{partnerName}</span>
            </div>
          );
        },
      },
      {
        key: "item",
        label: "Item / Category",
        render: (_, row) => {
          const isUnassigned =
            row.isUnassigned ||
            row.status === "unassigned" ||
            row.status === "unlinked" ||
            !row.businessName ||
            row.businessName === "Linked Business";

          if (isUnassigned) {
            return (
              <span className="text-xs font-medium text-(--theme-text-muted)">
                Unassigned Tag
              </span>
            );
          }

          const title =
            row.assetName ||
            row.asset?.assetName ||
            row.categoryName ||
            row.category?.name ||
            "Standard Item";
          return (
            <div className="truncate font-medium text-(--theme-text-primary)">
              {title}
            </div>
          );
        },
      },
      {
        key: "batch",
        label: "Batch Association",
        render: (_, row) => {
          if (row.activeBatchName) {
            return (
              <Badge size="sm" variant="primary">
                Active: {row.activeBatchName}
              </Badge>
            );
          }
          if (row.lastBatchName) {
            return (
              <Badge size="sm" variant="purple">
                Last: {row.lastBatchName}
              </Badge>
            );
          }
          if (row.resolvedBatchName) {
            return (
              <Badge
                size="sm"
                variant={row.batchType === "active" ? "primary" : "purple"}
              >
                {row.batchType === "active" ? "Active" : "Last"}:{" "}
                {row.resolvedBatchName}
              </Badge>
            );
          }
          return (
            <span className="text-xs italic text-(--theme-text-muted)">
              — (No Batch)
            </span>
          );
        },
      },
      {
        key: "washCount",
        label: "Wash Cycles",
        render: (_, row) => {
          const isUnassigned =
            row.isUnassigned ||
            row.status === "unassigned" ||
            row.status === "unlinked" ||
            !row.businessName ||
            row.businessName === "Linked Business";

          if (isUnassigned || row.washCount == null) {
            return <span className="text-xs text-(--theme-text-muted)">—</span>;
          }

          return (
            <WashCount
              count={row.washCount ?? row.asset?.washCount ?? 0}
              limit={row.washLimit ?? row.asset?.washLimit ?? 50}
            />
          );
        },
      },
      {
        key: "tagWashCount",
        label: "Tag Wash Count",
        render: (_, row) => {
          const isUnassigned =
            row.isUnassigned ||
            row.status === "unassigned" ||
            row.status === "unlinked";

          const count =
            row.tagWashCount ??
            row.tag?.totalLaundryCycles ??
            row.totalLaundryCycles ??
            (isUnassigned ? null : (row.washCount ?? 0));
          const limit =
            row.tagWashLimit ??
            row.tag?.washLimit ??
            row.washLimit ??
            null;

          if (isUnassigned || count == null) {
            return <span className="text-xs text-(--theme-text-muted)">—</span>;
          }

          return (
            <WashCount
              count={Number(count) || 0}
              limit={limit != null ? Number(limit) : null}
            />
          );
        },
      },
      {
        key: "status",
        label: "Status",
        render: (_, row) => {
          const isUnassigned =
            row.isUnassigned ||
            row.status === "unassigned" ||
            row.status === "unlinked" ||
            !row.businessName ||
            row.businessName === "Linked Business";

          if (isUnassigned) {
            return (
              <Badge size="sm" variant="warning">
                Unassigned
              </Badge>
            );
          }

          const rawStatus = row.status || row.tagStatus || "scanned";
          let variant = "info";
          if (
            rawStatus === "received" ||
            rawStatus === "in_laundry" ||
            rawStatus === "at_laundry"
          )
            variant = "primary";
          else if (
            rawStatus === "completed" ||
            rawStatus === "dispatched" ||
            rawStatus === "washed"
          )
            variant = "success";
          return (
            <Badge size="sm" variant={variant}>
              {formatStatusLabel(rawStatus)}
            </Badge>
          );
        },
      },
      {
        key: "scannedAt",
        label: "Scan Time",
        render: (value, row) => (
          <span className="text-xs text-(--theme-text-muted)">
            {formatDateTime(value || row.createdAt || new Date())}
          </span>
        ),
      },
      {
        key: "location",
        label: "Scanner Location",
        render: (value) => (
          <span className="flex items-center gap-1.5 text-xs text-(--theme-text-secondary)">
            <MapPin size={13} className="text-(--theme-text-muted)" />
            {value || "Main Floor"}
          </span>
        ),
      },
    ],
    [allSelected, selectedIds, someSelected, toggleAll, toggleRow],
  );

  return (
    <div className="space-y-4">
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--color-aurora-teal)/30 bg-(--color-aurora-teal)/10 px-4 py-2 text-xs font-semibold text-(--theme-text-primary)">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">{selectedIds.size} tag(s) selected</span>
            {eligibleSelectedCount === 0 ? (
              <span className="rounded bg-(--color-danger)/15 px-2 py-0.5 text-[11px] font-semibold text-(--color-danger)">
                Not linked to any business or batch
              </span>
            ) : eligibleSelectedCount < selectedIds.size ? (
              <span className="rounded bg-(--color-warning)/15 px-2 py-0.5 text-[11px] font-semibold text-(--color-warning)">
                {eligibleSelectedCount} linked & eligible for complaint
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isManualMode && (
              <>
                <Button
                  disabled={isActionInProgress}
                  leftIcon={<LogIn size={14} />}
                  loading={isActionInProgress}
                  onClick={() => {
                    const selectedRows = rows.filter((r) => selectedIds.has(r.id));
                    onCheckIn?.(selectedRows);
                  }}
                  size="sm"
                  variant="primary"
                >
                  Check In ({selectedIds.size})
                </Button>
                <Button
                  disabled={isActionInProgress}
                  leftIcon={<LogOut size={14} />}
                  loading={isActionInProgress}
                  onClick={() => {
                    const selectedRows = rows.filter((r) => selectedIds.has(r.id));
                    onCheckOut?.(selectedRows);
                  }}
                  size="sm"
                  variant="secondary"
                >
                  Check Out ({selectedIds.size})
                </Button>
              </>
            )}
            <Button
              className={eligibleSelectedCount === 0 ? "opacity-75" : ""}
              leftIcon={<AlertTriangle size={14} />}
              onClick={handleCreateComplaint}
              size="sm"
              title={
                eligibleSelectedCount === 0
                  ? "Selected tag(s) are not linked to any business or batch"
                  : undefined
              }
              variant="outline"
            >
              Complaint (
              {eligibleSelectedCount > 0
                ? eligibleSelectedCount
                : selectedIds.size}
              )
            </Button>
            <button
              className="ml-1 cursor-pointer text-xs font-medium text-(--theme-text-muted) hover:text-(--theme-text-primary) hover:underline"
              onClick={() => toggleAll(false)}
              type="button"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      <Table
        columns={columns}
        data={rows}
        emptyText={emptyText}
        loading={loading}
        rowKey="id"
      />

      {pagination?.totalPages > 1 && (
        <Pagination
          forcePage={Math.max(0, (pagination.page || 1) - 1)}
          itemsPerPage={pagination.limit || 50}
          onPageChange={onPageChange}
          pageCount={pagination.totalPages || 1}
          totalItems={pagination.total || rows.length}
        />
      )}
    </div>
  );
};

export default BulkScanEntriesTable;
