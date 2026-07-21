import { Eye } from "lucide-react";
import Button from "../../../../Components/UI/Button";
import ProgressBar from "../../../../Components/UI/ProgressBar";
import Table from "../../../../Components/UI/Table";
import { weeklySentReturned } from "./data";

const getRateColor = (rate) => {
  if (rate >= 80) return "var(--color-seafoam)";
  if (rate >= 70) return "var(--color-pending)";
  return "var(--color-overdue)";
};

const columns = [
  {
    key: "week",
    label: "Week",
    render: (value) => (
      <span className="font-black text-(--theme-text-primary)">{value}</span>
    ),
  },
  {
    key: "sent",
    label: "Sent",
    render: (value) => (
      <span className="font-black text-(--color-sky-blue)">{value}</span>
    ),
  },
  {
    key: "returned",
    label: "Returned",
    render: (value) => (
      <span className="font-black text-(--color-seafoam)">{value}</span>
    ),
  },
  {
    key: "difference",
    label: "Difference",
    render: (value) => (
      <span
        className="font-bold"
        style={{
          color: value >= 0
            ? "var(--color-seafoam)"
            : "var(--color-pending)",
        }}
      >
        {value > 0 ? `+${value}` : value}
      </span>
    ),
  },
  {
    key: "returnRate",
    label: "Return Rate",
    render: (value) => {
      const color = getRateColor(value);

      return (
        <div className="flex min-w-32 items-center gap-2">
          <span className="w-10 text-right font-black" style={{ color }}>
            {value}%
          </span>
          <ProgressBar
            className="max-w-20"
            color={color}
            heightClass="h-1.5"
            max={100}
            value={value}
          />
        </div>
      );
    },
  },
];

const viewButtonSize = { minHeight: 32, padding: "0 10px", fontSize: "0.75rem" };

const SentReturnedTable = () => (
  <section aria-labelledby="sent-returned-weekly-title">
    <div className="mb-3">
      <h2
        className="text-base font-black text-(--theme-text-primary)"
        id="sent-returned-weekly-title"
      >
        Weekly Breakdown
      </h2>
      <p className="mt-1 text-xs text-(--theme-text-muted)">
        Sent, returned, and return-rate performance by week
      </p>
    </div>

    <Table
      actions={(row) => (
        <Button
          aria-label={`View ${row.week} report — not connected`}
          disabled
          leftIcon={<Eye size={13} />}
          size={viewButtonSize}
          title="Weekly report details are not connected yet"
          variant="outline"
        >
          View
        </Button>
      )}
      columns={columns}
      compact
      data={weeklySentReturned}
      rowKey="id"
    />
  </section>
);

export default SentReturnedTable;
