import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../../../Components/UI/Card";
import Tabs from "../../../Components/UI/Tabs";
import { getApiErrorMessage } from "../../../axios/api";
import { getLaundryTenants } from "../../../axios/laundryTenants/laundryTenants";
import { toast } from "../../../Utils/toast";
import {
  getLaundryTenantCollection,
  normalizeLaundryTenantCounts,
} from "./data";
import LinkedBusinessesTable from "./LinkedBusinessesTable";
import PendingRequestsTable from "./PendingRequestsTable";
import LinkedBusinessStats from "./Stats";

const TAB_VALUES = ["linked", "pending"];

const LinkedBusinesses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = TAB_VALUES.includes(requestedTab) ? requestedTab : "linked";
  const [summary, setSummary] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [linkedRefreshKey, setLinkedRefreshKey] = useState(0);
  const [summaryRefreshKey, setSummaryRefreshKey] = useState(0);

  const handleSummaryChange = useCallback((nextSummary) => {
    setSummary(nextSummary);
    setIsSummaryLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === "linked" || summary) return undefined;

    let isActive = true;

    getLaundryTenants({ page: 1, limit: 1 })
      .then((response) => {
        if (!isActive) return;
        const collection = getLaundryTenantCollection(response, 1);
        handleSummaryChange(normalizeLaundryTenantCounts(collection.counts));
      })
      .catch((error) => {
        if (!isActive) return;
        setIsSummaryLoading(false);
        toast.error(
          getApiErrorMessage(error, "Unable to load laundry dashboard counts"),
        );
      });

    return () => {
      isActive = false;
    };
  }, [
    activeTab,
    handleSummaryChange,
    summary,
    summaryRefreshKey,
  ]);

  const handleTabChange = (nextTab) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);

      if (nextTab === "linked") nextParams.delete("tab");
      else nextParams.set("tab", nextTab);

      return nextParams;
    }, { replace: true });
  };

  const handleRequestResolved = useCallback(() => {
    setSummary(null);
    setIsSummaryLoading(true);
    setLinkedRefreshKey((current) => current + 1);
    setSummaryRefreshKey((current) => current + 1);
  }, []);

  return (
    <div className="space-y-5">
      <LinkedBusinessStats
        loading={isSummaryLoading && !summary}
        summary={summary}
      />

      <Card padding="0" rounded="18px">
        <div className="border-b border-(--theme-border) px-4 py-4">
          <div className="overflow-x-auto">
            <Tabs
            className="w-max overflow-x-auto"
              items={[
                {
                  label: "Linked Businesses",
                  value: "linked",
                },
                {
                  label: "Pending Requests",
                  value: "pending",
                },
              ]}
              onChange={handleTabChange}
              value={activeTab}
            />
          </div>
        </div>

        {activeTab === "linked" && (
          <LinkedBusinessesTable
            onSummaryChange={handleSummaryChange}
            refreshKey={linkedRefreshKey}
          />
        )}
        {activeTab === "pending" && (
          <PendingRequestsTable onRequestResolved={handleRequestResolved} />
        )}
      </Card>
    </div>
  );
};

export default LinkedBusinesses;
