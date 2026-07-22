import { Download, Eye, Clock, AlertTriangle } from "lucide-react";
import Button from "../../../../Components/UI/Button";
import Card from "../../../../Components/UI/Card";
import Table from "../../../../Components/UI/Table";
import Badge from "../../../../Components/UI/Badge";

const delayedItemsData = [
  {
    id: "AST-7741",
    tagEpc: "E280..B803",
    business: "Grand Plaza Hotel",
    batch: "B-2038",
    category: "Bedsheets",
    status: "Delayed",
    daysDelayed: "3 days",
    lastLocation: "Wash Bay B",
    lastScan: "Jun 26, 10:22 AM",
  },
  {
    id: "AST-5512",
    tagEpc: "E280..B804",
    business: "CityCare Hospital",
    batch: "B-2036",
    category: "Uniforms",
    status: "At Risk",
    daysDelayed: "5 days",
    lastLocation: "Processing Floor",
    lastScan: "Jun 24, 09:15 AM",
  },
  {
    id: "AST-9901",
    tagEpc: "E280..B807",
    business: "Metro Textile Services",
    batch: "B-2035",
    category: "Linens",
    status: "Critical Delay",
    daysDelayed: "8 days",
    lastLocation: "Dry Zone",
    lastScan: "Jun 21, 04:30 PM",
  },
  {
    id: "AST-4490",
    tagEpc: "E280..B808",
    business: "Grand Plaza Hotel",
    batch: "B-2034",
    category: "Uniforms",
    status: "Delayed",
    daysDelayed: "2 days",
    lastLocation: "Sorting Area",
    lastScan: "Jun 27, 11:45 AM",
  },
  {
    id: "AST-2218",
    tagEpc: "E280..B809",
    business: "Royal Suites",
    batch: "B-2033",
    category: "Robes",
    status: "Delayed",
    daysDelayed: "3 days",
    lastLocation: "Wash Bay B",
    lastScan: "Jun 26, 02:10 PM",
  },
];

const columns = [
  {
    label: "ASSET ID",
    accessor: "id",
    render: (val) => <span className="font-bold text-(--color-sky-blue)">{val}</span>,
  },
  {
    label: "TAG EPC",
    accessor: "tagEpc",
    render: (val) => <span className="font-mono text-(--theme-text-muted)">{val}</span>,
  },
  {
    label: "BUSINESS",
    accessor: "business",
    render: (val) => <span className="font-semibold">{val}</span>,
  },
  {
    label: "BATCH",
    accessor: "batch",
    render: (val) => <span className="font-bold text-(--color-sky-blue)">{val}</span>,
  },
  {
    label: "CATEGORY",
    accessor: "category",
    render: (val) => (
      <span className="rounded-md border border-(--theme-border-soft) bg-(--theme-surface-strong) px-2 py-1 text-xs font-semibold text-(--theme-text-muted)">
        {val}
      </span>
    ),
  },
  {
    label: "STATUS",
    accessor: "status",
    render: (val) => {
      let variant = "warning";
      if (val === "At Risk") variant = "warning";
      if (val === "Critical Delay") variant = "danger";

      return (
        <Badge variant={variant} size="sm" rounded="rounded-full">
          {val}
        </Badge>
      );
    },
  },
  {
    label: "DAYS DELAYED",
    accessor: "daysDelayed",
    render: (val, row) => (
      <span className={`font-bold ${row.status === "Critical Delay" ? "text-[#FF4C4C]" : "text-(--color-sunset-orange)"}`}>
        {val}
      </span>
    ),
  },
  {
    label: "LAST LOCATION",
    accessor: "lastLocation",
    render: (val) => (
      <div className="flex items-center gap-1.5 text-(--theme-text-muted)">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        {val}
      </div>
    ),
  },
  {
    label: "LAST SCAN",
    accessor: "lastScan",
    render: (val) => <span className="text-(--theme-text-muted)">{val}</span>,
  },
];

const DelayedItemsTab = () => {
  return (
    <Card padding="0">
      <div className="flex items-center justify-between border-b border-(--theme-border-soft) p-5 bg-[color-mix(in_srgb,var(--color-sunset-orange)_5%,transparent)] rounded-t-2xl">
        <div className="flex items-center gap-3">
          <Clock size={18} className="text-(--color-sunset-orange)" />
          <h2 className="text-base font-black text-(--theme-text-primary)">Delayed Items</h2>
          <span className="rounded-full bg-[color-mix(in_srgb,var(--color-sunset-orange)_20%,transparent)] text-(--color-sunset-orange) px-2.5 py-0.5 text-xs font-bold">
            5
          </span>
        </div>
        <Button variant="outline" size="sm" icon={Download}>
          Export
        </Button>
      </div>

      <Table
        columns={columns}
        data={delayedItemsData}
        keyExtractor={(row) => row.id}
        actions={() => (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="xs" icon={Eye}>
              Asset
            </Button>
            <Button variant="outline" size="xs" icon={Eye}>
              Batch
            </Button>
            <Button variant="outline" size="xs" icon={AlertTriangle}>
              Exception
            </Button>
          </div>
        )}
      />
    </Card>
  );
};

export default DelayedItemsTab;
