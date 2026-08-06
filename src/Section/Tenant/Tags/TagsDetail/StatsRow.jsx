import { Activity, Clock, MapPin, User } from "lucide-react";
import Card from "../../../../Components/UI/Card";
import { formatDateTime } from "../../../../Utils/date";

const StatsRow = ({ overview, tag, loading = false }) => {
  const lastScanVal = overview?.lastScan || tag?.lastScannedAt;
  const formattedLastScan = lastScanVal
    ? formatDateTime(lastScanVal, true, false, "18 min ago")
    : "18 min ago";

  const recentReadsVal =
    overview?.recentReads ?? tag?.totalScanCount ?? "87";

  const locationVal =
    overview?.location ||
    tag?.lastScannedLocation ||
    tag?.asset?.zoneName ||
    tag?.lastScanner?.zoneName ||
    "Roaming";

  const operatorObj = overview?.operator || tag?.operator;
  const operatorVal =
    typeof operatorObj === "object" && operatorObj !== null
      ? operatorObj.fullName || operatorObj.name || operatorObj.email || "Developer"
      : typeof operatorObj === "string"
        ? operatorObj
        : "Developer";

  const stats = [
    {
      key: "lastScan",
      label: "LAST SCAN",
      value: formattedLastScan,
      Icon: Clock,
    },
    {
      key: "recentReads",
      label: "RECENT READS",
      value: String(recentReadsVal),
      Icon: Activity,
    },
    {
      key: "location",
      label: "LOCATION",
      value: String(locationVal),
      Icon: MapPin,
    },
    {
      key: "operator",
      label: "OPERATOR",
      value: String(operatorVal),
      Icon: User,
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <Card key={n} padding="16px 18px" rounded="16px">
            <div className="animate-pulse flex items-start gap-3">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.Icon;
        return (
          <Card key={item.key} padding="16px 18px" rounded="16px">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-(--theme-border-soft) bg-(--button-ghost-bg)">
                <Icon size={16} className="text-(--color-aurora-teal)" />
              </div>
              <div className="min-w-0">
                <p className="m-0 text-[11px] font-black uppercase tracking-[0.12em] text-(--theme-text-muted)">
                  {item.label}
                </p>
                <p className="m-0 mt-1 text-sm font-bold text-(--theme-text-primary)">
                  {item.value}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsRow;
