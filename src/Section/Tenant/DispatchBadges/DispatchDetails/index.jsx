import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Alert from "../../../../Components/UI/Alert";
import Button from "../../../../Components/UI/Button";
import CardSkeleton from "../../../../Components/UI/CardSkeleton";
import Tabs from "../../../../Components/UI/Tabs";
import { getApiErrorMessage } from "../../../../axios/api";
import { getTenantDispatchBatchDetails } from "../../../../axios/dispatchBatches/tenantDispatchBatches";
import ActivityLogTab from "./components/ActivityLogTab";
import BatchHeaderInfo from "./components/BatchHeaderInfo";
import BatchItemsTab from "./components/BatchItemsTab";
import BatchLifecycle from "./components/BatchLifecycle";
import OverviewTab from "./components/OverviewTab";
import { normalizeDispatchBatchDetails } from "./data";

const DispatchDetails = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const requestedTab = searchParams.get("tab");
  const activeTab = ["overview", "items", "activity"].includes(requestedTab)
    ? requestedTab
    : "overview";

  const handleTabChange = (nextTab) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      if (nextTab === "overview") nextParams.delete("tab");
      else nextParams.set("tab", nextTab);
      return nextParams;
    }, { replace: true });
  };

  useEffect(() => {
    let isActive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError("");
    getTenantDispatchBatchDetails(id)
      .then((response) => {
        if (isActive) setDetails(normalizeDispatchBatchDetails(response, id));
      })
      .catch((requestError) => {
        if (!isActive) return;
        setDetails(null);
        setError(getApiErrorMessage(requestError, "Unable to load dispatch batch details"));
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [id, retryKey]);

  if (loading) {
    return (
      <div className="space-y-5 pb-10">
        <CardSkeleton lines={4} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => <CardSkeleton key={index} lines={2} />)}
        </div>
        <CardSkeleton lines={5} />
      </div>
    );
  }

  if (error || !details) {
    return (
      <Alert variant="danger">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{error || "Dispatch batch details are unavailable"}</span>
          <Button variant="outline" onClick={() => setRetryKey((value) => value + 1)}>Try Again</Button>
        </div>
      </Alert>
    );
  }

  const tabItems = [
    {
      label: "Overview",
      value: "overview",
    },
    {
      label: "Batch Items",
      value: "items",
      count: details.summary.totalItems,
    },
    {
      label: "Activity Log",
      value: "activity",
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Header & Meta Cards */}
      <BatchHeaderInfo details={details} />

      {/* Batch Lifecycle Tracker */}
      <BatchLifecycle steps={details.lifecycle} />

      {/* Global Tabs Navigation */}
      <div className="pt-2">
        <Tabs
          items={tabItems}
          value={activeTab}
          onChange={handleTabChange}
          equalWidth={false}
          rounded="16px"
        />

        {/* Tab Contents */}
        {activeTab === "overview" && <OverviewTab details={details} />}
        {activeTab === "items" && <BatchItemsTab batchId={details.apiId || id} />}
        {activeTab === "activity" && (
          <ActivityLogTab batchId={details.apiId || id} />
        )}
      </div>
    </div>
  );
};

export default DispatchDetails;
