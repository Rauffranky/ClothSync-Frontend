import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Eye,
  Search,
  Star,
  Unlink,
} from "lucide-react";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";
import Pagination from "../../../Components/UI/Pagination";
import Table from "../../../Components/UI/Table";
import IconWrapper from "../../../Components/UI/IconWrapper";
import {
  getSearchQuery,
  useDebouncedSearch,
} from "../../../Hooks/useDebouncedSearch";
import { useSortableTableData } from "../../../Hooks/useSortableTableData";
import {
  getTenantLaundries,
  unlinkTenantLaundry,
} from "../../../axios/laundries/tenantLaundries";
import { getApiErrorMessage } from "../../../axios/api";
import { toast } from "../../../Utils/toast";
import { getPaginatedCollection, normalizeLinkedLaundry } from "./utils";
import UnlinkLaundryModal from "./UnlinkLaundryModal";
import DefaultConfirmModal from "./DefaultConfirmModal";
import DefaultBlockedModal from "./DefaultBlockedModal";

const ITEMS_PER_PAGE = 3;



const laundryOptions = [
  { label: "All Laundries", value: "all" },
  { label: "Default Only", value: "default" },
  { label: "Non Default", value: "non-default" },
];

const LinkedLaundries = ({ onTotalChange }) => {
  const navigate = useNavigate();
  const [linkedLaundries, setLinkedLaundries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedSearch(searchValue);
  const [laundryFilter, setLaundryFilter] = useState("all");
  const [unlinkLaundry, setUnlinkLaundry] = useState(null);
  const [blockedDefaultLaundry, setBlockedDefaultLaundry] = useState(null);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [defaultAction, setDefaultAction] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const currentDefaultLaundry = linkedLaundries.find(
    (laundry) => laundry.isDefault,
  );

  useEffect(() => {
    let isActive = true;

    getTenantLaundries({
      page: currentPage + 1,
      limit: ITEMS_PER_PAGE,
      ...(debouncedSearch ? { keywords: debouncedSearch } : {}),
      ...(laundryFilter !== "all"
        ? { isDefault: laundryFilter === "default" }
        : {}),
    })
      .then((response) => {
        if (!isActive) return;
        const collection = getPaginatedCollection(
          response,
          ["laundries", "tenantLaundries"],
          ITEMS_PER_PAGE,
        );
        setLinkedLaundries(collection.rows.map(normalizeLinkedLaundry));
        setTotalItems(collection.totalItems);
        setTotalPages(collection.totalPages);
        onTotalChange?.(collection.totalItems);
      })
      .catch((error) => {
        if (!isActive) return;
        setLinkedLaundries([]);
        setTotalItems(0);
        setTotalPages(0);
        onTotalChange?.(0);
        toast.error(
          error?.code === "ECONNABORTED"
            ? "Linked laundries request timed out. Please try again."
            : getApiErrorMessage(error, "Unable to load linked laundries"),
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [currentPage, debouncedSearch, laundryFilter, onTotalChange, refreshKey]);

  const { handleSort, sortedData, sortBy, sortDirection } =
    useSortableTableData(linkedLaundries);
  const activePage = totalPages > 0 ? Math.min(currentPage, totalPages - 1) : 0;

  const resetCurrentPage = () => {
    setCurrentPage(0);
  };

  const handleSearchChange = (value) => {
    if (getSearchQuery(value) !== debouncedSearch) {
      setIsLoading(true);
    }
    setSearchValue(value);
    resetCurrentPage();
  };

 

  const handleLaundryFilterChange = (value) => {
    setLaundryFilter(value);
    resetCurrentPage();
  };

  const handleTableSort = (nextSortBy, nextSortDirection) => {
    handleSort(nextSortBy, nextSortDirection);
    resetCurrentPage();
  };

  const closeUnlinkModal = () => {
    if (isUnlinking) return;
    setUnlinkLaundry(null);
  };

  const requestUnlink = (laundry) => {
    if (laundry.isDefault) {
      setBlockedDefaultLaundry(laundry);
      return;
    }

    setUnlinkLaundry(laundry);
  };

  const closeDefaultConfirmModal = () => {
    setDefaultAction(null);
  };

  const requestDefaultAction = (laundry, action) => {
    if (laundry.status === "Suspend") return;
    setDefaultAction({ action, laundry });
  };

  const handleConfirmDefaultAction = () => {
    if (!defaultAction) return;
    const newDefaultLaundry = defaultAction.laundry;
    setDefaultAction(null);
    
    // Optimistically update UI - mark new default and unmark old default
    setLinkedLaundries((current) =>
      current.map((laundry) => ({
        ...laundry,
        isDefault: laundry.id === newDefaultLaundry.id,
      })),
    );
    
    // Refresh the data after setting default
    setCurrentPage(0);
  };

  const handleConfirmUnlink = async () => {
    if (isUnlinking) return;
    if (!unlinkLaundry?.apiId) {
      toast.error("Invalid laundry data");
      return;
    }

    setIsUnlinking(true);
    try {
      const response = await unlinkTenantLaundry(unlinkLaundry.apiId);
      toast.success(response?.message || "Laundry unlinked successfully");
      setUnlinkLaundry(null);
      setIsLoading(true);
      setCurrentPage(0);
      setRefreshKey((current) => current + 1);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to unlink laundry"));
    } finally {
      setIsUnlinking(false);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Laundry Name",
      sortable: true,
      render: (_, row) => (
        <div className="flex min-w-0 items-center gap-3">
          <IconWrapper
            icon={Building2}
            variant={row.isDefault ? "warning" : "info"}
            sizeClassName="h-9 w-9 shrink-0"
            roundedClassName="rounded-xl"
            iconSize={17}
          />
          <div className="min-w-0 flex items-center gap-2">
            <p className="m-0 truncate text-(--theme-text-primary)">
              {row.name}
            </p>
            {/* {row.isDefault && (
              <Star size={14} className="text-(--color-warning) shrink-0" fill="currentColor" />
            )} */}
            {/* <p className="m-0 mt-0.5 text-xs font-semibold text-(--theme-text-muted)">
              {row.id}
            </p> */}
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      sortable: true,
      render: (_, row) => (
        <div className="min-w-0">
          <p className="m-0 truncate font-bold text-(--theme-text-primary)">
            {row.contact}
          </p>
          <p className="m-0 mt-0.5 truncate text-xs font-semibold text-(--theme-text-muted)">
            {row.email}
          </p>
        </div>
      ),
    },
    { key: "location", label: "Location", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (_, row) => (
        <Badge variant={row.statusVariant} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      key: "isDefault",
      label: "Default",
      sortable: true,
      render: (_, row) =>
        row.isDefault ? (
          <Badge variant="warning" size="sm" leftIcon={<Star size={12} />}>
            Default
          </Badge>
        ) : row.status === "Suspend" ? (
          <span className="font-black text-(--theme-text-muted)">-</span>
        ) : (
          <Button
            leftIcon={<Star size={13} />}
            onClick={() => requestDefaultAction(row, "set")}
            size={{ minHeight: 28, padding: "0 10px", fontSize: "0.75rem" }}
            variant="ghost"
          >
            Set
          </Button>
        ),
    },
    { key: "batches", label: "Batches", align: "center", sortable: true },
    { key: "itemsSent", label: "Items Sent", align: "center", sortable: true },
    {
      key: "missing",
      label: "Missing",
      align: "center",
      sortable: true,
      render: (value) => (
        <span
          className="font-black"
          style={{
            color:
              value > 0 ? "var(--color-overdue)" : "var(--theme-text-muted)",
          }}
        >
          {value > 0 ? value : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (_, row) => (
        <ActionDropdown
          items={[
            { label: "View Details", icon: Eye, onClick: () => navigate(`/business/linked-laundries/${row.apiId || row.id}`) },
            ...(row.status === "Suspend" || row.isDefault
              ? []
              : [
                  {
                    label: "Set As Default",
                    icon: Star,
                    onClick: () =>
                      requestDefaultAction(row, "set"),
                  },
                ]),
            ...(row.status === "Suspend"
              ? []
              : [
                  {
                    label: "Unlink Laundry",
                    icon: Unlink,
                    danger: true,
                    onClick: () => requestUnlink(row),
                  },
                ]),
          ]}
          width={200}
        />
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-wrap gap-3 px-4 py-4">
        <div className="w-full min-w-0 sm:min-w-60 sm:flex-[1_1_280px]">
          <Input
            leftIcon={<Search size={16} />}
            onChange={handleSearchChange}
            placeholder="Search laundries..."
            value={searchValue}
          />
        </div>
       
        <div className="w-full sm:w-60 sm:shrink-0">
          <Dropdown
            onChange={handleLaundryFilterChange}
            options={laundryOptions}
            value={laundryFilter}
          />
        </div>
      </div>

      <div className="px-4 pb-4">
        <Table
          columns={columns}
          data={sortedData}
          emptyText="No linked laundries found"
          loading={isLoading}
          onSort={handleTableSort}
          rowKey="id"
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
        <Pagination
          forcePage={activePage}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={({ selected }) => {
            setIsLoading(true);
            setCurrentPage(selected);
          }}
          pageCount={totalPages}
          totalItems={totalItems}
        />
      </div>

      <UnlinkLaundryModal
        isOpen={Boolean(unlinkLaundry)}
        onClose={closeUnlinkModal}
        laundry={unlinkLaundry}
        onConfirm={handleConfirmUnlink}
        isSubmitting={isUnlinking}
      />

      <DefaultBlockedModal
        isOpen={Boolean(blockedDefaultLaundry)}
        laundry={blockedDefaultLaundry}
        onClose={() => setBlockedDefaultLaundry(null)}
      />

      <DefaultConfirmModal
        isOpen={Boolean(defaultAction)}
        onClose={closeDefaultConfirmModal}
        actionData={defaultAction}
        onConfirm={handleConfirmDefaultAction}
        currentDefaultLaundry={currentDefaultLaundry}
      />
    </>
  );
};

export default LinkedLaundries;
