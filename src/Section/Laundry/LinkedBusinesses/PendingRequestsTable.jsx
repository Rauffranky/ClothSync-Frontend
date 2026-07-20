import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Check,
  MapPin,
  RefreshCw,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import { hasPermission } from "../../../Utils/permissions";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import IconWrapper from "../../../Components/UI/IconWrapper";
import Input from "../../../Components/UI/Input";
import Pagination from "../../../Components/UI/Pagination";
import Table from "../../../Components/UI/Table";
import {
  getSearchQuery,
  useDebouncedSearch,
} from "../../../Hooks/useDebouncedSearch";
import { getApiErrorMessage } from "../../../axios/api";
import {
  acceptLaundryTenantRequest,
  getLaundryTenantPendingRequests,
  rejectLaundryTenantRequest,
} from "../../../axios/laundryTenants/laundryTenants";
import { formatDateWithUserPreferences } from "../../../Utils/date";
import { toast } from "../../../Utils/toast";
import {
  getLaundryTenantCollection,
  normalizePendingTenantRequest,
} from "./data";
import RequestActionModal from "./RequestActionModal";

const ITEMS_PER_PAGE = 10;

const PendingRequestsTable = ({ onRequestResolved }) => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedSearch(searchValue);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [actionData, setActionData] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;

    getLaundryTenantPendingRequests({
      page: currentPage + 1,
      limit: ITEMS_PER_PAGE,
      ...(debouncedSearch ? { keywords: debouncedSearch } : {}),
    })
      .then((response) => {
        if (!isActive) return;
        const collection = getLaundryTenantCollection(response, ITEMS_PER_PAGE);

        setRequests(collection.rows.map(normalizePendingTenantRequest));
        setTotalItems(collection.totalItems);
        setTotalPages(collection.totalPages);
        setLoadError("");
      })
      .catch((error) => {
        if (!isActive) return;
        const message = getApiErrorMessage(
          error,
          "Unable to load pending connection requests",
        );
        setRequests([]);
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
  }, [currentPage, debouncedSearch, refreshKey]);

  const activePage = totalPages > 0 ? Math.min(currentPage, totalPages - 1) : 0;

  const openAction = (action, request) => {
    if (!request.apiId || !request.canRespond) return;
    setRejectionReason("");
    setActionData({ action, request });
  };

  const closeAction = () => {
    if (isSubmitting) return;
    setActionData(null);
    setRejectionReason("");
  };

  const reloadRequests = () => {
    setIsLoading(true);
    setLoadError("");
    if (currentPage !== 0) setCurrentPage(0);
    else setRefreshKey((key) => key + 1);
  };

  const handleConfirm = async () => {
    if (!actionData?.request?.apiId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response =
        actionData.action === "accept"
          ? await acceptLaundryTenantRequest(actionData.request.apiId)
          : await rejectLaundryTenantRequest(
              actionData.request.apiId,
              rejectionReason,
            );

      toast.success(
        response?.message ||
          `Connection request ${actionData.action === "accept" ? "accepted" : "rejected"} successfully`,
      );
      setActionData(null);
      setRejectionReason("");
      reloadRequests();
      onRequestResolved?.();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          `Unable to ${actionData.action} this connection request`,
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Business",
        render: (_, row) => (
          <div className="flex min-w-0 items-center gap-3">
            <IconWrapper
              icon={Building2}
              iconSize={16}
              roundedClassName="rounded-full"
              sizeClassName="h-9 w-9 shrink-0"
              variant="warning"
            />
            <div className="min-w-0">
              <p className="m-0 truncate font-black text-(--theme-text-primary)">
                {row.name}
              </p>
              <p className="m-0 mt-0.5 text-xs font-semibold text-(--theme-text-muted)">
                {row.initials}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "contactName",
        label: "Contact Person",
        render: (_, row) => (
          <div className="min-w-0">
            <p className="m-0 font-bold text-(--theme-text-primary)">
              {row.contactName}
            </p>
            <p className="m-0 mt-0.5 text-xs font-semibold text-(--theme-text-muted)">
              {row.contactEmail}
            </p>
          </div>
        ),
      },
      {
        key: "location",
        label: "Location",
        render: (value) => (
          <span className="flex items-center gap-1.5">
            <MapPin size={14} />
            {value}
          </span>
        ),
      },
      {
        key: "requestedAt",
        label: "Request Date",
        render: (value) => (
          <span className="text-xs font-semibold text-(--theme-text-muted)">
            {value ? formatDateWithUserPreferences(value) : "-"}
          </span>
        ),
      },
      {
        key: "requestType",
        label: "Request Type",
        render: (value) => (
          <Badge size="sm" variant="neutral">
            {value}
          </Badge>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (_, row) => (
          <Badge dot size="sm" variant={row.statusVariant}>
            {row.status}
          </Badge>
        ),
      },
      {
        align: "center",
        key: "actions",
        label: "Actions",
        render: (_, row) => {
          const disabled =
            !hasPermission("linked_tenants", "approve") ||
            !row.apiId ||
            !row.canRespond ||
            isSubmitting;

          return (
            <ActionDropdown
              disabled={disabled}
              items={[
                {
                  icon: Check,
                  label: "Accept Request",
                  onClick: () => openAction("accept", row),
                },
                {
                  danger: true,
                  icon: X,
                  label: "Reject Request",
                  onClick: () => openAction("reject", row),
                },
              ]}
              triggerAriaLabel={`Open actions for ${row.name}`}
              width={190}
            />
          );
        },
      },
    ],
    [isSubmitting],
  );

  const handleSearchChange = (value) => {
    if (getSearchQuery(value) !== debouncedSearch) setIsLoading(true);
    setSearchValue(value);
    setCurrentPage(0);
  };

  return (
    <>
      <div className="space-y-4 px-4 py-4">
        <div className="max-w-md">
          <Input
            leftIcon={<Search size={16} />}
            onChange={handleSearchChange}
            placeholder="Search pending businesses..."
            value={searchValue}
          />
        </div>

        {loadError && (
          <Alert leftIcon={<TriangleAlert size={18} />} variant="danger">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{loadError}</span>
              <Button
                leftIcon={<RefreshCw size={15} />}
                onClick={reloadRequests}
                size="sm"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </Alert>
        )}

        <Table
          columns={columns}
          data={requests}
          emptyText="No pending connection requests found"
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

      <RequestActionModal
        actionData={actionData}
        isSubmitting={isSubmitting}
        onClose={closeAction}
        onConfirm={handleConfirm}
        onReasonChange={setRejectionReason}
        rejectionReason={rejectionReason}
      />
    </>
  );
};

export default PendingRequestsTable;
