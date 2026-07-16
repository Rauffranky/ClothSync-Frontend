import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CircleCheck,
  CircleX,
  Eye,
  Pencil,
  Tag,
} from "lucide-react";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Modal from "../../../Components/UI/Modal";
import Table from "../../../Components/UI/Table";
import { categories } from "./data";

const CategoriesTable = ({
  data = categories,
  onSort,
  onEditCategory,
  onStatusChange,
  loading = false,
  sortBy,
  sortDirection,
}) => {
  const navigate = useNavigate();
  const [statusAction, setStatusAction] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const isStatusModalOpen = Boolean(statusAction);

  const closeStatusModal = () => {
    setStatusAction(null);
  };

  const requestStatusAction = (category) => {
    setStatusAction({
      action: category.status === "Active" ? "inactive" : "active",
      category,
    });
  };

  const handleConfirmStatusAction = async () => {
    if (!statusAction) return;

    setIsUpdatingStatus(true);
    try {
      await onStatusChange?.(
        statusAction.category.id,
        statusAction.action === "active" ? "Active" : "Inactive",
      );
      setStatusAction(null);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Category Name",
      sortable: true,
      render: (_, row) => (
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
            style={{
              color:
                row.status === "Active" ? "#2563eb" : "var(--theme-text-muted)",
              background:
                row.status === "Active"
                  ? "rgba(37, 99, 235, 0.1)"
                  : "rgba(148, 163, 184, 0.12)",
            }}
          >
            <Tag size={17} />
          </span>
          <div className="min-w-0">
            <p className="m-0 truncate font-bold text-(--theme-text-primary)">
              {row.name}
            </p>
            <p className="m-0 mt-0.5 text-xs text-(--theme-text-muted)">
              {row.categoryCode}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      sortable: true,
      render: (_, row) => (
        <Badge
          leftIcon={
            row.status === "Active" ? (
              <CircleCheck size={12} />
            ) : (
              <CircleX size={12} />
            )
          }
          size="sm"
          variant={row.statusVariant}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: "usage",
      label: "Usage",
      align: "center",
      sortable: true,
      render: (_, row) => (
        <Badge
          size="sm"
          variant={row.usageState === "used" ? "info" : "neutral"}
        >
          {row.usage}
        </Badge>
      ),
    },
    {
      key: "assets",
      label: "Assets",
      align: "center",
      sortable: true,
      render: (value) =>
        value ? (
          <span className="font-black" style={{ color: "#9333ea" }}>
            {value}
          </span>
        ) : (
          <span className="font-black text-(--theme-text-muted)">-</span>
        ),
    },
    {
      key: "created",
      label: "Created",
      sortable: true,
      render: (value) => (
        <span className="text-sm font-bold text-(--theme-text-secondary)">
          {value}
        </span>
      ),
    },
    {
      key: "lastUpdated",
      label: "Last Updated",
      sortable: true,
      render: (value) => (
        <span className="text-sm font-bold text-(--theme-text-secondary)">
          {value}
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
              onClick: () => navigate(`/business/categories/${row.apiId || row.id}`),
            },
            {
              label: "Edit Category",
              icon: Pencil,
              onClick: () => onEditCategory?.(row),
            },
            {
              label: row.status === "Active" ? "Set Inactive" : "Set Active",
              icon: row.status === "Active" ? CircleX : CircleCheck,
              danger: row.status === "Active",
              onClick: () => requestStatusAction(row),
            },
          ]}
          width={210}
        />
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        data={data}
        emptyText="No categories found"
        loading={loading}
        onSort={onSort}
        rowKey="id"
        sortBy={sortBy}
        sortDirection={sortDirection}
      />

      <Modal
        footer={
          <>
            <Button
              onClick={closeStatusModal}
              rounded="10px"
              size="sm"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              leftIcon={
                statusAction?.action === "active" ? (
                  <CircleCheck size={15} />
                ) : (
                  <CircleX size={15} />
                )
              }
              onClick={handleConfirmStatusAction}
              loading={isUpdatingStatus}
              rounded="10px"
              size="sm"
              variant={statusAction?.action === "active" ? "success" : "danger"}
            >
              {statusAction?.action === "active" ? "Set Active" : "Set Inactive"}
            </Button>
          </>
        }
        onClose={closeStatusModal}
        open={isStatusModalOpen}
        title={
          statusAction?.action === "active"
            ? "Set Category Active"
            : "Set Category Inactive"
        }
        width={500}
      >
        {statusAction && (
          <Alert
            leftIcon={<AlertTriangle size={18} />}
            rounded="rounded-xl"
            variant={statusAction.action === "active" ? "info" : "danger"}
          >
            <p className="m-0 font-bold">
              {statusAction.action === "active"
                ? "Confirm active status"
                : "Confirm inactive status"}
            </p>
            <p className="m-0 mt-1 text-sm">
              {statusAction.action === "active" ? (
                <>
                  Set{" "}
                  <span className="font-black">
                    {statusAction.category.name}
                  </span>{" "}
                  as active.
                </>
              ) : (
                <>
                  Set{" "}
                  <span className="font-black">
                    {statusAction.category.name}
                  </span>{" "}
                  as inactive.
                </>
              )}
            </p>
          </Alert>
        )}
      </Modal>
    </>
  );
};

export default CategoriesTable;
