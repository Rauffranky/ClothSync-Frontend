import { useEffect, useState } from "react";
import { Building2, Search } from "lucide-react";
import Badge from "../../../Components/UI/Badge";
import IconWrapper from "../../../Components/UI/IconWrapper";
import Input from "../../../Components/UI/Input";
import Pagination from "../../../Components/UI/Pagination";
import Table from "../../../Components/UI/Table";
import { getPendingTenantLaundryInvites } from "../../../axios/laundries/tenantLaundries";
import { getApiErrorMessage } from "../../../axios/api";
import { formatDate } from "../../../Utils/date";
import { toast } from "../../../Utils/toast";
import { getPaginatedCollection, normalizePendingInvite } from "./utils";

const ITEMS_PER_PAGE = 5;

const columns = [
  {
    key: "email",
    label: "Laundry Invitation",
    render: (_, row) => (
      <div className="flex min-w-0 items-center gap-3">
        <IconWrapper
          icon={Building2}
          iconSize={17}
          roundedClassName="rounded-xl"
          sizeClassName="h-10 w-10 shrink-0"
          variant="info"
        />
        <p className="m-0 truncate font-bold text-(--theme-text-primary)">
          {row.email}
        </p>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (_, row) => (
      <Badge size="sm" variant={row.statusVariant}>
        {row.status}
      </Badge>
    ),
  },
  {
    key: "sentAt",
    label: "Sent On",
    render: (value) => (
      <span className="text-sm font-semibold text-(--theme-text-muted)">
        {value ? formatDate(value) : "-"}
      </span>
    ),
  },
];

const PendingRequest = ({ onTotalChange }) => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearch = searchValue.trim();

      if (nextSearch !== debouncedSearch) {
        setCurrentPage(0);
        setIsLoading(true);
        setDebouncedSearch(nextSearch);
      }
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [debouncedSearch, searchValue]);

  useEffect(() => {
    let isActive = true;

    getPendingTenantLaundryInvites({
      page: currentPage + 1,
      limit: ITEMS_PER_PAGE,
      ...(debouncedSearch ? { keywords: debouncedSearch } : {}),
    })
      .then((response) => {
        if (!isActive) return;
        const collection = getPaginatedCollection(
          response,
          ["pendingInvites", "invitations", "invites"],
          ITEMS_PER_PAGE,
        );
        setRequests(collection.rows.map(normalizePendingInvite));
        setTotalItems(collection.totalItems);
        setTotalPages(collection.totalPages);
        onTotalChange?.(collection.totalItems);
      })
      .catch((error) => {
        if (!isActive) return;
        setRequests([]);
        setTotalItems(0);
        setTotalPages(0);
        onTotalChange?.(0);
        toast.error(
          getApiErrorMessage(error, "Unable to load pending laundry invitations"),
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [currentPage, debouncedSearch, onTotalChange]);

  const activePage = totalPages > 0 ? Math.min(currentPage, totalPages - 1) : 0;

  return (
    <div className="px-4 py-4">
      <div className="mb-4 max-w-md">
        <Input
          leftIcon={<Search size={16} />}
          onChange={setSearchValue}
          placeholder="Search pending invitations..."
          value={searchValue}
        />
      </div>

      <Table
        columns={columns}
        data={requests}
        emptyText="No pending laundry invitations found"
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

export default PendingRequest;
