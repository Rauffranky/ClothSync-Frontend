
import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import CardSkeleton from "../../../Components/UI/CardSkeleton";
import IconWrapper from "../../../Components/UI/IconWrapper";
import { getApiErrorMessage } from "../../../axios/api";
import { getTenantScannerSummary } from "../../../axios/scanners/tenantScanners";
import { scannerStats } from "./data";

const summaryKeys = {
  total: "totalScanners",
  active: "activeScanners",
  inactive: "inactiveScanners",
  fixed: "fixedScanners",
  portable: "portableScanners",
  warnings: "scannerWarnings",
};

const ScannerStats = ({ refreshKey = 0 }) => {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    getTenantScannerSummary()
      .then((response) => {
        if (!isActive) return;
        setSummary(response?.data ?? response ?? null);
        setLoadError("");
      })
      .catch((error) => {
        if (!isActive) return;
        setSummary(null);
        setLoadError(
          getApiErrorMessage(error, "Unable to load scanner summary"),
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
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        {scannerStats.map((stat) => (
          <CardSkeleton key={stat.id} lines={3} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {loadError && (
        <Alert
          className="justify-between"
          leftIcon={<AlertTriangle size={18} />}
          variant="danger"
        >
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

        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
          {scannerStats.map((stat) => (
            <Card key={stat.id} bodyClassName="flex flex-col gap-3 h-full">
              <IconWrapper
                icon={stat.icon}
                variant={stat.variant}
                sizeClassName="h-10 w-10 shrink-0"
                roundedClassName="rounded-[12px]"
                iconSize={18}
              />
              <div className="mt-1 space-y-1">
                <div className="text-2xl font-black leading-none text-(--theme-text-primary)">
                  {summary?.[summaryKeys[stat.id]] ?? "—"}
                </div>
                <div className="text-sm font-bold leading-tight text-(--theme-text-primary)">
                  {stat.label}
                </div>
                <div className="text-xs font-medium text-(--theme-text-muted)">
                  {stat.subtext}
                </div>
              </div>
            </Card>
          ))}
        </div>
    </div>
  );
};

export default ScannerStats;
