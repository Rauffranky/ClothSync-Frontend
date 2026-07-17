import { useEffect, useState } from "react";
import {
  Plus,
  RefreshCw,
  Search,
  TriangleAlert,
} from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";
import Pagination from "../../../Components/UI/Pagination";
import {
  getSearchQuery,
  useDebouncedSearch,
} from "../../../Hooks/useDebouncedSearch";
import { useSortableTableData } from "../../../Hooks/useSortableTableData";
import { getApiErrorMessage } from "../../../axios/api";
import { getTenantCategories } from "../../../axios/categories/tenantCategories";
import { toast } from "../../../Utils/toast";
import AddCategoryModal from "./AddCategoryModal";
import CategoriesTable from "./CategoriesTable";
import CategoryStatusModal from "./CategoryStatusModal";
import EditCategoryModal from "./EditCategoryModal";
import Stats from "./Stats";
import {
  CATEGORY_ITEMS_PER_PAGE,
  categoryStatusOptions,
  categoryUsageOptions,
  getCategoryPaginatedCollection,
  normalizeCategory,
} from "./data";

const Categories = () => {
  const [categoryRows, setCategoryRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedSearch(searchValue);
  const [statusFilter, setStatusFilter] = useState("all");
  const [usageFilter, setUsageFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [statusAction, setStatusAction] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    getTenantCategories({
      page: currentPage + 1,
      limit: CATEGORY_ITEMS_PER_PAGE,
      ...(debouncedSearch ? { keywords: debouncedSearch } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      ...(usageFilter !== "all" ? { use: usageFilter } : {}),
    })
      .then((response) => {
        if (!isActive) return;

        const collection = getCategoryPaginatedCollection(response);
        setCategoryRows(collection.rows.map(normalizeCategory));
        setSummary(collection.summary);
        setTotalItems(collection.totalItems);
        setTotalPages(collection.totalPages);
        setLoadError("");
      })
      .catch((error) => {
        if (!isActive) return;

        const message = getApiErrorMessage(
          error,
          "Unable to load categories",
        );
        setCategoryRows([]);
        setSummary(null);
        setTotalItems(0);
        setTotalPages(0);
        setLoadError(message);
        toast.error(message);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [currentPage, debouncedSearch, refreshKey, statusFilter, usageFilter]);

  const { handleSort, sortedData, sortBy, sortDirection } =
    useSortableTableData(categoryRows);
  const activePage = totalPages > 0 ? Math.min(currentPage, totalPages - 1) : 0;

  const reloadCategories = ({ resetPage = false } = {}) => {
    setIsAddModalOpen(false);
    setEditingCategory(null);
    setStatusAction(null);
    setIsLoading(true);
    setLoadError("");

    if (resetPage && currentPage !== 0) {
      setCurrentPage(0);
      return;
    }

    setRefreshKey((current) => current + 1);
  };

  const handleSearchChange = (value) => {
    if (getSearchQuery(value) !== debouncedSearch) setIsLoading(true);
    setSearchValue(value);
    setCurrentPage(0);
  };

  const handleStatusFilterChange = (value) => {
    setIsLoading(true);
    setStatusFilter(value);
    setCurrentPage(0);
  };

  const handleUsageFilterChange = (value) => {
    setIsLoading(true);
    setUsageFilter(value);
    setCurrentPage(0);
  };

  const handleTableSort = (nextSortBy, nextSortDirection) => {
    handleSort(nextSortBy, nextSortDirection);
    setCurrentPage(0);
  };

  return (
    <div className="space-y-5">
      <Stats loading={isLoading && !summary} summary={summary} />

      {loadError && (
        <Alert leftIcon={<TriangleAlert size={18} />} variant="danger">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{loadError}</span>
            <Button
              leftIcon={<RefreshCw size={15} />}
              onClick={() => reloadCategories()}
              size="sm"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </Alert>
      )}

      <Card padding="0" rounded="18px">
        <div className="grid gap-3 border-b border-(--theme-border) px-4 py-4 lg:grid-cols-[minmax(240px,1fr)_170px_170px_auto]">
          <Input
            leftIcon={<Search size={16} />}
            onChange={handleSearchChange}
            placeholder="Search categories..."
            value={searchValue}
          />
          <Dropdown
            onChange={handleStatusFilterChange}
            options={categoryStatusOptions}
            value={statusFilter}
          />
          <Dropdown
            onChange={handleUsageFilterChange}
            options={categoryUsageOptions}
            value={usageFilter}
          />
          <Button
            leftIcon={<Plus size={16} />}
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            variant="secondary"
          >
            Add Category
          </Button>
        </div>

        <div className="px-4 py-4">
          <CategoriesTable
            data={sortedData}
            loading={isLoading}
            onEditCategory={setEditingCategory}
            onSort={handleTableSort}
            onStatusAction={setStatusAction}
            sortBy={sortBy}
            sortDirection={sortDirection}
          />
          <Pagination
            forcePage={activePage}
            itemsPerPage={CATEGORY_ITEMS_PER_PAGE}
            onPageChange={({ selected }) => {
              setIsLoading(true);
              setCurrentPage(selected);
            }}
            pageCount={totalPages}
            totalItems={totalItems}
          />
        </div>
      </Card>

      {isAddModalOpen && (
        <AddCategoryModal
          onClose={() => setIsAddModalOpen(false)}
          onSaved={() => reloadCategories({ resetPage: true })}
          open
        />
      )}
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSaved={() => reloadCategories()}
        />
      )}
      {statusAction && (
        <CategoryStatusModal
          actionData={statusAction}
          onClose={() => setStatusAction(null)}
          onSaved={() => reloadCategories()}
        />
      )}
    </div>
  );
};

export default Categories;
