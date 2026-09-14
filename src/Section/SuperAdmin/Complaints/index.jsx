import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  FileImage,
  RefreshCw,
  Building2,
  TowelRack,
  Clock,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import Card from "../../../Components/UI/Card";
import CardSkeleton from "../../../Components/UI/CardSkeleton";
import IconWrapper from "../../../Components/UI/IconWrapper";
import Button from "../../../Components/UI/Button";
import Badge from "../../../Components/UI/Badge";
import Input from "../../../Components/UI/Input";
import Dropdown from "../../../Components/UI/Dropdown";
import Table from "../../../Components/UI/Table";
import Pagination from "../../../Components/UI/Pagination";
import { getAdminComplaints } from "../../../axios/complaints";
import { getAdminTenants } from "../../../axios/adminTenants/adminTenants";
import { getAdminLaundries } from "../../../axios/laundries/adminLaundries";
import { toast } from "../../../Utils/toast";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "in_review", label: "In Review" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "All Priorities" },
  { value: "low", label: "Low Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "high", label: "High Priority" },
  { value: "urgent", label: "Urgent (Critical)" },
];

const STATS_CONFIG = [
  {
    key: "total",
    label: "Total Complaints",
    helper: "all platform disputes",
    icon: ShieldAlert,
    variant: "primary",
  },
  {
    key: "pending",
    label: "Pending Action",
    helper: "awaiting partner response",
    icon: Clock,
    variant: "warning",
  },
  {
    key: "inReview",
    label: "In Review",
    helper: "active investigations",
    icon: RefreshCw,
    variant: "info",
  },
  {
    key: "resolved",
    label: "Resolved Cases",
    helper: "closed tickets",
    icon: CheckCircle2,
    variant: "success",
  },
];

const getStatusBadge = (status) => {
  switch (status) {
    case "resolved":
      return (
        <Badge variant="success" size="sm">
          Resolved
        </Badge>
      );
    case "in_review":
      return (
        <Badge variant="info" size="sm">
          In Review
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="danger" size="sm">
          Rejected
        </Badge>
      );
    case "pending":
    default:
      return (
        <Badge variant="warning" size="sm">
          Pending
        </Badge>
      );
  }
};

const getPriorityBadge = (priority) => {
  switch (priority) {
    case "urgent":
      return (
        <Badge variant="danger" size="sm">
          Urgent
        </Badge>
      );
    case "high":
      return (
        <Badge variant="warning" size="sm">
          High
        </Badge>
      );
    case "medium":
      return (
        <Badge variant="info" size="sm">
          Medium
        </Badge>
      );
    case "low":
    default:
      return (
        <Badge variant="neutral" size="sm">
          Low
        </Badge>
      );
  }
};

const SuperAdminComplaintsSection = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inReview: 0,
    resolved: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [businessFilter, setBusinessFilter] = useState("all");
  const [laundryFilter, setLaundryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [businessesList, setBusinessesList] = useState([]);
  const [laundriesList, setLaundriesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch Businesses & Laundries lists for filter dropdowns
  useEffect(() => {
    let mounted = true;
    const fetchFilterOptions = async () => {
      try {
        const [tenantsRes, laundriesRes] = await Promise.allSettled([
          getAdminTenants({ page: 1, limit: 100 }),
          getAdminLaundries({ page: 1, limit: 100 }),
        ]);

        if (!mounted) return;

        if (tenantsRes.status === "fulfilled") {
          const tData = tenantsRes.value?.data || tenantsRes.value;
          const items =
            tData?.data?.items ||
            tData?.items ||
            (Array.isArray(tData) ? tData : []);
          setBusinessesList(items);
        }

        if (laundriesRes.status === "fulfilled") {
          const lData = laundriesRes.value?.data || laundriesRes.value;
          const items =
            lData?.data?.rows ||
            lData?.data?.items ||
            lData?.items ||
            (Array.isArray(lData) ? lData : []);
          setLaundriesList(items);
        }
      } catch (err) {
        console.error("Failed to load filter options:", err);
      }
    };

    fetchFilterOptions();
    return () => {
      mounted = false;
    };
  }, []);

  const businessOptions = useMemo(
    () => [
      { value: "all", label: "All Businesses" },
      ...businessesList.map((b) => ({
        value: String(b.id),
        label:
          b.businessName || b.fullName || b.companyName || `Business #${b.id}`,
      })),
    ],
    [businessesList],
  );

  const laundryOptions = useMemo(
    () => [
      { value: "all", label: "All Laundries" },
      ...laundriesList.map((l) => ({
        value: String(l.id),
        label:
          l.companyName || l.fullName || l.businessName || `Laundry #${l.id}`,
      })),
    ],
    [laundriesList],
  );

  useEffect(() => {
    let mounted = true;
    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        const res = await getAdminComplaints({
          page: currentPage,
          limit: pagination.limit,
          search: search.trim() || undefined,
          tenantId: businessFilter !== "all" ? businessFilter : undefined,
          laundryId: laundryFilter !== "all" ? laundryFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          priority: priorityFilter !== "all" ? priorityFilter : undefined,
        });

        if (mounted) {
          const data = res?.data || res;
          setComplaints(data?.items || []);
          if (data?.pagination) {
            setPagination(data.pagination);
          }
          if (data?.stats) {
            setStats(data.stats);
          }
        }
      } catch (err) {
        if (mounted) {
          console.error("Failed to load admin complaints:", err);
          toast.error("Failed to fetch complaints list.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchComplaints();
    return () => {
      mounted = false;
    };
  }, [
    currentPage,
    pagination.limit,
    search,
    businessFilter,
    laundryFilter,
    statusFilter,
    priorityFilter,
    refreshKey,
  ]);

  const columns = useMemo(
    () => [
      {
        key: "ticketNumber",
        label: "Ticket",
        render: (val, row) => (
          <div className="flex items-center gap-1.5 font-bold text-(--theme-text-primary)">
            <span>{val || `#CMP-${row.id}`}</span>
            {Array.isArray(row.images) && row.images.length > 0 && (
              <span className="flex items-center gap-0.5 rounded bg-(--theme-surface-strong)/50 px-1.5 py-0.5 text-[11px] font-semibold text-(--theme-text-muted)">
                <FileImage size={11} />
                {row.images.length}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "sender",
        label: "Initiator",
        render: (_, row) => (
          <Badge
            variant={
              row.senderType === "tenant" || row.senderType === "business"
                ? "neutral"
                : "primary"
            }
            size="sm"
          >
            {row.senderType === "tenant" || row.senderType === "business"
              ? "Business"
              : "Laundry"}
          </Badge>
        ),
      },
      {
        key: "business",
        label: "Business",
        render: (_, row) => {
          const name =
            row.tenant?.businessName ||
            row.tenant?.fullName ||
            row.tenant?.companyName ||
            "-";
          return (
            <div className="flex items-center gap-1.5 font-semibold text-(--theme-text-primary)">
              <Building2
                size={14}
                className="shrink-0 text-(--theme-text-muted)"
              />
              <span className="truncate">{name}</span>
            </div>
          );
        },
      },
      {
        key: "laundry",
        label: "Laundry",
        render: (_, row) => {
          const name =
            row.laundry?.companyName ||
            row.laundry?.fullName ||
            row.laundry?.businessName ||
            "-";
          return (
            <div className="flex items-center gap-1.5 font-semibold text-(--theme-text-primary)">
              <TowelRack
                size={14}
                className="shrink-0 text-(--theme-text-muted)"
              />
              <span className="truncate">{name}</span>
            </div>
          );
        },
      },
      {
        key: "subject",
        label: "Subject",
        render: (val) => (
          <div
            className="truncate font-medium text-(--theme-text-primary)"
            title={val}
          >
            {val}
          </div>
        ),
      },
      {
        key: "priority",
        label: "Priority",
        render: (val) => getPriorityBadge(val),
      },
      {
        key: "status",
        label: "Status",
        render: (val) => getStatusBadge(val),
      },
      {
        key: "createdAt",
        label: "Date",
        render: (val) => (
          <span className="text-xs text-(--theme-text-muted)">
            {val ? new Date(val).toLocaleDateString() : "-"}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Action",
        align: "right",
        render: (_, row) => (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Eye size={15} />}
            onClick={() => navigate(`/superadmin/complaints/${row.id}`)}
          >
            View
          </Button>
        ),
      },
    ],
    [navigate],
  );

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-(--theme-text-primary)">
            <ShieldAlert className="text-(--color-aurora-teal)" size={26} />
            Complaints Management
          </h1>
          <p className="mt-1 text-sm text-(--theme-text-muted)">
            Platform-wide dispute resolution and exception oversight between
            businesses and laundries.
          </p>
        </div>

        <Button
          disabled={isLoading}
          leftIcon={
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          }
          onClick={() => setRefreshKey((k) => k + 1)}
          size="md"
          variant="outline"
        >
          Refresh
        </Button>
      </div>

      {/* Top Stats Cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STATS_CONFIG.map((item) =>
          isLoading && !complaints.length ? (
            <CardSkeleton key={item.key} />
          ) : (
            <Card key={item.key} padding="18px">
              <IconWrapper icon={item.icon} variant={item.variant} />
              <p className="m-0 mt-4 text-3xl font-black leading-none text-(--theme-text-primary)">
                {stats[item.key] ?? 0}
              </p>
              <p className="m-0 mt-2 text-sm font-medium leading-5 text-(--theme-text-primary)">
                {item.label}
              </p>
              <p className="m-0 mt-1 text-xs font-semibold leading-5 text-(--theme-text-muted)">
                {item.helper}
              </p>
            </Card>
          ),
        )}
      </section>

      {/* Main Unified Card */}
      <Card padding="0" rounded="20px">
        <div className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_180px_180px_160px_160px]">
            <Input
              leftIcon={<Search size={16} />}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Search by ticket #, subject..."
              value={search}
            />
            <Dropdown
              onChange={(val) => {
                setBusinessFilter(val);
                setCurrentPage(1);
              }}
              options={businessOptions}
              value={businessFilter}
              placeholder="Filter by Business"
              search={businessOptions.length > 8}
            />
            <Dropdown
              onChange={(val) => {
                setLaundryFilter(val);
                setCurrentPage(1);
              }}
              options={laundryOptions}
              value={laundryFilter}
              placeholder="Filter by Laundry"
              search={laundryOptions.length > 8}
            />
            <Dropdown
              onChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
              options={STATUS_OPTIONS}
              value={statusFilter}
            />
            <Dropdown
              onChange={(val) => {
                setPriorityFilter(val);
                setCurrentPage(1);
              }}
              options={PRIORITY_OPTIONS}
              value={priorityFilter}
            />
          </div>

          <Table
            columns={columns}
            data={complaints}
            emptyText="No complaints found matching your filters."
            loading={isLoading}
            rowKey="id"
          />

          <Pagination
            forcePage={currentPage - 1}
            itemsPerPage={pagination.limit}
            onPageChange={({ selected }) => setCurrentPage(selected + 1)}
            pageCount={pagination.totalPages}
            totalItems={pagination.total}
          />
        </div>
      </Card>
    </div>
  );
};

export default SuperAdminComplaintsSection;
