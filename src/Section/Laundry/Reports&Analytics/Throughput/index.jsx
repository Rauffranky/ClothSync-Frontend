import { ArrowRight, Download } from "lucide-react";
import Button from "../../../../Components/UI/Button";
import Card from "../../../../Components/UI/Card";
import Table from "../../../../Components/UI/Table";
import Badge from "../../../../Components/UI/Badge";

const throughputData = [
  {
    id: "B-1",
    business: "Metro Textile Services",
    initials: "ME",
    color: "var(--color-sky-blue)",
    incoming: 812,
    inLaundry: 410,
    processed: 210,
    ready: 188,
    delayed: 18,
    exceptions: 4,
    avgTurnaround: "41 hrs",
  },
  {
    id: "B-2",
    business: "Grand Plaza Hotel",
    initials: "GR",
    color: "var(--color-aurora-purple)",
    incoming: 648,
    inLaundry: 284,
    processed: 192,
    ready: 98,
    delayed: 4,
    exceptions: 2,
    avgTurnaround: "26 hrs",
  },
  {
    id: "B-3",
    business: "CityCare Hospital",
    initials: "CI",
    color: "var(--color-aurora-teal)",
    incoming: 412,
    inLaundry: 176,
    processed: 88,
    ready: 42,
    delayed: 12,
    exceptions: 5,
    avgTurnaround: "34 hrs",
  },
  {
    id: "B-4",
    business: "Royal Suites",
    initials: "RO",
    color: "var(--color-sunset-orange)",
    incoming: 301,
    inLaundry: 133,
    processed: 71,
    ready: 60,
    delayed: 2,
    exceptions: 1,
    avgTurnaround: "22 hrs",
  },
];

const columns = [
  {
    label: "BUSINESS",
    accessor: "business",
    render: (val, row) => (
      <div className="flex items-center gap-3 font-semibold">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: row.color }}
        >
          {row.initials}
        </div>
        {val}
      </div>
    ),
  },
  {
    label: "INCOMING",
    accessor: "incoming",
    render: (val) => <span className="font-bold text-(--theme-text-primary)">{val}</span>,
  },
  {
    label: "IN LAUNDRY",
    accessor: "inLaundry",
    render: (val) => <span className="font-bold text-(--color-aurora-purple)">{val}</span>,
  },
  {
    label: "PROCESSED",
    accessor: "processed",
    render: (val) => <span className="font-bold text-(--color-neon-cyan)">{val}</span>,
  },
  {
    label: "READY",
    accessor: "ready",
    render: (val) => <span className="font-bold text-(--color-aurora-teal)">{val}</span>,
  },
  {
    label: "DELAYED",
    accessor: "delayed",
    render: (val) => <span className="font-bold text-(--color-sunset-orange)">{val}</span>,
  },
  {
    label: "EXCEPTIONS",
    accessor: "exceptions",
    render: (val) => {
      if (val === 0) return <span className="text-(--theme-text-muted)">—</span>;
      return (
        <Badge variant="danger" rounded="rounded-full" size="sm" className="w-6 h-6 p-0 flex items-center justify-center">
          {val}
        </Badge>
      );
    },
  },
  {
    label: "AVG TURNAROUND",
    accessor: "avgTurnaround",
    render: (val) => (
      <div className="flex items-center gap-1.5 text-(--theme-text-secondary)">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        {val}
      </div>
    ),
  },
];

const ThroughputTab = () => {
  return (
    <Card padding="0">
      <div className="flex items-center justify-between border-b border-(--theme-border-soft) p-5">
        <h2 className="text-base font-black text-(--theme-text-primary)">Business-Wise Throughput</h2>
        <Button variant="outline" size="sm" icon={Download}>
          Export
        </Button>
      </div>

      <Table
        columns={columns}
        data={throughputData}
        keyExtractor={(row) => row.id}
        actions={() => (
          <Button variant="outline" size="sm" icon={ArrowRight}>
            Operations
          </Button>
        )}
      />
    </Card>
  );
};

export default ThroughputTab;
