import { Building2, Download, Eye } from "lucide-react";
import Button from "../../../../Components/UI/Button";
import Card from "../../../../Components/UI/Card";
import Table from "../../../../Components/UI/Table";
import Badge from "../../../../Components/UI/Badge";

const summaryData = [
  {
    id: "B-2033",
    date: "Jun 29, 2026",
    business: "Grand Plaza Hotel",
    processed: 138,
    checkedOut: 138,
    ready: 0,
    exceptions: 0,
    scanner: "Exit Gate (SC-002)",
  },
  {
    id: "B-2031",
    date: "Jun 28, 2026",
    business: "Metro Textile Services",
    processed: 198,
    checkedOut: 188,
    ready: 10,
    exceptions: 1,
    scanner: "Exit Gate (SC-002)",
  },
  {
    id: "B-2030",
    date: "Jun 28, 2026",
    business: "CityCare Hospital",
    processed: 84,
    checkedOut: 84,
    ready: 0,
    exceptions: 0,
    scanner: "Exit Gate (SC-002)",
  },
  {
    id: "B-2029",
    date: "Jun 27, 2026",
    business: "Royal Suites",
    processed: 70,
    checkedOut: 68,
    ready: 2,
    exceptions: 0,
    scanner: "Exit Gate (SC-002)",
  },
  {
    id: "B-2028",
    date: "Jun 27, 2026",
    business: "Grand Plaza Hotel",
    processed: 121,
    checkedOut: 121,
    ready: 0,
    exceptions: 1,
    scanner: "Exit Gate (SC-002)",
  },
];

const columns = [
  {
    label: "DATE",
    accessor: "date",
    render: (val) => <span className="font-mono text-(--theme-text-secondary)">{val}</span>,
  },
  {
    label: "BUSINESS NAME",
    accessor: "business",
    render: (val) => (
      <div className="flex items-center gap-2 font-semibold">
        <Building2 size={16} className="text-(--theme-text-muted)" />
        {val}
      </div>
    ),
  },
  {
    label: "BATCH ID",
    accessor: "id",
    render: (val) => <span className="font-bold text-(--color-sky-blue)">{val}</span>,
  },
  {
    label: "PROCESSED",
    accessor: "processed",
    render: (val) => <span className="text-(--theme-text-secondary)">{val}</span>,
  },
  {
    label: "CHECKED OUT",
    accessor: "checkedOut",
    render: (val) => <span className="font-bold text-(--color-sky-blue)">{val}</span>,
  },
  {
    label: "READY FOR RETURN",
    accessor: "ready",
    render: (val) => (
      <span className={val > 0 ? "font-bold text-(--color-aurora-teal)" : "text-(--theme-text-muted)"}>
        {val > 0 ? val : "—"}
      </span>
    ),
  },
  {
    label: "EXCEPTIONS",
    accessor: "exceptions",
    render: (val) => {
      if (val === 0) return <span className="text-(--theme-text-muted)">—</span>;
      return (
        <Badge variant="danger" rounded="rounded-full" size="sm" leftIcon={<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>}>
          {val}
        </Badge>
      );
    },
  },
  {
    label: "SCANNER",
    accessor: "scanner",
    render: (val) => <span className="text-(--theme-text-muted)">{val}</span>,
  },
];

const CheckOutSummaryTab = () => {
  return (
    <Card padding="0">
      <div className="flex items-center justify-between border-b border-(--theme-border-soft) p-5">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-black text-(--theme-text-primary)">Check-Out Summary</h2>
          <span className="rounded-full bg-(--theme-surface-strong) px-2.5 py-0.5 text-xs font-semibold text-(--theme-text-secondary)">
            5 batches
          </span>
        </div>
        <Button variant="outline" size="sm" icon={Download}>
          Export
        </Button>
      </div>

      <Table
        columns={columns}
        data={summaryData}
        keyExtractor={(row) => row.id}
        actions={() => (
          <Button variant="primary" size="sm" icon={Eye}>
            View Batch
          </Button>
        )}
      />
    </Card>
  );
};

export default CheckOutSummaryTab;
