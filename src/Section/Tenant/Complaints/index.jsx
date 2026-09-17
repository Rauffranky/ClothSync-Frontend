import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  FileImage,
  RefreshCw,
  TowelRack,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldAlert,
  ScanLine,
} from "lucide-react";
import Card from "../../../Components/UI/Card";
import CardSkeleton from "../../../Components/UI/CardSkeleton";
import IconWrapper from "../../../Components/UI/IconWrapper";
import Button from "../../../Components/UI/Button";
import Badge from "../../../Components/UI/Badge";
import Input from "../../../Components/UI/Input";
import Dropdown from "../../../Components/UI/Dropdown";
import Tabs from "../../../Components/UI/Tabs";
import Table from "../../../Components/UI/Table";
import Pagination from "../../../Components/UI/Pagination";
import { getTenantComplaints } from "../../../axios/complaints";
import { getTenantLaundries } from "../../../axios/laundries/tenantLaundries";
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

const DIRECTION_TABS = [
  { value: "all", label: "All Complaints" },
  { value: "sent", label: "Sent to Laundries" },
  { value: "received", label: "Received from Laundries" },
];

const STATS_CONFIG = [
  {
    key: "total",
    label: "Total Complaints",
    helper: "all registered tickets",
    icon: ShieldAlert,
    variant: "primary",
  },
  {
    key: "sent",
    label: "Sent to Laundries",
    helper: "outbound complaints",
    icon: ArrowUpRight,
    variant: "warning",
  },
  {
    key: "received",
    label: "Received from Laundries",
    helper: "inbound complaints",
    icon: ArrowDownLeft,
    variant: "info",
  },
  {
    key: "resolved",
    label: "Resolved Cases",
    helper: "closed & resolved",
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

const TenantComplaintsSection = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    received: 0,
    pending: 0,
    resolved: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [direction, setDirection] = useState("all");
  const [search, setSearch] = useState("");
  const [laundryFilter, setLaundryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [laundriesList, setLaundriesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch linked laundries list for the filter dropdown
  useEffect(() => {
    let mounted = true;
    const fetchLaundries = async () => {
      try {
        const res = await getTenantLaundries({ limit: 100 });
        const list =
          res?.data?.data?.items ||
          res?.data?.items ||
          res?.data?.data ||
          res?.data ||
          [];
        if (mounted && Array.isArray(list)) {
          const formatted = list.map((item) => {
            const laundryObj = item.laundry || item;
            const laundryName =
              item.laundryName ||
              laundryObj.companyName ||
              laundryObj.fullName ||
              laundryObj.businessName ||
              item.companyName ||
              "Linked Laundry";
            const resolvedId = item.laundryId || laundryObj.id || item.id;
            return {
              id: resolvedId,
              name: laundryName,
            };
          });
          setLaundriesList(formatted);
        }
      } catch (err) {
        console.error("Failed to load linked laundries for filter:", err);
      }
    };

    fetchLaundries();
    return () => {
      mounted = false;
    };
  }, []);

  const laundryOptions = useMemo(
    () => [
      { value: "all", label: "All Laundries" },
      ...laundriesList.map((l) => ({
        value: String(l.id),
        label: l.name,
      })),
    ],
    [laundriesList],
  );

  useEffect(() => {
    let mounted = true;
    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        const res = await getTenantComplaints({
          page: currentPage,
          limit: pagination.limit,
          direction: direction !== "all" ? direction : undefined,
          search: search.trim() || undefined,
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
          console.error("Failed to fetch complaints:", err);
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
    direction,
    search,
    laundryFilter,
    statusFilter,
    priorityFilter,
    refreshKey,
  ]);

  const handleTabChange = (nextDirection) => {
    setDirection(nextDirection);
    setCurrentPage(1);
  };

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
        key: "direction",
        label: "Direction",
        render: (_, row) => {
          const isSent =
            row.senderType === "tenant" || row.senderType === "business";
          return (
            <Badge variant={isSent ? "neutral" : "primary"} size="sm">
              {isSent ? (
                <span className="flex items-center gap-1">
                  <ArrowUpRight size={12} /> Sent
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <ArrowDownLeft size={12} /> Received
                </span>
              )}
            </Badge>
          );
        },
      },
      {
        key: "laundry",
        label: "Laundry Partner",
        render: (_, row) => {
          const name =
            row.laundry?.companyName ||
            row.laundry?.fullName ||
            row.laundry?.businessName ||
            "Laundry Partner";
          return (
            <div className="flex items-center gap-1.5 font-semibold text-(--theme-text-primary)">
              <TowelRack
                size={15}
                className="shrink-0 text-(--theme-text-muted)"
              />
              <span className="truncate max-w-42.5">{name}</span>
            </div>
          );
        },
      },
      {
        key: "subject",
        label: "Subject",
        render: (val) => (
          <div
            className="max-w-50 truncate font-medium text-(--theme-text-primary)"
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
            onClick={() => navigate(`/business/complaints/${row.id}`)}
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

      {/* Main Unified Card with Tabs Header, Filters, Table & Pagination */}
      <Card padding="0" rounded="18px">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--theme-border) px-4 py-4">
          <div className="min-w-0 flex-[1_1_520px] overflow-x-auto overscroll-x-contain">
            <Tabs
              className="w-max border-0 bg-transparent p-0 shadow-none"
              itemClassName="min-w-[160px] overflow-hidden"
              equalWidth={false}
              items={DIRECTION_TABS}
              onChange={handleTabChange}
              value={direction}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:ml-auto w-full sm:w-auto">
            <Button
              className="w-full shrink-0 sm:w-auto"
              leftIcon={<Plus size={16} />}
              onClick={() =>
                navigate("/business/complaints/create", {
                  state: { complaintType: "general" },
                })
              }
              size="md"
              variant="primary"
            >
              General Complaint
            </Button>
            <Button
              className="w-full shrink-0 sm:w-auto"
              leftIcon={<ScanLine size={16} />}
              onClick={() => navigate("/business/bulk-scanning")}
              size="md"
              variant="outline"
            >
              Tag Discrepancy
            </Button>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_180px_160px_160px_auto]">
            <Input
              leftIcon={<Search size={16} />}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Search by ticket #, subject, text..."
              value={search}
            />
            <Dropdown
              onChange={(val) => {
                setLaundryFilter(val);
                setCurrentPage(1);
              }}
              options={laundryOptions}
              value={laundryFilter}
              placeholder="Filter by Laundry"
              search={laundryOptions.length > 6}
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
            <Button
              disabled={isLoading}
              leftIcon={
                <RefreshCw
                  size={15}
                  className={isLoading ? "animate-spin" : ""}
                />
              }
              onClick={() => setRefreshKey((k) => k + 1)}
              size="md"
              variant="outline"
            >
              Refresh
            </Button>
          </div>

          <Table
            columns={columns}
            data={complaints}
            emptyText={
              direction === "sent"
                ? "No complaints submitted to laundries yet."
                : direction === "received"
                  ? "No complaints received from laundries."
                  : "No complaints found matching your active filters."
            }
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

export default TenantComplaintsSection;
