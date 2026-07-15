import {
  Building2,
  Clock,
  Cuboid,
  Hourglass,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import Card from "../../../Components/UI/Card";
import CardSkeleton from "../../../Components/UI/CardSkeleton";
import IconWrapper from "../../../Components/UI/IconWrapper";
import { getTenantLaundrySummary } from "../../../axios/laundries/tenantLaundries";
import { toast } from "../../../Utils/toast";
import { getApiErrorMessage } from "../../../axios/api";

const SUMMARY_STATS = [
  {
    key: "totalLinked",
    label: "Total Linked",
    helper: "laundry partners",
    icon: Building2,
    variant: "info",
  },
  {
    key: "pendingRequests",
    label: "Pending Requests",
    helper: "awaiting confirmation",
    icon: Hourglass,
    variant: "warning",
  },
  {
    key: "activeDispatches",
    label: "Active Dispatches",
    helper: "across all laundries",
    icon: RefreshCw,
    variant: "purple",
  },
  {
    key: "itemsCurrentlySent",
    label: "Items Currently Sent",
    helper: "in transit or processing",
    icon: Cuboid,
    variant: "success",
  },
  {
    key: "delayedItems",
    label: "Delayed Items",
    helper: "past expected return",
    icon: Clock,
    variant: "danger",
  },
  
];

const Stats = ({ onPendingTotalChange }) => {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const fetchSummary = async () => {
      try {
        const response = await getTenantLaundrySummary();
        if (!isActive) return;

        const summaryData = response?.data ?? {};
        const pendingCount = Number(summaryData.pendingRequests);

        setSummary(summaryData);
        if (Number.isFinite(pendingCount)) {
          onPendingTotalChange?.(pendingCount);
        }
      } catch (error) {
        if (isActive) {
          toast.error(
            getApiErrorMessage(error, "Failed to load summary stats"),
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchSummary();

    return () => {
      isActive = false;
    };
  }, [onPendingTotalChange]);

  if (isLoading) {
    return (
      <section className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {SUMMARY_STATS.map((item) => (
          <CardSkeleton key={item.key} />
        ))}
      </section>
    );
  }

  return (
    <section className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {SUMMARY_STATS.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.key}>
            <IconWrapper icon={Icon} variant={item.variant} />

            <p className="m-0 mt-4 text-3xl font-black leading-none text-(--theme-text-primary)">
              {summary?.[item.key] ?? "-"}
            </p>
            <p className="m-0 mt-2 text-sm font-medium leading-5 text-(--theme-text-primary)">
              {item.label}
            </p>
            <p className="m-0 mt-1 text-xs font-semibold leading-5 text-(--theme-text-muted)">
              {item.helper}
            </p>
          </Card>
        );
      })}
    </section>
  );
};

export default Stats;
