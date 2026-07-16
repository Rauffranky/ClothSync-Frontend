import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ChartBarStacked,
  Cuboid,
  CircleX,
  CircleCheck,
  RefreshCw,
} from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import CardSkeleton from "../../../Components/UI/CardSkeleton";
import { getApiErrorMessage } from "../../../axios/api";
import { getTenantCategorySummary } from "../../../axios/categories/tenantCategories";

const summaryStats = [
  {
    key: "totalCategories",
    label: "Total Categories",
    helper: "all defined categories",
    icon: ChartBarStacked,
    color: "var(--color-sky-blue)",
  },
  {
    key: "activeCategories",
    label: "Active Categories",
    helper: "currently in use",
    icon: CircleCheck,
    color: "var(--color-ready)",
  },
  {
    key: "inactiveCategories",
    label: "Inactive Categories",
    helper: "disabled",
    icon: CircleX,
    color: "var(--color-overdue)",
  },
  {
    key: "categoriesInUse",
    label: "Categories in Use",
    helper: "across all laundries",
    icon: Cuboid,
    color: "var(--color-super-admin-light)",
  },
];

const Stats = ({ refreshKey = 0 }) => {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    getTenantCategorySummary()
      .then((response) => {
        if (!isActive) return;
        setSummary(response?.data ?? response ?? null);
        setLoadError("");
      })
      .catch((error) => {
        if (!isActive) return;
        setSummary(null);
        setLoadError(
          getApiErrorMessage(error, "Unable to load category summary"),
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [refreshKey, retryKey]);

  const retryLoad = () => {
    setIsLoading(true);
    setLoadError("");
    setRetryKey((current) => current + 1);
  };

  if (isLoading) {
    return (
      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((item) => (
          <CardSkeleton key={item.key} lines={3} />
        ))}
      </section>
    );
  }

  return (
    <div className="space-y-3">
      {loadError && (
        <Alert leftIcon={<AlertTriangle size={18} />} variant="danger">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{loadError}</span>
            <Button
              leftIcon={<RefreshCw size={14} />}
              onClick={retryLoad}
              size="sm"
              variant="secondary"
            >
              Try Again
            </Button>
          </div>
        </Alert>
      )}

      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.key}>
              <span
                className="grid h-9 w-9 place-items-center rounded-lg"
                style={{
                  color: item.color,
                  background: `color-mix(in srgb, ${item.color} 14%, transparent)`,
                }}
              >
                <Icon size={18} strokeWidth={2.2} />
              </span>

              <p className="m-0 mt-4 text-3xl font-black leading-none text-(--theme-text-primary)">
                {summary?.[item.key] ?? "—"}
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
    </div>
  );
};

export default Stats;
