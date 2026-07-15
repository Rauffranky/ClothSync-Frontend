import { useEffect, useMemo, useState } from "react";
import { Building2, Search } from "lucide-react";
import Badge from "../../../Components/UI/Badge";
import Dropdown from "../../../Components/UI/Dropdown";
import IconWrapper from "../../../Components/UI/IconWrapper";
import Input from "../../../Components/UI/Input";
import Pagination from "../../../Components/UI/Pagination";
import Table from "../../../Components/UI/Table";
import {
  getSearchQuery,
  useDebouncedSearch,
} from "../../../Hooks/useDebouncedSearch";
import { getApiErrorMessage } from "../../../axios/api";
import { getClosedTenantLaundryInvites } from "../../../axios/laundries/tenantLaundries";
import { formatDateWithUserPreferences } from "../../../Utils/date";
import { toast } from "../../../Utils/toast";
import { getPaginatedCollection, normalizeClosedInvite } from "./utils";

const ITEMS_PER_PAGE = 10;

const statusOptions = [
  { label: "All Closed Statuses", value: "all" },
  { label: "Rejected", value: "rejected" },
  { label: "Expired", value: "expired" },
  { label: "Cancelled", value: "cancelled" },
];

const RejectedLaundries = () => {
  const [closedInvites, setClosedInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedSearch(searchValue);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const columns = useMemo(
    () => [
      {
        sortable: true,
        key: "email",
        label: "Laundry Invitation",
        render: (_, row) => (
          <div className="flex min-w-0 items-center gap-3">
            <IconWrapper
              icon={Building2}
              iconSize={17}
              roundedClassName="rounded-xl"
              sizeClassName="h-10 w-10 shrink-0"
              variant="danger"
            />
            <p className="m-0 truncate font-bold text-(--theme-text-primary)">
              {row.email}
            </p>
          </div>
        ),
      },
      {
        sortable: true,
        key: "status",
        label: "Status",
        render: (_, row) => (
          <Badge size="sm" variant={row.statusVariant}>
            {row.status}
          </Badge>
        ),
      },
      {
        sortable: true,
        key: "closedAt",
        label: "Closed On",
        render: (value) => (
          <span className="text-sm font-semibold text-(--theme-text-muted)">
            {value ? formatDateWithUserPreferences(value) : "-"}
          </span>
        ),
      },
      {
        sortable: true,
        key: "expiresAt",
        label: "Expires On",
        render: (value) => (
          <span className="text-sm font-semibold text-(--theme-text-muted)">
            {value ? formatDateWithUserPreferences(value) : "-"}
          </span>
        ),
      },
      {
        sortable: true,
        key: "cancelledAt",
        label: "Cancelled On",
        render: (value) => (
          <span className="text-sm font-semibold text-(--theme-text-muted)">
            {value ? formatDateWithUserPreferences(value) : "-"}
          </span>
        ),
      },
      {
        sortable: true,
        key: "rejectedAt",
        label: "Rejected On",
        render: (value) => (
          <span className="text-sm font-semibold text-(--theme-text-muted)">
            {value ? formatDateWithUserPreferences(value) : "-"}
          </span>
        ),
      },
      {
        sortable: true,
        key: "reason",
        label: "Reason",
        render: (value) => (
          <span className="max-w-64 truncate text-sm font-semibold text-(--theme-text-secondary)">
            {value}
          </span>
        ),
      },
    ],
    [],
  );

  useEffect(() => {
    let isActive = true;

    getClosedTenantLaundryInvites({
      page: currentPage + 1,
      limit: ITEMS_PER_PAGE,
      ...(debouncedSearch ? { keywords: debouncedSearch } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    })
      .then((response) => {
        if (!isActive) return;
        const collection = getPaginatedCollection(
          response,
          ["closedInvites", "invitations", "invites"],
          ITEMS_PER_PAGE,
        );

        setClosedInvites(collection.rows.map(normalizeClosedInvite));
        setTotalItems(collection.totalItems);
        setTotalPages(collection.totalPages);
      })
      .catch((error) => {
        if (!isActive) return;
        setClosedInvites([]);
        setTotalItems(0);
        setTotalPages(0);
        toast.error(
          getApiErrorMessage(error, "Unable to load closed laundry invitations"),
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [currentPage, debouncedSearch, statusFilter]);

  const activePage = totalPages > 0 ? Math.min(currentPage, totalPages - 1) : 0;

  const handleSearchChange = (value) => {
    if (getSearchQuery(value) !== debouncedSearch) {
      setIsLoading(true);
    }
    setSearchValue(value);
    setCurrentPage(0);
  };

  const handleStatusChange = (value) => {
    setIsLoading(true);
    setStatusFilter(value);
    setCurrentPage(0);
  };

  return (
    <div className="px-4 py-4">
      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(280px,1fr)_250px]">
        <Input
          leftIcon={<Search size={16} />}
          onChange={handleSearchChange}
          placeholder="Search closed invitations..."
          value={searchValue}
        />
        <Dropdown
          onChange={handleStatusChange}
          options={statusOptions}
          value={statusFilter}
        />
      </div>

      <Table
        columns={columns}
        data={closedInvites}
        emptyText="No rejected, expired, or cancelled invitations found"
        loading={isLoading}
        rowKey="id"
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
  );
};

export default RejectedLaundries;
