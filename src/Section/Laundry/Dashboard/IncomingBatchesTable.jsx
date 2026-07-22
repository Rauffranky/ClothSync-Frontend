import { ArrowRight, Building2, MapPin } from "lucide-react";
import Card from "../../../Components/UI/Card";
import ProgressBar from "../../../Components/UI/ProgressBar";
import Table from "../../../Components/UI/Table";

const batches = [
  { id: "B-2041", business: "Grand Plaza Hotel", location: "Main Lobby", time: "Today, 09:15 AM", total: 142, progress: 142 },
  { id: "B-2040", business: "CityCare Hospital", location: "Ward 3 Storage", time: "Today, 10:30 AM", total: 98, progress: 54 },
  { id: "B-2039", business: "Royal Suites", location: "East Wing", time: "Today, 11:00 AM", total: 76, progress: 0 },
  { id: "B-2038", business: "Metro Textile Services", location: "Depot A", time: "Today, 08:45 AM", total: 210, progress: 0 },
  { id: "B-2037", business: "Grand Plaza Hotel", location: "Conference Hub", time: "Yesterday", total: 65, progress: 0 },
  { id: "B-2036", business: "CityCare Hospital", location: "ICU Storage", time: "Yesterday", total: 33, progress: 0 },
];

const Box = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const columns = [
  {
    label: "BATCH ID",
    accessor: "id",
    render: (val) => <span className="font-bold text-(--color-sky-blue)">{val}</span>,
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
    label: "DISPATCH LOCATION",
    accessor: "location",
    render: (val) => (
      <div className="flex items-center gap-2 text-(--theme-text-secondary)">
        <MapPin size={16} className="text-(--theme-text-muted)" />
        {val}
      </div>
    ),
  },
  {
    label: "DISPATCH TIME",
    accessor: "time",
  },
  {
    label: "TOTAL ITEMS",
    accessor: "total",
    render: (val) => (
      <div className="flex items-center gap-1.5 font-bold">
        <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-(--theme-surface-strong)">
          <Box size={12} className="text-(--theme-text-secondary)" />
        </div>
        {val}
      </div>
    ),
  },
  {
    label: "CHECK-IN PROGRESS",
    accessor: "progress",
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <div className="w-24">
          <ProgressBar progress={(row.progress / row.total) * 100} heightClass="h-1.5" />
        </div>
        <span className="text-xs font-semibold text-(--theme-text-muted)">
          {row.progress}/{row.total}
        </span>
      </div>
    ),
  },
];

const IncomingBatchesTable = () => (
  <Card padding="0">
    <div className="flex items-center justify-between border-b border-(--theme-border-soft) p-5">
      <div>
        <h2 className="text-base font-black text-(--theme-text-primary)">Incoming Batches</h2>
        <p className="mt-0.5 text-xs text-(--theme-text-muted)">6 batches from linked businesses</p>
      </div>
      <button className="flex items-center gap-1 text-xs font-bold text-(--color-sky-blue)">
        View All <ArrowRight size={14} />
      </button>
    </div>
    <Table columns={columns} data={batches} keyExtractor={(row) => row.id} />
  </Card>
);

export default IncomingBatchesTable;
