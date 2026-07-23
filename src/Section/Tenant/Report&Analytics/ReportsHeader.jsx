import { Calendar, Download, FileText } from "lucide-react";
import Button from "../../../Components/UI/Button";
import DateRangePicker from "../../../Components/UI/DateRangePicker";

const ReportsHeader = ({ customRange, onFromChange, onToChange }) => (
  <div className="flex flex-wrap items-start justify-between gap-4">
    {/* Title */}
    <div>
      <h1
        className="text-2xl font-bold tracking-tight"
        style={{ color: "var(--theme-text-primary)" }}
      >
        Reports &amp; Analytics
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--theme-text-muted)" }}>
        Track laundry operations, asset movement, delays, losses, wash cycles,
        and performance reports.
      </p>
    </div>

    {/* Actions */}
    <div className="flex flex-wrap items-center gap-2">
      <DateRangePicker
        from={customRange.from}
        to={customRange.to}
        onChange={({ from, to }) => {
          onFromChange(from);
          onToChange(to);
        }}
        placeholder="Date Range"
        disableFuture
        className="h-[36px]"
      />

      <Button
        variant="ghost"
        size="sm"
        leftIcon={<Calendar size={15} />}
      >
        Schedule Report
      </Button>

      <Button
        variant="primary"
        size="sm"
        leftIcon={<Download size={15} />}
      >
        Export Report
      </Button>
    </div>
  </div>
);

export default ReportsHeader;
