import { Download, Eye, FileSpreadsheet } from "lucide-react";
import Button from "../../../../Components/UI/Button";
import Table from "../../../../Components/UI/Table";
import { reportRows } from "./data";

const metric = (color) => (value) => (
  <span className="font-black" style={{ color }}>{value}</span>
);

const columns = [
  {
    key: "reportType",
    label: "Report Type",
    render: (value) => <span className="font-black text-(--theme-text-primary)">{value}</span>,
  },
  { key: "category", label: "Category" },
  { key: "laundry", label: "Laundry" },
  { key: "sent", label: "Sent", render: metric("var(--color-sky-blue)") },
  { key: "returned", label: "Returned", render: metric("var(--color-seafoam)") },
  { key: "delayed", label: "Delayed", render: metric("var(--color-pending)") },
  { key: "missing", label: "Missing", render: metric("var(--color-overdue)") },
  { key: "averageTurnaround", label: "Avg. TAT" },
  { key: "washes", label: "Washes" },
  { key: "dateRange", label: "Date Range" },
];

const actionButtonSize = { minHeight: 32, padding: "0 10px", fontSize: "0.75rem" };

const ReportsTable = () => (
  <section aria-labelledby="overview-report-table-title">
    <div className="mb-3">
      <h2 id="overview-report-table-title" className="text-base font-black text-(--theme-text-primary)">
        Report Summary
      </h2>
      <p className="mt-1 text-xs text-(--theme-text-muted)">
        Current report snapshots for the selected filters
      </p>
    </div>

    <Table
      columns={columns}
      compact
      data={reportRows}
      rowKey="id"
      actions={(row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            aria-label={`View ${row.reportType} — not connected`}
            disabled
            leftIcon={<Eye size={13} />}
            size={actionButtonSize}
            title="Report detail is not connected yet"
            variant="outline"
          >
            View
          </Button>
          <Button
            aria-label={`Download ${row.reportType} CSV — not connected`}
            disabled
            leftIcon={<Download size={13} />}
            size={actionButtonSize}
            title="CSV export is not connected yet"
            variant="ghost"
          >
            CSV
          </Button>
          <Button
            aria-label={`Download ${row.reportType} spreadsheet — not connected`}
            disabled
            leftIcon={<FileSpreadsheet size={13} />}
            size={actionButtonSize}
            title="Spreadsheet export is not connected yet"
            variant="ghost"
          >
            XLSX
          </Button>
        </div>
      )}
    />
  </section>
);

export default ReportsTable;
