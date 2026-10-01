import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, TowelRack, TriangleAlert } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";
import Pagination from "../../../Components/UI/Pagination";
import { useDebouncedSearch } from "../../../Hooks/useDebouncedSearch";
import { useSortableTableData } from "../../../Hooks/useSortableTableData";
import { getApiErrorMessage } from "../../../axios/api";
import {
  getAdminLaundries,
  impersonateAdminLaundry,
} from "../../../axios/laundries/adminLaundries";
import { startImpersonation } from "../../../axios/auth/authSession";
import { connectSocket } from "../../../socket/client";
import { toast } from "../../../Utils/toast";
import AddLaundryModal from "./AddLaundryModal";
import LaundriesTable from "./LaundriesTable";
import LaundryDetailsModal from "./LaundryDetailsModal";
import LaundryStatusModal from "./LaundryStatusModal";
import Stats from "./Stats";
import {
  LAUNDRY_ITEMS_PER_PAGE,
  laundryStatusOptions,
  getLaundryPaginatedCollection,
  normalizeLaundry,
} from "./data";

const Laundries = () => {
  const navigate = useNavigate();
  const [laundryRows, setLaundryRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedSearch(searchValue);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedLaundry, setSelectedLaundry] = useState(null);
  const [statusAction, setStatusAction] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [accessingId, setAccessingId] = useState(null);

  const handleAccessPortal = async (laundry) => {
    try {
      setAccessingId(laundry.id);
      const res = await impersonateAdminLaundry(laundry.id);
      startImpersonation(res, window.location.pathname + window.location.search);
      connectSocket();
      toast.success(`Accessing ${laundry.companyName || "Laundry"} portal...`);
      navigate("/laundry/dashboard");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to access laundry portal"));
    } finally {
      setAccessingId(null);
    }
  };

  useEffect(() => {
    let isActive = true;

    getAdminLaundries({
      page: currentPage + 1,
      limit: LAUNDRY_ITEMS_PER_PAGE,
      ...(debouncedSearch ? { keywords: debouncedSearch, search: debouncedSearch } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    })
      .then((response) => {
        if (!isActive) return;

        const collection = getLaundryPaginatedCollection(response);
        setLaundryRows(collection.rows.map(normalizeLaundry));
        setSummary(collection.summary);
        setTotalItems(collection.totalItems);
        setTotalPages(collection.totalPages);
        setLoadError("");
      })
      .catch((error) => {
        if (!isActive) return;

        const message = getApiErrorMessage(error, "Unable to load laundries");
        setLaundryRows([]);
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
  }, [currentPage, debouncedSearch, refreshKey, statusFilter]);

  const { handleSort, sortedData, sortBy, sortDirection } =
    useSortableTableData(laundryRows);

  const activePage = totalPages > 0 ? Math.min(currentPage, totalPages - 1) : 0;

  const reloadLaundries = () => {
    setIsLoading(true);
    setRefreshKey((current) => current + 1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-(--color-aurora-teal)/12 text-(--color-aurora-teal)">
              <TowelRack size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-(--theme-text-primary) md:text-3xl">
                Laundries
              </h1>
            </div>
          </div>
        </div>

        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => setIsAddModalOpen(true)}
          rounded="12px"
          size="sm"
        >
          Register Laundry
        </Button>
      </div>

      {/* Summary Stats */}
      <Stats
        loading={isLoading && !summary}
        pageCount={laundryRows.length}
        summary={summary}
      />

      {/* Main Table Card */}
      <Card padding="0" rounded="20px">
        {/* Filters and Controls */}
        <div className="border-b border-(--theme-border) p-4 md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-md">
              <Input
                aria-label="Search laundries"
                leftIcon={<Search size={16} />}
                onChange={(val) => {
                  const text = typeof val === "string" ? val : val?.target?.value || "";
                  setSearchValue(text);
                  setCurrentPage(0);
                }}
                placeholder="Search by facility name, contact, email, location..."
                value={searchValue}
              />
            </div>

            <div className="w-full sm:w-48">
              <Dropdown
                aria-label="Filter by status"
                label=""
                onChange={(val) => {
                  setIsLoading(true);
                  setStatusFilter(val);
                  setCurrentPage(0);
                }}
                options={laundryStatusOptions}
                value={statusFilter}
              />
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {loadError && (
          <div className="p-4 md:p-5">
            <Alert
              leftIcon={<TriangleAlert size={18} />}
              rounded="rounded-xl"
              variant="danger"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="m-0 text-sm font-semibold">{loadError}</p>
                <Button onClick={reloadLaundries} size="xs" variant="outline">
                  Retry
                </Button>
              </div>
            </Alert>
          </div>
        )}

        {/* Table View */}
        <div className="p-4 md:p-5">
          <LaundriesTable
            accessingId={accessingId}
            data={sortedData}
            loading={isLoading}
            onAccessPortal={handleAccessPortal}
            onSort={handleSort}
            onStatusAction={setStatusAction}
            onViewDetails={setSelectedLaundry}
            sortBy={sortBy}
            sortDirection={sortDirection}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 border-t border-(--theme-border) pt-4">
              <Pagination
                currentPage={activePage}
                onPageChange={(nextPage) => {
                  setIsLoading(true);
                  setCurrentPage(nextPage);
                }}
                totalItems={totalItems}
                totalPages={totalPages}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Details Modal */}
      {selectedLaundry && (
        <LaundryDetailsModal
          laundry={selectedLaundry}
          onClose={() => setSelectedLaundry(null)}
        />
      )}

      {/* Status Toggle Modal */}
      {statusAction && (
        <LaundryStatusModal
          actionData={statusAction}
          onClose={() => setStatusAction(null)}
          onSaved={() => {
            setStatusAction(null);
            reloadLaundries();
          }}
        />
      )}

      {/* Add Laundry Modal */}
      <AddLaundryModal
        onClose={() => setIsAddModalOpen(false)}
        onSaved={() => {
          setIsAddModalOpen(false);
          reloadLaundries();
        }}
        open={isAddModalOpen}
      />
    </div>
  );
};

export default Laundries;
