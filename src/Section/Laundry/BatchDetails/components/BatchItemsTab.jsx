import { useMemo, useState } from "react";
import { Search, Tags } from "lucide-react";
import Badge from "../../../../Components/UI/Badge";
import Card from "../../../../Components/UI/Card";
import Input from "../../../../Components/UI/Input";
import Pagination from "../../../../Components/UI/Pagination";
import Table from "../../../../Components/UI/Table";

const itemColumns = [
  {
    key: "epc",
    label: "Tag EPC",
    render: (value) => (
      <span className="font-mono text-xs font-bold tracking-tight text-(--theme-text-primary)">
        {value}
      </span>
    ),
  },
  { key: "tagCode", label: "Tag Code" },
  {
    key: "assetName",
    label: "Asset Name",
    render: (value) => (
      <span className="font-bold text-(--theme-text-primary)">{value}</span>
    ),
  },
  { key: "assetCode", label: "Asset ID" },
  { key: "category", label: "Category" },
  {
    key: "status",
    label: "Status",
    render: (value, row) => (
      <Badge size="sm" variant={row.statusVariant || "neutral"}>
        {value}
      </Badge>
    ),
  },
];

const ITEMS_PER_PAGE = 10;

const BatchItemsTab = ({ items = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);

  const filteredItems = useMemo(() => {
    let result = items;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.epc?.toLowerCase().includes(q) ||
          item.tagCode?.toLowerCase().includes(q) ||
          item.assetName?.toLowerCase().includes(q) ||
          item.assetCode?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") {
      result = result.filter(
        (item) =>
          item.statusValue === statusFilter ||
          item.status?.toLowerCase() === statusFilter.toLowerCase(),
      );
    }
    return result;
  }, [items, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  const pagedItems = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(0);
  };

  return (
    <Card padding="20px 24px" rounded="20px">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Tags className="text-(--color-aurora-teal)" size={18} />
          <h2 className="text-base font-black text-(--theme-text-primary)">
            Batch Items ({items.length})
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64">
            <Input
              leftIcon={<Search size={16} />}
              onChange={handleSearchChange}
              placeholder="Search EPC, asset or code..."
              size="sm"
              value={searchTerm}
            />
          </div>

          <div className="flex gap-1.5 rounded-xl border border-(--theme-border) p-1 text-xs">
            {["all", "sent", "at_laundry", "washed", "missing"].map((st) => (
              <button
                className={`cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition ${
                  statusFilter === st
                    ? "bg-(--theme-surface-hover) text-(--theme-text-primary) shadow-sm"
                    : "text-(--theme-text-muted) hover:text-(--theme-text-primary)"
                }`}
                key={st}
                onClick={() => handleStatusFilter(st)}
                type="button"
              >
                {st === "all" ? "All" : st.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Table
          columns={itemColumns}
          data={pagedItems}
          emptyText="No batch items match the filter criteria."
          rowKey="id"
        />

        {filteredItems.length > ITEMS_PER_PAGE && (
          <div className="mt-4 flex justify-end">
            <Pagination
              forcePage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={({ selected }) => setCurrentPage(selected)}
              pageCount={totalPages}
              totalItems={filteredItems.length}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default BatchItemsTab;
