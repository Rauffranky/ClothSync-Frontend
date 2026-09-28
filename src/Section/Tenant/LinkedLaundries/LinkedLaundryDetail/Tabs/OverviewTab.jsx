import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Box,
  CheckCircle2,
  ChevronRight,
  PackageOpen,
  RefreshCw,
  RotateCcw,
  Truck,
  UserRound,
} from "lucide-react";
import Card from "../../../../../Components/UI/Card";
import Badge from "../../../../../Components/UI/Badge";
import Button from "../../../../../Components/UI/Button";
import IconWrapper from "../../../../../Components/UI/IconWrapper";
import { getApiErrorMessage } from "../../../../../axios/api";
import { getTenantDispatchBatches } from "../../../../../axios/dispatchBatches/tenantDispatchBatches";
import { getTenantDispatchBatchCollection, STATUS_BADGE_VARIANTS } from "../../../DispatchBadges/data";

const getBatchIcon = (status = "") => {
  const s = String(status).toLowerCase();
  if (s.includes("delayed") || s.includes("missing")) return { icon: AlertCircle, variant: "danger" };
  if (s.includes("returned") || s.includes("completed")) return { icon: RotateCcw, variant: "success" };
  if (s.includes("in laundry") || s.includes("washed")) return { icon: CheckCircle2, variant: "purple" };
  if (s.includes("sent") || s.includes("dispatched")) return { icon: Truck, variant: "warning" };
  return { icon: Box, variant: "info" };
};

const OverviewTab = ({ laundryId, laundryDetails, onViewAllBatches }) => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!laundryId) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError("");

    getTenantDispatchBatches({
      laundryLinkId: laundryId,
      limit: 5,
      page: 1,
    })
      .then((response) => {
        if (requestId !== requestIdRef.current) return;
        const collection = getTenantDispatchBatchCollection(response, 5);
        setBatches(collection.rows || []);
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return;
        setBatches([]);
        setError(getApiErrorMessage(err, "Unable to load recent batch activity"));
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setLoading(false);
      });

    return () => {
      requestIdRef.current += 1;
    };
  }, [laundryId, refreshKey]);

  return (
    <div className="space-y-4">
      {/* Recent Batch Activity Card */}
      <Card padding="20px" rounded="16px">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="m-0 text-base font-black text-(--theme-text-primary)">
              Recent Batch Activity
            </h3>
            <p className="m-0 mt-0.5 text-xs font-semibold text-(--theme-text-muted)">
              Latest dispatch and return activities for {laundryDetails?.name || "this laundry"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-500 font-bold hover:bg-blue-500/10"
            rightIcon={<ChevronRight size={14} />}
            onClick={() => {
              if (onViewAllBatches) {
                onViewAllBatches();
              } else {
                navigate("/business/dispatch-batches");
              }
            }}
          >
            View All Batches
          </Button>
        </div>

        {error && (
          <div className="my-3 flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-500">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={13} />}
              onClick={() => setRefreshKey((k) => k + 1)}
            >
              Retry
            </Button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3" aria-label="Loading recent batches">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-xl bg-(--theme-surface-strong)"
              />
            ))}
          </div>
        ) : batches.length > 0 ? (
          <div className="space-y-3">
            {batches.map((batch) => {
              const { icon: Icon, variant } = getBatchIcon(batch.status);
              const badgeVariant = STATUS_BADGE_VARIANTS[batch.status] || variant;
              const batchTargetId = batch.apiId || batch.id;

              return (
                <Card
                  key={batch.apiId || batch.id}
                  padding="16px"
                  rounded="12px"
                  variant="bordered"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <IconWrapper
                        icon={Icon}
                        variant={variant}
                        sizeClassName="h-10 w-10 shrink-0"
                        roundedClassName="rounded-xl"
                        iconSize={18}
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/business/dispatch-batches/${batchTargetId}`)}
                            className="cursor-pointer border-none bg-transparent p-0 text-left font-black text-blue-500 hover:underline"
                          >
                            {batch.id}
                          </button>
                          <Badge
                            variant={badgeVariant}
                            size="sm"
                            leftIcon={<Icon size={12} />}
                          >
                            {batch.status}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-(--theme-text-muted)">
                          <span>{batch.created}</span>
                          <span>•</span>
                          <span className="font-bold text-(--theme-text-primary)">
                            {batch.items} items
                          </span>
                          {batch.createdBy && batch.createdBy !== "—" && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 text-(--color-aurora-teal)">
                                <UserRound size={12} />
                                Operator: <span className="font-bold text-(--theme-text-primary)">{batch.createdBy}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Icon size={14} />}
                        onClick={() => navigate(`/business/dispatch-batches/${batchTargetId}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-(--button-ghost-bg) text-(--theme-text-muted)">
              <PackageOpen size={24} />
            </div>
            <h4 className="m-0 mt-3 text-sm font-bold text-(--theme-text-primary)">
              No Batch Activity Yet
            </h4>
            <p className="m-0 mt-1 max-w-sm text-xs font-semibold text-(--theme-text-muted)">
              No dispatch batches have been created or sent to {laundryDetails?.name || "this laundry"} yet.
            </p>
            <Button
              className="mt-4"
              variant="outline"
              size="sm"
              leftIcon={<Box size={14} />}
              onClick={() => navigate("/business/bulk-scanning")}
            >
              Start New Dispatch Scan
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default OverviewTab;
