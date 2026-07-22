import { AlertCircle, Building2, Download, Eye } from "lucide-react";
import Button from "../../../../Components/UI/Button";
import Card from "../../../../Components/UI/Card";
import Table from "../../../../Components/UI/Table";

const summaryData = [
  {
    id: "B-2041",
    date: "Jun 29, 2026",
    business: "Grand Plaza Hotel",
    expected: 142,
    checkedIn: 142,
    missing: 0,
    exceptions: 1,
    scanner: "Gate Alpha (SC-001)",
  },
  {
    id: "B-2040",
    date: "Jun 29, 2026",
    business: "CityCare Hospital",
    expected: 98,
    checkedIn: 54,
    missing: 44,
    exceptions: 2,
    scanner: "Gate Alpha (SC-001)",
  },
  {
    id: "B-2039",
    date: "Jun 28, 2026",
    business: "Royal Suites",
    expected: 76,
    checkedIn: 76,
    missing: 0,
    exceptions: 0,
    scanner: "Gate Alpha (SC-001)",
  },
  {
    id: "B-2038",
    date: "Jun 28, 2026",
    business: "Metro Textile Services",
    expected: 210,
    checkedIn: 204,
    missing: 6,
    exceptions: 1,
    scanner: "Gate Alpha (SC-001)",
  },
  {
    id: "B-2037",
    date: "Jun 27, 2026",
    business: "Grand Plaza Hotel",
    expected: 65,
    checkedIn: 65,
    missing: 0,
    exceptions: 0,
    scanner: "Gate Alpha (SC-001)",
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
    label: "EXPECTED",
    accessor: "expected",
    render: (val) => <span className="text-(--theme-text-secondary)">{val}</span>,
  },
  {
    label: "CHECKED IN",
    accessor: "checkedIn",
    render: (val) => <span className="font-bold text-(--color-aurora-teal)">{val}</span>,
  },
  {
    label: "MISSING",
    accessor: "missing",
    render: (val) => (
      <span className={val > 0 ? "font-bold text-(--color-sunset-orange)" : "text-(--theme-text-muted)"}>
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
        <div className="inline-flex items-center gap-1 rounded-full border border-(--color-sunset-orange) bg-[color-mix(in_srgb,var(--color-sunset-orange)_10%,transparent)] px-2 py-0.5 text-xs font-bold text-(--color-sunset-orange)">
          <AlertCircle size={12} />
          {val}
        </div>
      );
    },
  },
  {
    label: "SCANNER",
    accessor: "scanner",
    render: (val) => <span className="text-(--theme-text-muted)">{val}</span>,
  },
];

const CheckInSummaryTab = () => {
  return (
    <Card padding="0">
      <div className="flex items-center justify-between border-b border-(--theme-border-soft) p-5">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-black text-(--theme-text-primary)">Check-In Summary</h2>
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

export default CheckInSummaryTab;
