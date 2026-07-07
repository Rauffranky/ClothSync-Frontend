import { useMemo, useState } from "react";
import { Eye, Radio } from "lucide-react";
import Badge from "../../../../../../Components/UI/Badge";
import Button from "../../../../../../Components/UI/Button";
import Pagination from "../../../../../../Components/UI/Pagination";
import Table from "../../../../../../Components/UI/Table";
import { useSortableTableData } from "../../../../../../Hooks/useSortableTableData";

const ITEMS_PER_PAGE = 10;

const TagHistoryTab = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const { handleSort, sortedData, sortBy, sortDirection } = useSortableTableData(data.tagHistory);
  const pageCount = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const activePage = pageCount > 0 ? Math.min(currentPage, pageCount - 1) : 0;
  const paginatedTags = useMemo(() => {
    const startIndex = activePage * ITEMS_PER_PAGE;
    return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [activePage, sortedData]);

  const handleTableSort = (nextSortBy, nextSortDirection) => {
    handleSort(nextSortBy, nextSortDirection);
    setCurrentPage(0);
  };

  const columns = [
    {
      key: "epc",
      label: "Tag EPC",
      sortable: true,
      render: (value, row) => (
        <div className="flex min-w-0 items-center gap-2">
          <Radio
            className="shrink-0 text-(--color-sky-blue)"
            size={15}
            strokeWidth={2.2}
          />
          <span className="max-w-38 truncate font-mono text-sm font-semibold text-(--color-sky-blue)">
            {value}
          </span>
          <span className="sr-only">{row.id}</span>
        </div>
      ),
    },
    {
      key: "id",
      label: "Tag ID",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm font-black text-(--theme-text-primary)">
          {value}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (_, row) => (
        <Badge variant={row.variant} size="sm" rounded="rounded-lg">
          {row.status}
        </Badge>
      ),
    },
    {
      key: "linkedDate",
      label: "Linked Date",
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-(--theme-text-primary)">
          {value}
        </span>
      ),
    },
    {
      key: "unlinkedDate",
      label: "Unlinked Date",
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-(--theme-text-primary)">
          {value || "-"}
        </span>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      sortable: true,
      render: (value) => (
        <span className="max-w-60 whitespace-normal font-semibold leading-relaxed text-(--theme-text-primary)">
          {value}
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
        data={paginatedTags}
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

export default TagHistoryTab;
