import { useEffect, useState, useMemo } from "react";
import { Building2, Search, Eye, Send, Ban } from "lucide-react";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import Badge from "../../../Components/UI/Badge";
import IconWrapper from "../../../Components/UI/IconWrapper";
import Input from "../../../Components/UI/Input";
import Pagination from "../../../Components/UI/Pagination";
import Table from "../../../Components/UI/Table";
import { 
  getPendingTenantLaundryInvites,
  resendTenantLaundryInvite,
  cancelTenantLaundryInvite
} from "../../../axios/laundries/tenantLaundries";
import { getApiErrorMessage } from "../../../axios/api";
import { formatDate } from "../../../Utils/date";
import { toast } from "../../../Utils/toast";
import { getPaginatedCollection, normalizePendingInvite } from "./utils";
import PendingActionModal from "./PendingActionModal";

const ITEMS_PER_PAGE = 5;

const PendingRequest = ({ onTotalChange }) => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [pendingAction, setPendingAction] = useState(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  const columns = useMemo(() => [
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
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (_, row) => (
        <ActionDropdown
          items={[
            { label: "View Detail", icon: Eye, onClick: () => {} },
            { label: "Resend", icon: Send, onClick: () => setPendingAction({ action: "resend", request: row }) },
            { label: "Cancel Invite", icon: Ban, danger: true, onClick: () => setPendingAction({ action: "cancel", request: row }) },
          ]}
          width={180}
        />
      ),
    },
  ], []);

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

  const handleActionConfirm = async (actionData) => {
    const { action, request } = actionData;
    setIsActionSubmitting(true);
    try {
      if (action === "resend") {
        const response = await resendTenantLaundryInvite(request.id);
        toast.success(response?.message || "Invitation resent successfully");
      } else if (action === "cancel") {
        const response = await cancelTenantLaundryInvite(request.id);
        toast.success(response?.message || "Invitation cancelled successfully");
        setRequests((current) => current.filter((r) => r.id !== request.id));
        const newTotal = totalItems > 0 ? totalItems - 1 : 0;
        setTotalItems(newTotal);
        onTotalChange?.(newTotal);
      }
      setPendingAction(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, `Failed to ${action} invitation`));
    } finally {
      setIsActionSubmitting(false);
    }
  };

  return (
    <>
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

      <PendingActionModal
        isOpen={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        actionData={pendingAction}
        onConfirm={handleActionConfirm}
        isSubmitting={isActionSubmitting}
      />
    </>
  );
};

export default PendingRequest;
