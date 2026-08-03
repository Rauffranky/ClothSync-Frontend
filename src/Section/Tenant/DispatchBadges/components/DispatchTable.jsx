import {
  Building2,
  MapPin,
  Package,
  Eye,
  Truck,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionDropdown from "../../../../Components/UI/ActionDropdown";
import Badge from "../../../../Components/UI/Badge";
import Card from "../../../../Components/UI/Card";
import IconWrapper from "../../../../Components/UI/IconWrapper";
import Pagination from "../../../../Components/UI/Pagination";
import Table from "../../../../Components/UI/Table";
import { STATUS_BADGE_VARIANTS } from "../data";

const DispatchTable = ({
  data = [],
  loading = false,
  totalItems = 0,
  pageCount = 0,
  currentPage = 0,
  itemsPerPage = 7,
  onPageChange,
  // onViewDetails,
}) => {
  const navigate = useNavigate();

  const handleRowDetails = (row) => {
    navigate(`/business/dispatch-batches/${row.id}`);
  };

  const columns = [
    {
      label: "BATCH ID",
      accessor: "id",
      render: (_value, row) => (
        <button
          type="button"
          onClick={() => handleRowDetails(row)}
          className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors text-left"
        >
          {row.id}
        </button>
      ),
    },
    {
      label: "LAUNDRY NAME",
      accessor: "laundryName",
      render: (_value, row) => (
        <div className="flex items-center gap-2.5">
          <IconWrapper
            icon={Building2}
            sizeClassName="h-7 w-7"
            iconSize={15}
            roundedClassName="rounded-md"
            variant="neutral"
          />
          <span className="font-semibold text-(--theme-text-primary)">
            {row.laundryName}
          </span>
        </div>
      ),
    },
    {
      label: "DISPATCH LOCATION",
      accessor: "dispatchLocation",
      render: (_value, row) => (
        <div className="flex items-center gap-1.5 text-(--theme-text-secondary) text-xs font-medium">
          <MapPin size={14} className="shrink-0 text-(--theme-text-secondary)" />
          <span>{row.dispatchLocation}</span>
        </div>
      ),
    },
    {
      label: "CREATED",
      accessor: "created",
      render: (_value, row) => (
        <span className="text-xs text-(--theme-text-secondary) font-medium">
          {row.created}
        </span>
      ),
    },
    {
      label: "ITEMS",
      accessor: "items",
      render: (_value, row) => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-(--theme-surface-strong) border border-(--theme-border) text-xs font-bold text-(--theme-text-primary)">
          <Package size={13} className="text-(--theme-text-secondary)" />
          <span>{row.items}</span>
        </div>
      ),
    },
    {
      label: "STATUS",
      accessor: "status",
      render: (_value, row) => {
        const variant = STATUS_BADGE_VARIANTS[row.status] || "neutral";
        return (
          <Badge variant={variant} size="md">
            {row.status}
          </Badge>
        );
      },
    },
    {
      label: "CREATED BY",
      accessor: "createdBy",
      render: (_value, row) => (
        <span className="text-xs text-(--theme-text-primary) font-medium">
          {row.createdBy}
        </span>
      ),
    },
    {
      label: "ACTIONS",
      key: "actions",
      sortable: false,
      align: "center",
      render: (_value, row) => (
        <ActionDropdown
          triggerIcon={<MoreHorizontal size={18} />}
          items={[
            {
              label: "View Details",
              icon: Eye,
              onClick: () => handleRowDetails(row),
            },
            {
              label: "Track Batch",
              icon: Truck,
              onClick: () => handleRowDetails(row),
            },
            {
              label: "Download Manifest",
              icon: FileText,
              onClick: () => handleRowDetails(row),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <Card className="space-y-4">
      <div className="rounded-2xl border border-(--theme-border) bg-(--theme-surface) overflow-hidden shadow-xs">
        <Table
          columns={columns}
          data={data}
          loading={loading}
          emptyText="No dispatch batches found"
        />
      </div>

      {pageCount > 1 && (
        <div className="pt-2">
          <Pagination
            pageCount={pageCount}
            forcePage={currentPage}
            onPageChange={onPageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </Card>
  );
};

export default DispatchTable;
