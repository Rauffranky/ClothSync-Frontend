import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import Badge from "../../../../../../Components/UI/Badge";
import Button from "../../../../../../Components/UI/Button";
import Pagination from "../../../../../../Components/UI/Pagination";
import Table from "../../../../../../Components/UI/Table";
import { useSortableTableData } from "../../../../../../Hooks/useSortableTableData";

const ITEMS_PER_PAGE = 10;

const StatusChip = ({ status, variant }) => (
  <Badge variant={variant} size="sm" rounded="rounded-lg">
    {status}
  </Badge>
);

const BatchHistoryTab = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const { handleSort, sortedData, sortBy, sortDirection } = useSortableTableData(data.batchHistory);
  const pageCount = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const activePage = pageCount > 0 ? Math.min(currentPage, pageCount - 1) : 0;
  const paginatedBatches = useMemo(() => {
    const startIndex = activePage * ITEMS_PER_PAGE;
    return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [activePage, sortedData]);

  const handleTableSort = (nextSortBy, nextSortDirection) => {
    handleSort(nextSortBy, nextSortDirection);
    setCurrentPage(0);
  };

  const columns = [
    {
      key: "id",
      label: "Batch ID",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm font-black text-(--color-aurora-teal)">
          {value}
        </span>
      ),
    },
    {
      key: "laundry",
      label: "Laundry",
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-(--theme-text-primary)">
          {value}
        </span>
      ),
    },
    {
      key: "dispatchDate",
      label: "Dispatch Date",
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-(--theme-text-primary)">
          {value}
        </span>
      ),
    },
    {
      key: "batchStatus",
      label: "Batch Status",
      sortable: true,
      render: (_, row) => (
        <StatusChip status={row.batchStatus} variant={row.batchStatusVariant} />
      ),
    },
    {
      key: "itemStatus",
      label: "Item Status",
      sortable: true,
      render: (_, row) => (
        <StatusChip status={row.itemStatus} variant={row.itemStatusVariant} />
      ),
    },
    {
      key: "returnedDate",
      label: "Returned",
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-(--theme-text-primary)">
          {value || "-"}
        </span>
      ),
    },
    {
      key: "exceptions",
      label: "Exceptions",
      align: "center",
      sortable: true,
      render: (value) => (
        <span
          className={
            value
              ? "font-black text-(--color-overdue)"
              : "font-semibold text-(--theme-text-muted)"
          }
        >
          {value || "-"}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      align: "right",
      render: () => (
        <Button variant="outline" size="sm" leftIcon={<Eye size={14} />}>
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        compact
        data={paginatedBatches}
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
    </>
  );
};

export default BatchHistoryTab;
