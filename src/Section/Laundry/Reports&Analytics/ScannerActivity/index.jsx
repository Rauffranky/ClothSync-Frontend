import { Download, Eye, Wifi } from "lucide-react";
import Button from "../../../../Components/UI/Button";
import Card from "../../../../Components/UI/Card";
import Table from "../../../../Components/UI/Table";
import Badge from "../../../../Components/UI/Badge";

const scannerActivityData = [
  {
    id: "SC-001",
    scanner: "Entry Gate Alpha",
    location: "Receiving Bay",
    type: "Fixed",
    mode: "Entry",
    totalReads: "14,832",
    valid: "14,809",
    failed: "23",
    lastActivity: "Just now",
    status: "Active",
  },
  {
    id: "SC-002",
    scanner: "Exit Gate Bravo",
    location: "Dispatch Area",
    type: "Fixed",
    mode: "Exit",
    totalReads: "12,441",
    valid: "12,430",
    failed: "11",
    lastActivity: "8 min ago",
    status: "Active",
  },
  {
    id: "SC-003",
    scanner: "Handheld Unit 1",
    location: "Processing Floor",
    type: "Portable",
    mode: "Automatic",
    totalReads: "6,320",
    valid: "6,314",
    failed: "6",
    lastActivity: "Just now",
    status: "Active",
  },
  {
    id: "SC-004",
    scanner: "Wash Bay Scanner",
    location: "Wash Bay B",
    type: "Fixed",
    mode: "Automatic",
    totalReads: "9,811",
    valid: "9,788",
    failed: "23",
    lastActivity: "44 min ago",
    status: "Warning",
  },
  {
    id: "SC-005",
    scanner: "Dry Zone Scanner",
    location: "Dry Zone",
    type: "Fixed",
    mode: "Automatic",
    totalReads: "4,502",
    valid: "4,502",
    failed: "0",
    lastActivity: "3 hrs ago",
    status: "Inactive",
  },
];

const columns = [
  {
    label: "SCANNER",
    accessor: "scanner",
    render: (val, row) => (
      <div className="flex items-center gap-2 font-bold text-(--theme-text-primary)">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full ${
            row.status === "Active"
              ? "bg-[color-mix(in_srgb,var(--color-aurora-teal)_15%,transparent)] text-(--color-aurora-teal)"
              : row.status === "Warning"
              ? "bg-[color-mix(in_srgb,var(--color-sunset-orange)_15%,transparent)] text-(--color-sunset-orange)"
              : "bg-(--theme-surface-strong) text-(--theme-text-muted)"
          }`}
        >
          <Wifi size={12} />
        </div>
        {val}
      </div>
    ),
  },
  {
    label: "LOCATION",
    accessor: "location",
    render: (val) => (
      <div className="flex items-center gap-1.5 text-xs text-(--theme-text-muted)">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        {val}
      </div>
    ),
  },
  {
    label: "TYPE",
    accessor: "type",
    render: (val) => (
      <Badge variant="neutral" rounded="rounded-md" size="sm" leftIcon={
        val === "Fixed" ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
        )
      }>
        {val}
      </Badge>
    ),
  },
  {
    label: "MODE",
    accessor: "mode",
    render: (val) => {
      let variant = "ready";
      if (val === "Entry") variant = "progress";
      if (val === "Exit") variant = "purple";
      return (
        <Badge variant={variant} size="sm" rounded="rounded-md">
          {val}
        </Badge>
      );
    },
  },
  {
    label: "TOTAL READS",
    accessor: "totalReads",
    render: (val) => <span className="font-bold text-(--theme-text-primary)">{val}</span>,
  },
  {
    label: "VALID",
    accessor: "valid",
    render: (val) => <span className="font-bold text-(--color-aurora-teal)">{val}</span>,
  },
  {
    label: "FAILED",
    accessor: "failed",
    render: (val) => (
      <span className={val === "0" ? "text-(--theme-text-muted)" : "font-bold text-(--color-sunset-orange)"}>
        {val === "0" ? "—" : val}
      </span>
    ),
  },
  {
    label: "LAST ACTIVITY",
    accessor: "lastActivity",
    render: (val) => <span className="text-xs text-(--theme-text-muted)">{val}</span>,
  },
  {
    label: "STATUS",
    accessor: "status",
    render: (val) => {
      let variant = "ready";
      if (val === "Warning") variant = "warning";
      if (val === "Inactive") variant = "neutral";
      return (
        <Badge variant={variant} size="sm" rounded="rounded-full">
          {val}
        </Badge>
      );
    },
  },
];

const ScannerActivityTab = () => {
  return (
    <Card padding="0">
      <div className="flex items-center justify-between border-b border-(--theme-border-soft) p-5">
        <h2 className="text-base font-black text-(--theme-text-primary)">Scanner Activity Report</h2>
        <Button variant="outline" size="sm" icon={Download}>
          Export
        </Button>
      </div>

      <Table
        columns={columns}
        data={scannerActivityData}
        keyExtractor={(row) => row.id}
        actions={() => (
          <Button variant="outline" size="xs" icon={Eye}>
            View Scanner
          </Button>
        )}
      />
    </Card>
  );
};

export default ScannerActivityTab;
