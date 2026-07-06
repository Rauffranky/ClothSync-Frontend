import { useState } from "react";
import {
  AlertTriangle,
  CircleCheck,
  CircleX,
  Eye,
  Pencil,
  Tag,
  Trash2,
} from "lucide-react";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Modal from "../../../Components/UI/Modal";
import Table from "../../../Components/UI/Table";
import { categories } from "./data";

const CategoriesTable = ({ data = categories }) => {
  const [deleteCategory, setDeleteCategory] = useState(null);
  const isDeleteModalOpen = Boolean(deleteCategory);
  const hasMappedAssets = Number(deleteCategory?.assets || 0) > 0;

  const closeDeleteModal = () => {
    setDeleteCategory(null);
  };

  const columns = [
    {
      key: "name",
      label: "Category Name",
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
            <p className="m-0 truncate font-black text-(--theme-text-primary)">
              {row.name}
            </p>
            <p className="m-0 mt-0.5 text-xs font-bold text-(--theme-text-muted)">
              {row.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
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
      render: (value) => (
        <span className="text-sm font-bold text-(--theme-text-secondary)">
          {value}
        </span>
      ),
    },
    {
      key: "lastUpdated",
      label: "Last Updated",
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
            { label: "View Details", icon: Eye },
            { label: "Edit Category", icon: Pencil },
            {
              label: "Delete Category",
              icon: Trash2,
              danger: true,
              onClick: () => setDeleteCategory(row),
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
        rowKey="id"
      />

      <Modal
        footer={
          <>
            <Button
              onClick={closeDeleteModal}
              rounded="10px"
              size="sm"
              variant="outline"
            >
              Cancel
            </Button>
            {hasMappedAssets ? (
              <Button
                onClick={closeDeleteModal}
                rounded="10px"
                size="sm"
                variant="success"
              >
                Set to Inactive Instead
              </Button>
            ) : (
              <Button
                leftIcon={<Trash2 size={15} />}
                onClick={closeDeleteModal}
                rounded="10px"
                size="sm"
                variant="danger"
              >
                Confirm Delete
              </Button>
            )}
          </>
        }
        onClose={closeDeleteModal}
        open={isDeleteModalOpen}
        title="Delete Category"
        width={460}
      >
        {deleteCategory && (
          <div className="space-y-3">
            {hasMappedAssets ? (
              <>
                <Alert
                  leftIcon={<AlertTriangle size={18} />}
                  rounded="rounded-xl"
                  variant="danger"
                >
                  <p className="m-0 font-bold">Cannot delete this category</p>
                  <p className="m-0 mt-1 text-sm">
                    <span className="font-bold">
                      "{deleteCategory.name}"
                    </span>{" "}
                    is mapped to {deleteCategory.assets} assets and cannot be
                    deleted. Please remap or remove all assets from this
                    category before deleting.
                  </p>
                </Alert>

                <div className="rounded-xl border border-(--theme-border) bg-(--button-ghost-bg) px-4 py-3 text-sm font-semibold leading-6 text-(--theme-text-secondary)">
                  Alternatively, you can set this category to{" "}
                  <span className="font-black text-(--theme-text-primary)">
                    Inactive
                  </span>{" "}
                  to prevent new asset mappings without removing existing ones.
                </div>
              </>
            ) : (
              <>
                <Alert
                  leftIcon={<AlertTriangle size={18} />}
                  rounded="rounded-xl"
                  variant="danger"
                >
                  <p className="m-0 font-bold">
                    This action cannot be undone
                  </p>
                  <p className="m-0 mt-1 text-sm">
                    You are about to permanently delete{" "}
                    <span className="font-bold">
                      "{deleteCategory.name}"
                    </span>
                    . This category has no mapped assets, so it is safe to
                    delete.
                  </p>
                </Alert>

                <div className="rounded-xl border border-(--theme-border) bg-(--button-ghost-bg) px-4 py-3">
                  {[
                    ["Category", deleteCategory.name],
                    ["Category ID", deleteCategory.id],
                    [
                      "Mapped Assets",
                      `${deleteCategory.assets || 0} - safe to delete`,
                    ],
                  ].map(([label, value]) => (
                    <div
                      className="flex items-center justify-between gap-4 py-1 text-sm"
                      key={label}
                    >
                      <span className="font-semibold text-(--theme-text-muted)">
                        {label}
                      </span>
                      <span
                        className={[
                          "text-right font-bold",
                          label === "Mapped Assets"
                            ? "text-(--badge-ready-text)"
                            : "text-(--theme-text-primary)",
                        ].join(" ")}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default CategoriesTable;
