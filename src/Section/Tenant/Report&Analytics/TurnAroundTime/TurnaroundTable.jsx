import Badge from "../../../../Components/UI/Badge";
import Table from "../../../../Components/UI/Table";
import { turnaroundRows } from "./data";

const hours = (color) => (value) => (
  <span className="font-black" style={{ color }}>{value}h</span>
);

const columns = [
  {
    key: "laundry",
    label: "Laundry Partner",
    render: (value) => (
      <span className="font-black text-(--theme-text-primary)">{value}</span>
    ),
  },
  {
    key: "p10",
    label: "P10 (Best)",
    render: hours("var(--color-seafoam)"),
  },
  {
    key: "average",
    label: "Avg. TAT",
    render: (value, row) => hours(
      row.average > 28 ? "var(--color-overdue)" : "var(--color-sky-blue)",
    )(value),
  },
  {
    key: "p90",
    label: "P90 (Worst)",
    render: (value, row) => hours(
      row.p90 > 40 ? "var(--color-overdue)" : "var(--theme-text-primary)",
    )(value),
  },
  {
    key: "sla",
    label: "SLA (72h)",
    render: (value) => (
      <span className="font-mono text-xs font-semibold text-(--theme-text-muted)">
        {value}h
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (value, row) => (
      <Badge size="sm" variant={row.statusVariant}>
        {value}
      </Badge>
    ),
  },
];

const TurnaroundTable = () => (
  <Table
    columns={columns}
    compact
    data={turnaroundRows}
    emptyText="No laundry turnaround data found"
    rowKey="id"
  />
);

export default TurnaroundTable;
